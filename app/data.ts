/* Données fixes du site : métiers + univers + libellés.
   Les RÉALISATIONS vivent désormais dans Supabase (voir utils/realisations.ts). */

export const SITE_URL = "https://rom1.fr";

export const EXPS: Record<string, string> = {
  identite: "Identité",
  print: "Print",
  photo: "Photo / Vidéo",
  web: "Webdesign",
  motion: "Motion",
};

export const UNIVERS: Record<string, string> = {
  vin: "Vin",
  sceno: "Scénographie",
  corporate: "Corporate",
  hotel: "Hôtellerie & Tables",
  art: "Culture & Art",
};

export type Metier = {
  key: string; // sert aussi de slug d'URL (/metiers/<key>) et matche realisation.exps
  t: string;
  sub: string;
  intro: string;
  off: string;
  featured?: boolean;
};

export const metiers: Metier[] = [
  {
    key: "identite",
    t: "Identité graphique",
    sub: "Logo, charte, branding",
    intro:
      "Un logo n'est pas un dessin, c'est une décision. Je construis des identités qui tiennent dans le temps : signe, système typographique, palette, règles d'usage — de la première intuition à la charte livrée.",
    off: "12%",
  },
  {
    key: "print",
    t: "Print éditions",
    sub: "Édition, packaging, étiquettes",
    intro:
      "Le papier reste le terrain le plus exigeant : aucune retouche après impression. Édition, packaging, étiquettes — je dessine pour la matière, le pli, le vernis et le geste de la main.",
    off: "26%",
  },
  {
    key: "photo",
    t: "Photo / Vidéo",
    sub: "Image, film, drone",
    intro:
      "L'image avant le discours. Reportage, nature morte, film de marque, captation par drone : je fabrique des images qui racontent un lieu, un produit, un moment — pas des cartes postales.",
    off: "17%",
  },
  {
    key: "web",
    t: "Webdesign",
    sub: "Sites sur-mesure → pixelstore.fr",
    intro:
      "Un site n'est pas une plaquette en ligne. La fabrication technique vit chez pixelstore.fr ; ici, c'est la direction artistique : le rythme, les intentions, l'image. Le pont entre les deux, c'est moi.",
    off: "34%",
  },
  {
    key: "motion",
    t: "Motion design",
    sub: "Animation, écrans de scène",
    intro:
      "Faire bouger une marque sans la trahir. Habillages, écrans de scène, génériques : le motion donne le tempo. Une grammaire visuelle qui s'anime, du teaser à l'écran géant.",
    off: "21%",
  },
];

export type Univers = {
  key: string; // sert aussi de slug d'URL (/univers/<key>) et matche realisation.univers
  t: string;
  sub: string;
  intro: string;
  off: string;
  featured?: boolean;
};

export const univers: Univers[] = [
  {
    key: "vin",
    t: "Univers du vin",
    sub: "Domaines, vignerons, étiquettes",
    intro:
      "Graphiste installé au cœur du Beaujolais, je travaille pour les domaines et les vignerons : étiquettes, identité de cave, packaging, photo et site web. Une vigne se raconte autant dans le verre que sur la bouteille — c'est cette image-là que je fabrique.",
    featured: true,
    off: "20%",
  },
  {
    key: "sceno",
    t: "Scénographie",
    sub: "Concerts, écrans — Blackmoon",
    intro:
      "Du concert à l'écran géant : scénographie, habillage visuel et contenus de scène. Une grammaire visuelle pensée pour le live, du teaser au mapping.",
    off: "12%",
  },
  {
    key: "art",
    t: "Culture & Art",
    sub: "Artistes, galeries, expositions",
    intro:
      "Artistes, galeries, expositions : identité, édition et signalétique au service de l'œuvre. Une direction artistique qui sert le propos sans le parasiter.",
    off: "30%",
  },
  {
    key: "corporate",
    t: "Corporate",
    sub: "Industrie, robotisation, B2B",
    intro:
      "Industrie, robotisation, B2B : rendre lisible et désirable un savoir-faire technique. Identité, image et web pour des entreprises qui ont des choses sérieuses à montrer.",
    off: "16%",
  },
  {
    key: "hotel",
    t: "Hôtellerie & Tables",
    sub: "Hôtels, restaurants, lieux",
    intro:
      "Hôtels, restaurants, lieux de réception : une identité qui se vit avant même d'avoir passé la porte. De la carte au site, l'expérience commence par l'image.",
    off: "24%",
  },
];

export const getMetier = (key: string) => metiers.find((m) => m.key === key);
export const getUnivers = (key: string) => univers.find((u) => u.key === key);
