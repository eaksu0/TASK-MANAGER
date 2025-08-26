// Görev listesi sayfası: filtreler + durum değiştirme + silme
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PRIORITIES, STATUSES } from "../context/constants.js";
import { useTasks } from "../context/TasksContext.jsx";
import TaskCard from "../components/TaskCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function TasksPage() {
  const { currentUser, isAdmin } = useAuth();
  const { tasks, updateTask, deleteTask } = useTasks();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("tumu");
  const [priority, setPriority] = useState("tumu");

  const filtered = useMemo(() => {
    const base = isAdmin ? tasks : tasks.filter(t => t.assignedTo === currentUser?.id);
    return base
      .filter(t => (status === "tumu" ? true : t.status === status))
      .filter(t => (priority === "tumu" ? true : t.priority === priority))
      .filter(t => (q.trim() ? t.title.toLowerCase().includes(q.trim().toLowerCase()) : true))
      .sort((a, b) => (a.status === "tamamlandi" && b.status !== "tamamlandi" ? 1 : -1));
  }, [tasks, status, priority, q, isAdmin, currentUser]);

  return (
    <section>
      <div className="toolbar">
        <input
          className="input"
          placeholder="Baslikta ara…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="tumu">Durum: Tumu</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="select" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="tumu">Öncelik: Tumu</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {isAdmin && <Link className="btn-primary" to="/new">+ Yeni Gorev</Link>}
      </div>

      <div className="grid grid-2">
        {filtered.length === 0 && (
          <div className="empty">Henuz gorev yok. {isAdmin ? "Ilk gorevi olusturmak icin sag ustteki butonu kullan." : ""}</div>
        )}
        {filtered.map(t => (
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
