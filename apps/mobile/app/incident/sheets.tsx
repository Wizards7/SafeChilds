"use client";

// The overlays of «Мой случай» (2026-10-14). All are native modal dialogs: the page behind is inert, focus stays inside,
// Esc and the backdrop close them, the body does not scroll, and in the desktop shell they sit on the phone frame.
// AddSheet: a link (labelled field, its own error) or a screenshot from the gallery. ItemSheet: one saved item with
// what it says, when it was saved, and copy / share / remove (remove asks first). ShotViewer: one screenshot full screen
// (2026-10-12, moved here unchanged apart from the frame pinning). A saved address is never one tap from opening.

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { coverageLine, EVIDENCE_TEXT, IMAGE_CHECK_TEXT, LINK_SOURCE_TEXT, LINK_TIER_TEXT, ORIGINAL_MATCHES_TEXT, TIER_TEXT } from "@safechilds/analysis";
import { Icon } from "../../components/Icon";
import { incidentStore, type Evidence } from "../../lib/incident-store";
import { pick, type Locale } from "../../lib/locale";
import { takenAt } from "../../lib/timeline";
import { formatDay, formatTime } from "./format";
import { isAbort, pinToFrame, useBodyScrollLock, useCanShare, useCanShareFiles, useObjectUrl } from "./hooks";
import { resultTitle, toneOf } from "./Timeline";

export type ShotItem = Extract<Evidence, { kind: "screenshot" }>;
export type SheetItem = Exclude<Evidence, ShotItem>;

function useModal(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null);
  useBodyScrollLock(open);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      pinToFrame(d);
      d.showModal();
    }
    if (!open && d.open) d.close();
  }, [open]);
  return ref;
}

