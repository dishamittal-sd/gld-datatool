import type { ReactNode } from "react";

export function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="border-b border-border pb-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

export function Panel({ label, children, className = "" }: { label?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-md border border-border bg-card p-4 ${className}`}>
      {label && <p className="label-caps mb-3">{label}</p>}
      {children}
    </div>
  );
}

export function Bullets({ items, diamond }: { items: string[]; diamond?: boolean }) {
  return (
    <ul className="space-y-3 text-sm leading-relaxed">
      {items.map((t) => (
        <li key={t} className="flex gap-3">
          <span className={diamond ? "mt-1.5 h-2 w-2 shrink-0 rotate-45 border border-primary" : "mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"} />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}
