/* Pages d'atterrissage SEO local : « graphiste + ville » et « site internet Beaujolais ».
   Hors menu principal (accès footer + sitemap), contenu unique par page — pas de
   template à variables. URLs à plat : rom1.fr/<slug>. La requête tête
   « graphiste beaujolais » est portée par l'accueil (bloc Beaujolais), pas ici. */

export type LocalPage = {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  intro: string;
  sections: { title: string; body: string[] }[];
  faq: { q: string; a: string }[];
  /** Clés de métiers (data.ts) à proposer en liens internes. */
  metierLinks: string[];
  /** Slugs des autres pages locales à lier en bas de page. */
  related: string[];
  /** Ville pour le JSON-LD Service (areaServed). Absent = région entière. */
  ville?: string;
  serviceType: string;
};

export const localPages: LocalPage[] = [
  {
    slug: "graphiste-villefranche-sur-saone",
    metaTitle: "Graphiste à Villefranche-sur-Saône — identité, print & web",
    metaDescription:
      "Graphiste indépendant près de Villefranche-sur-Saône : logo, charte graphique, brochures, photo et sites web pour les entreprises et commerces de la capitale du Beaujolais.",
    eyebrow: "Graphiste · Villefranche-sur-Saône",
    h1: "Graphiste à Villefranche-sur-Saône",
    intro:
      "Capitale du Beaujolais, sous-préfecture, tissu d'entreprises dense entre la rue Nationale et les zones d'activités du nord : Villefranche-sur-Saône concentre l'essentiel de l'économie caladoise. J'y interviens comme graphiste indépendant — identité, print, photo, web — à une demi-heure de mon atelier de Jullié.",
    serviceType: "Graphisme et identité visuelle pour entreprises",
    ville: "Villefranche-sur-Saône",
    sections: [
      {
        title: "Pour les entreprises caladoises",
        body: [
          "PME industrielles, cabinets, commerces de la rue Nat', négoces et artisans : les besoins ne sont pas les mêmes, mais le problème est souvent identique — une image qui date, des supports dépareillés, un site qui ne raconte rien. Je remets tout ça d'équerre : un signe, un système, des règles d'usage, et des supports qui se répondent du papier à l'écran.",
          "J'ai une vraie culture du B2B : rendre lisible et désirable un savoir-faire technique, c'est un travail de fond que je mène régulièrement pour des industriels de la région. Plaquettes, photos d'atelier, films de présentation, salons — le corporate n'est pas une punition graphique.",
        ],
      },
      {
        title: "Un indépendant, pas une agence",
        body: [
          "À Villefranche comme ailleurs, vous trouverez des agences avec des chefs de projet et des plannings partagés. Moi, je travaille seul, entouré de partenaires fiables quand il faut du renfort : vous parlez directement à celui qui dessine. Vingt ans de métier, un devis clair, des délais tenus — et la fabrication web assurée par pixelstore.fr, ma structure dédiée.",
        ],
      },
    ],
    faq: [
      {
        q: "Intervenez-vous directement à Villefranche-sur-Saône ?",
        a: "Oui. Mon atelier est à Jullié, dans le Beaujolais nord : Villefranche est à une demi-heure par la D306 ou l'A6. Rendez-vous sur place, reportages photo, réunions de lancement — la distance n'est jamais un sujet.",
      },
      {
        q: "Travaillez-vous pour les commerces et indépendants ?",
        a: "Bien sûr. Logo, vitrine, carte, réseaux sociaux : un commerce a besoin d'une image cohérente plus que d'une image chère. Je calibre le périmètre au besoin réel — quitte à faire moins, mais bien.",
      },
      {
        q: "Pouvez-vous reprendre une identité existante sans tout jeter ?",
        a: "C'est même fréquent. Un logo qui a de la notoriété locale ne se jette pas : on le redessine proprement, on reconstruit la charte autour, et vos supports repartent sur des bases saines sans perdre vingt ans de reconnaissance.",
      },
    ],
    metierLinks: ["identite", "print", "web"],
    related: [
      "graphiste-belleville-en-beaujolais",
      "creation-site-internet-beaujolais",
    ],
  },
  {
    slug: "graphiste-belleville-en-beaujolais",
    metaTitle: "Graphiste à Belleville-en-Beaujolais — vin, négoce, artisans",
    metaDescription:
      "Graphiste indépendant à un quart d'heure de Belleville-en-Beaujolais : étiquettes de vin, identités de domaines et de négoces, print, photo et sites web.",
    eyebrow: "Graphiste · Belleville-en-Beaujolais",
    h1: "Graphiste à Belleville-en-Beaujolais",
    intro:
      "Belleville-en-Beaujolais, c'est la porte des crus : le négoce, la coopérative, les zones d'activités le long de la Saône, et des dizaines de domaines à dix minutes dans les collines. Mon atelier de Jullié est juste au-dessus — un quart d'heure de route à travers les vignes.",
    serviceType: "Graphisme pour domaines viticoles et entreprises",
    ville: "Belleville-en-Beaujolais",
    sections: [
      {
        title: "Le vin d'abord, mais pas seulement",
        body: [
          "Autour de Belleville, mon quotidien c'est le vin : étiquettes, identités de caves, packaging de cuvées, photos de vendanges et de chais, sites de domaines avec ou sans boutique en ligne. Je travaille pour des vignerons de Morgon, Fleurie, Juliénas ou Brouilly — des étiquettes dessinées pour la bouteille réelle, la matière du papier, la dorure, pas pour un écran.",
          "Mais Belleville, c'est aussi des transporteurs, des artisans, des PME installées dans les zones d'activités entre l'A6 et la Saône. Pour eux : identité, plaquettes, photos, web. Le même niveau d'exigence, appliqué à d'autres matières.",
        ],
      },
      {
        title: "La proximité comme méthode",
        body: [
          "Une étiquette se valide autour d'une table, avec la bouteille entre les mains — pas en visioconférence. Être à un quart d'heure change tout : je passe au domaine, je photographie le lieu, je reviens à la mise en bouteille. C'est ce compagnonnage-là qui fait les identités justes, celles qui tiennent plus de trois millésimes.",
        ],
      },
    ],
    faq: [
      {
        q: "Faites-vous les étiquettes de vin de A à Z ?",
        a: "Oui : du concept au fichier d'impression, gabarits par format de bouteille, mentions légales, suivi avec l'imprimeur — dorure, gaufrage, papiers texturés compris. Et la photo des bouteilles finies pour vos réseaux et votre site.",
      },
      {
        q: "Travaillez-vous avec les caves coopératives et les négoces ?",
        a: "Oui. Les enjeux diffèrent d'un domaine familial — gammes larges, marques multiples, contraintes export — et c'est un exercice que je connais bien : construire un système graphique qui tient sur trente références sans se diluer.",
      },
      {
        q: "Et si mon domaine est plus loin, dans les crus ?",
        a: "Jullié est au centre du Beaujolais viticole : Juliénas et Chénas sont à cinq minutes, Fleurie et Villié-Morgon à dix, Brouilly à vingt. Je passe déjà devant chez vous.",
      },
    ],
    metierLinks: ["print", "identite", "photo"],
    related: [
      "graphiste-macon",
      "creation-site-internet-beaujolais",
    ],
  },
  {
    slug: "graphiste-macon",
    metaTitle: "Graphiste à Mâcon — identité, print, photo & web",
    metaDescription:
      "Graphiste indépendant à vingt minutes de Mâcon : identité visuelle, étiquettes pour le Mâconnais, print, photo, vidéo et sites web pour entreprises et domaines de Saône-et-Loire.",
    eyebrow: "Graphiste · Mâcon",
    h1: "Graphiste à Mâcon",
    intro:
      "Mâcon est de l'autre côté de la crête : vingt minutes depuis mon atelier de Jullié, par la route qui passe au-dessus de Saint-Amour. Préfecture de Saône-et-Loire, port de plaisance sur la Saône, et capitale d'un vignoble blanc — le Mâconnais — qui n'a pas les mêmes codes que mon Beaujolais natal. C'est justement ce qui rend le travail intéressant.",
    serviceType: "Graphisme et identité visuelle",
    ville: "Mâcon",
    sections: [
      {
        title: "Entre Beaujolais et Bourgogne",
        body: [
          "Travailler à Mâcon, c'est jongler entre deux cultures graphiques : la spontanéité beaujolaise et la retenue bourguignonne. Pour un domaine de Pouilly-Fuissé ou de Saint-Véran, une étiquette ne se dessine pas comme pour un morgon — les codes, les papiers, les typographies changent. Je connais les deux versants, et je dessine pour celui où vous êtes.",
          "Côté entreprises, Mâcon concentre services, commerces et industrie le long de l'axe Saône : identité, print, photo d'entreprise, films et sites web — le même savoir-faire complet que je déploie côté Rhône, sans facturation de kilomètres imaginaires.",
        ],
      },
      {
        title: "Un atelier à vingt minutes",
        body: [
          "La proximité n'est pas un argument marketing : Jullié touche la Saône-et-Loire. Saint-Amour, la Chapelle-de-Guinchay et Crêches sont mes voisins directs ; Mâcon centre est à vingt minutes. Rendez-vous sur place, repérages photo, allers-retours de validation : je fonctionne avec le Mâconnais comme avec le Beaujolais — en voisin.",
        ],
      },
    ],
    faq: [
      {
        q: "Couvrez-vous tout le Mâconnais ?",
        a: "Oui : Mâcon, la Roche-Vineuse, Prissé, Fuissé, Lugny… Le vignoble mâconnais et la ville sont à moins de trente minutes de l'atelier. Au-delà, vers Cluny ou Tournus, j'interviens aussi — on s'organise simplement.",
      },
      {
        q: "Connaissez-vous les codes des appellations bourguignonnes ?",
        a: "Oui. Étiquettes conformes aux mentions obligatoires, hiérarchie appellation / climat / domaine, papiers et finitions attendus sur ce marché : le blanc mâconnais a ses usages, et une étiquette qui les ignore se voit tout de suite sur une carte des vins.",
      },
      {
        q: "Photo et vidéo aussi à Mâcon ?",
        a: "Oui : reportages d'entreprise, photos de domaines et de cuvées, films de marque et captations par drone (dans le respect de la réglementation). L'image fait partie du même geste que l'identité — c'est souvent le duo qui change tout.",
      },
    ],
    metierLinks: ["identite", "print", "photo"],
    related: [
      "graphiste-belleville-en-beaujolais",
      "creation-site-internet-beaujolais",
    ],
  },
  {
    slug: "creation-site-internet-beaujolais",
    metaTitle: "Création de site internet en Beaujolais — sites sur-mesure",
    metaDescription:
      "Création de sites internet en Beaujolais : direction artistique de graphiste, développement sur-mesure, référencement local. Sites de domaines, d'entreprises et de lieux, avec ou sans boutique.",
    eyebrow: "Sites internet · Beaujolais",
    h1: "Création de site internet en Beaujolais",
    intro:
      "Un site n'est pas une plaquette en ligne : c'est le premier rendez-vous que vos clients ont avec vous. Je conçois des sites sur-mesure pour les domaines, entreprises et lieux du Beaujolais — la direction artistique ici, la fabrication technique chez pixelstore.fr, ma structure dédiée au web. Un seul interlocuteur, du premier croquis à la mise en ligne.",
    serviceType: "Création de sites internet",
    sections: [
      {
        title: "Du sur-mesure, pas du thème acheté",
        body: [
          "La plupart des sites locaux se ressemblent parce qu'ils sortent des mêmes gabarits. Les miens sont dessinés : une grille, un rythme, des images faites pour le sujet — souvent les miennes, puisque je suis aussi photographe. Techniquement, ce sont des sites modernes, rapides, sécurisés, avec un espace d'administration simple pour que vous restiez autonome sur vos contenus.",
          "Pour les vignerons : présentation du domaine et des cuvées, actualités, et boutique en ligne quand il faut vendre en direct. Pour les entreprises : savoir-faire, références, recrutement, formulaires reliés à votre boîte mail. Pour les lieux : réservation, cartes, événements.",
        ],
      },
      {
        title: "Pensés pour être trouvés",
        body: [
          "Un beau site invisible ne sert à rien. Chaque site part avec des fondations propres : structure claire, textes travaillés, données structurées, performances soignées et référencement local — être trouvé sur sa commune et son métier, c'est le premier objectif. C'est exactement la mécanique que j'applique à mon propre site, et elle fonctionne.",
        ],
      },
      {
        title: "Et après la mise en ligne",
        body: [
          "Un site vit : millésimes qui changent, équipes qui bougent, actualités. Vous modifiez l'essentiel vous-même depuis l'administration ; pour le reste, je reste là — pas de hotline anonyme, le même interlocuteur qu'au premier jour. L'hébergement et le nom de domaine sont posés proprement, à votre nom, chez des prestataires sérieux.",
        ],
      },
    ],
    faq: [
      {
        q: "Combien coûte un site internet ?",
        a: "Un site vitrine sur-mesure se chiffre selon le nombre de pages, les contenus à créer (textes, photos) et les fonctions (boutique, réservation, multilingue). Devis clair après un premier échange — vous savez exactement ce qui est compris.",
      },
      {
        q: "Utilisez-vous WordPress ?",
        a: "Quand c'est pertinent, oui — je reprends et sécurise aussi des sites WordPress existants. Mais pour les créations neuves, je privilégie des technologies plus récentes : plus rapides, plus sûres, sans maintenance anxiogène. Le choix technique suit le besoin, jamais l'inverse.",
      },
      {
        q: "Faites-vous aussi les textes et les photos ?",
        a: "Oui, et c'est souvent ce qui change tout : un site sur-mesure avec des photos de banque d'images reste un site anonyme. Reportage sur place, textes travaillés avec vous, images cohérentes avec votre identité — tout sort de la même main.",
      },
      {
        q: "Un vigneron peut-il vendre en ligne ?",
        a: "Oui : boutique avec paiement sécurisé, gestion des millésimes et des stocks, vente par cartons, et les obligations du secteur (mentions, majorité légale) posées correctement dès le départ.",
      },
    ],
    metierLinks: ["web", "identite", "photo"],
    related: [
      "graphiste-villefranche-sur-saone",
      "graphiste-belleville-en-beaujolais",
    ],
  },
];

export const getLocalPage = (slug: string) =>
  localPages.find((p) => p.slug === slug);
