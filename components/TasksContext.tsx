"use client";

import { createContext, useContext } from "react";
import { useTasks } from "@/lib/store";
import type { Task } from "@/lib/types";

interface Ctx {
  tasks: Task[];
  addTask: (text: string) => void;
  addTasks: (texts: string[]) => void;
  toggleDone: (id: string) => void;
  toggleToday: (id: string) => void;
  deleteTask: (id: string) => void;
}

const TasksContext = createContext<Ctx | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  return <TasksContext.Provider value={useTasks()}>{children}</TasksContext.Provider>;
}

export function useTasksCtx() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasksCtx outside TasksProvider");
  return ctx;
}
