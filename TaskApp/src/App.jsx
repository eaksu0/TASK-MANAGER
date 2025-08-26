// Uygulama iskeleti + rotalar
import React, { useMemo } from "react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import TasksPage from "./pages/TasksPage.jsx";
import TaskForm from "./pages/TaskForm.jsx";
import TaskDetail from "./pages/TaskDetail.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import MyTasksPage from "./pages/MyTasksPage.jsx";
import AdminUsersPage from "./pages/AdminUsersPage.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { useTasks } from "./context/TasksContext.jsx";
import { toStatusClass } from "./context/utils.js";

export default function App() {
    const { currentUser, isAdmin, logout } = useAuth();
    const { tasks } = useTasks();
    const navigate = useNavigate();

    // Yalnızca mevcut kullanıcıya atanmış aktif (yapilacak) görevlerin sayısı
    const activeCount = useMemo(() => {
        if (!currentUser) return 0;
        return tasks.filter(t => t.assignedTo === currentUser.id && toStatusClass(t.status) === "yapilacak").length;
    }, [tasks, currentUser]);

    return (
        <div className="app-shell">
            {/* ÜST MENÜ */}
            <header className="app-header">
                <div className="container header-inner">
                    <Link to="/" className="brand">🧱 TaskPro</Link>
                    <nav className="nav">
                        <Link className="nav-link" to="/">Gorevler</Link>
                        <Link className="nav-link" to="/me">
                            Aktif Gorevler{activeCount > 0 && (
                                <span className="badge blue" style={{ marginLeft: 6 }}>{activeCount}</span>
                            )}
                        </Link>
                        {isAdmin && <Link className="nav-link" to="/admin/users">Kullanicilar</Link>}
                        {isAdmin && <Link className="btn-primary" to="/new">+ Yeni Gorev</Link>}
                        <div className="nav-divider" />
                        {currentUser ? (
                            <>
                                <span className="muted">👤 {currentUser.name}</span>
                                <button
                                    className="btn-ghost"
                                    onClick={() => { logout(); navigate("/login"); }}
                                >
                                    Cikis
                                </button>
                            </>
                        ) : (
                            <Link className="btn-ghost" to="/login">Giris</Link>
                        )}
                    </nav>
                </div>
            </header>

            {/* SAYFALAR */}
            <main className="container">
                <Routes>
                    <Route path="/" element={<TasksPage />} />
                    <Route path="/new" element={<TaskForm />} />
                    <Route path="/edit/:id" element={<TaskForm />} />
                    <Route path="/task/:id" element={<TaskDetail />} />

                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/me" element={<MyTasksPage />} />
                    <Route path="/admin/users" element={<AdminUsersPage />} />
                </Routes>
            </main>

            {/* ALT BİLGİ */}
            <footer className="app-footer">
                React + Vite • LocalStorage • {new Date().getFullYear()}
            </footer>
        </div>
    );
}
