"use client";

import { useState, useRef } from "react";
import { useTasksCtx } from "@/components/TasksContext";
import { parseTasks } from "@/lib/parse";
import { useRouter } from "next/navigation";

export default function CapturePage() {
  const [listening, setListening] = useState(false);
  const [saved, setSaved] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [hasText, setHasText] = useState(false);
  const { addTasks } = useTasksCtx();
  const router = useRouter();

  // Поле НЕкероване: текст живе в DOM, React його не перемальовує.
  // Саме це лагодить втрату задач при диктовці на iOS.
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recRef = useRef<unknown>(null);
  const baseTextRef = useRef("");        // текст, зафіксований із попередніх сесій
  const sessionFinalRef = useRef("");    // фіналізоване в поточній сесії
  const manualStopRef = useRef(false);

  function setFieldValue(value: string) {
    if (textareaRef.current) textareaRef.current.value = value;
    setHasText(!!value.trim());
  }

  async function handleSave() {
    const raw = textareaRef.current?.value ?? "";
    if (!raw.trim() || processing) return;

    // якщо запис ще йде — зупиняємо перед збереженням
    if (listening) {
      manualStopRef.current = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (recRef.current as any)?.stop();
      setListening(false);
    }

    setProcessing(true);

    // Спершу AI-розбір; якщо недоступний — запасна евристика.
    let lines: string[] = [];
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: raw }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.tasks)) lines = data.tasks;
      }
    } catch {
      // мережа недоступна — впадемо на евристику
    }
    if (!lines.length) lines = parseTasks(raw);

    setProcessing(false);
    if (!lines.length) return;
    addTasks(lines); // усі задачі одним оновленням — без втрат
    setFieldValue("");
    setSaved(true);
    setTimeout(() => { setSaved(false); router.push("/inbox"); }, 800);
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
      // Обробляємо лише НОВІ результати (від resultIndex). Фіналізовані одразу
      // дописуємо в постійний накопичувач — тож навіть якщо iOS обріже свій
      // буфер у довгій сесії, раніше сказане вже збережено.
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
      // Фіксуємо все показане (фінал + «хвіст» interim) як базу, скидаємо
      // лічильник сесії — наступна сесія тільки ДОПИСУЄ.
      baseTextRef.current = (textareaRef.current?.value ?? "").trim();
      sessionFinalRef.current = "";
      if (!manualStopRef.current) {
        startRecognition(); // тримаємо запис через паузи, поки не натиснуто «стоп»
      } else {
        setListening(false);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (ev: any) => {
      if (ev.error === "not-allowed" || ev.error === "service-not-allowed") {
        manualStopRef.current = true;
        setListening(false);
        alert("Дозвольте доступ до мікрофона, щоб користуватися кнопкою запису.");
      }
      // no-speech / aborted — нормально, onend перезапустить
    };

    rec.start();
    recRef.current = rec;
  }

  function handleMic() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    // Браузер без Web Speech (Chrome на iOS) — відкриваємо клавіатуру з її 🎤.
    if (!SR) {
      textareaRef.current?.focus();
      return;
    }

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
            background: saved ? "#16a34a" : hasText ? "#6366f1" : "#1e1e1e",
            color: hasText ? "#fff" : "#3d3d3d",
          }}
        >
          {saved
            ? "✓ Збережено"
            : processing
            ? "✨ Розбираю…"
            : "Зберегти задачі →"}
        </button>
      </div>
    </div>
  );
}
