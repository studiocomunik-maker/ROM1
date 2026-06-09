import { metiers, univers } from "../../../data";

export type SectionMeta = {
  routeId: string; // segment d'URL admin : "metier-identite" | "univers-vin"
  dbId: string; // clé en base : "metier:identite" | "univers:vin"
  group: "Métiers" | "Univers";
  label: string;
  sub: string;
  publicPath: string; // page publique correspondante
  defaultTitle: string;
  defaultIntro: string;
};

export const SECTIONS: SectionMeta[] = [
  ...metiers.map((m) => ({
    routeId: `metier-${m.key}`,
    dbId: `metier:${m.key}`,
    group: "Métiers" as const,
    label: m.t,
    sub: m.sub,
    publicPath: `/metiers/${m.key}`,
    defaultTitle: m.t,
    defaultIntro: m.intro,
  })),
  ...univers.map((u) => ({
    routeId: `univers-${u.key}`,
    dbId: `univers:${u.key}`,
    group: "Univers" as const,
    label: u.t,
    sub: u.sub,
    publicPath: `/univers/${u.key}`,
    defaultTitle: u.t,
    defaultIntro: u.intro,
  })),
];

export const getSection = (routeId: string) => SECTIONS.find((s) => s.routeId === routeId);
