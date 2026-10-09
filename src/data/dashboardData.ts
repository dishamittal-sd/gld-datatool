/** Synthetic data powering the GLD Baseline EYFS Dashboard. */

export type MetricKey = "CLC" | "TT" | "PSED" | "F" | "PD" | "PreSchool";

export const METRICS: { key: MetricKey; label: string; full: string; target: number }[] = [
  { key: "CLC", label: "CLC", full: "Communication & Language", target: 69 },
  { key: "PSED", label: "PSED", full: "Personal, Social & Emotional Development", target: 69 },
  { key: "PD", label: "PD", full: "Physical Development", target: 69 },
  { key: "PreSchool", label: "Pre-school", full: "Pre-school Attendance", target: 69 },
  { key: "TT", label: "TT", full: "Toilet Trained", target: 69 },
  { key: "F", label: "F", full: "Feeding Independently", target: 69 },
];

export const PRIMARY_WARD = "Gorton";

export type WardName = "Gorton" | "Levenshulme" | "Moss Side" | "Cheetham";

export const WARDS: WardName[] = ["Gorton", "Levenshulme", "Moss Side", "Cheetham"];

export const wardPerformance: Record<WardName, Record<MetricKey, number>> = {
  Gorton: { CLC: 68, TT: 74, PSED: 71, F: 79, PD: 81, PreSchool: 66 },
  Levenshulme: { CLC: 76, TT: 88, PSED: 80, F: 84, PD: 77, PreSchool: 73 },
  "Moss Side": { CLC: 61, TT: 70, PSED: 64, F: 72, PD: 69, PreSchool: 58 },
  Cheetham: { CLC: 82, TT: 86, PSED: 83, F: 88, PD: 79, PreSchool: 84 },
};

/* ---------- Tab 2: demographic breakdown ---------- */

export type BreakdownRow = {
  group: string;
  cll: { LA: number; S: number };
  pse: { SR: number; MS: number; BR: number };
  pd: { GM: number; FM: number };
};

export const breakdown: BreakdownRow[] = [
  { group: "Boy", cll: { LA: 62, S: 59 }, pse: { SR: 66, MS: 64, BR: 61 }, pd: { GM: 84, FM: 70 } },
  { group: "Girl", cll: { LA: 74, S: 72 }, pse: { SR: 79, MS: 77, BR: 75 }, pd: { GM: 81, FM: 83 } },
  { group: "EAL", cll: { LA: 57, S: 54 }, pse: { SR: 68, MS: 66, BR: 67 }, pd: { GM: 82, FM: 74 } },
  { group: "SEND", cll: { LA: 41, S: 38 }, pse: { SR: 47, MS: 44, BR: 43 }, pd: { GM: 63, FM: 52 } },
  { group: "FSM", cll: { LA: 58, S: 55 }, pse: { SR: 64, MS: 62, BR: 61 }, pd: { GM: 74, FM: 66 } },
  { group: "National", cll: { LA: 72, S: 70 }, pse: { SR: 76, MS: 75, BR: 74 }, pd: { GM: 85, FM: 79 } },
];

/* ---------- Tab 3: hierarchy ---------- */

export type EyfsScores = Record<string, number>;

export type SchoolNode = {
  id: string;
  name: string;
  eyfs: EyfsScores;
  kpis: { preSchoolReady: number; toiletTrained: number; feedIndependently: number };
};

export type AreaNode = {
  id: string;
  name: string;
  eyfs: EyfsScores;
  schools: SchoolNode[];
};

export type RegionNode = {
  id: string;
  name: string;
  eyfs: EyfsScores;
  areas: AreaNode[];
};

export const EYFS_AREAS = [
  "Listening & Attention",
  "Speaking",
  "Self-Regulation",
  "Managing Self",
  "Building Relationships",
  "Gross Motor Skills",
  "Fine Motor Skills",
];

