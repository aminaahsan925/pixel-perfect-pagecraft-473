import { useEffect, useMemo, useState } from "react";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { FileQuestion, Info } from "lucide-react";
import { getDemoReport } from "@/data/demo-reports";
import { analyzeReport, countStatuses, CANNOT_CLASSIFY } from "@/lib/analysis";
import { buildDoctorQuestions } from "@/lib/questions";
import { downloadReportSummary } from "@/lib/report-download";
import { useSettings } from "@/lib/settings";
import { ReportHeader } from "@/components/report/ReportHeader";
import { ReportSummary } from "@/components/report/ReportSummary";
import { UrgentAlert } from "@/components/report/UrgentAlert";
import { TestResultItem } from "@/components/report/TestResultItem";
import { DoctorQuestions } from "@/components/report/DoctorQuestions";
import { SourceDocuments } from "@/components/report/SourceDocuments";
import { cn } from "@/lib/utils";
import type { AnalyzedResult } from "@/data/types";

export const Route = createFileRoute("/reports/$reportId")({
  loader: ({ params }) => {
    const report = getDemoReport(params.reportId);
    if (!report) throw notFound();
    return { report };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.report.name} — LabSense AI` : "Report unavailable — LabSense AI";
    const description = "Each lab result explained in plain language, with its reference range, source and questions for your doctor.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
        ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  notFoundComponent: ReportNotFound,
  component: ReportAnalysis,
});

function ReportNotFound() {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <FileQuestion className="mx-auto h-10 w-10 text-primary" strokeWidth={1.5} />
      <h2 className="mt-4 font-display text-2xl font-semibold">Report not available</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        This report doesn't exist or doesn't belong to the current patient context.
      </p>
      <Link to="/reports" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">
        Back to My Reports
      </Link>
    </div>
  );
}

const FILTERS = [
  { id: "all", label: "All", match: () => true },
  { id: "attention", label: "Needs attention", match: (r: AnalyzedResult) => ["urgent", "high", "low"].includes(r.status) },
  { id: "normal", label: "Within range", match: (r: AnalyzedResult) => r.status === "normal" },
  { id: "unclassified", label: "Not classified", match: (r: AnalyzedResult) => r.status === "unclassified" },
] as const;

function ReportAnalysis() {
  const { report } = Route.useLoaderData();
  const { settings } = useSettings();
  const results = useMemo(() => analyzeReport(report), [report]);
  const counts = useMemo(() => countStatuses(results), [results]);
  const questions = useMemo(() => buildDoctorQuestions(results), [results]);
  const urgent = results.filter((r) => r.status === "urgent");

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  useEffect(() => {
    setExpanded(
      settings.expandFlaggedByDefault
        ? new Set(results.filter((r) => ["urgent", "high", "low"].includes(r.status)).map((r) => r.id))
        : new Set(),
    );
  }, [settings.expandFlaggedByDefault, results]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const review = (id: string) => {
    setFilter("all");
    setExpanded((prev) => new Set(prev).add(id));
    window.setTimeout(() => document.getElementById(`result-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const active = FILTERS.find((f) => f.id === filter)!;
  const visible = results.filter(active.match);

  return (
    <div className="mx-auto max-w-[1280px] space-y-8">
      <ReportHeader report={report} onDownload={() => downloadReportSummary(report, results, questions)} />

      {urgent.map((r) => (
        <UrgentAlert key={r.id} result={r} onReview={() => review(r.id)} />
      ))}

      <ReportSummary counts={counts} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-semibold">Individual results</h3>
              <p className="mt-1 text-sm text-muted-foreground">Fictional demonstration values. Select a test to see its explanation.</p>
            </div>
            <div className="flex flex-wrap gap-1 rounded-full border bg-card p-1" role="tablist" aria-label="Filter results">
              {FILTERS.map((f) => {
                const n = results.filter(f.match).length;
                return (
                  <button
                    key={f.id}
                    role="tab"
                    aria-selected={filter === f.id}
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                      filter === f.id ? "bg-navy text-navy-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {f.label} <span className="num opacity-70">{n}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border shadow-soft">
            <div className="hidden grid-cols-[1.6fr_1fr_1.2fr_auto_auto] gap-x-4 border-b bg-muted/70 px-6 py-2.5 text-xs font-semibold text-muted-foreground md:grid">
              <span>Test</span>
              <span>Your value</span>
              <span>Reference range</span>
              <span>Classification</span>
              <span className="w-4" />
            </div>
            <div className="divide-y">
              {visible.map((r) => (
                <TestResultItem key={r.id} result={r} open={expanded.has(r.id)} onToggle={() => toggle(r.id)} />
              ))}
              {visible.length === 0 && (
                <p className="bg-card px-6 py-10 text-center text-sm text-muted-foreground">No results in this group.</p>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <SourceDocuments results={results} />
          <div className="rounded-2xl border border-dashed bg-card/60 p-5 text-xs leading-relaxed text-muted-foreground">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Info className="h-4 w-4 text-primary" /> When files don't cover it
            </p>
            <p className="mt-2">
              Results show <span className="font-semibold text-foreground">“{CANNOT_CLASSIFY}”</span> when a range is missing, the unit
              differs, or age or sex is needed but not stated. Nothing is guessed.
            </p>
          </div>
        </aside>
      </div>

      <DoctorQuestions questions={questions} />
    </div>
  );
}