function Sheet({ open, label, onClose, children }: { open: boolean; label: string; onClose: () => void; children: ReactNode }) {
  const t = useTranslations("incident");
  const ref = useModal(open);
  return (
    <dialog ref={ref} className="ev-sheet" aria-label={label} onClose={onClose} onClick={(ev) => { if (ev.target === ref.current) onClose(); }}>
      <div className="ev-sheet-panel">
        <div className="ev-sheet-head">
          <h2>{label}</h2>
          <button type="button" className="act" onClick={onClose} aria-label={t("evidence.close")}><Icon name="x" size={22} /></button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

export function AddSheet({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: (id: string) => Promise<void> }) {
  const t = useTranslations("incident");
  const tc = useTranslations("common");
  const [mode, setMode] = useState<"choose" | "link">("choose");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const close = () => {
    setMode("choose");
    setValue("");
    setError(null);
    onClose();
  };
  const saved = async (item: Evidence | null) => {
    if (!item) return setError(tc("saveFailed"));
    await onAdded(item.id);
    close();
  };
  const saveLink = async () => {
    let url: URL;
    try {
      url = new URL(value.trim());
      if (url.protocol !== "https:" && url.protocol !== "http:") throw new TypeError("not a web address");
    } catch {
      return setError(t("evidence.linkError"));
    }
    setBusy(true);
    try {
      await saved(await incidentStore.addEvidence({ kind: "url", value: url.href }));
    } catch {
      setError(tc("saveFailed"));
    } finally {
      setBusy(false);
    }
  };
  const addShot = async (file: File | undefined) => {
    if (fileRef.current) fileRef.current.value = ""; // the same file can be picked again
    if (!file || !file.type.startsWith("image/")) return;
    setBusy(true);
    setError(null);
    try {
      const taken = takenAt(file.lastModified, Date.now());
      await saved(await incidentStore.addEvidence({ kind: "screenshot", value: file, ...(taken ? { takenAt: taken } : {}) }));
    } catch {
      setError(tc("saveFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} label={t("sheet.add")} onClose={close}>
      {mode === "choose" ? (
        <div className="stack">
          <button type="button" className="option" onClick={() => { setMode("link"); setError(null); }}>
            <span className="ic"><Icon name="link" /></span>
            <span className="body"><span className="t">{t("item.link")}</span><span className="d">{t("sheet.linkSub")}</span></span>
            <Icon name="chevron-right" className="i chev" />
          </button>
          <button type="button" className="option" disabled={busy} onClick={() => fileRef.current?.click()}>
            <span className="ic"><Icon name="image-plus" /></span>
            <span className="body"><span className="t">{t("item.screenshot")}</span><span className="d">{t("sheet.shotSub")}</span></span>
            <Icon name="chevron-right" className="i chev" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => addShot(e.target.files?.[0])} />
          {error && <div className="error" role="alert">{error}</div>}
        </div>
      ) : (
        <div className="stack">
          <div className={`field${error ? " has-error" : ""}`}>
            <label htmlFor="add-link">{t("item.link")}</label>
            <input id="add-link" type="url" inputMode="url" autoComplete="off" autoFocus placeholder={t("evidence.placeholder")} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void saveLink(); }} aria-invalid={!!error} aria-describedby={error ? "add-link-error" : undefined} />
            {error && <div id="add-link-error" className="error">{error}</div>}
          </div>
          <div className="row2">
            <button type="button" className="btn btn-secondary" onClick={() => { setMode("choose"); setError(null); }}>{tc("back")}</button>
            <button type="button" className="btn btn-primary" disabled={busy || !value.trim()} onClick={saveLink}>{t("evidence.add")}</button>
          </div>
        </div>
      )}
    </Sheet>
  );
}

const itemLabel = (e: SheetItem): "item.link" | "item.note" | "item.imageCheck" | "item.linkCheck" =>
  e.kind === "url" ? "item.link" : e.kind === "note" ? "item.note" : e.kind === "imageCheck" ? "item.imageCheck" : "item.linkCheck";

export function ItemSheet({ item, now, locale, onClose, onRemove }: { item: SheetItem | null; now: Date; locale: Locale; onClose: () => void; onRemove: (id: string) => Promise<void> }) {
  const t = useTranslations("incident");
  const tc = useTranslations("common");
  const canShare = useCanShare();
  const canShareFiles = useCanShareFiles();
  const [asking, setAsking] = useState(false);
  const [status, setStatus] = useState<"copied" | "copyFailed" | "shareFailed" | null>(null);
  const [removeFailed, setRemoveFailed] = useState(false);
  const photo = useObjectUrl(item?.kind === "imageCheck" ? item.image : undefined);
  // «Скопировано» fades; a failure stays where it happened until the next action or the sheet closes.
  useEffect(() => {
    if (status !== "copied") return;
    const id = setTimeout(() => setStatus(null), 2000);
    return () => clearTimeout(id);
  }, [status]);

  const close = () => {
    setAsking(false);
    setStatus(null);
    setRemoveFailed(false);
    onClose();
  };
  const remove = async () => {
    if (!item) return;
    setRemoveFailed(false);
    try {
      await onRemove(item.id);
      close();
    } catch {
      setRemoveFailed(true);
    }
  };
  const copy = async (text: string) => {
    setStatus(null);
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("copyFailed");
    }
  };
  const share = async (data: ShareData) => {
    setStatus(null);
    try {
      if (data.files && !navigator.canShare(data)) return setStatus("shareFailed");
      await navigator.share(data);
    } catch (err) {
      if (!isAbort(err)) setStatus("shareFailed");
    }
  };

  const saved = item ? new Date(item.createdAt) : now;
  let body: ReactNode = null;
  let actions: ReactNode = null;
  if (item?.kind === "url") {
    body = <p className="addr-full">{item.value}</p>;
    actions = (
      <>
        <button type="button" className="btn btn-secondary" onClick={() => copy(item.value)}><Icon name="copy" size={18} />{t("evidence.copy")}</button>
        {canShare && <button type="button" className="btn btn-secondary" onClick={() => share({ url: item.value })}><Icon name="share" size={18} />{t("evidence.share")}</button>}
      </>
    );
  } else if (item?.kind === "note") {
    body = <p className="note-full">{item.value}</p>;
  } else if (item?.kind === "imageCheck") {
    const tone = toneOf(item);
    const facts = item.facts.filter((f) => f !== "original_matches" && f !== "exif_present");
    body = (
      <>
        {photo && <img className="photo" src={photo} alt="" />}
        <div className={`card col result ${tone}`}>
          <div className="head">{resultTitle(item, locale)}</div>
          <p className="small">{pick(item.originalMatches ? ORIGINAL_MATCHES_TEXT.body : TIER_TEXT[item.tier].body, locale)}</p>
        </div>
        {facts.length > 0 && <ul className="facts">{facts.map((f) => <li key={f}>{pick(EVIDENCE_TEXT[f].what, locale)}</li>)}</ul>}
        {item.coverage && <p className="small coverage">{coverageLine(item.coverage, IMAGE_CHECK_TEXT, locale)}</p>}
      </>
    );
    const image = item.image;
    if (image && canShareFiles) {
      const type = image.type || "image/jpeg";
      const file = image instanceof File ? image : new File([image], `safechilds-${item.id.slice(0, 8)}.${type.split("/")[1] ?? "jpg"}`, { type });
      actions = <button type="button" className="btn btn-secondary" onClick={() => share({ files: [file] })}><Icon name="share" size={18} />{t("evidence.share")}</button>;
    }
  } else if (item?.kind === "linkCheck") {
    body = (
      <>
        <div className={`card col result ${toneOf(item)}`}>
          <div className="head">{resultTitle(item, locale)}</div>
          <p className="small">{pick(LINK_TIER_TEXT[item.tier].body, locale)}</p>
        </div>
        {item.coverage && <p className="small coverage">{coverageLine(item.coverage, LINK_SOURCE_TEXT, locale)}</p>}
        <div className="small label">{t("sheet.address")}</div>
        <p className="addr-full">{item.url}</p>
      </>
    );
    actions = <button type="button" className="btn btn-secondary" onClick={() => copy(item.url)}><Icon name="copy" size={18} />{t("evidence.copy")}</button>;
  }

  return (
    <Sheet open={!!item} label={item ? t(itemLabel(item)) : ""} onClose={close}>
      <div className="stack item-sheet">
        <div className="small meta">{t("meta.saved", { date: formatDay(saved, now), time: formatTime(saved) })}</div>
        {body}
        <div className="small" aria-live="polite">{status === "copied" ? tc("copied") : status === "copyFailed" ? tc("copyFailed") : status === "shareFailed" ? t("evidence.shareFailed") : ""}</div>
        {asking ? (
          <section className="card card-danger col">
            <div className="head"><Icon name="triangle-alert" />{t("evidence.removeItemAsk")}</div>
            <div className="row2">
              <button type="button" className="btn btn-secondary" onClick={() => { setAsking(false); setRemoveFailed(false); }}>{t("evidence.keep")}</button>
              <button type="button" className="btn btn-danger" onClick={remove}>{t("evidence.remove")}</button>
            </div>
            {removeFailed && <div className="error" role="alert">{t("evidence.removeFailed")}</div>}
          </section>
        ) : (
          <div className="ev-sheet-actions">
            {actions}
            <button type="button" className="btn btn-quiet danger" onClick={() => setAsking(true)}><Icon name="trash-2" size={18} />{t("evidence.remove")}</button>
          </div>
        )}
      </div>
    </Sheet>
  );
}

// Full-screen view of one screenshot (2026-10-12): share the file where the phone can, remove behind an inline confirm.
export function ShotViewer({ e, now, onClose, onRemove }: { e: ShotItem | null; now: Date; onClose: () => void; onRemove: (id: string) => Promise<void> }) {
  const t = useTranslations("incident");
  const ref = useModal(!!e);
  const canShareFiles = useCanShareFiles();
  const [asking, setAsking] = useState(false);
  const [failed, setFailed] = useState(false);
  const [removeFailed, setRemoveFailed] = useState(false);
  const url = useObjectUrl(e?.value);
  const close = () => {
    setAsking(false);
    setFailed(false);
    setRemoveFailed(false);
    onClose();
  };
  const remove = async () => {
    if (!e) return;
    setRemoveFailed(false);
    try {
      await onRemove(e.id);
      close();
    } catch {
      setRemoveFailed(true);
    }
  };
  const share = async () => {
    if (!e) return;
    setFailed(false);
    const type = e.value.type || "image/png";
    const file = e.value instanceof File ? e.value : new File([e.value], `safechilds-${e.id.slice(0, 8)}.${type.split("/")[1] ?? "png"}`, { type });
    if (!navigator.canShare({ files: [file] })) return setFailed(true);
    try {
      await navigator.share({ files: [file] });
    } catch (err) {
      if (!isAbort(err)) setFailed(true);
    }
  };
  const when = e ? new Date(e.takenAt ?? e.createdAt) : now;
  return (
    <dialog ref={ref} className="viewer" onClose={close} onClick={(ev) => { if (ev.target === ref.current) close(); }} aria-label={t("evidence.open")}>
      <div className="bar">
        <span className={`small${failed ? " fail" : ""}`} aria-live="polite">{failed ? t("evidence.shareFailed") : e ? t(e.takenAt ? "meta.taken" : "meta.added", { date: formatDay(when, now), time: formatTime(when) }) : ""}</span>
        <button type="button" className="act" onClick={close} aria-label={t("evidence.close")}><Icon name="x" size={22} /></button>
      </div>
      <div className="pic">{url && <img src={url} alt="" />}</div>
      {asking ? (
        <section className="card card-danger col ask-card">
          <div className="head"><Icon name="triangle-alert" />{t("evidence.removeShotAsk")}</div>
          <div className="row2">
            <button type="button" className="btn btn-secondary" onClick={() => { setAsking(false); setRemoveFailed(false); }}>{t("evidence.keep")}</button>
            <button type="button" className="btn btn-danger" onClick={remove}>{t("evidence.remove")}</button>
          </div>
          {removeFailed && <div className="error" role="alert">{t("evidence.removeFailed")}</div>}
        </section>
      ) : (
        <div className="foot">
          {canShareFiles && <button type="button" className="btn btn-secondary" onClick={share}><Icon name="share" size={18} />{t("evidence.share")}</button>}
          <button type="button" className="btn btn-danger" onClick={() => setAsking(true)}><Icon name="trash-2" size={18} />{t("evidence.remove")}</button>
        </div>
      )}
    </dialog>
  );
}
