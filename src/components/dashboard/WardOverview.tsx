import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Check, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  METRICS,
  PRIMARY_WARD,
  WARDS,
  wardPerformance,
  type MetricKey,
  type WardName,
} from "@/data/dashboardData";
import { cn } from "@/lib/utils";

const OTHER_WARDS = WARDS.filter((w) => w !== PRIMARY_WARD);

const SERIES_COLORS = ["var(--chart-2)", "var(--chart-4)", "var(--chart-5)"];

function colorFor(ward: WardName) {
  if (ward === PRIMARY_WARD) return "var(--chart-1)";
  return SERIES_COLORS[OTHER_WARDS.indexOf(ward) % SERIES_COLORS.length];
}

export function WardOverview() {
  const [selected, setSelected] = useState<WardName[]>(["Levenshulme", "Cheetham"]);

  const wards = useMemo<WardName[]>(
    () => [PRIMARY_WARD as WardName, ...WARDS.filter((w) => selected.includes(w))],
    [selected],
  );

  const toggle = (ward: WardName) =>
    setSelected((prev) =>
      prev.includes(ward) ? prev.filter((w) => w !== ward) : [...prev, ward],
    );

  const keyMessages = useMemo(() => buildKeyMessages(selected), [selected]);

  return (
    <div className="space-y-5">
      <div className="border-b border-border pb-4">
        <h2 className="text-base font-semibold sm:text-lg">Ward overview</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          An overview of early learning goal attainment and key developmental milestones for
          children in the ward.
        </p>
      </div>

      {/* Controls: quiet, borderless strip */}
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="mr-1 label-caps">Comparing</span>
          {wards.map((ward) => (
            <span
              key={ward}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-sm border border-border px-2 py-0.5 text-xs font-medium",
                ward === PRIMARY_WARD && "border-primary/40 bg-primary/5",
              )}
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: colorFor(ward) }}
              />
              {ward}
              {ward === PRIMARY_WARD && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  primary
                </span>
              )}
            </span>
          ))}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 shrink-0 justify-between gap-2 rounded-sm text-xs font-medium sm:w-48"
            >
              {selected.length ? `${selected.length} comparison ward(s)` : "Select wards"}
              <ChevronDown className="size-3.5 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-60 rounded-sm p-1">
            <div className="flex items-center justify-between px-2.5 py-1.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{PRIMARY_WARD}</span>
              <span className="label-caps">primary</span>
            </div>
            {OTHER_WARDS.map((ward) => {
              const active = selected.includes(ward);
              return (
                <button
                  key={ward}
                  type="button"
                  onClick={() => toggle(ward)}
                  className="flex w-full items-center justify-between rounded-sm px-2.5 py-1.5 text-sm transition-colors hover:bg-secondary"
                >
                  <span>{ward}</span>
                  <Check className={cn("size-3.5", active ? "opacity-100" : "opacity-0")} />
                </button>
              );
            })}
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 xl:grid-cols-3">
        {METRICS.map((metric) => (
          <MetricChart key={metric.key} metricKey={metric.key} wards={wards} />
        ))}
      </div>

      <section className="rounded-md border border-border bg-card p-4">
        <h2 className="label-caps">Key messages</h2>
        <ul className="mt-3 space-y-2.5">
          {keyMessages.map((msg, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{msg}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function MetricChart({ metricKey, wards }: { metricKey: MetricKey; wards: WardName[] }) {
  const metric = METRICS.find((m) => m.key === metricKey)!;
  const data = [
    {
      name: metric.label,
      ...Object.fromEntries(wards.map((w) => [w, wardPerformance[w][metricKey]])),
    },
  ];
  const primaryValue = wardPerformance[PRIMARY_WARD as WardName][metricKey];
  const delta = primaryValue - metric.target;

  return (
    <div className="bg-card p-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-snug">{metric.full}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {metric.label} · target {metric.target}%
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-bold leading-none tabular-nums">{primaryValue}%</p>
          <p
            className={cn(
              "mt-1 text-[11px] font-semibold tabular-nums",
              delta >= 0 ? "text-rag-green" : "text-rag-red",
            )}
          >
            {delta >= 0 ? "+" : "−"}
            {Math.abs(delta)} pts
          </p>
        </div>
      </div>

      <div className="mt-3 h-[168px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, left: -26, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" hide />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              unit="%"
            />
            <Tooltip
              formatter={(v: number) => `${v}%`}
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                fontSize: 12,
              }}
            />
            <ReferenceLine
              y={metric.target}
              stroke="var(--foreground)"
              strokeOpacity={0.45}
              strokeDasharray="4 3"
            />
            {wards.map((ward) => (
              <Bar key={ward} dataKey={ward} fill={colorFor(ward)} radius={[2, 2, 0, 0]} maxBarSize={34} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function buildKeyMessages(selected: WardName[]): string[] {
  const gorton = wardPerformance[PRIMARY_WARD as WardName];
  const messages: string[] = [];

  const aboveTarget = METRICS.filter((m) => gorton[m.key] >= m.target);
  const belowTarget = METRICS.filter((m) => gorton[m.key] < m.target);

  const strongest = [...METRICS].sort(
    (a, b) => gorton[b.key] - b.target - (gorton[a.key] - a.target),
  )[0]!;
  messages.push(
    aboveTarget.length
      ? `${PRIMARY_WARD} meets or exceeds its bespoke target in ${aboveTarget.length} of ${METRICS.length} metrics, performing best in ${strongest.full} (${gorton[strongest.key]}% against a ${strongest.target}% target).`
      : `${PRIMARY_WARD} sits below its bespoke target across all ${METRICS.length} metrics, coming closest in ${strongest.full} (${gorton[strongest.key]}% against a ${strongest.target}% target).`,
  );

  const widestGap = [...belowTarget].sort(
    (a, b) => b.target - gorton[b.key] - (a.target - gorton[a.key]),
  )[0];
  if (widestGap) {
    messages.push(
      `The widest gap to target is ${widestGap.full} at ${gorton[widestGap.key]}% against a ${widestGap.target}% target (${widestGap.target - gorton[widestGap.key]} percentage points short).`,
    );
  } else {
    messages.push(`Every metric in ${PRIMARY_WARD} is on or above its bespoke target this cycle.`);
  }

  if (!selected.length) {
    messages.push(
      "Select one or more comparison wards to benchmark Gorton against the rest of the locality.",
    );
    return messages.slice(0, 3);
  }

  const wins = METRICS.filter((m) =>
    selected.every((w) => gorton[m.key] > wardPerformance[w][m.key]),
  );
  const losses = METRICS.filter((m) =>
    selected.every((w) => gorton[m.key] < wardPerformance[w][m.key]),
  );

  messages.push(
    `Compared with ${formatList(selected)}, ${PRIMARY_WARD} leads on ${
      wins.length ? formatList(wins.map((m) => m.label)) : "no metric"
    } and trails on ${losses.length ? formatList(losses.map((m) => m.label)) : "no metric"}.`,
  );

  return messages.slice(0, 3);
}

function formatList(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
