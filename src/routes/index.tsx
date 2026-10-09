import { createFileRoute } from "@tanstack/react-router";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WardOverview } from "@/components/dashboard/WardOverview";
import { GlanceBreakdown } from "@/components/dashboard/GlanceBreakdown";
import { EyfsPerformance } from "@/components/dashboard/EyfsPerformance";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Baseline Early Years Foundation Stage Data | Gorton Ward Insights" },
      {
        name: "description",
        content:
          "Interactive baseline EYFS dashboard comparing Gorton ward outcomes, demographic characteristics and school-level performance against bespoke targets.",
      },
      { property: "og:title", content: "Baseline Early Years Foundation Stage Data" },
      {
        property: "og:description",
        content:
          "Ward comparisons, demographic characteristics and school drill-down for Early Years baseline performance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TABS = [
  { value: "ward", label: "Ward view" },
  { value: "glance", label: "Characteristics view" },
  { value: "eyfs", label: "Schools view" },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface text-surface-foreground">
        <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 sm:py-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-surface-foreground/55">
            Manchester locality reporting
          </p>
          <h1 className="mt-1.5 text-[1.375rem] font-bold leading-tight sm:text-3xl">
            Baseline Early Years Foundation Stage Data
          </h1>
          <p className="mt-1 text-sm text-surface-foreground/65">
            Early Years good level of development · baseline cycle
          </p>
        </div>
      </header>

      <Tabs defaultValue="ward">
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
            <TabsList className="h-auto w-full justify-start gap-6 overflow-x-auto rounded-none bg-transparent p-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {TABS.map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="shrink-0 rounded-none border-b-2 border-transparent bg-transparent px-0 py-3 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        <main className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 sm:py-7">
          <TabsContent value="ward" className="mt-0">
            <WardOverview />
          </TabsContent>
          <TabsContent value="glance" className="mt-0">
            <GlanceBreakdown />
          </TabsContent>
          <TabsContent value="eyfs" className="mt-0">
            <EyfsPerformance />
          </TabsContent>
        </main>
      </Tabs>
    </div>
  );
}
