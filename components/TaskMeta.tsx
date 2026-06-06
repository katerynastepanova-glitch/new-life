import type { Task, Priority, Category } from "@/lib/types";
import { PRIORITY_LABEL, CATEGORY_LABEL } from "@/lib/types";

function formatEstimate(min: number): string {
  if (min < 60) return `${min} хв`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} год ${m} хв` : `${h} год`;
}

function formatDeadline(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}`;
}

const PRIORITY_STYLE: Record<Priority, { bg: string; color: string; icon: string }> = {
  critical:  { bg: "#3b1f1f", color: "#f87171", icon: "🔴" },
  important: { bg: "#3a2e1b", color: "#fbbf24", icon: "🟠" },
  normal:    { bg: "#1b2a3a", color: "#60a5fa", icon: "🔵" },
  backlog:   { bg: "#1e1e1e", color: "#9ca3af", icon: "⚪️" },
};

const CATEGORY_STYLE: Record<Category, { bg: string; color: string; icon: string }> = {
  work:     { bg: "#1e1b3a", color: "#a5b4fc", icon: "💼" },
  personal: { bg: "#1b2e22", color: "#6ee7b7", icon: "🏠" },
};

export function CategoryBadge({ category }: { category: Category }) {
  const s = CATEGORY_STYLE[category] ?? CATEGORY_STYLE.personal;
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color }}>
      {s.icon} {CATEGORY_LABEL[category] ?? "Особисте"}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const s = PRIORITY_STYLE[priority] ?? PRIORITY_STYLE.normal;
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color }}>
      {s.icon} {PRIORITY_LABEL[priority] ?? "неважливо"}
    </span>
  );
}

export default function TaskMeta({ task }: { task: Task }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      {task.category && <CategoryBadge category={task.category} />}
      {task.priority && <PriorityBadge priority={task.priority} />}
      {task.estimateMin != null && (
        <span className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: "#1e1e1e", color: "#9ca3af" }}>
          ⏱ {formatEstimate(task.estimateMin)}
        </span>
      )}
      {task.deadline && (
        <span className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: "#2a1e3a", color: "#c4b5fd" }}>
          📅 {formatDeadline(task.deadline)}
        </span>
      )}
    </div>
  );
}

export { formatEstimate };
