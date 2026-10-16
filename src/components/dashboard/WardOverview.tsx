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
import { CalendarDays, Check, ChevronDown, MousePointerClick, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DATA_PERIOD,
  ELG_KEYS,
  ELG_SUB_ITEMS,
  MANCHESTER_LABEL,
  METRICS,
  MILESTONE_CORRELATIONS,
  MILESTONE_KEYS,
  PRIMARY_WARD,
  TARGET,
  WARDS,
  manchesterAverage,
  subItemScore,
  wardPerformance,
  type MetricKey,
  type WardName,
} from "@/data/dashboardData";
import { cn } from "@/lib/utils";

const OTHER_WARDS: WardName[] = WARDS.filter((w) => w !== PRIMARY_WARD);
const SERIES_COLORS = ["var(--chart-2)", "var(--chart-4)", "var(--chart-5)"];
const MCR_COLOR = "var(--rag-orange)";

function colorFor(ward: string) {
  if (ward === MANCHESTER_LABEL) return MCR_COLOR;
  if (ward === PRIMARY_WARD) return "var(--chart-1)";
  return SERIES_COLORS[OTHER_WARDS.indexOf(ward as WardName) % SERIES_COLORS.length];
}

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 4,
  fontSize: 12,
};

export function WardOverview() {
  const [selected, setSelected] = useState<WardName[]>(["Levenshulme", "Cheetham"]);
  const [focusWard, setFocusWard] = useState<WardName>(PRIMARY_WARD as WardName);
  const [openMetric, setOpenMetric] = useState<MetricKey | null>(null);

  const wards = useMemo<WardName[]>(
    () => [PRIMARY_WARD as WardName, ...WARDS.filter((w) => selected.includes(w))],
    [selected],
  );

  const toggle = (ward: WardName) =>
    setSelected((prev) => {
      const next = prev.includes(ward) ? prev.filter((w) => w !== ward) : [...prev, ward];
      if (!next.includes(focusWard) && focusWard !== PRIMARY_WARD) setFocusWard(PRIMARY_WARD as WardName);
      return next;
    });

  const keyMessages = useMemo(() => buildKeyMessages(selected), [selected]);

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold sm:text-lg">Ward overview</h2>
          <span className="inline-flex items-center gap-1 rounded-sm border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            <CalendarDays className="size-3.5" />
            {DATA_PERIOD}
          </span>
        </div>
        <div className="mt-2 max-w-4xl space-y-2 text-sm leading-relaxed text-muted-foreground">
          <p>
            This page provides a ward-by-ward comparative view of key development milestones and
            Early Years Foundation Stage (EYFS) baseline data across Manchester’s 32 wards.
          </p>
          <p>
            Collected at the start of the reception year in September 2026, this data establishes
            the starting point for tracking progress toward Good Level of Development (GLD) targets
            in July 2027. A single benchmark target of {TARGET}% applies across every Early Learning
            Goal and developmental milestone.
          </p>
        </div>
      </div>

      {/* Ward selection */}
      <div className="flex flex-col gap-3 rounded-md border border-primary/30 bg-primary/5 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <SlidersHorizontal className="size-4 text-primary" />
            Select wards to compare
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {wards.map((ward) => (
              <Chip key={ward} label={ward} primary={ward === PRIMARY_WARD} />
            ))}
            <Chip label={MANCHESTER_LABEL} />
          </div>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" className="h-9 shrink-0 justify-between gap-2 rounded-sm sm:w-56">
              {selected.length ? `${selected.length} comparison ward(s)` : "Select wards"}
              <ChevronDown className="size-4 opacity-70" />
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

      <ChartSection
        title="Early Learning Goals"
        hint="Click a chart to see its sub-item breakdown"
        keys={ELG_KEYS}
        wards={wards}
        onOpen={setOpenMetric}
      />
      <ChartSection
        title="Key Development Milestones"
        hint="Click a chart to see correlated Early Learning Goals"
        keys={MILESTONE_KEYS}
        wards={wards}
        onOpen={setOpenMetric}
      />

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

      <DetailDrawer
        metricKey={openMetric}
        wards={wards}
        focusWard={focusWard}
        onFocusWard={setFocusWard}
        onClose={() => setOpenMetric(null)}
      />
    </div>
  );
}

function Chip({ label, primary }: { label: string; primary?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border border-border bg-card px-2 py-0.5 text-xs font-medium",
        primary && "border-primary/40",
      )}
    >
      <span className="size-2 rounded-full" style={{ backgroundColor: colorFor(label) }} />
      {label}
      {primary && (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          primary
        </span>
      )}
    </span>
  );
}

