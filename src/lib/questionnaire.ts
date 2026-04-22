// ---------------------------------------------------------------------------
// Questionnaire Definitions
// This file serves as the single source of truth for all questionnaire questions,
// including their scoring caps (maxPoints, minPoints) used in normalization.
// ---------------------------------------------------------------------------

export interface QuestionnaireQuestion {
  id: string;
  label: string;
  hint?: string;
  type: "scale" | "open";
  maxPoints: number;
  minPoints: number;
}

export const QUESTIONNAIRE_QUESTIONS: QuestionnaireQuestion[] = [
  // Scale questions: Answered 1-5. 
  // 4 or 5 = +1 point
  // 1 or 2 = -1 point
  // 3 = 0 points
  {
    id: "q1_climate_priority",
    label: "Klíma a životné prostredie patria medzi top 3 priority môjho programu pre kraj/mesto.",
    type: "scale",
    maxPoints: 1,
    minPoints: -1,
  },
  {
    id: "q2_emission_target",
    label: "Podporím prijatie merateľného cieľa zníženia emisií skleníkových plynov pre kraj/mesto do roku 2030.",
    hint: "Napr. klimatický plán so záväznými míľnikmi.",
    type: "scale",
    maxPoints: 1,
    minPoints: -1,
  },
  {
    id: "q3_public_transport",
    label: "Presadím rozšírenie a zatraktívnenie verejnej dopravy ako alternatívy k individuálnej automobilovej doprave.",
    type: "scale",
    maxPoints: 1,
    minPoints: -1,
  },
  {
    id: "q4_renewables",
    label: "Aktívne podporím rozvoj obnoviteľných zdrojov energie (slnko, vietor, geotermál) na území kraja/mesta.",
    type: "scale",
    maxPoints: 1,
    minPoints: -1,
  },
  {
    id: "q5_building_renovation",
    label: "Vyhradím prostriedky na hĺbkovú obnovu verejných budov so zameraním na energetickú efektívnosť.",
    type: "scale",
    maxPoints: 1,
    minPoints: -1,
  },
  {
    id: "q6_green_infrastructure",
    label: "Budem zvyšovať podiel zelene a vodozádržných prvkov v zastavanom území (parky, stromoradia, dažďové záhrady).",
    type: "scale",
    maxPoints: 1,
    minPoints: -1,
  },
  {
    id: "q7_waste",
    label: "Podporím opatrenia na výrazné zvýšenie miery triedenia a recyklácie odpadu.",
    type: "scale",
    maxPoints: 1,
    minPoints: -1,
  },
  {
    id: "q8_just_transition",
    label: "Súhlasím, že klimatické opatrenia musia byť spravodlivé voči nízkopríjmovým domácnostiam.",
    type: "scale",
    maxPoints: 1,
    minPoints: -1,
  },
  {
    id: "q9_adaptation",
    label: "Považujem prípravu kraja/mesta na dopady klimatickej zmeny (horúčavy, sucho, povodne) za naliehavú úlohu.",
    type: "scale",
    maxPoints: 1,
    minPoints: -1,
  },
  {
    id: "q10_transparency",
    label: "Zaviažem sa zverejňovať pokrok v plnení klimatických cieľov minimálne raz ročne.",
    type: "scale",
    maxPoints: 1,
    minPoints: -1,
  },

  // Open-text questions: Assessed by AI agent.
  {
    id: "priorityActions",
    label: "Tri konkrétne klimatické/environmentálne opatrenia, ktoré presadíte v prvom roku v úrade",
    type: "open",
    maxPoints: 6, // E.g., 3 actions, up to 2 specific points per action.
    minPoints: -3,
  },
  {
    id: "additionalNotes",
    label: "Doplňujúci komentár (nepovinné)",
    type: "open",
    maxPoints: 5,
    minPoints: -2,
  },
];
