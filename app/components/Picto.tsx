/* Pictos riso des métiers/univers (trait orange via currentColor, viewBox 24).
   Partagés entre la liste Expertises de l'accueil (curseur au survol) et la
   page /savoir-faire (cartes). */
export default function Picto({ k, className = "" }: { k: string; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
  switch (k) {
    case "identite":
      return (
        <svg {...common}>
          <path d="M2 12C6 5 18 5 22 12C18 19 6 19 2 12Z" />
          <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
        </svg>
      );
    case "print":
      return (
        <svg {...common}>
          <rect x="5" y="3" width="14" height="18" rx="1" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );
    case "photo":
      return (
        <svg {...common}>
          <rect x="2.5" y="7" width="19" height="12" rx="2" />
          <path d="M8.5 7l1.5-3h4l1.5 3" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      );
    case "web":
      return (
        <svg {...common}>
          <path d="M9 8l-4 4 4 4M15 8l4 4-4 4" />
        </svg>
      );
    case "motion":
      return (
        <svg {...common}>
          <path d="M13 2 4 13h6l-1 9 9-12h-6z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "vin":
      return (
        <svg {...common}>
          <path d="M10 2h4v4c0 2 2 3 2 6v11a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V12c0-3 2-4 2-6z" />
          <path d="M8 13h8" />
        </svg>
      );
    case "sceno":
      return (
        <svg {...common}>
          <circle cx="12" cy="4" r="2" />
          <path d="M12 6l-7 14M12 6l7 14M12 6v14" />
        </svg>
      );
    case "art":
      return (
        <svg {...common}>
          <path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19" />
        </svg>
      );
    case "corporate":
      return (
        <svg {...common}>
          <rect x="6" y="3" width="12" height="18" rx="1" />
          <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
        </svg>
      );
    case "hotel":
      return (
        <svg {...common}>
          <path d="M8 3h8l-1 7a3 3 0 0 1-6 0zM12 13v8M9 21h6" />
        </svg>
      );
    default:
      return null;
  }
}
