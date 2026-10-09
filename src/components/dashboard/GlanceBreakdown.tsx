import { breakdown, ragOf, type BreakdownRow } from "@/data/dashboardData";
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

const AREA_HEADERS: { label: string; span: number; border: boolean }[] = [
  { label: "Communication & Language", span: 2, border: true },
  { label: "Personal, Social & Emotional Development", span: 3, border: true },
  { label: "Physical Development", span: 2, border: false },
];

function valueClass(v: number) {
  const rag = ragOf(v);
  return rag === "green"
    ? "text-rag-green"
    : rag === "orange"
      ? "text-rag-orange"
      : "text-rag-red";
}

export function GlanceBreakdown() {
  return (
    <div className="space-y-5">
      <div className="border-b border-border pb-4">
        <h2 className="text-base font-semibold sm:text-lg">Characteristics breakdown</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Percentage of children at expected level by group and early learning goals.
        </p>
      </div>

      {/* RAG rating key */}
      <section className="rounded-md border border-border bg-card px-4 py-3">
        <h3 className="label-caps">How the RAG rating works</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Each percentage is colour-coded against the baseline standard, so weaker areas stand out
          at a glance:
        </p>
        <ul className="mt-2.5 grid gap-2 sm:grid-cols-3">
          <li className="flex items-center gap-2 text-sm">
            <span className="size-2.5 shrink-0 rounded-full bg-rag-green" />
            <span>
              <span className="font-semibold">Green</span> — 69% or above (on target)
            </span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <span className="size-2.5 shrink-0 rounded-full bg-rag-orange" />
            <span>
              <span className="font-semibold">Orange</span> — 60–68% (approaching)
            </span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <span className="size-2.5 shrink-0 rounded-full bg-rag-red" />
            <span>
              <span className="font-semibold">Red</span> — below 60% (below target)
            </span>
          </li>
        </ul>
      </section>

      {/* Desktop / tablet: matrix table */}
      <div className="hidden overflow-x-auto rounded-md border border-border bg-card sm:block">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="bg-surface text-surface-foreground">
              <th
                rowSpan={2}
                className="border-r border-white/10 px-3 py-2 text-left align-bottom text-[11px] font-semibold uppercase tracking-[0.08em]"
              >
                Group
              </th>
              {AREA_HEADERS.map((a) => (
                <th
                  key={a.label}
                  colSpan={a.span}
                  className={cn(
                    "px-3 py-2 text-center text-[11px] font-semibold uppercase leading-snug tracking-[0.06em]",
                    a.border && "border-r border-white/10",
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
                  className={cn(
                    "px-3 pb-2 text-center text-[10px] font-medium leading-tight",
                    (i === 1 || i === 4) && "border-r border-white/10",
                  )}
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
                  "border-t border-border transition-colors hover:bg-secondary/50",
                  row.group === "National" && "bg-secondary/40",
                )}
              >
                <th
                  scope="row"
                  className="border-r border-border px-3 py-2.5 text-left text-sm font-semibold"
                >
                  {row.group}
                  {row.group === "National" && (
                    <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      benchmark
                    </span>
                  )}
                </th>
                {CELL_KEYS.map((c, i) => {
                  const v = c.path(row);
                  return (
                    <td
                      key={c.key}
                      className={cn(
                        "px-3 py-2.5 text-center text-[15px] font-semibold tabular-nums",
                        (i === 1 || i === 4) && "border-r border-border",
                        valueClass(v),
                      )}
                    >
                      {v}
                      <span className="text-[11px] font-medium opacity-60">%</span>
                    </td>
                  );
                })}
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
              "rounded-md border border-border bg-card",
              row.group === "National" && "border-primary/40",
            )}
          >
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <h3 className="text-sm font-semibold">
                {row.group}
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
                  <div key={c.key}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {c.head}
                    </p>
                    <p className={cn("text-lg font-bold tabular-nums", valueClass(v))}>{v}%</p>
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
            {buildNextSteps().map((msg, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                <span className="mt-1.5 size-1.5 shrink-0 rotate-45 border border-primary" />
                <span>{msg}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
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
    `SEND children show the widest inequality at ${avg(send)}% overall — ${natAvg - avg(send)} points behind national.`,
    `EAL children track closer to national at ${avg(eal)}%, but their language outcomes (Listening & Attention ${eal.cll.LA}%, Speaking ${eal.cll.S}%) remain a priority for targeted support.`,
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

  const boyAvg = avg(boy);
  const girlAvg = avg(girl);
  const natAvg = avg(nat);

  return [
    `Review Communication & Language provision for boys, focusing on Listening & Attention strategies where the ${girl.cll.LA - boy.cll.LA} point gap is widest.`,
    `Prioritise targeted intervention for SEND pupils to close the ${natAvg - avg(send)} point gap to national.`,
    `Strengthen early-language support for EAL children, particularly in Listening & Attention (${eal.cll.LA}%) and Speaking (${eal.cll.S}%).`,
    `Share Physical Development — Gross Motor practice across settings, as it is the consistently strongest area.`,
    `Re-check baseline data quality and collection consistency before the next reporting cycle.`,
  ];
}
