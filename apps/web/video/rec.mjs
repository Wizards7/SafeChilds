// node rec.mjs <outDir> [probe]   — renders apps/web/video/screens.html frame by frame (30 fps) into MP4s
import { chromium } from "playwright-core";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
const [,, out, mode] = process.argv;
const BASE = "http://localhost:4501/video/screens.html";
const CLIPS = [
  ["dm", 5.5], ["bubble", 5.5], ["link", 7], ["photo", 6.5], ["share", 6.5], ["message", 7], ["end", 5],
];
const FPS = 30;
const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
fs.mkdirSync(out, { recursive: true });
for (const [name, dur] of CLIPS) {
  for (const framed of name === "end" ? [false] : [false, true]) {
    const wide = name === "end" || framed;
    const ctx = await b.newContext({ viewport: wide ? { width: 1920, height: 1080 } : { width: 360, height: 780 }, deviceScaleFactor: wide ? 1 : 3 });
    const p = await ctx.newPage();
    await p.goto(`${BASE}?s=${name}${framed ? "&frame=1" : ""}`, { waitUntil: "networkidle" });
    await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
    await p.evaluate(() => document.getAnimations().forEach(a => a.pause()));
    const tag = `${name}${framed ? "-16x9" : ""}`;
    const dir = `${out}/_f-${tag}`; fs.mkdirSync(dir, { recursive: true });
    const times = mode === "probe" ? [dur - 0.2] : Array.from({ length: Math.round(dur * FPS) }, (_, i) => i / FPS);
    let i = 0;
    for (const t of times) {
      await p.evaluate((ms) => document.getAnimations().forEach(a => { a.currentTime = ms; }), t * 1000);
      await p.screenshot({ path: `${dir}/${String(i++).padStart(4, "0")}.png` });
    }
    if (mode !== "probe") {
      execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-framerate", String(FPS), "-i", `${dir}/%04d.png`, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-preset", "slow", "-movflags", "+faststart", `${out}/${tag}.mp4`]);
      fs.rmSync(dir, { recursive: true });
    }
    console.log(tag, times.length, "frames");
    await ctx.close();
  }
}
await b.close();
