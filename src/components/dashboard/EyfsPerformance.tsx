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
import { ArrowLeft, ChevronRight, Info, MousePointerClick, School, Trophy, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DATA_PERIOD, RAG_COLOR, TARGET, ragLabel, ragOf, type EyfsScores } from "@/data/dashboardData";
import {
  DEFAULT_WARD_ID,
  MILESTONES,
  TOTAL_GOALS,
  goalsOnTarget,
  topNames,
  wardRecords,
  type Milestones,
  type SchoolRecord,
  type WardRecord,
} from "@/data/schoolsData";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

function ragTextClass(v: number) {
  const r = ragOf(v);
  return r === "green" ? "text-rag-green" : r === "orange" ? "text-rag-orange" : "text-rag-red";
}

type Peer = { name: string; eyfs: EyfsScores; kpis: Milestones };

export function EyfsPerformance() {
  const [wardId, setWardId] = useState(DEFAULT_WARD_ID);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const ward = wardRecords.find((w) => w.id === wardId)!;
  const school = ward.schools.find((s) => s.id === schoolId) ?? null;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-5">
        <div className="border-b border-border pb-4">
          <h2 className="text-base font-semibold sm:text-lg">Schools view</h2>
          <div className="mt-2 max-w-4xl space-y-2 text-sm leading-relaxed text-muted-foreground">
            <p>
              This page provides a breakdown of key development milestones and Early Years
              Foundation Stage (EYFS) baseline data across Manchester’s 32 wards. You are able to
              select the ward, and then able to click directly into each to view the school-level
              breakdown.
            </p>
            <p>
              Collected at the start of the reception year in September 2026, this data establishes
              the starting point for tracking progress toward Good Level of Development (GLD)
              targets in July 2027. Target thresholds for each Early Learning Goal and developmental
              milestone are set in line with Manchester Local Authority priorities.
            </p>
          </div>
        </div>

        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => setSchoolId(null)}
            className={cn(
              "rounded-sm px-1.5 py-0.5",
              school ? "font-medium text-muted-foreground hover:text-foreground" : "font-semibold",
            )}
          >
            {ward.name}
          </button>
          {school && (
            <>
              <ChevronRight className="size-3.5 text-muted-foreground/60" />
              <span className="px-1.5 py-0.5 font-semibold">{school.name}</span>
            </>
          )}
        </nav>

        {school ? (
          <SchoolView school={school} ward={ward} onBack={() => setSchoolId(null)} />
        ) : (
          <WardView
            ward={ward}
            onWard={(id) => {
              setWardId(id);
              setSchoolId(null);
            }}
            onSchool={setSchoolId}
          />
        )}
      </div>
    </TooltipProvider>
  );
}

