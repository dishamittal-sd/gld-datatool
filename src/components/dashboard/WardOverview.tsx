import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { METRICS, PRIMARY_WARD, WARDS, wardPerformance, type WardName } from "@/data/dashboardData";
import { RagLegend, RagValue } from "./RagBadge";

export function WardOverview() {
  const [compare, setCompare] = useState<WardName>("Levenshulme");
  const g = wardPerformance[PRIMARY_WARD];
  const c = wardPerformance[compare];
  const data = METRICS.map((m) => ({ name: m.label, [PRIMARY_WARD]: g[m.key], [compare]: c[m.key] }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {METRICS.map((m) => (
          <div key={m.key} className="rounded-lg border border-border bg-card p-4">
            <p className="label-caps">{m.label}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground" title={m.full}>{m.full}</p>
            <RagValue value={g[m.key]} className="mt-3 text-2xl" />
            <p className="mt-1 text-xs text-muted-foreground">Target {m.target}%</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{PRIMARY_WARD} vs comparison ward</h2>
            <p className="text-sm text-muted-foreground">Dashed line shows the 69% target</p>
          </div>
          <select
            value={compare}
            onChange={(e) => setCompare(e.target.value as WardName)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {WARDS.filter((w) => w !== PRIMARY_WARD).map((w) => <option key={w}>{w}</option>)}
          </select>
        </div>
        <div className="h-80">
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} unit="%" />
              <Tooltip />
              <Legend />
              <ReferenceLine y={69} stroke="var(--accent)" strokeDasharray="6 4" />
              <Bar dataKey={PRIMARY_WARD} fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
              <Bar dataKey={compare} fill="var(--chart-2)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4"><RagLegend /></div>
      </div>
    </div>
  );
}