function ChartSection({
  title,
  hint,
  keys,
  wards,
  onOpen,
}: {
  title: string;
  hint: string;
  keys: MetricKey[];
  wards: WardName[];
  onOpen: (k: MetricKey) => void;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MousePointerClick className="size-3.5" />
          {hint}
        </p>
      </div>
      <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 xl:grid-cols-3">
        {keys.map((k) => (
          <MetricChart key={k} metricKey={k} wards={wards} onOpen={() => onOpen(k)} />
        ))}
      </div>
    </section>
  );
}

function MetricChart({
  metricKey,
  wards,
  onOpen,
}: {
  metricKey: MetricKey;
  wards: WardName[];
  onOpen: () => void;
}) {
  const metric = METRICS.find((m) => m.key === metricKey)!;
  const series = [MANCHESTER_LABEL, ...wards];
  const data = [
    {
      name: metric.label,
      ...Object.fromEntries(wards.map((w) => [w, wardPerformance[w][metricKey]])),
      [MANCHESTER_LABEL]: manchesterAverage[metricKey],
    },
  ];
  const primaryValue = wardPerformance[PRIMARY_WARD as WardName][metricKey];
  const delta = primaryValue - TARGET;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group bg-card p-4 text-left transition-colors hover:bg-secondary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold leading-snug group-hover:text-primary">
            {metric.full}
          </h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {metric.label} · target {TARGET}%
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
            <Tooltip formatter={(v: number) => `${v}%`} contentStyle={tooltipStyle} />
            <ReferenceLine
              y={TARGET}
              stroke="var(--foreground)"
              strokeOpacity={0.45}
              strokeDasharray="4 3"
            />
            {series.map((s) => (
              <Bar
                key={s}
                dataKey={s}
                fill={colorFor(s)}
                radius={[2, 2, 0, 0]}
                maxBarSize={34}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-[11px] font-medium text-primary opacity-70 group-hover:opacity-100">
        View details →
      </p>
    </button>
  );
}

function DetailDrawer({
  metricKey,
  wards,
  focusWard,
  onFocusWard,
  onClose,
}: {
  metricKey: MetricKey | null;
  wards: WardName[];
  focusWard: WardName;
  onFocusWard: (w: WardName) => void;
  onClose: () => void;
}) {
  const metric = metricKey ? METRICS.find((m) => m.key === metricKey) : null;
  const isElg = metricKey ? ELG_KEYS.includes(metricKey) : false;

  return (
    <Sheet open={!!metricKey} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {metric && metricKey && (
          <>
            <SheetHeader>
              <p className="label-caps">
                {isElg ? "Early Learning Goal breakdown" : "Milestone correlation"}
              </p>
              <SheetTitle>{metric.full}</SheetTitle>
              <SheetDescription>
                {isElg
                  ? `Early learning goals for ${focusWard} compared with the Manchester average.`
                  : `Early Learning Goals most closely linked with ${metric.full.toLowerCase()}, comparing children who achieved the milestone with those who did not.`}
              </SheetDescription>
            </SheetHeader>

            {isElg && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {wards.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => onFocusWard(w)}
                    className={cn(
                      "rounded-sm border border-border px-2 py-0.5 text-xs font-medium transition-colors",
                      w === focusWard ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary",
                    )}
                  >
                    {w}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5 space-y-3">
              {isElg ? (
                <SubItemChart metricKey={metricKey} ward={focusWard} />
              ) : (
                <CorrelationPanel metricKey={metricKey} />
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function SubItemChart({ metricKey, ward }: { metricKey: MetricKey; ward: WardName }) {
  const items = ELG_SUB_ITEMS[metricKey] ?? [];
  const data = items.map((it) => ({
    name: it.name,
    [MANCHESTER_LABEL]: subItemScore(manchesterAverage[metricKey], it.offset),
    [ward]: subItemScore(wardPerformance[ward][metricKey], it.offset),
  }));

  return (
    <>
      <Legend items={[MANCHESTER_LABEL, ward]} />
      <div className="h-[280px] rounded-md border border-border bg-card p-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              unit="%"
            />
            <Tooltip formatter={(v: number) => `${v}%`} contentStyle={tooltipStyle} />
            <ReferenceLine
              y={TARGET}
              stroke="var(--foreground)"
              strokeOpacity={0.45}
              strokeDasharray="4 3"
              label={{
                value: `Target ${TARGET}%`,
                position: "insideTopRight",
                fill: "var(--muted-foreground)",
                fontSize: 10,
              }}
            />
            <Bar
              dataKey={MANCHESTER_LABEL}
              fill={MCR_COLOR}
              radius={[2, 2, 0, 0]}
              maxBarSize={40}
            />
            <Bar dataKey={ward} fill={colorFor(ward)} radius={[2, 2, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-1.5">
        {data.map((d) => {
          const gap = (d[ward] as number) - (d[MANCHESTER_LABEL] as number);
          return (
            <li key={d.name} className="flex justify-between gap-3 border-b border-border py-1.5 text-sm">
              <span>{d.name}</span>
              <span className={cn("font-semibold tabular-nums", gap >= 0 ? "text-rag-green" : "text-rag-red")}>
                {gap >= 0 ? "+" : "−"}
                {Math.abs(gap)} pts vs Manchester
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function CorrelationPanel({ metricKey }: { metricKey: MetricKey }) {
  const rows = MILESTONE_CORRELATIONS[metricKey] ?? [];
  const data = rows.map((r) => ({ name: r.elg, Achieved: r.achieved, "Not achieved": r.notAchieved }));

  return (
    <>
      <Legend items={["Achieved", "Not achieved"]} colors={["var(--chart-1)", "var(--muted-foreground)"]} />
      <div className="h-[280px] rounded-md border border-border bg-card p-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              unit="%"
            />
            <Tooltip formatter={(v: number) => `${v}%`} contentStyle={tooltipStyle} />
            <ReferenceLine
              y={TARGET}
              stroke="var(--foreground)"
              strokeOpacity={0.45}
              strokeDasharray="4 3"
              label={{
                value: `Target ${TARGET}%`,
                position: "insideTopRight",
                fill: "var(--muted-foreground)",
                fontSize: 10,
              }}
            />
            <Bar dataKey="Achieved" fill="var(--chart-1)" radius={[2, 2, 0, 0]} maxBarSize={40} />
            <Bar dataKey="Not achieved" fill="var(--muted-foreground)" fillOpacity={0.55} radius={[2, 2, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid gap-2">
        {rows.map((r) => {
          const strength = r.r >= 0.6 ? "Strong" : r.r >= 0.5 ? "Moderate" : "Weak";
          const strengthClass =
            r.r >= 0.6 ? "text-rag-green" : r.r >= 0.5 ? "text-rag-orange" : "text-rag-red";
          const barColor =
            r.r >= 0.6 ? "var(--rag-green)" : r.r >= 0.5 ? "var(--rag-orange)" : "var(--rag-red)";
          return (
            <div key={r.elg} className="rounded-md border border-border bg-card p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">{r.elg}</span>
                <span className="text-sm font-bold tabular-nums">r = {r.r.toFixed(2)}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full" style={{ width: `${r.r * 100}%`, backgroundColor: barColor }} />
              </div>
              <p className={cn("mt-1.5 text-xs font-medium", strengthClass)}>
                {strength} positive
                correlation · {r.achieved - r.notAchieved} pt attainment gap
              </p>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground">Illustrative correlation figures (mock data).</p>
    </>
  );
}

function Legend({ items, colors }: { items: string[]; colors?: string[] }) {
  return (
    <div className="flex flex-wrap gap-3 text-xs">
      {items.map((it, i) => (
        <span key={it} className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ backgroundColor: colors?.[i] ?? colorFor(it) }} />
          {it}
        </span>
      ))}
    </div>
  );
}

function buildKeyMessages(selected: WardName[]): string[] {
  const gorton = wardPerformance[PRIMARY_WARD as WardName];
  const messages: string[] = [];

  const aboveTarget = METRICS.filter((m) => gorton[m.key] >= TARGET);
  const strongest = [...METRICS].sort((a, b) => gorton[b.key] - gorton[a.key])[0]!;
  messages.push(
    `${PRIMARY_WARD} meets or exceeds the ${TARGET}% benchmark target in ${aboveTarget.length} of ${METRICS.length} metrics, performing best in ${strongest.full} (${gorton[strongest.key]}%).`,
  );

  const aboveMcr = METRICS.filter((m) => gorton[m.key] >= manchesterAverage[m.key]);
  messages.push(
    `Against the Manchester average, ${PRIMARY_WARD} is level or ahead in ${aboveMcr.length} of ${METRICS.length} metrics${
      aboveMcr.length ? ` (${formatList(aboveMcr.map((m) => m.label))})` : ""
    }.`,
  );

  if (!selected.length) {
    messages.push("Select one or more comparison wards to benchmark Gorton against other wards.");
    return messages;
  }

  const wins = METRICS.filter((m) => selected.every((w) => gorton[m.key] > wardPerformance[w][m.key]));
  const losses = METRICS.filter((m) => selected.every((w) => gorton[m.key] < wardPerformance[w][m.key]));
  messages.push(
    `Compared with ${formatList(selected)}, ${PRIMARY_WARD} leads on ${
      wins.length ? formatList(wins.map((m) => m.label)) : "no metric"
    } and trails on ${losses.length ? formatList(losses.map((m) => m.label)) : "no metric"}.`,
  );
  return messages;
}

function formatList(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
