// критично — сьогодні; важливо — 2-3 дні; неважливо — 3-10 днів; беклог — ідея на майбутнє
export type Priority = "critical" | "important" | "normal" | "backlog";
export type Category = "work" | "personal";

export interface Task {
  id: string;
  text: string;            // title — коротке формулювання задачі
  done: boolean;
  inToday: boolean;
  createdAt: number;
  category: Category;
  priority: Priority;
  estimateMin: number | null;
  deadline: string | null; // YYYY-MM-DD або null
}

// Дані задачі від парсера (без службових полів).
export interface ParsedTask {
  text: string;
  category: Category;
  priority: Priority;
  estimateMin: number | null;
  deadline: string | null;
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  critical: "критично",
  important: "важливо",
  normal: "неважливо",
  backlog: "беклог",
};

export const CATEGORY_LABEL: Record<Category, string> = {
  work: "Робота",
  personal: "Особисте",
};
