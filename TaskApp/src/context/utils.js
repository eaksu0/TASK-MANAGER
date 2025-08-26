// src/context/utils.js

// localStorage sarmalayıcı
export const storage = {
    get(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch {
            return fallback;
        }
    },
    set(key, val) {
        localStorage.setItem(key, JSON.stringify(val));
    },
};

// Rastgele id üret
export const uid = () =>
    crypto.getRandomValues(new Uint32Array(1))[0].toString(16);

// Tarih formatlayıcı (gg.aa.yyyy)
export function formatDate(iso) {
    if (!iso) return "—";
    try {
        const d = new Date(iso);
        const ye = new Intl.DateTimeFormat("tr-TR", { year: "numeric" }).format(d);
        const mo = new Intl.DateTimeFormat("tr-TR", { month: "2-digit" }).format(d);
        const da = new Intl.DateTimeFormat("tr-TR", { day: "2-digit" }).format(d);
        return `${da}.${mo}.${ye}`;
    } catch {
        return iso;
    }
}

// Durum anahtarını CSS sınıfı için normalize et (Türkçe karakterleri İngilizce'ye çevir)
export function toStatusClass(s) {
    const base = (s ?? "").toString().trim().toLowerCase();
    const map = {
        "ı": "i", "İ": "i",
        "ö": "o", "Ö": "o",
        "ü": "u", "Ü": "u",
        "ş": "s", "Ş": "s",
        "ğ": "g", "Ğ": "g",
        "ç": "c", "Ç": "c",
    };
    return base.replace(/[İıÖöÜüŞşĞğÇç]/g, ch => map[ch] || ch);
}