export const manchester: RegionNode = {
  id: "manchester",
  name: "Manchester",
  eyfs: {
    "Listening & Attention": 71,
    Speaking: 76,
    "Self-Regulation": 82,
    "Managing Self": 64,
    "Building Relationships": 68,
    "Gross Motor Skills": 73,
    "Fine Motor Skills": 79,
  },
  areas: [
    {
      id: "gorton",
      name: "Gorton",
      eyfs: {
        "Listening & Attention": 66,
        Speaking: 70,
        "Self-Regulation": 81,
        "Managing Self": 57,
        "Building Relationships": 61,
        "Gross Motor Skills": 68,
        "Fine Motor Skills": 75,
      },
      schools: [
        {
          id: "abbey-hey",
          name: "Abbey Hey",
          eyfs: {
            "Listening & Attention": 68,
            Speaking: 73,
            "Self-Regulation": 84,
            "Managing Self": 55,
            "Building Relationships": 60,
            "Gross Motor Skills": 67,
            "Fine Motor Skills": 74,
          },
          kpis: { preSchoolReady: 71, toiletTrained: 79, feedIndependently: 68 },
        },
        {
          id: "all-saints",
          name: "All Saints",
          eyfs: {
            "Listening & Attention": 63,
            Speaking: 67,
            "Self-Regulation": 78,
            "Managing Self": 52,
            "Building Relationships": 57,
            "Gross Motor Skills": 64,
            "Fine Motor Skills": 72,
          },
          kpis: { preSchoolReady: 62, toiletTrained: 71, feedIndependently: 75 },
        },
        {
          id: "gorton-mount",
          name: "Gorton Mount",
          eyfs: {
            "Listening & Attention": 59,
            Speaking: 63,
            "Self-Regulation": 76,
            "Managing Self": 51,
            "Building Relationships": 56,
            "Gross Motor Skills": 62,
            "Fine Motor Skills": 69,
          },
          kpis: { preSchoolReady: 58, toiletTrained: 66, feedIndependently: 77 },
        },
        {
          id: "oasis-aspinal",
          name: "Oasis Aspinal",
          eyfs: {
            "Listening & Attention": 70,
            Speaking: 75,
            "Self-Regulation": 83,
            "Managing Self": 61,
            "Building Relationships": 64,
            "Gross Motor Skills": 71,
            "Fine Motor Skills": 77,
          },
          kpis: { preSchoolReady: 74, toiletTrained: 81, feedIndependently: 69 },
        },
        {
          id: "old-hall-drive",
          name: "Old Hall Drive",
          eyfs: {
            "Listening & Attention": 57,
            Speaking: 61,
            "Self-Regulation": 74,
            "Managing Self": 48,
            "Building Relationships": 53,
            "Gross Motor Skills": 59,
            "Fine Motor Skills": 66,
          },
          kpis: { preSchoolReady: 55, toiletTrained: 64, feedIndependently: 72 },
        },
        {
          id: "rushbrook",
          name: "Rushbrook",
          eyfs: {
            "Listening & Attention": 61,
            Speaking: 65,
            "Self-Regulation": 77,
            "Managing Self": 54,
            "Building Relationships": 58,
            "Gross Motor Skills": 63,
            "Fine Motor Skills": 70,
          },
          kpis: { preSchoolReady: 60, toiletTrained: 68, feedIndependently: 76 },
        },
        {
          id: "sacred-heart",
          name: "Sacred Heart",
          eyfs: {
            "Listening & Attention": 74,
            Speaking: 79,
            "Self-Regulation": 85,
            "Managing Self": 65,
            "Building Relationships": 69,
            "Gross Motor Skills": 73,
            "Fine Motor Skills": 80,
          },
          kpis: { preSchoolReady: 80, toiletTrained: 85, feedIndependently: 74 },
        },
        {
          id: "st-francis",
          name: "St. Francis",
          eyfs: {
            "Listening & Attention": 66,
            Speaking: 71,
            "Self-Regulation": 80,
            "Managing Self": 58,
            "Building Relationships": 62,
            "Gross Motor Skills": 69,
            "Fine Motor Skills": 76,
          },
          kpis: { preSchoolReady: 69, toiletTrained: 76, feedIndependently: 70 },
        },
        {
          id: "st-james",
          name: "St. James’",
          eyfs: {
            "Listening & Attention": 72,
            Speaking: 78,
            "Self-Regulation": 86,
            "Managing Self": 63,
            "Building Relationships": 66,
            "Gross Motor Skills": 74,
            "Fine Motor Skills": 81,
          },
          kpis: { preSchoolReady: 78, toiletTrained: 84, feedIndependently: 71 },
        },
      ],
    },
    {
      id: "levenshulme",
      name: "Levenshulme",
      eyfs: {
        "Listening & Attention": 77,
        Speaking: 82,
        "Self-Regulation": 84,
        "Managing Self": 70,
        "Building Relationships": 74,
        "Gross Motor Skills": 78,
        "Fine Motor Skills": 83,
      },
      schools: [
        {
          id: "chapel-street",
          name: "Chapel Street Primary",
          eyfs: {
            "Listening & Attention": 80,
            Speaking: 85,
            "Self-Regulation": 87,
            "Managing Self": 73,
            "Building Relationships": 76,
            "Gross Motor Skills": 81,
            "Fine Motor Skills": 86,
          },
          kpis: { preSchoolReady: 86, toiletTrained: 90, feedIndependently: 82 },
        },
      ],
    },
  ],
};

/* ---------- Traffic light ---------- */

export type Rag = "green" | "orange" | "red";

export function ragOf(value: number): Rag {
  if (value >= 69) return "green";
  if (value >= 60) return "orange";
  return "red";
}

export const RAG_COLOR: Record<Rag, string> = {
  green: "var(--rag-green)",
  orange: "var(--rag-orange)",
  red: "var(--rag-red)",
};

export const RAG_TEXT_CLASS: Record<Rag, string> = {
  green: "text-rag-green",
  orange: "text-rag-orange",
  red: "text-rag-red",
};

export function ragLabel(value: number): string {
  const r = ragOf(value);
  return r === "green" ? "On Target" : r === "orange" ? "Approaching" : "Below Target";
}
