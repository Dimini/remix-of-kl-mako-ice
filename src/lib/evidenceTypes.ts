import type { SourceType } from "@/types/domain";

// ---------------------------------------------------------------------------
// Evidence type catalog — single source of truth for the admin form.
// SLOVÁ entries (program / questionnaire / social) have NO fixed point value.
// They feed into a sub-score that the Phase-D scoring engine computes from
// the full set of evidence.
// SKUTKY entries (vote / action) carry a pre-computed point value defined
// here. These mirror the future `evidence_type` table that will live in
// Supabase.
// ---------------------------------------------------------------------------

export type EvidencePillar = "slova" | "skutky";

export interface EvidenceTypeDef {
  key: string;                // stored on EvidenceRecord.evidenceType
  sourceType: SourceType;     // routes to pillar via PILLAR_FOR_SOURCE
  pillar: EvidencePillar;
  label: string;              // Slovak UI label
  description: string;
  points?: number;            // SKUTKY only
}

export const PILLAR_FOR_SOURCE: Record<SourceType, EvidencePillar> = {
  program: "slova",
  questionnaire: "slova",
  social: "slova",
  vote: "skutky",
  action: "skutky",
};

// SLOVÁ — point values are NOT shown; sub-score is computed from the set.
export const SLOVA_TYPES: EvidenceTypeDef[] = [
  {
    key: "program",
    sourceType: "program",
    pillar: "slova",
    label: "Volebný program",
    description: "Pasáž z volebného programu kandidáta s explicitnou klimatickou/environmentálnou väzbou.",
  },
  {
    key: "questionnaire",
    sourceType: "questionnaire",
    pillar: "slova",
    label: "Odpoveď z dotazníka",
    description: "Odpoveď kandidáta v dotazníku #klimatapotrebuje.",
  },
  {
    key: "social_post",
    sourceType: "social",
    pillar: "slova",
    label: "Príspevok na sociálnej sieti",
    description: "Verejný post / vyjadrenie kandidáta. (Phase 2 — voliteľné v MVP.)",
  },
];

// SKUTKY — fixed point values. Range designed so the absolute caps in
// scoring_config (actions: −10..+15, votes: ±n×2) hold.
export const SKUTKY_TYPES: EvidenceTypeDef[] = [
  // Council votes — typically ±2 per vote (caps to ±n×2)
  {
    key: "council_vote_for",
    sourceType: "vote",
    pillar: "skutky",
    label: "Hlasovanie ZA klimatické opatrenie",
    description: "Doložené hlasovanie v zastupiteľstve v prospech klimatického opatrenia.",
    points: 2,
  },
  {
    key: "council_vote_against",
    sourceType: "vote",
    pillar: "skutky",
    label: "Hlasovanie PROTI klimatickému opatreniu",
    description: "Doložené hlasovanie v zastupiteľstve proti klimatickému opatreniu.",
    points: -2,
  },
  {
    key: "council_vote_abstain",
    sourceType: "vote",
    pillar: "skutky",
    label: "Zdržanie sa pri klimatickom hlasovaní",
    description: "Zdržanie sa hlasovania o klimatickom opatrení (počíta sa ako čiastočné mínus).",
    points: -1,
  },
  // Documented actions
  {
    key: "resolution",
    sourceType: "action",
    pillar: "skutky",
    label: "Iniciatíva / uznesenie",
    description: "Predložené uznesenie alebo iniciatíva s preukázateľným environmentálnym dopadom.",
    points: 3,
  },
  {
    key: "implemented_project",
    sourceType: "action",
    pillar: "skutky",
    label: "Realizovaný projekt",
    description: "Dokončený projekt s merateľným environmentálnym prínosom.",
    points: 5,
  },
  {
    key: "public_commitment",
    sourceType: "action",
    pillar: "skutky",
    label: "Verejný záväzok",
    description: "Verejne deklarovaný a dokumentovaný klimatický záväzok.",
    points: 1,
  },
  {
    key: "obstruction",
    sourceType: "action",
    pillar: "skutky",
    label: "Blokovanie / obštrukcia",
    description: "Dokumentované blokovanie klimatického opatrenia mimo hlasovaní.",
    points: -3,
  },
  {
    key: "harmful_project",
    sourceType: "action",
    pillar: "skutky",
    label: "Podpora environmentálne škodlivého projektu",
    description: "Aktívna podpora projektu so zdokumentovaným negatívnym dopadom.",
    points: -5,
  },
];

export const ALL_EVIDENCE_TYPES: EvidenceTypeDef[] = [...SLOVA_TYPES, ...SKUTKY_TYPES];

export function getEvidenceType(key: string): EvidenceTypeDef | undefined {
  return ALL_EVIDENCE_TYPES.find((t) => t.key === key);
}

export const TIER_LABELS: Record<1 | 2 | 3, string> = {
  1: "Tier 1 — Explicitná klimatická väzba",
  2: "Tier 2 — Implicitná väzba (vyžaduje poznámku)",
  3: "Tier 3 — Vylúčené zo skóre",
};

export const TIER_DESCRIPTIONS: Record<1 | 2 | 3, string> = {
  1: "Environmentálna väzba je explicitne uvedená v zdroji (klíma, emisie, životné prostredie, CO2 …). Citácia musí byť doslovná.",
  2: "Väzba je reálna ale v zdroji nie je environmentálne rámcovaná. Recenzent MUSÍ vysvetliť spojenie v poznámke (publikuje sa verejne).",
  3: "Bez kredibilnej environmentálnej väzby. Uložené pre transparentnosť, ale NEVSTUPUJE do skóre.",
};
