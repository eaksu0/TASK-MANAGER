import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

// LocalStorage anahtarı
const STORAGE_KEY = "taskpro.tasks.v1";

// Yardımcılar
function randomId() {
    try { return crypto.randomUUID(); }
    catch { return Math.random().toString(36).slice(2, 10); }
}
function loadTasks() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
    } catch { return []; }
}
function saveTasks(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// Context
const TasksContext = createContext(null);

export function TasksProvider({ children }) {
    const [tasks, setTasks] = useState(loadTasks());

    // Değişiklikte localStorage'a yaz
    useEffect(() => { saveTasks(tasks); }, [tasks]);

    // CRUD
    const createTask = useCallback(({ title, description = "", priority = "orta", deadline = "", status = "yapilacak", assignedTo = null }) => {
        const now = new Date().toISOString();
        const task = { id: randomId(), title, description, priority, deadline, status, assignedTo, createdAt: now, updatedAt: now };
        setTasks(prev => [task, ...prev]);
        return task.id;
    }, []);
    const updateTask = useCallback((id, patch) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t));
    }, []);
    const deleteTask = useCallback((id) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    }, []);
    const getTaskById = useCallback((id) => {
        return tasks.find(t => t.id === id) || null;
    }, [tasks]);

    const value = useMemo(() => ({ tasks, createTask, updateTask, deleteTask, getTaskById }), [tasks, createTask, updateTask, deleteTask, getTaskById]);
    return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTasks() {
    const ctx = useContext(TasksContext);
    if (!ctx) throw new Error("useTasks yalnızca TasksProvider içinde kullanılabilir.");
    return ctx;
}
