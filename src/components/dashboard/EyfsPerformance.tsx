import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { EYFS_AREAS, manchester, type AreaNode, type SchoolNode } from "@/data/dashboardData";
import { RagLegend, RagValue } from "./RagBadge";

export function EyfsPerformance() {
  const [area, setArea] = useState<AreaNode | null>(null);
  const [school, setSchool] = useState<SchoolNode | null>(null);
  const current = school ?? area ?? manchester;
  const children = school ? [] : area ? area.schools : manchester.areas;

  return (
    <div className="space-y-5">
      <nav className="flex flex-wrap items-center gap-1 text-sm">
        <button className="font-medium text-primary hover:underline" onClick={() => { setArea(null); setSchool(null); }}>Manchester</button>
        {area && (<><ChevronRight className="h-4 w-4 text-muted-foreground" />
          <button className="font-medium text-primary hover:underline" onClick={() => setSchool(null)}>{area.name}</button></>)}
        {school && (<><ChevronRight className="h-4 w-4 text-muted-foreground" /><span className="font-semibold">{school.name}</span></>)}
      </nav>

      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <h2 className="text-lg font-semibold">{current.name}</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {EYFS_AREAS.map((a) => (
            <div key={a} className="rounded-md bg-muted p-3">
              <p className="text-xs text-muted-foreground">{a}</p>
              <RagValue value={current.eyfs[a] ?? 0} className="mt-2 text-xl" />
            </div>
          ))}
        </div>
        {school && (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {([["Pre-school ready", school.kpis.preSchoolReady], ["Toilet trained", school.kpis.toiletTrained], ["Feeds independently", school.kpis.feedIndependently]] as const).map(([l, v]) => (
              <div key={l} className="rounded-md border border-border p-3">
                <p className="label-caps">{l}</p>
                <RagValue value={v} className="mt-1 text-xl" />
              </div>
            ))}
          </div>
        )}
      </div>

      {children.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="p-3 text-left label-caps">{area ? "School" : "Area"}</th>
                {EYFS_AREAS.map((a) => <th key={a} className="p-2 text-center text-xs font-medium text-muted-foreground">{a}</th>)}
              </tr>
            </thead>
            <tbody>
              {children.map((c) => (
                <tr key={c.id} className="cursor-pointer border-b border-border hover:bg-secondary"
                  onClick={() => (area ? setSchool(c as SchoolNode) : setArea(c as AreaNode))}>
                  <td className="p-3 font-semibold text-primary">{c.name} <ChevronRight className="inline h-3.5 w-3.5" /></td>
                  {EYFS_AREAS.map((a) => <td key={a} className="p-2 text-center"><RagValue value={c.eyfs[a] ?? 0} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <RagLegend />
    </div>
  );
}
