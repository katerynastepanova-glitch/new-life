"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task, ParsedTask } from "./types";

const KEY = "new-life-tasks";

function load(): Task[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); }
  catch { return []; }
}

function save(tasks: Task[]) {
  localStorage.setItem(KEY, JSON.stringify(tasks));
}

function makeTask(input: string | ParsedTask): Task {
  const p: ParsedTask =
    typeof input === "string"
      ? { text: input, category: "personal", priority: "normal", estimateMin: null, deadline: null }
      : input;
  return {
    id: crypto.randomUUID(),
    text: p.text.trim(),
    done: false,
    inToday: false,
    createdAt: Date.now(),
    category: p.category === "work" ? "work" : "personal",
    priority: p.priority ?? "normal",
    estimateMin: p.estimateMin ?? null,
    deadline: p.deadline ?? null,
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
  // Приймає або рядки, або структуровані задачі від парсера.
  const addTasks = useCallback((items: (string | ParsedTask)[]) => {
    const fresh = items
      .filter((i) => (typeof i === "string" ? i.trim() : i.text?.trim()))
      .map(makeTask);
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
