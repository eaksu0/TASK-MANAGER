/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { storage, uid } from "./utils";

const STORAGE_KEY = "taskpro.users.v1";

export function loadUsers() {
  return storage.get(STORAGE_KEY, []);
}
export function saveUsers(list) {
  storage.set(STORAGE_KEY, list);
}

export const UsersContext = createContext(null);

export function UsersProvider({ children }) {
  const [users, setUsers] = useState(() => {
    const list = loadUsers();
    if (Array.isArray(list) && list.length > 0) return list;
    // İlk açılışta admin + Yücel seed et
    const now = new Date().toISOString();
    const initial = [
      {
        id: uid(),
        name: "Admin",
        email: "admin@local",
        password: "admin",
        role: "admin",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uid(),
        name: "Yücel Kandaş",
        email: "yucel_kandas@hotmail.com",
        password: "1234",
        role: "user",
        createdAt: now,
        updatedAt: now,
      }
    ];
    saveUsers(initial);
    return initial;
  });

  useEffect(() => { saveUsers(users); }, [users]);

  const findByEmail = useCallback((email) => {
    const key = (email || "").trim().toLowerCase();
    return users.find(u => u.email.toLowerCase() === key) || null;
  }, [users]);

  const getUserById = useCallback((id) => {
    return users.find(u => u.id === id) || null;
  }, [users]);

  const createUser = useCallback(({ name, email, password = "1234", role = "user" }) => {
    const e = (email || "").trim();
    if (!name?.trim() || !e) throw new Error("Ad ve e-posta zorunlu.");
    if (users.some(u => u.email.toLowerCase() === e.toLowerCase())) {
      throw new Error("Bu e-posta zaten kayıtlı.");
    }
    const now = new Date().toISOString();
    const user = { id: uid(), name: name.trim(), email: e, password, role, createdAt: now, updatedAt: now };
    setUsers(prev => [user, ...prev]);
    return user.id;
  }, [users]);

  const deleteUser = useCallback((id) => {
    const target = users.find(u => u.id === id);
    if (!target) return;
    if (target.role === "admin") {
      const adminCount = users.filter(u => u.role === "admin").length;
      if (adminCount <= 1) throw new Error("Son admin silinemez.");
    }
    setUsers(prev => prev.filter(u => u.id !== id));
  }, [users]);

  const updateUser = useCallback((id, patch) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...patch, updatedAt: new Date().toISOString() } : u));
  }, []);

  const value = useMemo(() => ({
    users,
    createUser,
    deleteUser,
    updateUser,
    findByEmail,
    getUserById,
  }), [users, createUser, deleteUser, updateUser, findByEmail, getUserById]);

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
}

export function useUsers() {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers yalnızca UsersProvider içinde kullanılabilir.");
  return ctx;
}