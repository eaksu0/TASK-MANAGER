import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@local");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Giriş başarısız.");
    }
  }

  return (
    <section>
      <h1 className="page-title">Giris</h1>
      <form className="form" onSubmit={onSubmit}>
        <label className="label">
          <span>E-posta</span>
          <input className="input" value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <label className="label">
          <span>Sifre</span>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        {error && <div className="error">{error}</div>}
        <div className="form-actions">
          <button className="btn-primary" type="submit">Giris Yap</button>
        </div>
      </form>
      <p className="muted" style={{ marginTop: 12 }}>
        Not: Kayit yok. Kullanıcıları admin ekler.
      </p>
    </section>
  );
}