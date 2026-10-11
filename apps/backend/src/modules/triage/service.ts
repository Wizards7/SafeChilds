// Guided chat (plan 0005): crisis words by rules first, then the model for codes, validated; nothing stored, nothing logged
// but the outcome. The kid's text is in memory for one request.

import { crisisLevel, parseTriage, rulesTriage, TRIAGE_PROMPT, type Triage } from "@safechilds/analysis";
import { describeError } from "../analysis/service";

export interface TextModelClient {
  reply(system: string, user: string): Promise<string>;
}

export interface TriageDeps {
  model: TextModelClient | null;
  log: { warn: (msg: string) => void };
}

export async function triage(deps: TriageDeps, messages: readonly string[]): Promise<Triage> {
  const text = messages.join("\n---\n");
  // Rules look at the latest message only: a crisis sentence from an earlier turn must not route every later one to urgent.
  const level = crisisLevel(messages[messages.length - 1] ?? "");
  if (level === "urgent") return rulesTriage("urgent");
  if (!deps.model) return { status: "failed" };
  try {
    const raw = await deps.model.reply(TRIAGE_PROMPT, `<kid>\n${text}\n</kid>`);
    const parsed = parseTriage(raw);
    if (!parsed) {
      deps.log.warn("triage response failed validation");
      return { status: "failed" };
    }
    // Rules may raise safety, never lower it.
    const safety = level === "threatened" && parsed.safety === "ok" ? "threatened" : parsed.safety;
    const flags = safety === "threatened" && !parsed.flags.includes("threatened") ? [...parsed.flags, "threatened" as const] : parsed.flags;
    return { status: "ok", source: "model", ...parsed, safety, flags, route: safety === "ok" ? parsed.route : "urgent" };
  } catch (err) {
    deps.log.warn(`triage call failed: ${describeError(err)}`);
    return { status: "failed" };
  }
}
