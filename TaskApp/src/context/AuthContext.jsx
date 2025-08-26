/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useUsers } from "./UsersContext.jsx";

const STORAGE_KEY = "taskpro.auth.v1";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const { findByEmail, getUserById } = useUsers();

    const [currentUserId, setCurrentUserId] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });

    // Persist auth
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUserId));
    }, [currentUserId]);

    // Mevcut kullanıcıyı hesapla
    const currentUser = useMemo(
        () => (currentUserId ? getUserById(currentUserId) : null),
        [currentUserId, getUserById]
    );

    // Silinmiş / bulunamayan kullanıcı id'sini temizle
    useEffect(() => {
        if (currentUserId && !currentUser) {
            setCurrentUserId(null);
        }
    }, [currentUserId, currentUser]);

    const login = useCallback((email, password) => {
        const user = findByEmail(email);
        if (!user) throw new Error("Kullanıcı bulunamadı.");
        if (user.password !== password) throw new Error("Şifre hatalı.");
        setCurrentUserId(user.id);
        return user;
    }, [findByEmail]);

    const logout = useCallback(() => {
        setCurrentUserId(null);
    }, []);

    const isAdmin = useMemo(() => !!currentUser && currentUser.role === "admin", [currentUser]);

    const value = useMemo(() => ({
        currentUser,
        isAdmin,
        login,
        logout,
    }), [currentUser, isAdmin, login, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth yalnızca AuthProvider içinde kullanılabilir.");
    return ctx;
}