import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft, ChevronRight, School } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  RAG_COLOR,
  manchester,
  ragLabel,
  ragOf,
  type AreaNode,
  type EyfsScores,
  type SchoolNode,
} from "@/data/dashboardData";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const TARGET = 69;

function ragTextClass(v: number) {
  const r = ragOf(v);
  return r === "green" ? "text-rag-green" : r === "orange" ? "text-rag-orange" : "text-rag-red";
}

function toChartData(eyfs: EyfsScores) {
  return Object.entries(eyfs)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function EyfsPerformance() {
  const [areaId, setAreaId] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);

  const area = useMemo<AreaNode | null>(
    () => manchester.areas.find((a) => a.id === areaId) ?? null,
    [areaId],
  );
  const school = useMemo<SchoolNode | null>(
    () => area?.schools.find((s) => s.id === schoolId) ?? null,
    [area, schoolId],
  );

  return (
    <div className="space-y-5">
      <div className="border-b border-border pb-4">
        <h2 className="text-base font-semibold sm:text-lg">Schools view</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          An overview of early learning goal attainment and key developmental milestones for
          schools in Manchester.
        </p>
      </div>

      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1 border-b border-border pb-3 text-xs"
      >
        <BreadcrumbButton
          label="Manchester"
          active={!area}
          onClick={() => {
            setAreaId(null);
            setSchoolId(null);
          }}
        />
        {area && (
          <>
            <ChevronRight className="size-3.5 text-muted-foreground/60" />
            <BreadcrumbButton
              label={area.name}
              active={!school}
              onClick={() => setSchoolId(null)}
            />
          </>
        )}
        {school && (
          <>
            <ChevronRight className="size-3.5 text-muted-foreground/60" />
            <BreadcrumbButton label={school.name} active onClick={() => {}} />
          </>
        )}
      </nav>

      {school ? (
        <SchoolView school={school} onBack={() => setSchoolId(null)} />
      ) : area ? (
        <OverviewView
          title={`${area.name} — EYFS areas of learning`}
          eyfs={area.eyfs}
          drillLabel="Schools"
          onBack={() => setAreaId(null)}
          backLabel="All wards"
          items={area.schools.map((s) => ({ id: s.id, name: s.name, eyfs: s.eyfs }))}
          onDrill={setSchoolId}
        />
      ) : (
        <OverviewView
          title="Manchester — EYFS areas of learning"
          eyfs={manchester.eyfs}
          drillLabel="Wards / Areas"
          hint="Select a ward to view its schools"
          items={manchester.areas.map((a) => ({
            id: a.id,
            name: a.name,
            eyfs: a.eyfs,
            count: a.schools.length,
            actionLabel: `${a.schools.length} school${a.schools.length === 1 ? "" : "s"}`,
          }))}
          onDrill={setAreaId}
        />
      )}
    </div>
  );
}

function BreadcrumbButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-sm px-1.5 py-0.5 transition-colors",
        active
          ? "font-semibold text-foreground"
          : "font-medium text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function avgOf(eyfs: EyfsScores) {
  const vals = Object.values(eyfs);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function OverviewView({
  title,
  eyfs,
  drillLabel,
  items,
  onDrill,
  onBack,
  backLabel,
  hint,
}: {
  title: string;
  eyfs: EyfsScores;
  drillLabel: string;
  items: {
    id: string;
    name: string;
    eyfs: EyfsScores;
    count?: number;
    actionLabel?: string;
  }[];
  onDrill: (id: string) => void;
  onBack?: () => void;
  backLabel?: string;
  hint?: string;
}) {
  const data = toChartData(eyfs);
  const isMobile = useIsMobile();

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-6">
      <section className="min-w-0">
        {onBack && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="mb-3 h-8 gap-1.5 rounded-sm text-xs"
          >
            <ArrowLeft className="size-3.5" />
            {backLabel ?? "Back"}
          </Button>
        )}
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-base font-semibold sm:text-lg">{title}</h2>
          <p className="shrink-0 text-xs text-muted-foreground">Target {TARGET}%</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Ranked by % at expected level</p>

        <div className="mt-3 h-[400px] rounded-md border border-border bg-card p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 40, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                unit="%"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={isMobile ? 108 : 150}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: isMobile ? 9 : 11, fill: "var(--foreground)" }}
              />
              <Tooltip
                formatter={(v: number) => [`${v}%`, "At expected level"]}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  fontSize: 12,
                }}
              />
              <ReferenceLine
                x={TARGET}
                stroke="var(--foreground)"
                strokeOpacity={0.45}
                strokeDasharray="4 3"
              />
              <Bar dataKey="value" radius={[0, 2, 2, 0]} maxBarSize={20}>
                {data.map((d) => (
                  <Cell key={d.name} fill={RAG_COLOR[ragOf(d.value)]} />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(v: number) => `${v}%`}
                  style={{ fontSize: 11, fontWeight: 600, fill: "var(--foreground)" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="label-caps">{drillLabel}</h2>
          {hint && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <School className="size-3.5" />
              {hint}
            </span>
          )}
        </div>
        <div className="mt-3 divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
          {items.map((item) => {
            const score = avgOf(item.eyfs);
            const action = item.actionLabel ?? "View";
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onDrill(item.id)}
                className="group flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-secondary/60"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.name}</span>
                <span className="hidden shrink-0 text-right sm:block">
                  <span className={cn("text-base font-bold tabular-nums", ragTextClass(score))}>
                    {score}%
                  </span>
                  <span className="ml-1.5 text-[11px] text-muted-foreground">
                    {ragLabel(score)}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="rounded-sm border border-border bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground group-hover:border-foreground/20 group-hover:text-foreground">
                    {action}
                  </span>
                  <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
          Green ≥ 69% · Orange 60–68% · Red &lt; 60%. Overall score is the mean across all seven
          areas of learning.
        </p>
      </section>
    </div>
  );
}

function SchoolView({ school, onBack }: { school: SchoolNode; onBack: () => void }) {
  const data = toChartData(school.eyfs);
  const kpis = [
    { label: "Pre-school Attendance", value: school.kpis.preSchoolReady },
    { label: "Toilet Trained", value: school.kpis.toiletTrained },
    { label: "Feed Independently", value: school.kpis.feedIndependently },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-border pb-4">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold sm:text-xl">{school.name}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">School-level EYFS detail</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="h-8 shrink-0 gap-1.5 rounded-sm text-xs"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Button>
      </div>

      <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card px-4 py-3.5">
            <p className="label-caps">{kpi.label}</p>
            <p className={cn("mt-1.5 text-3xl font-bold tabular-nums", ragTextClass(kpi.value))}>
              {kpi.value}
              <span className="text-lg font-semibold opacity-60">%</span>
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: RAG_COLOR[ragOf(kpi.value)] }}
              />
              {ragLabel(kpi.value)}
            </p>
          </div>
        ))}
      </div>

      <section>
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-base font-semibold">Detailed metrics</h3>
          <p className="shrink-0 text-xs text-muted-foreground">Target {TARGET}%</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          % at expected level by area of learning
        </p>
        <div className="mt-3 h-[420px] rounded-md border border-border bg-card p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 16, right: 4, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                angle={-35}
                textAnchor="end"
                interval={0}
                height={120}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                domain={[0, 100]}
                unit="%"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              />
              <Tooltip
                formatter={(v: number) => [`${v}%`, "At expected level"]}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  fontSize: 12,
                }}
              />
              <ReferenceLine
                y={TARGET}
                stroke="var(--foreground)"
                strokeOpacity={0.45}
                strokeDasharray="4 3"
              />
              <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={40}>
                {data.map((d) => (
                  <Cell key={d.name} fill={RAG_COLOR[ragOf(d.value)]} />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={(v: number) => `${v}%`}
                  style={{ fontSize: 11, fontWeight: 600, fill: "var(--foreground)" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
