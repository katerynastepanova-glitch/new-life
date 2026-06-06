"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task } from "./types";

const KEY = "new-life-tasks";

function load(): Task[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); }
  catch { return []; }
}

function save(tasks: Task[]) {
  localStorage.setItem(KEY, JSON.stringify(tasks));
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => { setTasks(load()); }, []);

  const update = useCallback((next: Task[]) => {
    setTasks(next);
    save(next);
  }, []);

  const addTask = useCallback((text: string) => {
    const task: Task = {
      id: crypto.randomUUID(),
      text: text.trim(),
      done: false,
      inToday: false,
      createdAt: Date.now(),
    };
    update([task, ...tasks]);
  }, [tasks, update]);

  const toggleDone   = useCallback((id: string) =>
    update(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)), [tasks, update]);

  const toggleToday  = useCallback((id: string) =>
    update(tasks.map(t => t.id === id ? { ...t, inToday: !t.inToday } : t)), [tasks, update]);

  const deleteTask   = useCallback((id: string) =>
    update(tasks.filter(t => t.id !== id)), [tasks, update]);

  return { tasks, addTask, toggleDone, toggleToday, deleteTask };
}
