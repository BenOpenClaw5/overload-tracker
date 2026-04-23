"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { dismissInstallHint, installHintDismissed } from "@/lib/storage";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    nav.standalone === true
  );
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /iPad|iPhone|iPod/.test(ua);
}

export function InstallHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (installHintDismissed()) return;
    const t = window.setTimeout(() => setShow(true), 2500);
    return () => window.clearTimeout(t);
  }, []);

  if (!show) return null;

  const ios = isIOS();

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 pointer-events-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="pointer-events-auto mx-3 mb-3 brutal-border bg-[var(--panel)]">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
          <span className="mono-micro">[ INSTALL / ADD TO HOME SCREEN ]</span>
          <button
            type="button"
            aria-label="Dismiss"
            className="text-[var(--muted)] hover:text-[var(--fg)]"
            onClick={() => {
              dismissInstallHint();
              setShow(false);
            }}
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
        <div className="px-3 py-3 text-[12px] leading-relaxed font-mono text-[var(--fg-dim)]">
          {ios ? (
            <>
              Tap <span className="text-[var(--fg)] font-bold">Share</span> ›{" "}
              <span className="text-[var(--fg)] font-bold">Add to Home Screen</span> to
              install OVERLOAD. Works offline between sets.
            </>
          ) : (
            <>
              Install OVERLOAD via your browser menu{" "}
              <span className="text-[var(--fg)] font-bold">Add to Home Screen</span>.
              Runs offline between sets.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
