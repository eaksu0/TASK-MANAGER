import React, { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "../context/TasksContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import TaskCard from "../components/TaskCard.jsx";

export default function MyTasksPage() {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { tasks, updateTask, deleteTask, getTasksByAssignee } = useTasks();

  useEffect(() => {
    if (!currentUser) navigate("/login");
  }, [currentUser, navigate]);

  const mine = useMemo(() => {
    if (!currentUser) return [];
    return typeof getTasksByAssignee === "function"
      ? getTasksByAssignee(currentUser.id)
      : tasks.filter(t => t.assignedTo === currentUser.id);
  }, [tasks, currentUser, getTasksByAssignee]);

  return (
    <section>
      <h1 className="page-title">Benim Gorevlerim</h1>
      <div className="grid grid-2">
        {mine.length === 0 && <div className="empty">Sana atanmış görev bulunmuyor.</div>}
        {mine.map(t => (
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