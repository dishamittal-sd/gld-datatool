import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TARGET, breakdown, ragOf, RAG_COLOR, type BreakdownRow, type Rag } from "@/data/dashboardData";
import { cn } from "@/lib/utils";

const CELL_KEYS: { path: (r: BreakdownRow) => number; key: string; head: string }[] = [
  { key: "cll-LA", head: "Listening & Attention", path: (r) => r.cll.LA },
  { key: "cll-S", head: "Speaking", path: (r) => r.cll.S },
  { key: "pse-SR", head: "Self-Regulation", path: (r) => r.pse.SR },
  { key: "pse-MS", head: "Managing Self", path: (r) => r.pse.MS },
  { key: "pse-BR", head: "Building Relationships", path: (r) => r.pse.BR },
  { key: "pd-GM", head: "Gross Motor", path: (r) => r.pd.GM },
  { key: "pd-FM", head: "Fine Motor", path: (r) => r.pd.FM },
];

const AREA_HEADERS: { label: string; span: number }[] = [
  { label: "Communication & Language", span: 2 },
  { label: "Personal, Social & Emotional Development", span: 3 },
  { label: "Physical Development", span: 2 },
];

/** Display labels for group keys. */
const GROUP_LABELS: Record<string, string> = {
  FSM: "Free School Meals",
  National: "Manchester overview",
};

/** Abbreviations that expand in a hover tooltip. */
const TOOLTIP_LABELS: Record<string, string> = {
  EAL: "English as an Additional Language",
  SEND: "Special Educational Needs and Disabilities",
};

function groupLabel(group: string) {
  return GROUP_LABELS[group] ?? group;
}

/** Group heading with a dotted-underline abbreviation + hover tooltip where applicable. */
function GroupLabel({ group }: { group: string }) {
  const full = TOOLTIP_LABELS[group];
  if (!full) return <>{groupLabel(group)}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className="cursor-help underline decoration-dotted decoration-muted-foreground/60 underline-offset-2"
        >
          {groupLabel(group)}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-56 text-center">{full}</TooltipContent>
    </Tooltip>
  );
}

/* Darker grid lines for contrast */
const GRID = "border-foreground/30";
const GRID_DOTTED = "border-foreground/25";

/** Left-edge border per column: solid darker between learning areas, dotted within. */
function colBorder(i: number) {
  if (i === 0) return undefined;
  if (i === 2 || i === 5) return cn("border-l-2", GRID);
  return cn("border-l border-dotted", GRID_DOTTED);
}

function valueClass(v: number) {
  const rag = ragOf(v);
  return rag === "green"
    ? "text-rag-green-ink"
    : rag === "orange"
      ? "text-rag-orange-ink"
      : "text-rag-red-ink";
}

/** Legend rows: a solid RAG circle, then the status label and its threshold band. */
const RAG_KEY: {
  rag: Rag;
  label: string;
  threshold: string;
}[] = [
  {
    rag: "green",
    label: "On target",
    threshold: `${TARGET}% or above`,
  },
  {
    rag: "orange",
    label: "Approaching",
    threshold: "60–68%",
  },
  {
    rag: "red",
    label: "Further development needed",
    threshold: "below 60%",
  },
];

function CellValue({ value }: { value: number }) {
  return (
    <span className={cn("text-[19px] font-bold tabular-nums", valueClass(value))}>
      {value}
      <span className="text-[12px] font-semibold opacity-60">%</span>
    </span>
  );
}

/** Resource links shared by the next-steps text and the "Helpful links" list. */
const HELPFUL_LINKS: { label: string; href: string }[] = [
  { label: "Communication & language resources", href: "https://www.bbc.co.uk/tiny-happy-people" },
  {
    label: "SEND code of practice",
    href: "https://www.gov.uk/government/publications/send-code-of-practice-0-to-25",
  },
  { label: "EAL guidance and resources", href: "https://www.bell-foundation.org.uk/" },
  {
    label: "Physical development guidance",
    href: "https://www.gov.uk/government/publications/development-matters--2",
  },
  {
    label: "EYFS profile handbook",
    href: "https://www.gov.uk/government/publications/early-years-foundation-stage-profile-handbook",
  },
];

