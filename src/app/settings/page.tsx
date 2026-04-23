"use client";

import { TopBar } from "@/components/TopBar";
import { useSettings } from "@/lib/useSettings";
import {
  DEFAULT_SETTINGS,
  exportAll,
  importAll,
  nukeAll,
  saveSettings,
} from "@/lib/storage";
import { useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import { useTimer } from "@/components/TimerProvider";

export default function SettingsPage() {
  const settings = useSettings();
  const { start } = useTimer();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ kind: "info" | "err"; text: string } | null>(null);

  const update = (patch: Partial<typeof settings>) =>
    saveSettings({ ...settings, ...patch });

  const restMin = Math.floor(settings.restSeconds / 60);
  const restSec = settings.restSeconds % 60;

  const setRest = (min: number, sec: number) => {
    const total = Math.max(15, Math.min(600, min * 60 + sec));
    update({ restSeconds: total });
  };

  const doExport = () => {
    const data = exportAll();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `overload-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg({ kind: "info", text: "EXPORTED." });
  };

  const onImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const { sessions } = importAll(text);
      setMsg({ kind: "info", text: `IMPORTED ${sessions} SESSIONS.` });
    } catch (err) {
      setMsg({
        kind: "err",
        text: `IMPORT FAILED: ${(err as Error).message.toUpperCase()}`,
      });
    } finally {
      e.target.value = "";
    }
  };

  const confirmNuke = () => {
    const sure = window.confirm(
      "DELETE ALL LOGGED SESSIONS AND SETTINGS? THIS CANNOT BE UNDONE.",
    );
    if (!sure) return;
    nukeAll();
    setMsg({ kind: "info", text: "ALL DATA WIPED." });
  };

  const testTimer = () => start(5, "TIMER TEST");

  return (
    <>
      <TopBar />
      <main className="flex-1 pb-40">
        <section className="px-3 pt-5 pb-3 border-b border-[var(--border)]">
          <div className="mono-micro">[ CONFIG / UNIT PARAMETERS ]</div>
          <h1 className="display-big mt-2">SETTINGS</h1>
        </section>

        <section className="px-3 pt-5">
          <h2 className="mono-tag mb-3">&gt;&gt; REST TIMER</h2>
          <div className="brutal-border p-3">
            <div className="mono-micro mb-2">DEFAULT REST DURATION</div>
            <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
              <input
                type="number"
                min={0}
                max={10}
                value={restMin}
                onChange={(e) => setRest(Number(e.target.value) || 0, restSec)}
                aria-label="Rest minutes"
              />
              <span className="mono-tag">MIN</span>
              <input
                type="number"
                min={0}
                max={59}
                value={restSec}
                onChange={(e) => setRest(restMin, Number(e.target.value) || 0)}
                aria-label="Rest seconds"
              />
              <span className="mono-tag">SEC</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="mono-micro">
                CURRENT:{" "}
                <span className="text-[var(--fg)] font-bold tabular-nums">
                  {String(restMin).padStart(2, "0")}:{String(restSec).padStart(2, "0")}
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  update({ restSeconds: DEFAULT_SETTINGS.restSeconds })
                }
                className="btn btn-ghost !min-h-[40px] !px-3"
              >
                RESET 2:30
              </button>
            </div>
          </div>
        </section>

        <section className="px-3 pt-5">
          <h2 className="mono-tag mb-3">&gt;&gt; ALERTS</h2>
          <div className="grid-rule grid-cols-1 brutal-border">
            <Toggle
              label="SOUND"
              sub="BEEP ON FINAL 10S + COMPLETE"
              checked={settings.soundOn}
              onChange={(v) => update({ soundOn: v })}
            />
            <Toggle
              label="VIBRATION"
              sub="HAPTIC ON LOG + ALERT"
              checked={settings.vibrationOn}
              onChange={(v) => update({ vibrationOn: v })}
            />
            <Toggle
              label="NOTIFICATIONS"
              sub="FIRES EVEN WITH SCREEN LOCKED"
              checked={settings.notificationsOn}
              onChange={(v) => update({ notificationsOn: v })}
            />
          </div>
          <button
            type="button"
            onClick={testTimer}
            className="btn mt-3 w-full"
          >
            TEST ALERT (5S)
          </button>
        </section>

        <section className="px-3 pt-5">
          <h2 className="mono-tag mb-3">&gt;&gt; DATA</h2>
          <div className="grid grid-cols-2 gap-[1px] bg-[var(--border)] brutal-border">
            <button
              type="button"
              onClick={doExport}
              className="bg-[var(--bg)] hover:bg-[var(--panel)] py-4 mono-tag flex items-center justify-center gap-2"
            >
              <Download size={14} strokeWidth={2.5} /> EXPORT
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="bg-[var(--bg)] hover:bg-[var(--panel)] py-4 mono-tag flex items-center justify-center gap-2"
            >
              <Upload size={14} strokeWidth={2.5} /> IMPORT
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            onChange={onImportFile}
            className="sr-only"
          />
          <button
            type="button"
            onClick={confirmNuke}
            className="btn w-full mt-3 !border-[var(--accent)] !text-[var(--accent)] hover:!bg-[var(--accent)] hover:!text-black"
          >
            <Trash2 size={14} strokeWidth={2.5} /> NUKE ALL DATA
          </button>
        </section>

        {msg ? (
          <div
            className={
              "mx-3 mt-5 px-3 py-2 border " +
              (msg.kind === "err"
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--fg)]")
            }
          >
            <span className="mono-tag">{msg.text}</span>
          </div>
        ) : null}

        <section className="px-3 pt-8 text-center mono-micro">
          OVERLOAD · REV 1.0 · BUILT FOR FAILURE
        </section>
      </main>
    </>
  );
}

function Toggle({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string;
  sub: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="grid grid-cols-[1fr_auto] items-center gap-3 px-3 py-4 cursor-pointer select-none bg-[var(--bg)]">
      <div>
        <div className="mono-tag text-[var(--fg)]">{label}</div>
        <div className="mono-micro mt-0.5">{sub}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={
          "relative w-[56px] h-[28px] border " +
          (checked
            ? "bg-[var(--accent)] border-[var(--accent)]"
            : "bg-[var(--panel)] border-[var(--border)]")
        }
      >
        <span
          className={
            "absolute top-0.5 w-[20px] h-[20px] transition-all " +
            (checked ? "left-[32px] bg-black" : "left-0.5 bg-[var(--fg)]")
          }
        />
      </button>
    </label>
  );
}
