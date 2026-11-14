import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2, FileText } from "lucide-react";
import type { LabReport } from "@/data/types";
import { analyzeReport, countStatuses } from "@/lib/analysis";
import { formatDate } from "@/lib/format";
import { STATUS_DOT } from "@/components/report/StatusBadge";

export function ReportRow({ report }: { report: LabReport }) {
  const counts = countStatuses(analyzeReport(report));
  const flagged = counts.low + counts.high + counts.urgent;
  return (
    <Link
      to="/reports/$reportId"
      params={{ reportId: report.id }}
      className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-4 transition-colors hover:bg-icy sm:grid-cols-[auto_2fr_1fr_1fr_1.2fr_auto] sm:px-6"
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary">
        <FileText className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-semibold">{report.name}</span>
        <span className="block truncate text-xs text-muted-foreground sm:hidden">
          {formatDate(report.uploadedOn)} · {counts.total} tests
        </span>
        <span className="hidden truncate text-xs text-muted-foreground sm:block">{report.labName}</span>
      </span>
      <span className="hidden text-sm text-muted-foreground num sm:block">{formatDate(report.uploadedOn)}</span>
      <span className="hidden text-sm num sm:block">{counts.total} tests</span>
      <span className="hidden items-center gap-2 text-sm sm:flex">
        <CheckCircle2 className="h-4 w-4 text-normal-ink" />
        <span>Analyzed</span>
        <span className="flex gap-0.5" aria-label={`${flagged} flagged`}>
          {analyzeReport(report).map((r) => (
            <span key={r.id} className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[r.status]}`} />
          ))}
        </span>
      </span>
      <span className="inline-flex items-center gap-1 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold text-primary transition-all group-hover:border-primary/40 group-hover:shadow-soft">
        View Report <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

export function ReportList({ reports }: { reports: LabReport[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
      <div className="hidden grid-cols-[auto_2fr_1fr_1fr_1.2fr_auto] gap-4 border-b bg-muted/60 px-6 py-2.5 text-xs font-semibold text-muted-foreground sm:grid">
        <span className="w-10" />
        <span>Report</span>
        <span>Uploaded</span>
        <span>Tests</span>
        <span>Status</span>
        <span className="w-[104px]" />
      </div>
      <div className="divide-y">
        {reports.map((r) => (
          <ReportRow key={r.id} report={r} />
        ))}
      </div>
    </div>
  );
}

export function RecentReports({ reports }: { reports: LabReport[] }) {
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold">Recent reports</h3>
          <p className="mt-1 text-sm text-muted-foreground">Fictional demo data for a fictional patient.</p>
        </div>
        <Link to="/reports" className="text-sm font-semibold text-primary hover:underline">
          All reports
        </Link>
      </div>
      <ReportList reports={reports} />
    </section>
  );
}
