// src/pages/TaskDetail.jsx
import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTasks } from "../context/TasksContext.jsx";
import { useUsers } from "../context/UsersContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import PriorityBadge from "../components/PriorityBadge.jsx";
import { formatDate } from "../context/utils.js";

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTaskById, deleteTask } = useTasks();
  const { getUserById } = useUsers();
  const { isAdmin } = useAuth();

  const task = getTaskById(id);
  if (!task) return <div className="empty">Görev bulunamadı.</div>;

  const assignee = task.assignedTo ? getUserById(task.assignedTo) : null;

  function onDelete() {
    if (!isAdmin) return;
    if (confirm("Bu görevi silmek istediğine emin misin?")) {
      deleteTask(task.id);
      navigate("/");
    }
  }

  return (
    <section>
      <div className="detail-head">
        <h1 className="page-title">Görev Detayı</h1>
        <div className="detail-actions">
          {isAdmin && (
            <Link className="btn-primary" to={`/edit/${task.id}`}>
              Düzenle
            </Link>
          )}
          {isAdmin && (
            <button className="btn-danger" onClick={onDelete}>
              Sil
            </button>
          )}
          <button className="btn-ghost" onClick={() => navigate(-1)}>
            Geri
          </button>
        </div>
      </div>

      <div className="card">
        <div className="row">
          <span className="key">Başlık:</span> <span>{task.title}</span>
        </div>
        <div className="row">
          <span className="key">Açıklama:</span>{" "}
          <span>{task.description || "—"}</span>
        </div>
        <div className="row">
          <span className="key">Öncelik:</span>{" "}
          <span>
            <PriorityBadge priority={task.priority} />
          </span>
        </div>
        <div className="row">
          <span className="key">Son Tarih:</span>{" "}
          <span>{formatDate(task.deadline)}</span>
        </div>
        <div className="row">
          <span className="key">Durum:</span>{" "}
          <span className={`status ${task.status}`}>{task.status}</span>
        </div>
        <div className="row">
          <span className="key">Atanan Kullanıcı:</span>{" "}
          <span>{assignee?.name || "—"}</span>
        </div>
        <div className="row">
          <span className="key">Oluşturma:</span>{" "}
          <span>{formatDate(task.createdAt)}</span>
        </div>
        <div className="row">
          <span className="key">Güncelleme:</span>{" "}
          <span>{formatDate(task.updatedAt)}</span>
        </div>
      </div>
    </section>
  );
}
