"use client";

// The QR card beside the phone opens the QR big (Ali, 2026-10-15): the presenter clicks it and the whole room scans it
// from their seats on the projector. A native modal dialog: Esc, the close button or a click on the dimmed area around it
// closes it, and the browser returns focus to the card. Laptops only: the aside is hidden below 768 px.
// No icon on the card: anywhere it fits it would sit in the QR's quiet zone, which scanners need; the zoom cursor, the
// hover lift and the press feedback (app/shell.css) say it opens.

import { useEffect, useId, useRef, useState } from "react";
import { useBodyScrollLock } from "../app/incident/hooks";
import { Icon } from "./Icon";

type Props = { title: string; hint: string; alt: string; zoom: string; close: string };

export function QrZoom({ title, hint, alt, zoom, close }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const pressedOutside = useRef(false);
  const [open, setOpen] = useState(false);
  const titleId = useId();
  useBodyScrollLock(open);

  // The dialog lives in the aside, which is display:none below 768 px. A window narrowed (or a tablet turned) while it is
  // open would leave an invisible modal that blocks every click, so it closes with the layout.
  useEffect(() => {
    if (!open) return;
    const wide = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (!wide.matches) ref.current?.close();
    };
    wide.addEventListener("change", onChange);
    return () => wide.removeEventListener("change", onChange);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="shell-qr"
        aria-haspopup="dialog"
        onClick={() => {
          ref.current?.showModal();
          setOpen(true);
        }}
      >
        <img className="shell-qr-img" src="/qr.svg" width={168} height={168} alt="" />
        <b>{title}</b>
        <span>{hint}</span>
        <span className="sr-only">{zoom}</span>
      </button>
      <dialog
        ref={ref}
        className="qr-zoom"
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        onPointerDown={(ev) => {
          pressedOutside.current = ev.target === ref.current;
        }}
        onClick={(ev) => {
          // Only a press and release both on the dimmed area closes it: not a drag that starts or ends inside the panel,
          // and not the second click of a double-click on the card, which lands on the dimmed area (detail 2).
          if (ev.target === ref.current && pressedOutside.current && ev.detail < 2) ref.current.close();
        }}
      >
        <div className="qr-zoom-panel">
          <button type="button" className="qr-zoom-close" onClick={() => ref.current?.close()} aria-label={close}>
            <Icon name="x" size={24} />
          </button>
          <img src="/qr.svg" width={164} height={164} alt={alt} />
          <b id={titleId}>{title}</b>
          <span>{hint}</span>
        </div>
      </dialog>
    </>
  );
}
