import type { Task } from "@/lib/types";

function formatEstimate(min: number): string {
  if (min < 60) return `${min} хв`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} год ${m} хв` : `${h} год`;
}

function formatDeadline(iso: string): string {
  // YYYY-MM-DD → DD.MM
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}`;
}

export default function TaskMeta({ task }: { task: Task }) {
  const hasMeta =
    task.priority === "must" || task.estimateMin != null || task.deadline;
  if (!hasMeta) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      {task.priority === "must" && (
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "#3b1f1f", color: "#f87171" }}
        >
          🔥 терміново
        </span>
      )}
      {task.estimateMin != null && (
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: "#1e1e1e", color: "#9ca3af" }}
        >
          ⏱ {formatEstimate(task.estimateMin)}
        </span>
      )}
      {task.deadline && (
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: "#1e1b3a", color: "#a5b4fc" }}
        >
          📅 {formatDeadline(task.deadline)}
        </span>
      )}
    </div>
  );
}
