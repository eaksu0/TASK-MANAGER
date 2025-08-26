import React, { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "../context/TasksContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import TaskCard from "../components/TaskCard.jsx";
import { toStatusClass } from "../context/utils.js";

// Aktif Görevler sayfası: mevcut kullanıcıya atanmış ve "yapilacak" durumundaki görevler
export default function MyTasksPage() {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { tasks, updateTask, deleteTask } = useTasks();

  useEffect(() => {
    if (!currentUser) navigate("/login");
  }, [currentUser, navigate]);

  const active = useMemo(() => {
    if (!currentUser) return [];
    return tasks.filter(t => t.assignedTo === currentUser.id && toStatusClass(t.status) === "yapilacak");
  }, [tasks, currentUser]);

  return (
    <section>
      <h1 className="page-title">Aktif Gorevler</h1>
      <div className="grid grid-2">
        {active.length === 0 && <div className="empty">Aktif (yapilacak) görev bulunmuyor.</div>}
        {active.map(t => (
          <TaskCard
            key={t.id}
            task={t}
            onStatusChange={isAdmin ? ((s) => updateTask(t.id, { status: s })) : undefined}
            onDelete={isAdmin ? (() => { if (confirm("Bu gorevi silmek istedigine emin misin?")) deleteTask(t.id); }) : undefined}
          />
        ))}
      </div>
    </section>
  );
}