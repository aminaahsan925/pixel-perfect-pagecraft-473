import type { ReferenceSheetEntry, UrgentRule } from "./types";

/**
 * FICTIONAL demonstration data standing in for the "Normal-range sheet" and
 * "Dangerous-value guidance" documents. These are not universal reference ranges
 * and must not be used for medical decisions.
 */

/** Different names a lab may print for the same test → canonical test name. */
export const TEST_ALIASES: Record<string, string> = {
  hemoglobin: "Hemoglobin",
  haemoglobin: "Hemoglobin",
  hb: "Hemoglobin",
  hgb: "Hemoglobin",
  glucose: "Glucose",
  "fasting blood sugar": "Glucose",
  fbs: "Glucose",
  "blood glucose (fasting)": "Glucose",
  creatinine: "Creatinine",
  "serum creatinine": "Creatinine",
  platelets: "Platelets",
  plt: "Platelets",
  "platelet count": "Platelets",
  potassium: "Potassium",
  "potassium (k+)": "Potassium",
  k: "Potassium",
  sodium: "Sodium",
  "sodium (na+)": "Sodium",
  wbc: "White blood cells",
  "white blood cells": "White blood cells",
  "total leukocyte count": "White blood cells",
  "vitamin d, 25-oh": "Vitamin D",
  "vitamin d": "Vitamin D",
  "total cholesterol": "Total cholesterol",
  cholesterol: "Total cholesterol",
  "ldl cholesterol": "LDL cholesterol",
  ldl: "LDL cholesterol",
  "hdl cholesterol": "HDL cholesterol",
  hdl: "HDL cholesterol",
  triglycerides: "Triglycerides",
  tg: "Triglycerides",
  alt: "ALT",
  "alt (sgpt)": "ALT",
  sgpt: "ALT",
  ast: "AST",
  "ast (sgot)": "AST",
  sgot: "AST",
  albumin: "Albumin",
  "bilirubin, total": "Total bilirubin",
  "total bilirubin": "Total bilirubin",
  bun: "Blood urea nitrogen",
  "blood urea nitrogen": "Blood urea nitrogen",
  "uric acid": "Uric acid",
  tsh: "TSH",
};

/** Canonical test name → glossary entry id. */
export const TEST_GLOSSARY_IDS: Record<string, string> = {
  Hemoglobin: "hemoglobin",
  Glucose: "glucose",
  Creatinine: "creatinine",
  Platelets: "platelets",
  Potassium: "potassium",
  Sodium: "sodium",
  "White blood cells": "wbc",
  "Vitamin D": "vitamin-d",
  "Total cholesterol": "cholesterol",
  "LDL cholesterol": "ldl",
  "HDL cholesterol": "hdl",
  Triglycerides: "triglycerides",
  ALT: "alt",
  AST: "ast",
  Albumin: "albumin",
  "Total bilirubin": "bilirubin",
  "Blood urea nitrogen": "bun",
  "Uric acid": "uric-acid",
  TSH: "tsh",
};

