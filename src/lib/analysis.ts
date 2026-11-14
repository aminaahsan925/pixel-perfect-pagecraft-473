import {
  REFERENCE_SHEET,
  TEST_ALIASES,
  TEST_GLOSSARY_IDS,
  URGENT_RULES,
} from "@/data/reference-sheet";
import type {
  AnalyzedResult,
  AppliedRange,
  LabReport,
  PatientContext,
  RawLabResult,
  ReferenceSheetEntry,
  ResultStatus,
  SourceId,
  UrgentRule,
} from "@/data/types";

/**
 * File-based analysis engine.
 * Every decision here comes from the provided documents (normal-range sheet,
 * dangerous-value guidance, glossary). When a document does not cover a case,
 * the result is "unclassified" — we never guess a range or threshold.
 */

export const CANNOT_CLASSIFY = "Cannot be classified from the provided files.";
export const NOT_IN_FILES = "I cannot find this information in the provided files.";

const normalise = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

/** Map a printed test name to its canonical name, handling different names for the same test. */
export function resolveTestName(reportedAs: string): string | null {
  return TEST_ALIASES[normalise(reportedAs)] ?? null;
}

type RangeSelection = { range: AppliedRange } | { range: null; reason: string };

/** Pick the age- and sex-specific row from the normal-range sheet. Age bounds are inclusive. */
export function selectReferenceRange(
  entry: ReferenceSheetEntry,
  patient: Pick<PatientContext, "age" | "sex">,
): RangeSelection {
  const needsSex = entry.options.some((o) => o.sex);
  const needsAge = entry.options.some((o) => o.ageMin !== undefined || o.ageMax !== undefined);

  if (needsSex && !patient.sex) {
    return {
      range: null,
      reason: "The patient's sex is missing, and the normal-range sheet lists different ranges for women and men.",
    };
  }
  if (needsAge && patient.age === null) {
    return {
      range: null,
      reason: "The patient's age is missing, and the normal-range sheet ranges depend on age.",
    };
  }

  const match = entry.options.find((o) => {
    if (o.sex && o.sex !== patient.sex) return false;
    if (patient.age !== null) {
      if (o.ageMin !== undefined && patient.age < o.ageMin) return false;
      if (o.ageMax !== undefined && patient.age > o.ageMax) return false;
    }
    return true;
  });

  if (!match) {
    return {
      range: null,
      reason: "The normal-range sheet has no range for this patient's age and sex.",
    };
  }

  const parts: string[] = [];
  if (match.sex) parts.push(match.sex === "female" ? "Women" : "Men");
  else parts.push("Adults");
  if (match.ageMin !== undefined && match.ageMax !== undefined)
    parts.push(`${match.ageMin}–${match.ageMax} y`);
  else if (match.ageMin !== undefined) parts.push(`${match.ageMin}+ y`);

  return {
    range: {
      low: match.low,
      high: match.high,
      unit: entry.unit,
      population: parts.join(", "),
      sheetRef: match.sheetRef,
    },
  };
}

/** Return the urgent rule a value matches, if any. Only rules with the same unit apply. */
export function findUrgentRule(testName: string, value: number, unit: string): UrgentRule | null {
  const rules = URGENT_RULES[testName] ?? [];
  return (
    rules.find(
      (r) =>
        r.unit === unit &&
        (r.direction === "above" ? value >= r.threshold : value <= r.threshold),
    ) ?? null
  );
}

