/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const STORAGE_KEY = "taskpro.mail.v1";

// Basit localStorage sarmalayıcı
function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function saveSettings(s) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

// Varsayılan şablonlar
const defaultSettings = {
  subject: "Yeni görev atandı: {{task.title}}",
  html: `
  <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; color:#0f172a;">
    <div style="max-width:640px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="padding:16px 20px;background:#111827;color:#e5e7eb">
        <strong>TaskPro</strong>
      </div>
      <div style="padding:20px;background:#ffffff">
        <h2 style="margin:0 0 8px 0;color:#111827">Yeni bir görev atandı</h2>
        <p style="margin:0 0 14px 0;color:#374151">Merhaba {{assignee.name}}, size bir görev atandı.</p>

        <div style="border:1px solid #e5e7eb;border-radius:10px;padding:14px">
          <div style="font-size:14px;color:#6b7280">Başlık</div>
          <div style="font-size:16px;color:#111827"><strong>{{task.title}}</strong></div>
          <div style="height:10px"></div>
          <div style="display:flex;gap:14px;font-size:14px;color:#374151">
            <div><strong>Öncelik:</strong> {{task.priority}}</div>
            <div><strong>Durum:</strong> {{task.status}}</div>
            <div><strong>Son Tarih:</strong> {{task.deadline || '—'}}</div>
          </div>
          {{#if task.description}}
          <div style="height:10px"></div>
          <div>
            <div style="font-size:14px;color:#6b7280">Açıklama</div>
            <div style="white-space:pre-wrap;font-size:14px;color:#111827">{{task.description}}</div>
          </div>
          {{/if}}
        </div>

        <div style="height:16px"></div>
        <a href="{{app.taskUrl}}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 14px;border-radius:8px">Görevi Aç</a>
      </div>
      <div style="padding:12px 20px;background:#f9fafb;color:#6b7280;font-size:12px">
        Bu e-posta TaskPro tarafından otomatik gönderildi.
      </div>
    </div>
  </div>`,
};

function render(template, data) {
  // Basit {{path}} değişimi ve {{#if path}} ... {{/if}} desteği
  const withConditionals = template.replace(/\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, condPath, inner) => {
    const val = get(data, condPath.trim());
    return val ? inner : "";
  });
  return withConditionals.replace(/\{\{\s*([^}\s]+)\s*\}\}/g, (_, path) => {
    const v = get(data, path.trim());
    return v == null ? "" : String(v);
  });
}
function get(obj, path) {
  return path.split(".").reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
}

export const MailContext = createContext(null);

export function MailProvider({ children }) {
  const [settings, setSettings] = useState(() => loadSettings() || defaultSettings);

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const send = useCallback(async ({ to, subject, html, text }) => {
    const res = await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, html, text }),
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Mail gönderilemedi");
    }
    return await res.json();
  }, []);

  const sendAssignmentEmail = useCallback(async (task, assignee, actor) => {
    if (!assignee?.email) return;
    const app = {
      baseUrl: window?.location?.origin || "http://localhost:5173",
      taskUrl: `${window?.location?.origin || "http://localhost:5173"}/task/${task.id}`,
    };
    const html = render(settings.html, { task, assignee, actor, app });
    const subject = render(settings.subject, { task, assignee, actor, app });
    const text = `Merhaba ${assignee.name}, size yeni bir görev atandı: ${task.title}`;
    return send({ to: assignee.email, subject, html, text });
  }, [settings, send]);

  const value = useMemo(() => ({ settings, updateSettings, send, sendAssignmentEmail, render }), [settings, updateSettings, send, sendAssignmentEmail]);

  return <MailContext.Provider value={value}>{children}</MailContext.Provider>;
}

export function useMail() {
  const ctx = useContext(MailContext);
  if (!ctx) throw new Error("useMail yalnızca MailProvider içinde kullanılabilir.");
  return ctx;
}
