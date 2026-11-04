import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { MANCHESTER_LABEL, type BreakdownRow } from "@/data/dashboardData";
import {
  COMBO_CHARACTERISTICS, GOAL_KEYS, GOAL_LABELS, MAX_COMBINATION, canAdd, combinationResult,
  rowGoals, wardAverageGoals, type ComboCharacteristic,
} from "@/data/combinationData";
import { cn } from "@/lib/utils";

const MCR = "var(--rag-orange)";

export function CombinationExplorer({ ward, rows }: { ward: string; rows: BreakdownRow[] }) {
  const [selected, setSelected] = useState<ComboCharacteristic[]>([]);
  const toggle = (c: ComboCharacteristic) =>
    setSelected((s) => (s.includes(c) ? s.filter((x) => x !== c) : canAdd(s, c) ? [...s, c] : s));

  const nat = rows.find((r) => r.group === "National");
  const label = selected.join(" + ");
  const result = selected.length ? combinationResult(ward, rows, selected) : null;
  const wardAvg = wardAverageGoals(rows);
  const mcr = nat ? rowGoals(nat) : wardAvg;
  const comboName = `${label} in ${ward}`;
  const data = GOAL_KEYS.map((k) => ({
    goal: GOAL_LABELS[k],
    [MANCHESTER_LABEL]: mcr[k],
    [`${ward} figure`]: wardAvg[k],
    [label || "Cohort"]: result?.goals[k] ?? 0,
  }));

  return (
    <section className="rounded-md border border-border bg-card p-4">
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <pattern id="combo-mcr-stripes" width="5" height="5" patternUnits="userSpaceOnUse">
            <rect width="5" height="5" fill={MCR} opacity={0.45} />
            <rect width="2.5" height="5" fill={MCR} />
          </pattern>
        </defs>
      </svg>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Interconnecting Characteristics Explorer</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Combine up to 3 characteristics to see how attainment changes across the Early Learning Goals.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setSelected([])} disabled={!selected.length}>
          Clear all
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Characteristics">
        {COMBO_CHARACTERISTICS.map((c) => {
          const on = selected.includes(c);
          const disabled = !on && !canAdd(selected, c);
          return (
            <button
              key={c}
              type="button"
              aria-pressed={on}
              disabled={disabled}
              onClick={() => toggle(c)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-primary/10",
                disabled && "cursor-not-allowed opacity-40 hover:bg-background",
              )}
            >
              {c}
            </button>
          );
        })}
      </div>
      {selected.length >= MAX_COMBINATION && (
        <p className="mt-2 text-xs text-muted-foreground">Maximum 3 characteristics selected</p>
      )}

      {!result ? (
        <p className="mt-4 rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Select up to 3 characteristics above to view combined attainment breakdowns.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="grid gap-3 rounded-md border border-primary/30 bg-primary/5 p-3 sm:grid-cols-3">
            <div>
              <p className="label-caps">Filtered cohort</p>
              <p className="mt-1 font-semibold">{comboName}</p>
            </div>
            <div>
              <p className="label-caps">Cohort size</p>
              <p className="mt-1 font-semibold">{result.cohort} children</p>
            </div>
            <div>
              <p className="label-caps">Overall reaching expected</p>
              <p className="mt-1 text-[19px] font-bold tabular-nums">{result.overall}%</p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer>
              <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="goal" interval={0} angle={-25} textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend verticalAlign="top" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey={MANCHESTER_LABEL} fill="url(#combo-mcr-stripes)" stroke={MCR} />
                <Bar dataKey={`${ward} figure`} fill="var(--muted-foreground)" />
                <Bar dataKey={label} fill="var(--primary)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground">Synthetic sample data — not real results.</p>
        </div>
      )}
    </section>
  );
}