export function analyzeResult(
  raw: RawLabResult,
  patient: Pick<PatientContext, "age" | "sex">,
  index = 0,
): AnalyzedResult {
  const id = `${index}-${normalise(raw.reportedAs).replace(/[^a-z0-9]+/g, "-")}`;
  const testName = resolveTestName(raw.reportedAs);
  const base = {
    id,
    reportedAs: raw.reportedAs,
    testName,
    glossaryId: testName ? (TEST_GLOSSARY_IDS[testName] ?? null) : null,
    value: raw.value,
    unit: raw.unit,
  };
  const sources: SourceId[] = ["patient-report"];

  const unclassified = (reason: string, range: AppliedRange | null = null): AnalyzedResult => ({
    ...base,
    range,
    status: "unclassified",
    reason,
    urgentRule: null,
    sources: [...sources, "safety-rules"],
  });

  if (!testName) {
    return unclassified("This test name was not recognised in the provided files.");
  }
  if (base.glossaryId) sources.push("medical-glossary");

  const entry = REFERENCE_SHEET[testName];
  if (!entry) {
    return unclassified("The normal-range sheet does not include a range for this test.");
  }
  sources.push("normal-range-sheet");

  if (normalise(entry.unit) !== normalise(raw.unit)) {
    return unclassified(
      `The report uses ${raw.unit}, but the normal-range sheet uses ${entry.unit}. The provided files contain no conversion rule, so the value is not converted.`,
    );
  }

  const selection = selectReferenceRange(entry, patient);
  if (!selection.range) return unclassified(selection.reason);
  const range = selection.range;

  const urgentRule = findUrgentRule(testName, raw.value, raw.unit);
  let status: ResultStatus;
  let reason: string;

  if (urgentRule) {
    sources.push("dangerous-values");
    status = "urgent";
    reason = `${raw.value} ${raw.unit} is ${urgentRule.direction === "above" ? "at or above" : "at or below"} the urgent threshold of ${urgentRule.threshold} ${urgentRule.unit} in the dangerous-value guidance (${urgentRule.ruleRef}).`;
  } else if (raw.value < range.low) {
    status = "low";
    reason = `${raw.value} ${raw.unit} is below the lower limit of ${range.low} ${range.unit}.`;
  } else if (raw.value > range.high) {
    status = "high";
    reason = `${raw.value} ${raw.unit} is above the upper limit of ${range.high} ${range.unit}.`;
  } else {
    status = "normal";
    reason = `${raw.value} ${raw.unit} is within ${range.low}–${range.high} ${range.unit}.`;
  }

  return { ...base, range, status, reason, urgentRule, sources };
}

export function analyzeReport(report: LabReport): AnalyzedResult[] {
  return report.results.map((r, i) => analyzeResult(r, report.patient, i));
}

export type StatusCounts = Record<ResultStatus, number> & { total: number };

export function countStatuses(results: AnalyzedResult[]): StatusCounts {
  const counts: StatusCounts = { total: results.length, normal: 0, low: 0, high: 0, urgent: 0, unclassified: 0 };
  for (const r of results) counts[r.status] += 1;
  return counts;
}

export const STATUS_LABEL: Record<ResultStatus, string> = {
  normal: "Within range",
  low: "Low",
  high: "High",
  urgent: "Urgent",
  unclassified: "Not classified",
};

/** Simple, eighth-grade-level meaning of a result. Never states a cause or diagnosis. */
export function explainMeaning(r: AnalyzedResult): string {
  const name = r.testName ?? r.reportedAs;
  const v = `${r.value} ${r.unit}`;
  switch (r.status) {
    case "normal":
      return `Your ${name} result of ${v} is inside the reference range used here. On its own, this value is in the expected zone.`;
    case "high":
      return `Your ${name} result of ${v} is above the reference range used here. This does not tell us why it is high or establish a diagnosis. Your doctor can explain what it means for you.`;
    case "low":
      return `Your ${name} result of ${v} is below the reference range used here. This does not tell us why it is low or establish a diagnosis. Your doctor can explain what it means for you.`;
    case "urgent":
      return `Your ${name} result of ${v} matches an urgent threshold in the provided safety guidance. This does not say what is causing it. Please contact a healthcare professional promptly.`;
    case "unclassified":
      return `${CANNOT_CLASSIFY} ${r.reason}`;
  }
}
