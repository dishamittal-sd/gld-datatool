import { breakdown } from "@/data/dashboardData";
import { RagLegend, RagValue } from "./RagBadge";

const COLS = [
  { area: "Communication & Language", items: [["cll", "LA", "Listening & Attention"], ["cll", "S", "Speaking"]] },
  { area: "Personal, Social & Emotional", items: [["pse", "SR", "Self-Regulation"], ["pse", "MS", "Managing Self"], ["pse", "BR", "Building Relationships"]] },
  { area: "Physical Development", items: [["pd", "GM", "Gross Motor"], ["pd", "FM", "Fine Motor"]] },
] as const;

export function GlanceBreakdown() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Outcomes by pupil characteristic</h2>
        <p className="text-sm text-muted-foreground">Gorton baseline, compared with national</p>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th rowSpan={2} className="p-3 text-left label-caps">Group</th>
              {COLS.map((c) => (
                <th key={c.area} colSpan={c.items.length} className="border-l border-border p-2 text-center label-caps">{c.area}</th>
              ))}
            </tr>
            <tr className="border-b border-border bg-muted/50">
              {COLS.flatMap((c) => c.items.map(([, k, l]) => (
                <th key={l} className="p-2 text-center text-xs font-medium text-muted-foreground">{l}</th>
              )))}
            </tr>
          </thead>
          <tbody>
            {breakdown.map((r) => (
              <tr key={r.group} className={r.group === "National" ? "bg-secondary font-medium" : "border-b border-border"}>
                <td className="p-3 font-semibold">{r.group}</td>
                {COLS.flatMap((c) => c.items.map(([g, k]) => (
                  <td key={g + k} className="p-2 text-center">
                    <RagValue value={(r[g] as Record<string, number>)[k] ?? 0} />
                  </td>
                )))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <RagLegend />
    </div>
  );
}
