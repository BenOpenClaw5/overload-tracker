"use client";

import Link from "next/link";
import { ArrowLeft, History, Settings as SettingsIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

export function TopBar() {
  const pathname = usePathname();
  const showBack = pathname !== "/";

  return (
    <header className="bar-top sticky top-0 z-30 safe-top">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-3">
        <div className="flex items-center gap-2">
          {showBack ? (
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-2 py-1 border border-[var(--border)] text-[var(--fg-dim)] hover:text-[var(--fg)]"
              aria-label="Back to home"
            >
              <ArrowLeft size={14} strokeWidth={2.5} />
              <span className="mono-tag">HOME</span>
            </Link>
          ) : (
            <Link href="/" className="text-[var(--fg)] flex items-center gap-2">
              <Logo size={18} />
            </Link>
          )}
        </div>
        <div className="text-center mono-micro truncate">
          [ UNIT / OVERLOAD · REV 1.0 ]
        </div>
        <nav className="flex items-center gap-1">
          <Link
            href="/history"
            aria-label="History"
            className={
              "p-2 border border-[var(--border)] " +
              (pathname?.startsWith("/history")
                ? "bg-[var(--fg)] text-[var(--bg)]"
                : "text-[var(--fg-dim)] hover:text-[var(--fg)]")
            }
          >
            <History size={16} strokeWidth={2.5} />
          </Link>
          <Link
            href="/settings"
            aria-label="Settings"
            className={
              "p-2 border border-[var(--border)] " +
              (pathname?.startsWith("/settings")
                ? "bg-[var(--fg)] text-[var(--bg)]"
                : "text-[var(--fg-dim)] hover:text-[var(--fg)]")
            }
          >
            <SettingsIcon size={16} strokeWidth={2.5} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
