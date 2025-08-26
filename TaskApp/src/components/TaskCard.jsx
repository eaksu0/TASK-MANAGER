// Liste görünümündeki tek görev kartı
import React, { useState } from "react";
import { Link } from "react-router-dom";
import StatusSelect from "./StatusSelect.jsx";
import PriorityBadge from "./PriorityBadge.jsx";
import { formatDate, toStatusClass } from "../context/utils.js";
import { useUsers } from "../context/UsersContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function TaskCard({ task, onStatusChange, onDelete }) {
    const { getUserById } = useUsers();
    const { isAdmin } = useAuth();
    const assignee = task.assignedTo ? getUserById(task.assignedTo) : null;

    const statusClass = `status ${toStatusClass(task.status)}`;

    // Durum düzenleme togglesı
    const [editingStatus, setEditingStatus] = useState(false);
    const canEditStatus = typeof onStatusChange === "function";

    function handleStatusChange(newVal) {
        onStatusChange?.(newVal);
        setEditingStatus(false);
    }

    return (
        <div className="card">
            <div className="card-head">
                <h3 className="card-title clamp-1">{task.title}</h3>
                <PriorityBadge priority={task.priority} />
            </div>

            {task.description && <p className="muted clamp-2">{task.description}</p>}

            <div className="card-meta">
                <div>
                    <span className="key">Son teslim:</span> {formatDate(task.deadline)}
                </div>
                <div>
                    <span className="key">Atanan:</span> {assignee ? assignee.name : "—"}
                </div>
                <div className="status-wrap">
                    <span className="key">Durum:</span>
                    {editingStatus && canEditStatus ? (
                        <>
                            <StatusSelect value={task.status} onChange={handleStatusChange} />
                            <button className="btn-ghost" onClick={() => setEditingStatus(false)}>Iptal</button>
                        </>
                    ) : (
                        <>
                            <span className={statusClass}>{task.status}</span>
                            {canEditStatus && (
                                <button className="btn-ghost" onClick={() => setEditingStatus(true)}>Duzenle</button>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="card-actions">
                <Link className="btn-ghost" to={`/task/${task.id}`}>Detay</Link>
                {isAdmin && <Link className="btn-ghost" to={`/edit/${task.id}`}>Duzenle</Link>}
                {isAdmin && <button className="btn-danger" onClick={onDelete}>Sil</button>}
            </div>
        </div>
    );
}