function WardView({
  ward,
  onWard,
  onSchool,
}: {
  ward: WardRecord;
  onWard: (id: string) => void;
  onSchool: (id: string) => void;
}) {
  const [show2025, setShow2025] = useState(false);
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-md border border-primary/30 bg-primary/5 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{ward.name} overview</h2>
          <p className="text-xs text-muted-foreground">
            {ward.schools.length} schools · {DATA_PERIOD} · target {TARGET}%
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm font-semibold">Select ward</Label>
          <Select value={ward.id} onValueChange={onWard}>
            <SelectTrigger className="h-9 w-56 rounded-sm bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {wardRecords.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <MilestoneCards kpis={ward.kpis} peers={wardRecords} peerLabel="wards" />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold">Early Learning Goals</h3>
            <div className="flex items-center gap-2">
              <Switch id="show-2025" checked={show2025} onCheckedChange={setShow2025} />
              <Label htmlFor="show-2025" className="text-xs font-medium">
                Show 2025 Data
              </Label>
            </div>
          </div>
          <ElgChart
            eyfs={ward.eyfs}
            previous={show2025 ? ward.eyfs2025 : undefined}
            peers={wardRecords}
            peerLabel="wards"
          />
        </section>

        <section className="min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-base font-semibold">Schools in {ward.name}</h3>
          </div>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-sm border border-primary/40 bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
            <MousePointerClick className="size-3.5" />
            Click a school to view individual performance
          </p>
          <div className="mt-3 divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
            {ward.schools.map((s) => {
              const goals = goalsOnTarget(s.eyfs, s.kpis);
              const r = goals >= 7 ? 80 : goals >= 4 ? 64 : 50;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSchool(s.id)}
                  className="group flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <School className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium group-hover:text-primary">
                    {s.name}
                  </span>
                  <span className={cn("shrink-0 text-sm font-bold tabular-nums", ragTextClass(r))}>
                    {goals}/{TOTAL_GOALS}
                    <span className="ml-1 text-[11px] font-medium text-muted-foreground">
                      goals on target
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function SchoolView({
  school,
  ward,
  onBack,
}: {
  school: SchoolRecord;
  ward: WardRecord;
  onBack: () => void;
}) {
  const meta = [
    { icon: Users, label: "Reception Cohort", value: `${school.cohort} children` },
    { icon: Info, label: "SEND Provision", value: school.send ? "Yes" : "No" },
    { icon: Trophy, label: "Schools GLD", value: `${school.gld}%` },
  ];
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold sm:text-xl">{school.name}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {ward.name} · School-level EYFS detail · target {TARGET}%
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onBack} className="h-8 gap-1.5 rounded-sm text-xs">
          <ArrowLeft className="size-3.5" />
          Back to {ward.name}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {meta.map((m) => (
          <div key={m.label} className="flex items-center gap-3 rounded-md border border-border bg-secondary/40 px-3 py-2.5">
            <m.icon className="size-4 text-primary" />
            <div>
              <p className="label-caps">{m.label}</p>
              <p className="text-base font-bold">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      <MilestoneCards kpis={school.kpis} peers={ward.schools} peerLabel={`schools in ${ward.name}`} />

      <section>
        <h3 className="text-base font-semibold">Early Learning Goals</h3>
        <ElgChart eyfs={school.eyfs} peers={ward.schools} peerLabel={`schools in ${ward.name}`} />
      </section>
    </div>
  );
}

function MilestoneCards({ kpis, peers, peerLabel }: { kpis: Milestones; peers: Peer[]; peerLabel: string }) {
  return (
    <section>
      <h3 className="mb-2 text-base font-semibold">Key Developmental Milestones</h3>
      <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
        {MILESTONES.map((m) => {
          const v = kpis[m.key];
          const top = topNames(peers, (p) => p.kpis[m.key]);
          return (
            <UiTooltip key={m.key}>
              <TooltipTrigger asChild>
                <div tabIndex={0} className="cursor-help bg-card px-4 py-3.5 transition-colors hover:bg-secondary/50">
                  <p className="label-caps">{m.label}</p>
                  <p className={cn("mt-1.5 text-3xl font-bold tabular-nums", ragTextClass(v))}>
                    {v}
                    <span className="text-lg font-semibold opacity-60">%</span>
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <span className="size-2 rounded-full" style={{ backgroundColor: RAG_COLOR[ragOf(v)] }} />
                    {ragLabel(v)}
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <TopList title={`Top 3 ${peerLabel}`} names={top} />
              </TooltipContent>
            </UiTooltip>
          );
        })}
      </div>
    </section>
  );
}

function TopList({ title, names }: { title: string; names: string[] }) {
  return (
    <div className="text-xs">
      <p className="mb-1 font-semibold">{title}</p>
      <ol className="list-decimal space-y-0.5 pl-4">
        {names.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ol>
    </div>
  );
}

function ElgChart({
  eyfs,
  previous,
  peers,
  peerLabel,
}: {
  eyfs: EyfsScores;
  previous?: EyfsScores;
  peers: Peer[];
  peerLabel: string;
}) {
  const isMobile = useIsMobile();
  const data = useMemo(
    () =>
      Object.entries(eyfs)
        .map(([name, value]) => ({ name, value, prev: previous?.[name] }))
        .sort((a, b) => b.value - a.value),
    [eyfs, previous],
  );
  return (
    <div className="mt-3 rounded-md border border-border bg-card p-3">
      <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>% at expected level · hover a bar for top performers</span>
        {previous && (
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-muted-foreground/40" />
            2025
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <span className="w-4 border-t border-dashed border-foreground/60" />
          Target {TARGET}%
        </span>
      </div>
      <div className={previous ? "h-[460px]" : "h-[360px]"}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, left: 0, bottom: 0 }}>
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
              cursor={{ fill: "var(--secondary)" }}
              content={({ active, label }) =>
                active && label ? (
                  <div className="rounded-sm border border-border bg-card px-3 py-2 shadow-sm">
                    <p className="mb-1 text-xs font-semibold">{label}</p>
                    <TopList title={`Top 3 ${peerLabel}`} names={topNames(peers, (p) => p.eyfs[label as string] ?? 0)} />
                  </div>
                ) : null
              }
            />
            <ReferenceLine x={TARGET} stroke="var(--foreground)" strokeOpacity={0.45} strokeDasharray="4 3" />
            {previous && (
              <Bar dataKey="prev" name="2025" fill="var(--muted-foreground)" fillOpacity={0.4} radius={[0, 2, 2, 0]} maxBarSize={14}>
                <LabelList dataKey="prev" position="right" formatter={(v: number) => `${v}%`} style={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
              </Bar>
            )}
            <Bar dataKey="value" name="2026" radius={[0, 2, 2, 0]} maxBarSize={previous ? 14 : 20}>
              {data.map((d) => (
                <Cell key={d.name} fill={RAG_COLOR[ragOf(d.value)]} />
              ))}
              <LabelList dataKey="value" position="right" formatter={(v: number) => `${v}%`} style={{ fontSize: 11, fontWeight: 600, fill: "var(--foreground)" }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
