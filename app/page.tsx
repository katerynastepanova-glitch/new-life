"use client";

import { useState, useRef } from "react";
import { useTasksCtx } from "@/components/TasksContext";
import { parseTasks } from "@/lib/parse";
import type { ParsedTask } from "@/lib/types";
import { CategoryBadge, PriorityBadge, formatEstimate } from "@/components/TaskMeta";
import { useRouter } from "next/navigation";

// Рядок (евристика) → структурована задача з типовими значеннями.
function toParsed(item: string | ParsedTask): ParsedTask {
  if (typeof item !== "string") return item;
  return { text: item, category: "personal", priority: "normal", estimateMin: 30, deadline: null };
}

export default function CapturePage() {
  const [listening, setListening] = useState(false);
  const [saved, setSaved] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [hasText, setHasText] = useState(false);
  const [review, setReview] = useState<ParsedTask[] | null>(null); // екран підтвердження
  const { addTasks } = useTasksCtx();
  const router = useRouter();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recRef = useRef<unknown>(null);
  const baseTextRef = useRef("");
  const sessionFinalRef = useRef("");
  const manualStopRef = useRef(false);

  function setFieldValue(value: string) {
    if (textareaRef.current) textareaRef.current.value = value;
    setHasText(!!value.trim());
  }

  async function handleSave() {
    const raw = textareaRef.current?.value ?? "";
    if (!raw.trim() || processing) return;

    if (listening) {
      manualStopRef.current = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (recRef.current as any)?.stop();
      setListening(false);
    }

    setProcessing(true);

    let items: (string | ParsedTask)[] = [];
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: raw }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.tasks)) items = data.tasks;
      }
    } catch {
      // мережа недоступна — евристика
    }
    if (!items.length) items = parseTasks(raw);

    setProcessing(false);
    if (!items.length) return;
    // не зберігаємо одразу — показуємо екран підтвердження часу
    setReview(items.map(toParsed));
  }

  // --- екран підтвердження ---
  function adjustEstimate(i: number, delta: number) {
    setReview((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      const cur = next[i].estimateMin ?? 0;
      next[i] = { ...next[i], estimateMin: Math.max(5, cur + delta) };
      return next;
    });
  }

  function removeReviewItem(i: number) {
    setReview((prev) => (prev ? prev.filter((_, idx) => idx !== i) : prev));
  }

  function confirmReview() {
    if (!review || !review.length) return;
    addTasks(review);
    setReview(null);
    setFieldValue("");
    setSaved(true);
    setTimeout(() => { setSaved(false); router.push("/inbox"); }, 600);
  }

  function startRecognition() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new SR() as any;
    rec.lang = "uk-UA";
    rec.continuous = true;
    rec.interimResults = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) sessionFinalRef.current += r[0].transcript + " ";
        else interim += r[0].transcript + " ";
      }
      const combined = (baseTextRef.current + " " + sessionFinalRef.current + " " + interim).trim();
      setFieldValue(combined);
    };

    rec.onend = () => {
      baseTextRef.current = (textareaRef.current?.value ?? "").trim();
      sessionFinalRef.current = "";
      setListening(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (ev: any) => {
      if (ev.error === "not-allowed" || ev.error === "service-not-allowed") {
        manualStopRef.current = true;
        setListening(false);
        alert("Дозвольте доступ до мікрофона, щоб користуватися кнопкою запису.");
      }
    };

    rec.start();
    recRef.current = rec;
  }

  function handleMic() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { textareaRef.current?.focus(); return; }

    if (listening) {
      manualStopRef.current = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (recRef.current as any)?.stop();
      setListening(false);
      return;
    }

    manualStopRef.current = false;
    baseTextRef.current = (textareaRef.current?.value ?? "").trim();
    sessionFinalRef.current = "";
    startRecognition();
    setListening(true);
  }

  // ===== Екран підтвердження часу =====
  if (review) {
    const total = review.reduce((s, t) => s + (t.estimateMin ?? 0), 0);
    return (
      <div className="flex flex-col" style={{ minHeight: "100dvh", paddingBottom: 80 }}>
        <div className="px-5 pt-6 pb-3">
          <h1 className="text-2xl font-bold" style={{ color: "#f5f5f5" }}>Перевірте час</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            Скоригуйте оцінку, якщо задача займе більше чи менше. Разом: {formatEstimate(total)}
          </p>
        </div>

        <div className="flex-1 px-4 pb-4 flex flex-col gap-3">
          {review.map((t, i) => (
            <div key={i} className="rounded-2xl px-4 py-4"
              style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
              <div className="flex items-start gap-2">
                <span className="flex-1 text-base leading-snug" style={{ color: "#f5f5f5" }}>
                  {t.text}
                </span>
                <button onClick={() => removeReviewItem(i)}
                  className="shrink-0 rounded-lg flex items-center justify-center active:scale-95"
                  style={{ width: 32, height: 32, background: "#1e1e1e", border: "1px solid #2a2a2a" }}
                  aria-label="Прибрати">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <CategoryBadge category={t.category} />
                <PriorityBadge priority={t.priority} />
                {t.deadline && (
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "#2a1e3a", color: "#c4b5fd" }}>
                    📅 {t.deadline.slice(8, 10)}.{t.deadline.slice(5, 7)}
                  </span>
                )}
              </div>

              {/* регулятор часу */}
              <div className="flex items-center gap-3 mt-3">
                <span className="text-sm" style={{ color: "#6b7280" }}>Час:</span>
                <button onClick={() => adjustEstimate(i, -15)}
                  className="rounded-lg flex items-center justify-center text-xl active:scale-90"
                  style={{ width: 40, height: 40, background: "#1e1e1e", border: "1px solid #2a2a2a", color: "#f5f5f5" }}>
                  −
                </button>
                <span className="text-base font-semibold tabular-nums" style={{ color: "#f5f5f5", minWidth: 84, textAlign: "center" }}>
                  {formatEstimate(t.estimateMin ?? 0)}
                </span>
                <button onClick={() => adjustEstimate(i, 15)}
                  className="rounded-lg flex items-center justify-center text-xl active:scale-90"
                  style={{ width: 40, height: 40, background: "#1e1e1e", border: "1px solid #2a2a2a", color: "#f5f5f5" }}>
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 pb-4 flex gap-3">
          <button onClick={() => setReview(null)}
            className="rounded-2xl text-base font-medium active:scale-95"
            style={{ height: 64, paddingInline: 20, background: "#1e1e1e", border: "1px solid #2a2a2a", color: "#9ca3af" }}>
            Назад
          </button>
          <button onClick={confirmReview}
            className="flex-1 rounded-2xl text-lg font-semibold active:scale-95"
            style={{ height: 64, background: saved ? "#16a34a" : "#6366f1", color: "#fff" }}>
            {saved ? "✓ Додано" : `Додати ${review.length} задач →`}
          </button>
        </div>
      </div>
    );
  }

  // ===== Екран Capture =====
  return (
    <div className="flex flex-col" style={{ height: "100dvh", paddingBottom: 80 }}>
      <div className="px-5 pt-6 pb-3">
        <h1 className="text-2xl font-bold" style={{ color: "#f5f5f5" }}>Що в голові?</h1>
        <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
          Натисніть мікрофон і диктуйте все підряд (натисніть ще раз, щоб зупинити) — AI сам розкладе на задачі.
        </p>
      </div>

      <div className="flex-1 px-4 pb-4">
        <textarea
          ref={textareaRef}
          onChange={(e) => setHasText(!!e.target.value.trim())}
          placeholder="Написати звіт, зателефонувати Олені, купити продукти…"
          className="w-full h-full rounded-2xl p-4 text-lg resize-none outline-none leading-relaxed"
          style={{ background: "#1a1a1a", color: "#f5f5f5", border: "1px solid #2a2a2a", caretColor: "#6366f1" }}
          autoFocus
        />
      </div>

      <div className="px-4 pb-4 flex gap-3">
        <button
          onClick={handleMic}
          className="flex items-center justify-center rounded-2xl transition-all active:scale-95"
          style={{
            width: 64, height: 64, flexShrink: 0,
            background: listening ? "#6366f1" : "#1e1e1e",
            border: `2px solid ${listening ? "#6366f1" : "#2a2a2a"}`,
          }}
          aria-label={listening ? "Зупинити" : "Говорити"}
        >
          {listening ? (
            <span className="relative flex">
              <span className="animate-ping absolute inline-flex h-5 w-5 rounded-full opacity-75"
                style={{ background: "#fff" }} />
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="6" width="12" height="12" rx="2"/>
              </svg>
            </span>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
              stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
              <path d="M19 10v2a7 7 0 01-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          )}
        </button>

        <button
          onClick={handleSave}
          disabled={!hasText || processing}
          className="flex-1 rounded-2xl text-lg font-semibold transition-all active:scale-95"
          style={{
            height: 64,
            background: hasText ? "#6366f1" : "#1e1e1e",
            color: hasText ? "#fff" : "#3d3d3d",
          }}
        >
          {processing ? "✨ Розбираю…" : "Розібрати задачі →"}
        </button>
      </div>
    </div>
  );
}
