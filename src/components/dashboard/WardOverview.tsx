import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { METRICS, PRIMARY_WARD, WARDS, wardPerformance, type WardName } from "@/data/dashboardData";
import { Bullets, Panel, SectionHeader } from "./Section";

const WARD_COLOR: Record<WardName, string> = {
  Gorton: "var(--chart-1)",
  Levenshulme: "var(--chart-2)",
  Cheetham: "var(--chart-5)",
  "Moss Side": "var(--chart-3)",
};

const list = (a: string[]) => (a.length <= 1 ? a.join("") : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`);

export function WardOverview() {
  const others = WARDS.filter((w) => w !== PRIMARY_WARD);
  const [compare, setCompare] = useState<WardName[]>(["Levenshulme", "Cheetham"]);
  const shown = [PRIMARY_WARD, ...others.filter((w) => compare.includes(w))] as WardName[];
  const g = wardPerformance[PRIMARY_WARD];

  const met = METRICS.filter((m) => g[m.key] >= m.target);
  const best = [...METRICS].sort((a, b) => g[b.key] - b.target - (g[a.key] - a.target))[0]!;
  const worst = [...METRICS].sort((a, b) => g[a.key] - a.target - (g[b.key] - b.target))[0]!;
  const avg = (k: (typeof METRICS)[number]["key"]) => compare.reduce((s, w) => s + wardPerformance[w][k], 0) / (compare.length || 1);
  const leads = METRICS.filter((m) => g[m.key] >= avg(m.key)).map((m) => m.label);
  const trails = METRICS.filter((m) => g[m.key] < avg(m.key)).map((m) => m.label);

  const messages = [
    `${PRIMARY_WARD} meets or exceeds its bespoke target in ${met.length} of ${METRICS.length} metrics, performing best in ${best.full} (${g[best.key]}% against a ${best.target}% target).`,
    g[worst.key] < worst.target
      ? `The widest gap to target is ${worst.full} at ${g[worst.key]}% against a ${worst.target}% target (${worst.target - g[worst.key]} percentage points short).`
      : `All metrics meet their targets.`,
  ];
  if (compare.length)
    messages.push(
      `Compared with ${list(compare)}, ${PRIMARY_WARD}${leads.length ? ` leads on ${list(leads)}` : ""}${leads.length && trails.length ? " and" : ""}${trails.length ? ` trails on ${list(trails)}` : ""}.`,
    );

  return (
    <div className="space-y-5">
      <SectionHeader title="Ward overview" desc="An overview of early learning goal attainment and key developmental milestones for children in the ward." />

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="label-caps mr-2">Comparing</span>
          {shown.map((w) => (
            <span key={w} className={`inline-flex items-center gap-2 rounded-sm border px-2 py-1 text-xs ${w === PRIMARY_WARD ? "border-primary/40 bg-secondary" : "border-border bg-card"}`}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: WARD_COLOR[w] }} />
              {w}
              {w === PRIMARY_WARD && <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Primary</span>}
            </span>
          ))}
        </div>
        <Popover>
          <PopoverTrigger className="inline-flex w-48 items-center justify-between rounded-sm border border-input bg-card px-3 py-2 text-xs shadow-sm">
            {compare.length} comparison ward(s) <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 space-y-2 p-3">
            {others.map((w) => (
              <label key={w} className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={compare.includes(w)}
                  onCheckedChange={(c) => setCompare((p) => (c ? [...p, w] : p.filter((x) => x !== w)))}
                />
                {w}
              </label>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 overflow-hidden rounded-md border border-border bg-card sm:grid-cols-2 lg:grid-cols-3">
        {METRICS.map((m) => {
          const v = g[m.key];
          const diff = v - m.target;
          const data = shown.map((w) => ({ ward: w, value: wardPerformance[w][m.key] }));
          return (
            <div key={m.key} className="border-b border-r border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">{m.full}</h3>
                  <p className="text-xs text-muted-foreground">{m.label} · target {m.target}%</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold leading-none">{v}%</p>
                  <p className={`mt-1 text-xs font-semibold ${diff >= 0 ? "text-rag-green" : "text-rag-red"}`}>
                    {diff >= 0 ? "+" : "−"}{Math.abs(diff)} pts
                  </p>
                </div>
              </div>
              <div className="mt-3 h-44">
                <ResponsiveContainer>
                  <BarChart data={data} margin={{ left: -20, right: 4, top: 8 }}>
                    <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="ward" hide />
                    <YAxis domain={[0, 100]} ticks={[25, 50, 75, 100]} tickFormatter={(t) => `${t}%`} fontSize={10} stroke="var(--muted-foreground)" axisLine={false} tickLine={false} />
                    <Tooltip formatter={(x) => `${x}%`} cursor={{ fill: "var(--muted)" }} />
                    <ReferenceLine y={m.target} stroke="var(--muted-foreground)" strokeDasharray="4 3" />
                    <Bar dataKey="value" maxBarSize={36}>
                      {data.map((d) => <Cell key={d.ward} fill={WARD_COLOR[d.ward]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      <Panel label="Key messages"><Bullets items={messages} /></Panel>
    </div>
  );
}
