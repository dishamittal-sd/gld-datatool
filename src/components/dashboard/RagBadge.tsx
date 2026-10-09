import { RAG_TEXT_CLASS, ragLabel, ragOf } from "@/data/dashboardData";
import { cn } from "@/lib/utils";

export function RagDot({ value }: { value: number }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: `var(--rag-${ragOf(value)})` }}
    />
  );
}

export function RagValue({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-semibold tabular-nums", RAG_TEXT_CLASS[ragOf(value)], className)}>
      <RagDot value={value} />
      {value}%
    </span>
  );
}

export function RagLegend() {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
      {[75, 65, 50].map((v) => (
        <span key={v} className="inline-flex items-center gap-1.5">
          <RagDot value={v} /> {ragLabel(v)} {v === 75 ? "(≥69%)" : v === 65 ? "(60–68%)" : "(<60%)"}
        </span>
      ))}
    </div>
  );
}
