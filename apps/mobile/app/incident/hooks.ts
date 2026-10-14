"use client";

// Small helpers the "Мой случай" screen and its sheets share.

import { useEffect, useState, useSyncExternalStore } from "react";

// Whether this phone has a share sheet; false on the server so hydration matches. No effect needed.
const noop = () => () => undefined;
export const useCanShare = () => useSyncExternalStore(noop, () => typeof navigator.share === "function", () => false);
export const useCanShareFiles = () => useSyncExternalStore(noop, () => typeof navigator.canShare === "function", () => false);
export const isAbort = (e: unknown) => e instanceof DOMException && e.name === "AbortError"; // the kid closed the share sheet

// An object URL for a stored Blob, revoked when the Blob changes or the component leaves.
export function useObjectUrl(value: unknown) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!(value instanceof Blob)) return;
    const u = URL.createObjectURL(value);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [value]);
  return url;
}

// Inside the desktop shell (≥ 768 px, the projector) a modal dialog belongs on the phone frame, not in the middle of the
// laptop screen: the frame sits right of centre beside the pitch column. On a phone the dialog keeps its own CSS.
export function pinToFrame(d: HTMLDialogElement) {
  const frame = document.querySelector(".shell-screen");
  if (!frame || !window.matchMedia("(min-width: 768px)").matches) {
    for (const p of ["inset", "width", "height"]) d.style.removeProperty(p);
    return;
  }
  const r = frame.getBoundingClientRect();
  d.style.inset = `${r.top}px auto auto ${r.left}px`;
  d.style.width = `${r.width}px`;
  d.style.height = `${r.height}px`;
}

// While an overlay is open the page behind does not scroll.
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);
}
