import { metiers, univers } from "../../../data";

export type SectionMeta = {
  routeId: string; // segment d'URL admin : "metier-identite" | "univers-vin"
  dbId: string; // clé en base : "metier:identite" | "univers:vin"
  group: "Pages" | "Métiers" | "Univers";
  label: string;
  sub: string;
  publicPath: string; // page publique correspondante
  defaultTitle: string;
  defaultIntro: string;
};

export const SECTIONS: SectionMeta[] = [
  // Hero des PAGES principales (réutilisent la table section_heroes, id "page:<slug>")
  {
    routeId: "page-savoir-faire",
    dbId: "page:savoir-faire",
    group: "Pages",
    label: "Savoir-faire",
    sub: "Page savoir-faire",
    publicPath: "/savoir-faire",
    defaultTitle: "Cinq métiers, un seul œil",
    defaultIntro:
      "Identité, print, photo, web, motion : cinq métiers que je fais dialoguer d'un même œil. Une direction à 360° — un global design où tout, du logo à l'écran, raconte la même histoire. Pour le vin d'abord, et partout où une marque cherche son image.",
  },
  {
    routeId: "page-a-propos",
    dbId: "page:a-propos",
    group: "Pages",
    label: "À propos",
    sub: "Page à propos",
    publicPath: "/a-propos",
    defaultTitle: "Geek & artiste",
    defaultIntro:
      "Le dessin reçu en héritage, la technologie attrapée par passion — 20 ans que les deux se tressent pour fabriquer des images.",
  },
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
