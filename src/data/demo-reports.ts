import type { LabReport } from "./types";

/**
 * FICTIONAL demonstration reports for one fictional patient.
 * Values, ranges and identifiers are invented and are not medical advice.
 * Replace this module with API data when a backend is connected.
 */

export const DEMO_PATIENT_ID = "DEMO-4821";

export const DEMO_REPORTS: LabReport[] = [
  {
    id: "cbc-metabolic-2026-11",
    name: "Complete Blood Count & Metabolic Panel",
    labName: "Northbridge Diagnostics (demo)",
    collectedOn: "2026-11-10",
    uploadedOn: "2026-11-12",
    patient: { id: DEMO_PATIENT_ID, age: 34, sex: "female" },
    status: "complete",
    results: [
      { reportedAs: "Hb", value: 13.2, unit: "g/dL" },
      { reportedAs: "Fasting Blood Sugar", value: 145, unit: "mg/dL" },
      { reportedAs: "Serum Creatinine", value: 0.8, unit: "mg/dL" },
      { reportedAs: "Potassium (K+)", value: 6.8, unit: "mmol/L" },
      { reportedAs: "PLT", value: 142, unit: "×10³/µL" },
      { reportedAs: "WBC", value: 7.1, unit: "×10³/µL" },
      { reportedAs: "Vitamin D, 25-OH", value: 18, unit: "ng/mL" },
    ],
  },
  {
    id: "lipid-2026-10",
    name: "Lipid Profile",
    labName: "Northbridge Diagnostics (demo)",
    collectedOn: "2026-10-02",
    uploadedOn: "2026-10-03",
    patient: { id: DEMO_PATIENT_ID, age: 34, sex: "female" },
    status: "complete",
    results: [
      { reportedAs: "Total Cholesterol", value: 5.6, unit: "mmol/L" },
      { reportedAs: "LDL Cholesterol", value: 128, unit: "mg/dL" },
      { reportedAs: "HDL Cholesterol", value: 52, unit: "mg/dL" },
      { reportedAs: "Triglycerides", value: 140, unit: "mg/dL" },
    ],
  },
  {
    id: "lft-2026-08",
    name: "Liver Function Test",
    labName: "Riverside Clinical Lab (demo)",
    collectedOn: "2026-08-19",
    uploadedOn: "2026-08-20",
    patient: { id: DEMO_PATIENT_ID, age: 34, sex: "female" },
    status: "complete",
    results: [
      { reportedAs: "ALT (SGPT)", value: 52, unit: "U/L" },
      { reportedAs: "AST (SGOT)", value: 28, unit: "U/L" },
      { reportedAs: "Albumin", value: 4.2, unit: "g/dL" },
      { reportedAs: "Bilirubin, Total", value: 0.9, unit: "mg/dL" },
    ],
  },
  {
    id: "kft-2026-06",
    name: "Kidney Function Test",
    labName: "Riverside Clinical Lab (demo)",
    collectedOn: "2026-06-05",
    uploadedOn: "2026-06-06",
    // This demo report does not print the patient's sex.
    patient: { id: DEMO_PATIENT_ID, age: 34, sex: null },
    status: "complete",
    results: [
      { reportedAs: "Creatinine", value: 0.9, unit: "mg/dL" },
      { reportedAs: "BUN", value: 14, unit: "mg/dL" },
      { reportedAs: "Sodium (Na+)", value: 139, unit: "mmol/L" },
      { reportedAs: "Potassium", value: 4.2, unit: "mmol/L" },
      { reportedAs: "Uric Acid", value: 6.4, unit: "mg/dL" },
    ],
  },
];

export function getDemoReport(id: string): LabReport | undefined {
  // Patient-context guard: only reports belonging to the active patient are returned.
  return DEMO_REPORTS.find((r) => r.id === id && r.patient.id === DEMO_PATIENT_ID);
}

export const SAMPLE_REPORT_ID = "cbc-metabolic-2026-11";
