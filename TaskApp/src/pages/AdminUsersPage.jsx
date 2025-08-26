import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useUsers } from "../context/UsersContext.jsx";

export default function AdminUsersPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { users, createUser, deleteUser } = useUsers();

  useEffect(() => {
    if (!isAdmin) navigate("/");
  }, [isAdmin, navigate]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("1234");
  const [role, setRole] = useState("user");

  const adminCount = useMemo(() => users.filter(u => u.role === "admin").length, [users]);

  function addUser(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    createUser({ name: name.trim(), email: email.trim(), password: password || "1234", role });
    setName(""); setEmail("");
  }

  return (
    <section>
      <h1 className="page-title">Kullanici Yonetimi</h1>

      <form className="form" onSubmit={addUser}>
        <div className="row">
          <label className="label" style={{ flex: 2 }}>
            <span>Ad Soyad</span>
            <input className="input" value={name} onChange={e => setName(e.target.value)} />
          </label>
          <label className="label" style={{ flex: 2 }}>
            <span>E-posta</span>
            <input className="input" value={email} onChange={e => setEmail(e.target.value)} />
          </label>
          <label className="label" style={{ flex: 1 }}>
            <span>Şifre</span>
            <input className="input" value={password} onChange={e => setPassword(e.target.value)} />
          </label>
          <label className="label" style={{ flex: 1 }}>
            <span>Rol</span>
            <select className="select" value={role} onChange={e => setRole(e.target.value)}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </label>
        </div>
        <div className="form-actions">
          <button className="btn-primary" type="submit">Kullanici Ekle</button>
        </div>
      </form>

      <div className="list" style={{ marginTop: 16 }}>
        {users.map(u => {
          const isLastAdmin = u.role === "admin" && adminCount <= 1;
          return (
            <div key={u.id} className="list-item">
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <strong>{u.name}</strong>
                <span className="muted">({u.email})</span>
                <span className="tag">{u.role}</span>
              </div>
              <div>
                <button
                  className="btn-danger"
                  disabled={isLastAdmin}
                  title={isLastAdmin ? "Son admin silinemez." : "Sil"}
                  onClick={() => {
                    if (confirm("Bu kullanıcıyı silmek istiyor musun?")) deleteUser(u.id);
                  }}
                >
                  Sil
                </button>
              </div>
            </div>
          );
        })}
        {users.length === 0 && <div className="empty">Kayıtlı kullanıcı yok.</div>}
      </div>
    </section>
  );
}