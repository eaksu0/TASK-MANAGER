/* eslint-disable */
/* eslint-env node */
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Robust .env loader: try several common locations so users can keep .env at repo root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cwd = process.cwd();

const envCandidates = [
  path.join(__dirname, ".env"),            // TaskApp/.env (next to this file)
  path.join(cwd, ".env"),                   // current working directory
  path.join(__dirname, "..", ".env"),      // repo root (one level up)
  path.join(__dirname, "..", "..", ".env") // two levels up (just in case)
];

let loadedEnvPath = null;
for (const p of envCandidates) {
  try {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p, override: false });
      loadedEnvPath = loadedEnvPath || p; // remember first hit
    }
  } catch {}
}

if (!loadedEnvPath) {
  // eslint-disable-next-line no-console
  console.warn(`[MailAPI] .env file not found in common locations. CWD=${cwd}`);
} else {
  // eslint-disable-next-line no-console
  console.log(`[MailAPI] Loaded environment from ${loadedEnvPath}`);
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Resolve sensible defaults based on SMTP_USER domain when host is not provided
const envHost = process.env.SMTP_HOST;
const userEmail = process.env.SMTP_USER || "yucel_kandas@hotmail.com";
const userDomain = (userEmail.split("@")[1] || "").toLowerCase();
let defaultHost = "smtp.office365.com"; // M365 default
if (/^(hotmail|outlook|live)\.com$/.test(userDomain)) {
  defaultHost = "smtp-mail.outlook.com"; // Outlook.com/Hotmail consumer
} else if (/gmail\.com$/.test(userDomain)) {
  defaultHost = "smtp.gmail.com"; // Gmail (requires app password)
}

// ENV via process.env or fallback demo
const SMTP_HOST = envHost || defaultHost;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
// For 587 use STARTTLS (secure=false). For 465 use SMTPS (secure=true)
const SMTP_SECURE = SMTP_PORT === 465 ? true : false;
const SMTP_USER = userEmail;
const SMTP_PASS = process.env.SMTP_PASS || "YOUR_PASSWORD_HERE"; // provide via .env
const FROM = process.env.MAIL_FROM || SMTP_USER; // use exact mailbox to avoid rejection

// Basic validation to avoid confusing auth errors
if (!SMTP_USER) {
  // eslint-disable-next-line no-console
  console.error("[MailAPI] SMTP_USER missing. Set it in .env");
}
if (!process.env.SMTP_PASS || SMTP_PASS === "YOUR_PASSWORD_HERE") {
  // eslint-disable-next-line no-console
  console.warn(
    "[MailAPI] SMTP_PASS is not configured. Set SMTP_PASS in your .env (use an app password if 2FA is enabled)."
  );
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure:false,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  // Be explicit about modern TLS
  tls: { minVersion: "TLSv1.2" },
  // Connection pooling to improve reliability
  pool: true,
  // Help some providers prefer AUTH LOGIN explicitly
  authMethod: "LOGIN",
});

function outlookAuthDisabledHint(errMsg) {
  const msg = String(errMsg || "").toLowerCase();
  const isOutlookHost = /outlook\.com|office365\.com|microsoft/.test(String(SMTP_HOST).toLowerCase());
  const basicDisabled = msg.includes("basic authentication is disabled") || msg.includes("5.7.139");
  if (isOutlookHost && basicDisabled) {
    return (
      "Hint: SMTP AUTH seems disabled for this mailbox/tenant. In Microsoft 365, enable SMTP AUTH for the mailbox or use an app password (for consumer accounts with 2FA) or switch to OAuth2/Graph."
    );
  }
  return "";
}

// Healthcheck & SMTP verify
app.get("/api/health", async (req, res) => {
  try {
    await transporter.verify();
    res.json({ ok: true, smtp: { host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_SECURE, user: SMTP_USER, from: FROM } });
  } catch (err) {
    const hint = outlookAuthDisabledHint(err?.message || err);
    res.status(500).json({ ok: false, error: err?.message || String(err), hint, smtp: { host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_SECURE, user: SMTP_USER, from: FROM } });
  }
});

app.post("/api/send", async (req, res) => {
  try {
    const { to, subject, html, text } = req.body || {};
    if (!to || !subject || (!html && !text)) {
      return res.status(400).send("to, subject ve html/text zorunlu");
    }

    if (!SMTP_PASS || SMTP_PASS === "YOUR_PASSWORD_HERE") {
      return res.status(500).send(
        "SMTP yapılandırması eksik: Lütfen .env dosyasında SMTP_USER ve SMTP_PASS değerlerini girin. Outlook/Gmail için uygulama şifresi gerekebilir."
      );
    }

    const info = await transporter.sendMail({ from: FROM, to, subject, html, text });
    res.json({ ok: true, messageId: info.messageId });
  } catch (err) {
    console.error("SMTP error", err);
    // Yalın ama faydalı hata mesajı döndür
    const base = err?.response?.toString?.() || err?.message || "SMTP error";
    const hint = outlookAuthDisabledHint(base);
    res.status(500).send(hint ? `${base}\n${hint}` : base);
  }
});

const port = Number(process.env.API_PORT || 5174);
app.listen(port, async () => {
  console.log(`Mail API listening on http://localhost:${port}`);
  try {
    await transporter.verify();
    console.log("SMTP verify: OK as", SMTP_USER, "on", SMTP_HOST, ":", SMTP_PORT, "secure=", SMTP_SECURE);
  } catch (e) {
    const hint = outlookAuthDisabledHint(e?.message || e);
    console.error("SMTP verify failed:", e?.message || e);
    if (hint) console.error(hint);
  }
});

// Global error safety net
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection in Mail API:", reason);
});
