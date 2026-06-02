/* Source unique de vérité : métiers + réalisations.
   Consommé par les composants d'accueil (Expertises, Portfolio) ET les pages
   internes /metiers/[slug] et /realisations/[slug]. Aucun hook ici (module serveur-safe). */

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
  key: string; // sert aussi de slug d'URL (/metiers/<key>) et matche projet.exps
  t: string; // titre
  sub: string; // accroche courte
  intro: string; // paragraphe d'explication (hero de la page métier)
  off: string; // décalage horizontal sur la liste d'accueil
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
  key: string;
  t: string;
  sub: string;
  off: string;
  featured?: boolean;
};

export const univers: Univers[] = [
  { key: "vin", t: "Univers du vin", sub: "Domaines, vignerons, étiquettes", featured: true, off: "20%" },
  { key: "sceno", t: "Scénographie", sub: "Concerts, écrans — Blackmoon", off: "12%" },
  { key: "art", t: "Culture & Art", sub: "Artistes, galeries, expositions", off: "30%" },
  { key: "corporate", t: "Corporate", sub: "Industrie, robotisation, B2B", off: "16%" },
  { key: "hotel", t: "Hôtellerie & Tables", sub: "Hôtels, restaurants, lieux", off: "24%" },
];

const G = (a: string, b: string) => `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;

export type Projet = {
  slug: string;
  t: string;
  univers: string;
  exps: string[];
  year: string;
  desc: string; // accroche courte (vignette)
  intro?: string; // texte long (page réalisation)
  client?: string;
  img?: string;
  bg?: string;
  gallery?: string[]; // visuels de la colonne qui scrolle (sinon dérivés du bg)
};

export const projets: Projet[] = [
  {
    slug: "domaine-biodynamie",
    t: "Domaine en biodynamie",
    univers: "vin",
    exps: ["identite", "photo", "web"],
    year: "2025",
    desc: "Identité, série photo et site pour un domaine du Beaujolais.",
    intro:
      "Un domaine converti à la biodynamie qui voulait une image à la hauteur de sa rigueur. Refonte complète : marque, étiquettes, reportage photo de nuit dans les vignes et site vitrine. Le fil conducteur : la lumière qui sort des bouteilles.",
    client: "Domaine confidentiel · Beaujolais",
    img: "/medias/01-vigne/bouteilles.jpg",
  },
  {
    slug: "blackmoon-live-arena",
    t: "Blackmoon — Live Aréna",
    univers: "sceno",
    exps: ["motion"],
    year: "2025",
    desc: "Motion design des écrans de scène, tournée arénas.",
    intro:
      "Habillage motion des écrans géants pour la tournée arénas de Blackmoon. Contenus pensés pour la lumière, le rythme du set et la distance du public. Des visuels qui tiennent à 60 mètres comme en gros plan caméra.",
    client: "Blackmoon · Tournée 2025",
    img: "/medias/02-scene/concert.jpg",
  },
  {
    slug: "chateau-le-devay",
    t: "Château Le Devay",
    univers: "vin",
    exps: ["web", "photo"],
    year: "2024",
    desc: "Refonte du site et reportage photo du domaine.",
    intro:
      "Refonte du site et reportage photo d'un château viticole du Rhône Nord. Mise en valeur du lieu, des cuvées et du travail de cave, avec une direction artistique sobre qui laisse parler les images.",
    client: "Château Le Devay",
    bg: G("#2a2620", "#4a3f2e"),
  },
  {
    slug: "festival-des-lumieres",
    t: "Festival des Lumières",
    univers: "sceno",
    exps: ["motion", "identite"],
    year: "2024",
    desc: "Identité et habillage motion de l'événement.",
    intro:
      "Identité visuelle et habillage motion d'un festival lumière. Un système graphique qui vit aussi bien sur l'affiche que projeté sur les façades : typographie, signalétique, génériques et boucles d'ambiance.",
    client: "Festival des Lumières",
    bg: G("#241630", "#5a2a6b"),
  },
  {
    slug: "guignard-robotisation",
    t: "Guignard Robotisation",
    univers: "corporate",
    exps: ["identite", "web", "photo"],
    year: "2025",
    desc: "Image de marque industrielle, site et photographie.",
    intro:
      "Image de marque pour un intégrateur en robotisation industrielle (médical / pharma). Identité, photographie des cellules robotisées et site complet. Rendre désirable un univers technique, sans trahir son exigence.",
    client: "Guignard Robotisation",
    bg: G("#16222e", "#234a63"),
  },
  {
    slug: "imprimerie-regionale",
    t: "Imprimerie Régionale",
    univers: "corporate",
    exps: ["print", "identite"],
    year: "2023",
    desc: "Refonte d'identité et déclinaisons print.",
    intro:
      "Refonte d'identité pour une imprimerie régionale et toutes ses déclinaisons print. Un système conçu comme une démonstration de savoir-faire : papiers, encres, finitions et repérages comme arguments de marque.",
    client: "Imprimerie Régionale",
    bg: G("#1a2228", "#2f4654"),
  },
  {
    slug: "hotel-le-beaujolais",
    t: "Hôtel Le Beaujolais",
    univers: "hotel",
    exps: ["photo", "web"],
    year: "2024",
    desc: "Reportage lieux et site vitrine élégant.",
    intro:
      "Reportage photo et site vitrine pour un hôtel du Beaujolais. Capter l'atmosphère des lieux — lumière, matières, tables — et la prolonger dans une navigation calme qui donne envie de réserver.",
    client: "Hôtel Le Beaujolais",
    bg: G("#2b2823", "#6b6051"),
  },
  {
    slug: "restaurant-la-table",
    t: "Restaurant La Table",
    univers: "hotel",
    exps: ["identite", "photo", "print"],
    year: "2025",
    desc: "Identité, photo culinaire et carte imprimée.",
    intro:
      "Identité, photographie culinaire et carte imprimée pour un restaurant. De l'assiette à l'enseigne : un univers cohérent, gourmand et précis, pensé pour donner faim avant même de lire le menu.",
    client: "Restaurant La Table",
    bg: G("#2c241c", "#6b4f30"),
  },
  {
    slug: "serie-vendanges",
    t: "Série « Vendanges »",
    univers: "art",
    exps: ["photo"],
    year: "2023",
    desc: "Projet photographique personnel sur les vendanges.",
    intro:
      "Série photographique personnelle sur les vendanges du Beaujolais. Un travail au long cours sur les gestes, les visages et la lumière de septembre — la matière première de tout le reste.",
    client: "Projet personnel",
    bg: G("#1c2a1e", "#3c5a32"),
  },
  {
    slug: "exposition-riso",
    t: "Exposition « Riso »",
    univers: "art",
    exps: ["print", "identite"],
    year: "2022",
    desc: "Sérigraphie et édition pour une expo collective.",
    intro:
      "Direction artistique, sérigraphie et édition pour une exposition collective autour de la risographie. Affiches, fanzine et signalétique imprimés en tons directs — le geste d'impression comme sujet.",
    client: "Exposition collective",
    bg: G("#2a1620", "#6b2a44"),
  },
];

export const getProjet = (slug: string) => projets.find((p) => p.slug === slug);
export const getMetier = (key: string) => metiers.find((m) => m.key === key);
export const projetsByMetier = (key: string) => projets.filter((p) => p.exps.includes(key));
