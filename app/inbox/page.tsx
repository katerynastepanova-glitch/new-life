"use client";

import { useTasksCtx } from "@/components/TasksContext";

export default function InboxPage() {
  const { tasks, toggleToday, deleteTask } = useTasksCtx();
  const inbox = tasks.filter(t => !t.inToday);

  return (
    <div className="px-4 pt-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold" style={{ color: "#f5f5f5" }}>Inbox</h1>
        <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
          {inbox.length > 0
            ? `${inbox.length} задач — додайте потрібні на сьогодні`
            : "Порожньо — перейдіть на Capture і додайте задачі"}
        </p>
      </div>

      {inbox.length === 0 && (
        <div className="rounded-2xl flex flex-col items-center justify-center py-16 gap-3"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" strokeWidth="1.5">
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
            <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>
          </svg>
          <span style={{ color: "#3d3d3d" }} className="text-sm">Тут з'являться ваші задачі</span>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {inbox.map(task => (
          <li key={task.id}
            className="rounded-2xl px-4 py-4 flex items-center gap-3"
            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
            <span className="flex-1 text-base leading-snug" style={{ color: "#f5f5f5" }}>
              {task.text}
            </span>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => toggleToday(task.id)}
                className="rounded-xl px-3 text-sm font-medium transition-all active:scale-95"
                style={{ background: "#6366f1", color: "#fff", minWidth: 44, minHeight: 44 }}>
                → Today
              </button>
              <button onClick={() => deleteTask(task.id)}
                className="rounded-xl flex items-center justify-center transition-all active:scale-95"
                style={{ background: "#1e1e1e", border: "1px solid #2a2a2a", minWidth: 44, minHeight: 44 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
