import type { SourceDocument, SourceId } from "./types";

/** Fictional demonstration documents. Not real clinical guidance. */
export const SOURCE_DOCUMENTS: Record<SourceId, SourceDocument> = {
  "patient-report": {
    id: "patient-report",
    title: "Patient laboratory report",
    description: "The uploaded report: test names, values and units as printed.",
    version: "Uploaded file",
  },
  "normal-range-sheet": {
    id: "normal-range-sheet",
    title: "Normal-range sheet",
    description: "Age- and sex-specific reference ranges used to compare each value.",
    version: "Demo v1.2",
  },
  "medical-glossary": {
    id: "medical-glossary",
    title: "Medical glossary",
    description: "Plain-language descriptions of what each test measures.",
    version: "Demo v1.0",
  },
  "dangerous-values": {
    id: "dangerous-values",
    title: "Dangerous-value guidance",
    description: "Thresholds at which a result must be flagged as urgent.",
    version: "Demo v0.9",
  },
  "safety-rules": {
    id: "safety-rules",
    title: "Laboratory safety rules",
    description: "How to handle missing ranges, unit mismatches and missing patient details.",
    version: "Demo v1.0",
  },
};

export const SOURCE_ORDER: SourceId[] = [
  "patient-report",
  "normal-range-sheet",
  "medical-glossary",
  "dangerous-values",
  "safety-rules",
];