export function GlanceBreakdown() {
  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-5">
        <div className="border-b border-border pb-4">
          <h2 className="text-base font-semibold sm:text-lg">Characteristics view</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This page provides a characteristics breakdown of key development milestones and Early
            Years Foundation Stage (EYFS) baseline data for children in Gorton. It shows the
            percentage of children reaching expected levels across different characteristics and
            Early Learning Goals.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Collected at the start of the reception year in September 2026, this data establishes the
            starting point for tracking progress toward Good Level of Development (GLD) targets in
            July 2027. Target thresholds for each Early Learning Goal and developmental milestone are
            set in line with Manchester Local Authority priorities.
          </p>
        </div>

        {/* RAG rating key */}
        <section className="rounded-md border border-border bg-card px-4 py-3">
          <h3 className="label-caps">How the RAG rating works</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Each percentage is color-coded, giving you a clear view of strengths and areas for
            development
          </p>
          <ul className="mt-2.5 grid gap-2.5 sm:grid-cols-3">
            {RAG_KEY.map((item) => (
              <li key={item.rag} className="flex items-start gap-2.5 text-sm">
                <span
                  aria-hidden
                  className="mt-1 size-3 shrink-0 rounded-full ring-1 ring-inset ring-foreground/10"
                  style={{ background: RAG_COLOR[item.rag] }}
                />
                <span className="leading-snug">
                  <span className="font-semibold text-foreground">{item.label}</span>
                  <span className="text-muted-foreground"> — {item.threshold}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Desktop / tablet: matrix table */}
        <div className={cn("hidden overflow-x-auto rounded-md border bg-card sm:block", GRID)}>
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="bg-surface text-surface-foreground">
                <th
                  rowSpan={2}
                  className={cn(
                    "border-r px-3 py-2 text-left align-bottom text-[11px] font-semibold uppercase tracking-[0.08em]",
                    GRID,
                  )}
                >
                  Group
                </th>
                {AREA_HEADERS.map((a, ai) => (
                  <th
                    key={a.label}
                    colSpan={a.span}
                    className={cn(
                      "px-3 py-2 text-center text-[11px] font-semibold uppercase leading-snug tracking-[0.06em]",
                      ai < AREA_HEADERS.length - 1 && cn("border-r-2", GRID),
                    )}
                  >
                    {a.label}
                  </th>
                ))}
              </tr>
              <tr className="bg-surface text-surface-foreground/70">
                {CELL_KEYS.map((c, i) => (
                  <th
                    key={c.key}
                    className={cn("px-3 pb-2 text-center text-[10px] font-medium leading-tight", colBorder(i))}
                  >
                    {c.head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {breakdown.map((row) => (
                <tr
                  key={row.group}
                  className={cn(
                    "border-t transition-colors hover:bg-primary/10",
                    GRID,
                    row.group === "National" && "bg-secondary/40",
                  )}
                >
                  <th
                    scope="row"
                    className={cn("border-r px-3 py-2.5 text-left text-sm font-semibold", GRID)}
                  >
                    <GroupLabel group={row.group} />
                    {row.group === "National" && (
                      <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        benchmark
                      </span>
                    )}
                  </th>
                  {CELL_KEYS.map((c, i) => (
                    <td key={c.key} className={cn("px-3 py-2.5 text-center", colBorder(i))}>
                      <CellValue value={c.path(row)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: one card per group, data-forward */}
        <div className="space-y-3 sm:hidden">
          {breakdown.map((row) => (
            <div
              key={row.group}
              className={cn(
                "rounded-md border bg-card",
                GRID,
                row.group === "National" && "border-primary/40",
              )}
            >
              <div className={cn("flex items-center justify-between border-b px-3 py-2", GRID)}>
                <h3 className="text-sm font-semibold">
                  <GroupLabel group={row.group} />
                  {row.group === "National" && (
                    <span className="ml-2 align-middle text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      benchmark
                    </span>
                  )}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-3 py-3">
                {CELL_KEYS.map((c) => {
                  const v = c.path(row);
                  return (
                    <div key={c.key} className="flex flex-col items-start gap-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {c.head}
                      </p>
                      <p className={cn("text-xl font-bold tabular-nums", valueClass(v))}>{v}%</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-md border border-border bg-card p-4">
            <h2 className="label-caps">Data summary</h2>
            <ul className="mt-3 space-y-2.5">
              {buildSummaryBullets().map((msg, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{msg}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-md border border-border bg-card p-4">
            <h2 className="label-caps">Suggested next steps</h2>
            <ul className="mt-3 space-y-2.5">
              {buildNextSteps().map((step, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                  <span className="mt-1.5 size-1.5 shrink-0 rotate-45 border border-primary" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>

            <h3 className="label-caps mt-5 border-t border-border pt-4">Helpful links</h3>
            <ul className="mt-3 space-y-2">
              {HELPFUL_LINKS.map((link) => (
                <li key={link.href} className="flex gap-2.5 text-sm">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline underline-offset-2 transition-colors hover:opacity-80"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </TooltipProvider>
  );
}

function avg(row: BreakdownRow) {
  const vals = CELL_KEYS.map((c) => c.path(row));
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function buildSummaryBullets(): string[] {
  const byGroup = Object.fromEntries(breakdown.map((r) => [r.group, r]));
  const boy = byGroup["Boy"]!;
  const girl = byGroup["Girl"]!;
  const nat = byGroup["National"]!;
  const send = byGroup["SEND"]!;
  const eal = byGroup["EAL"]!;
  const fsm = byGroup["FSM"]!;

  const boyAvg = avg(boy);
  const girlAvg = avg(girl);
  const natAvg = avg(nat);
  const gap = girlAvg - boyAvg;
  const widestGap = Math.max(
    girl.cll.LA - boy.cll.LA,
    girl.cll.S - boy.cll.S,
    girl.pse.SR - boy.pse.SR,
    girl.pse.MS - boy.pse.MS,
    girl.pse.BR - boy.pse.BR,
    girl.pd.FM - boy.pd.FM,
  );

  return [
    `Girls outperform boys on six of the seven early learning goals — Listening & Attention (${girl.cll.LA}% vs ${boy.cll.LA}%), Speaking (${girl.cll.S}% vs ${boy.cll.S}%), Self-Regulation (${girl.pse.SR}% vs ${boy.pse.SR}%), Managing Self (${girl.pse.MS}% vs ${boy.pse.MS}%), Building Relationships (${girl.pse.BR}% vs ${boy.pse.BR}%) and Fine Motor Skills (${girl.pd.FM}% vs ${boy.pd.FM}%) — an overall gap of ${gap} points (${girlAvg}% vs ${boyAvg}%).`,
    `Boys outperform girls only in Gross Motor Skills (${boy.pd.GM}% vs ${girl.pd.GM}%); the widest gender gap is ${widestGap} points.`,
    `Children with SEND show the widest inequality at ${avg(send)}% overall — ${natAvg - avg(send)} points behind the Manchester overview.`,
    `Children with EAL track closer to the Manchester overview at ${avg(eal)}%, but their language outcomes (Listening & Attention ${eal.cll.LA}%, Speaking ${eal.cll.S}%) remain a priority for targeted support.`,
    `Children facing combined barriers need the most joined-up support: both children on Free School Meals (${avg(fsm)}% overall) and children with EAL (${avg(eal)}%) sit well below the Manchester overview (${natAvg}%), and where the two overlap — for example in Communication & Language (Free School Meals ${fsm.cll.LA}%, EAL ${eal.cll.LA}%) — the gaps add up, so these children benefit most when language and family support are planned together.`,
    `Physical Development — Gross Motor is the strongest area across every group.`,
  ];
}

function buildNextSteps(): string[] {
  const byGroup = Object.fromEntries(breakdown.map((r) => [r.group, r]));
  const boy = byGroup["Boy"]!;
  const girl = byGroup["Girl"]!;
  const nat = byGroup["National"]!;
  const send = byGroup["SEND"]!;
  const eal = byGroup["EAL"]!;

  const natAvg = avg(nat);

  return [
    `Review Communication & Language provision for boys, focusing on Listening & Attention strategies where the ${girl.cll.LA - boy.cll.LA} point gap is widest.`,
    `Prioritise targeted intervention for pupils with SEND to close the ${natAvg - avg(send)} point gap to the Manchester overview.`,
    `Strengthen early-language support for children with EAL, particularly in Listening & Attention (${eal.cll.LA}%) and Speaking (${eal.cll.S}%).`,
    `Share Physical Development — Gross Motor practice across settings, as it is the consistently strongest area.`,
    `Re-check baseline data quality and collection consistency before the next reporting cycle.`,
  ];
}
