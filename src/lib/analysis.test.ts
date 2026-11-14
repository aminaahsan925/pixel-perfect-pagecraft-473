import { describe, expect, it } from "vitest";
import { analyzeReport, analyzeResult, resolveTestName } from "./analysis";
import { buildDoctorQuestions } from "./questions";
import { DEMO_REPORTS, getDemoReport } from "@/data/demo-reports";

const adultFemale = { age: 34, sex: "female" as const };

describe("result classification", () => {
  it("marks glucose 145 mg/dL as high against 70–99 mg/dL", () => {
    const r = analyzeResult({ reportedAs: "Glucose", value: 145, unit: "mg/dL" }, adultFemale);
    expect(r.status).toBe("high");
    expect(r.range).toMatchObject({ low: 70, high: 99 });
  });

  it("treats the upper boundary value as within range", () => {
    const r = analyzeResult({ reportedAs: "Glucose", value: 99, unit: "mg/dL" }, adultFemale);
    expect(r.status).toBe("normal");
  });

  it("marks hemoglobin 13.2 g/dL as normal for an adult woman (12.0–16.0)", () => {
    const r = analyzeResult({ reportedAs: "Hb", value: 13.2, unit: "g/dL" }, adultFemale);
    expect(r.testName).toBe("Hemoglobin");
    expect(r.status).toBe("normal");
  });

  it("flags potassium 6.8 mmol/L as urgent using the ≥ 6.5 rule", () => {
    const r = analyzeResult({ reportedAs: "Potassium", value: 6.8, unit: "mmol/L" }, adultFemale);
    expect(r.status).toBe("urgent");
    expect(r.urgentRule?.threshold).toBe(6.5);
  });

  it("never invents an urgent threshold for tests without one", () => {
    const r = analyzeResult({ reportedAs: "ALT", value: 900, unit: "U/L" }, adultFemale);
    expect(r.status).toBe("high");
    expect(r.urgentRule).toBeNull();
  });

  it("does not classify when the unit differs from the sheet", () => {
    const r = analyzeResult({ reportedAs: "Total Cholesterol", value: 5.6, unit: "mmol/L" }, adultFemale);
    expect(r.status).toBe("unclassified");
    expect(r.range).toBeNull();
  });

  it("does not classify a test missing from the normal-range sheet", () => {
    const r = analyzeResult({ reportedAs: "Vitamin D", value: 18, unit: "ng/mL" }, adultFemale);
    expect(r.status).toBe("unclassified");
  });

  it("does not pick a sex-specific range when sex is missing", () => {
    const r = analyzeResult({ reportedAs: "Creatinine", value: 0.9, unit: "mg/dL" }, { age: 34, sex: null });
    expect(r.status).toBe("unclassified");
  });

  it("does not pick an age-dependent range when age is missing", () => {
    const r = analyzeResult({ reportedAs: "Glucose", value: 90, unit: "mg/dL" }, { age: null, sex: "female" });
    expect(r.status).toBe("unclassified");
  });

  it("switches hemoglobin to the 65+ range at exactly age 65", () => {
    const r = analyzeResult({ reportedAs: "Hemoglobin", value: 11.8, unit: "g/dL" }, { age: 65, sex: "female" });
    expect(r.range).toMatchObject({ low: 11.7, high: 15.5 });
    expect(r.status).toBe("normal");
  });

  it("resolves different names for the same test", () => {
    expect(resolveTestName("FBS")).toBe("Glucose");
    expect(resolveTestName("  ALT (SGPT) ")).toBe("ALT");
    expect(resolveTestName("Unknown marker")).toBeNull();
  });
});

describe("patient context", () => {
  it("only returns reports that belong to the active demo patient", () => {
    expect(getDemoReport(DEMO_REPORTS[0].id)).toBeDefined();
    expect(getDemoReport("someone-elses-report")).toBeUndefined();
  });
});

describe("doctor questions", () => {
  it("puts urgent results first and returns at most 5 questions", () => {
    const qs = buildDoctorQuestions(analyzeReport(DEMO_REPORTS[0]));
    expect(qs.length).toBeLessThanOrEqual(5);
    expect(qs[0]).toContain("Potassium");
    expect(qs[0]).toContain("urgent");
  });
});