/** Normal-range sheet. Tests absent here cannot be classified. */
export const REFERENCE_SHEET: Record<string, ReferenceSheetEntry> = {
  Hemoglobin: {
    unit: "g/dL",
    options: [
      { sex: "female", ageMin: 18, ageMax: 64, low: 12.0, high: 16.0, sheetRef: "Table 1, row 1" },
      { sex: "female", ageMin: 65, low: 11.7, high: 15.5, sheetRef: "Table 1, row 2" },
      { sex: "male", ageMin: 18, ageMax: 64, low: 13.5, high: 17.5, sheetRef: "Table 1, row 3" },
      { sex: "male", ageMin: 65, low: 12.6, high: 17.0, sheetRef: "Table 1, row 4" },
    ],
  },
  Glucose: {
    unit: "mg/dL",
    options: [{ ageMin: 18, low: 70, high: 99, sheetRef: "Table 3, row 1 (fasting)" }],
  },
  Creatinine: {
    unit: "mg/dL",
    options: [
      { sex: "female", ageMin: 18, low: 0.6, high: 1.2, sheetRef: "Table 4, row 1" },
      { sex: "male", ageMin: 18, low: 0.7, high: 1.3, sheetRef: "Table 4, row 2" },
    ],
  },
  Platelets: {
    unit: "×10³/µL",
    options: [{ ageMin: 18, low: 150, high: 400, sheetRef: "Table 1, row 6" }],
  },
  Potassium: {
    unit: "mmol/L",
    options: [{ ageMin: 18, low: 3.5, high: 5.1, sheetRef: "Table 5, row 2" }],
  },
  Sodium: {
    unit: "mmol/L",
    options: [{ ageMin: 18, low: 135, high: 145, sheetRef: "Table 5, row 1" }],
  },
  "White blood cells": {
    unit: "×10³/µL",
    options: [{ ageMin: 18, low: 4.0, high: 11.0, sheetRef: "Table 1, row 5" }],
  },
  "Total cholesterol": {
    unit: "mg/dL",
    options: [{ ageMin: 18, low: 125, high: 199, sheetRef: "Table 6, row 1" }],
  },
  "LDL cholesterol": {
    unit: "mg/dL",
    options: [{ ageMin: 18, low: 0, high: 99, sheetRef: "Table 6, row 2" }],
  },
  "HDL cholesterol": {
    unit: "mg/dL",
    options: [
      { sex: "female", ageMin: 18, low: 50, high: 100, sheetRef: "Table 6, row 3" },
      { sex: "male", ageMin: 18, low: 40, high: 100, sheetRef: "Table 6, row 4" },
    ],
  },
  Triglycerides: {
    unit: "mg/dL",
    options: [{ ageMin: 18, low: 0, high: 149, sheetRef: "Table 6, row 5" }],
  },
  ALT: {
    unit: "U/L",
    options: [
      { sex: "female", ageMin: 18, low: 7, high: 35, sheetRef: "Table 7, row 1" },
      { sex: "male", ageMin: 18, low: 7, high: 45, sheetRef: "Table 7, row 2" },
    ],
  },
  AST: {
    unit: "U/L",
    options: [{ ageMin: 18, low: 10, high: 35, sheetRef: "Table 7, row 3" }],
  },
  Albumin: {
    unit: "g/dL",
    options: [{ ageMin: 18, low: 3.5, high: 5.0, sheetRef: "Table 7, row 4" }],
  },
  "Total bilirubin": {
    unit: "mg/dL",
    options: [{ ageMin: 18, low: 0.1, high: 1.2, sheetRef: "Table 7, row 5" }],
  },
  "Blood urea nitrogen": {
    unit: "mg/dL",
    options: [{ ageMin: 18, low: 7, high: 20, sheetRef: "Table 4, row 3" }],
  },
  "Uric acid": {
    unit: "mg/dL",
    options: [
      { sex: "female", ageMin: 18, low: 2.4, high: 6.0, sheetRef: "Table 4, row 4" },
      { sex: "male", ageMin: 18, low: 3.4, high: 7.0, sheetRef: "Table 4, row 5" },
    ],
  },
  // Vitamin D and TSH are intentionally NOT in this sheet.
};

/** Dangerous-value guidance. Only tests listed here can ever be "urgent". */
export const URGENT_RULES: Record<string, UrgentRule[]> = {
  Potassium: [
    { direction: "above", threshold: 6.5, unit: "mmol/L", ruleRef: "Section 2.1" },
    { direction: "below", threshold: 2.8, unit: "mmol/L", ruleRef: "Section 2.2" },
  ],
  Glucose: [
    { direction: "above", threshold: 400, unit: "mg/dL", ruleRef: "Section 3.1" },
    { direction: "below", threshold: 50, unit: "mg/dL", ruleRef: "Section 3.2" },
  ],
  Sodium: [
    { direction: "above", threshold: 160, unit: "mmol/L", ruleRef: "Section 2.3" },
    { direction: "below", threshold: 120, unit: "mmol/L", ruleRef: "Section 2.4" },
  ],
  Platelets: [{ direction: "below", threshold: 50, unit: "×10³/µL", ruleRef: "Section 4.1" }],
  Hemoglobin: [{ direction: "below", threshold: 7.0, unit: "g/dL", ruleRef: "Section 4.2" }],
};
