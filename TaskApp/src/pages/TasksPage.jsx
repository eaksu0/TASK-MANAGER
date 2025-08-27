// Görev listesi sayfası: herkes için TÜM durumlar görünür
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PRIORITIES, STATUSES } from "../context/constants.js";
import { useTasks } from "../context/TasksContext.jsx";
import TaskCard from "../components/TaskCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { toStatusClass } from "../context/utils.js";

export default function TasksPage() {
  const { isAdmin, currentUser } = useAuth();
  const { tasks, updateTask, deleteTask } = useTasks();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("tumu");
  const [priority, setPriority] = useState("tumu");

  // Herkes için tüm durumlar gösterilsin
  const VISIBLE_STATUSES = STATUSES;

  const filtered = useMemo(() => {
    // Admin tüm görevleri görür; normal kullanıcı sadece kendi görevlerini
    const base = isAdmin ? tasks : tasks.filter(t => t.assignedTo === currentUser?.id);

    return base
      // sayfa görünürlüğü: tüm durumlar (STATUSES)
      .filter(t => VISIBLE_STATUSES.includes(toStatusClass(t.status)))
      // kullanıcı bir durum seçtiyse uygula (aksi halde tümü)
      .filter(t => (status === "tumu" ? true : toStatusClass(t.status) === status))
      .filter(t => (priority === "tumu" ? true : t.priority === priority))
      .filter(t => (q.trim() ? t.title.toLowerCase().includes(q.trim().toLowerCase()) : true))
      .sort((a, b) => (toStatusClass(a.status) === "tamamlandi" && toStatusClass(b.status) !== "tamamlandi" ? 1 : -1));
  }, [tasks, status, priority, q, isAdmin, currentUser, VISIBLE_STATUSES]);

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
          {VISIBLE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="select" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="tumu">Öncelik: Tumu</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {isAdmin && <Link className="btn-primary" to="/new">+ Yeni Gorev</Link>}
      </div>

      <div className="grid grid-2">
        {filtered.length === 0 && (
          <div className="empty">Gösterilecek görev yok.</div>
        )}
        {filtered.map(t => (
          <TaskCard
            key={t.id}
            task={t}
            // Normal kullanıcılar sadece durum değiştirebilir; admin silme de yapabilir
            onStatusChange={(s) => updateTask(t.id, { status: s })}
            onDelete={isAdmin ? (() => { if (confirm("Bu gorevi silmek istedigine emin misin?")) deleteTask(t.id); }) : undefined}
          />
        ))}
      </div>
    </section>
  );
}
