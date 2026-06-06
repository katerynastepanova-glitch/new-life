"use client";

import { useTasksCtx } from "@/components/TasksContext";

export default function TodayPage() {
  const { tasks, toggleDone, toggleToday } = useTasksCtx();
  const today = tasks.filter(t => t.inToday);
  const done = today.filter(t => t.done).length;
  const pct = today.length > 0 ? Math.round((done / today.length) * 100) : 0;

  return (
    <div className="px-4 pt-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold" style={{ color: "#f5f5f5" }}>Today</h1>
        {today.length > 0 ? (
          <div className="mt-2">
            <div className="flex justify-between text-sm mb-2" style={{ color: "#6b7280" }}>
              <span>{done} з {today.length} виконано</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "#1e1e1e" }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: "#6366f1" }} />
            </div>
          </div>
        ) : (
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            Порожньо — перейдіть у Inbox і оберіть задачі на сьогодні
          </p>
        )}
      </div>

      {today.length === 0 && (
        <div className="rounded-2xl flex flex-col items-center justify-center py-16 gap-3"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" strokeWidth="1.5">
            <polyline points="9 11 12 14 22 4"/>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          <span style={{ color: "#3d3d3d" }} className="text-sm">Тут з'явиться ваш список на сьогодні</span>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {today.map(task => (
          <li key={task.id}
            className="rounded-2xl px-4 py-4 flex items-center gap-3 transition-all"
            style={{
              background: task.done ? "#141414" : "#1a1a1a",
              border: `1px solid ${task.done ? "#1e1e1e" : "#2a2a2a"}`,
            }}>
            <button onClick={() => toggleDone(task.id)}
              className="shrink-0 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{
                width: 28, height: 28,
                background: task.done ? "#6366f1" : "transparent",
                border: `2px solid ${task.done ? "#6366f1" : "#3d3d3d"}`,
              }}>
              {task.done && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>

            <span className="flex-1 text-base leading-snug" style={{
              color: task.done ? "#4b4b4b" : "#f5f5f5",
              textDecoration: task.done ? "line-through" : "none",
            }}>
              {task.text}
            </span>

            <button onClick={() => toggleToday(task.id)}
              className="shrink-0 rounded-xl flex items-center justify-center transition-all active:scale-95"
              style={{ width: 44, height: 44, background: "transparent", border: "1px solid #2a2a2a" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
