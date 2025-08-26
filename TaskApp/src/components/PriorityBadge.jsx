// Önceliğe göre renkli rozet
import React from "react";

export default function PriorityBadge({ priority }) {
    const cls =
        priority === "yuksek" ? "badge red" :
            priority === "orta" ? "badge amber" :
                "badge blue";
    return <span className={cls}>{priority}</span>;
}
