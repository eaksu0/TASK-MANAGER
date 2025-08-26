// Durum değiştirme dropdown'ı
import React from "react";
import { STATUSES } from "../context/constants.js";

export default function StatusSelect({ value, onChange }) {
    return (
        <select className="select" value={value} onChange={(e) => onChange(e.target.value)}>
            {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
            ))}
        </select>
    );
}
