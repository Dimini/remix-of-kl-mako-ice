import type { Kraj } from "@/types/domain";

export const KRAJS: Kraj[] = [
  { id: "BA", name: "Bratislavský kraj", capital: "Bratislava" },
  { id: "TT", name: "Trnavský kraj", capital: "Trnava" },
  { id: "TN", name: "Trenčiansky kraj", capital: "Trenčín" },
  { id: "NR", name: "Nitriansky kraj", capital: "Nitra" },
  { id: "ZA", name: "Žilinský kraj", capital: "Žilina" },
  { id: "BB", name: "Banskobystrický kraj", capital: "Banská Bystrica" },
  { id: "PO", name: "Prešovský kraj", capital: "Prešov" },
  { id: "KE", name: "Košický kraj", capital: "Košice" },
];

export const getKraj = (id: string): Kraj | undefined =>
  KRAJS.find((k) => k.id === id.toUpperCase());
