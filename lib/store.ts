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

function makeTask(text: string): Task {
  return {
    id: crypto.randomUUID(),
    text: text.trim(),
    done: false,
    inToday: false,
    createdAt: Date.now(),
  };
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => { setTasks(load()); }, []);

  // Усі мутації — через функціональне оновлення (prev => next), щоб не
  // читати застарілий стан. Збереження в localStorage робимо тут же.
  const mutate = useCallback((fn: (prev: Task[]) => Task[]) => {
    setTasks((prev) => {
      const next = fn(prev);
      save(next);
      return next;
    });
  }, []);

  const addTask = useCallback((text: string) => {
    mutate((prev) => [makeTask(text), ...prev]);
  }, [mutate]);

  // Пакетне додавання — усі задачі одним оновленням (без втрат у циклі).
  const addTasks = useCallback((texts: string[]) => {
    const fresh = texts.map((t) => t.trim()).filter(Boolean).map(makeTask);
    if (!fresh.length) return;
    mutate((prev) => [...fresh, ...prev]);
  }, [mutate]);

  const toggleDone = useCallback((id: string) => {
    mutate((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, [mutate]);

  const toggleToday = useCallback((id: string) => {
    mutate((prev) => prev.map((t) => (t.id === id ? { ...t, inToday: !t.inToday } : t)));
  }, [mutate]);

  const deleteTask = useCallback((id: string) => {
    mutate((prev) => prev.filter((t) => t.id !== id));
  }, [mutate]);

  return { tasks, addTask, addTasks, toggleDone, toggleToday, deleteTask };
}
