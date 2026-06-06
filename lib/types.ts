export type Priority = "must" | "nice";

export interface Task {
  id: string;
  text: string;            // title — коротке формулювання задачі
  done: boolean;
  inToday: boolean;
  createdAt: number;
  priority: Priority;
  estimateMin: number | null;
  deadline: string | null; // YYYY-MM-DD або null
}

// Дані задачі від парсера (без службових полів).
export interface ParsedTask {
  text: string;
  priority: Priority;
  estimateMin: number | null;
  deadline: string | null;
}
