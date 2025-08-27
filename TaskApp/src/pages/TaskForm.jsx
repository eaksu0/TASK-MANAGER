// Görev oluşturma / düzenleme formu
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTasks } from "../context/TasksContext.jsx";
import { PRIORITIES, STATUSES } from "../context/constants.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useUsers } from "../context/UsersContext.jsx";
import { useMail } from "../context/MailContext.jsx";

export default function TaskForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getTaskById, createTask, updateTask } = useTasks();
    const { currentUser, isAdmin } = useAuth();
    const { users } = useUsers();
    const { sendAssignmentEmail } = useMail();

    const editingTask = id ? getTaskById(id) : null;

    const [title, setTitle] = useState(editingTask?.title || "");
    const [description, setDescription] = useState(editingTask?.description || "");
    const [priority, setPriority] = useState(editingTask?.priority || "orta");
    const [deadline, setDeadline] = useState(editingTask?.deadline || "");
    const [status, setStatus] = useState(editingTask?.status || "yapilacak");
    const [assignedTo, setAssignedTo] = useState(editingTask?.assignedTo ?? null);

    useEffect(() => {
        // Login gereksinimi
        if (!currentUser) {
            navigate("/login");
            return;
        }
        // Yalnızca adminler oluşturabilir/düzenleyebilir
        if (!isAdmin) {
            navigate("/", { replace: true });
            return;
        }
        if (id) {
            const t = getTaskById(id);
            if (!t) { navigate("/"); return; }
            setTitle(t.title);
            setDescription(t.description || "");
            setPriority(t.priority);
            setDeadline(t.deadline || "");
            setStatus(t.status);
            setAssignedTo(t.assignedTo ?? null);
        } else {
            // Yeni kayıt için atama varsayılanı
            setAssignedTo(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, currentUser, isAdmin]);

    async function onSubmit(e) {
        e.preventDefault();
        if (!title.trim()) { alert("Başlık zorunludur."); return; }

        const payload = {
            title,
            description,
            priority,
            deadline,
            status,
            assignedTo: assignedTo || null
        };

        if (editingTask) {
            updateTask(editingTask.id, payload);
            // Atanan kişi değiştiyse mail gönder
            const prevAssigneeId = editingTask.assignedTo ?? null;
            const nextAssigneeId = payload.assignedTo ?? null;
            if (prevAssigneeId !== nextAssigneeId && nextAssigneeId) {
                const user = users.find(u => u.id === nextAssigneeId);
                if (user) {
                    try { await sendAssignmentEmail({ ...editingTask, ...payload }, user, currentUser); } catch { /* noop */ }
                }
            }
            navigate("/", { replace: true });
        } else {
            const newId = createTask(payload);
            // Yeni görev atandıysa mail
            if (payload.assignedTo) {
                const user = users.find(u => u.id === payload.assignedTo);
                if (user) {
                    try { await sendAssignmentEmail({ id: newId, ...payload }, user, currentUser); } catch { /* noop */ }
                }
            }
            navigate("/", { replace: true });
        }
    }

    return (
        <section>
            <h1 className="page-title">{editingTask ? "Gorev Duzenle" : "Yeni Gorev Olustur"}</h1>
            <form className="form" onSubmit={onSubmit}>
                <label className="label">
                    <span>Başlık *</span>
                    <input
                        className="input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Örn: Teklif e-postasi gonderilecek"
                        required
                    />
                </label>

                <label className="label">
                    <span>Aciklama</span>
                    <textarea
                        className="textarea"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detaylar…"
                    />
                </label>

                <label className="label">
                    <span>Oncelik</span>
                    <select className="select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </label>

                <label className="label">
                    <span>Son Teslim Tarihi</span>
                    <input type="date" className="input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </label>

                <label className="label">
                    <span>Durum</span>
                    <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </label>

                <label className="label">
                    <span>Atanan Kullanıcı</span>
                    <select
                        className="select"
                        value={assignedTo ?? ""}
                        onChange={(e) => setAssignedTo(e.target.value ? e.target.value : null)}
                    >
                        <option value="">— Atanmadı —</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>
                                {u.name} ({u.email})
                            </option>
                        ))}
                    </select>
                </label>

                <div className="form-actions">
                    <button type="submit" className="btn-primary">Kaydet</button>
                    <button type="button" className="btn-ghost" onClick={() => history.back()}>Iptal</button>
                </div>
            </form>
        </section>
    );
}
