import React from "react";

export default function KpiCard({ title, value, valueClass = "" }) {
  return (
    <div className="rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] p-4">
      <div className="text-[10px] font-bold tracking-wider text-[var(--c-muted)] uppercase">
        {title}
      </div>
      <div className={`font-display text-2xl font-bold mt-1 ${valueClass}`}>
        {value}
      </div>
    </div>
  );
}
