import type { SectionHero } from "../../utils/sectionHeroes";

// Fond plein écran (image OU vidéo) + voile dégradé pour la lisibilité du texte.
// Placé en premier enfant d'un <section relative overflow-hidden> ; le contenu
// du hero doit être enveloppé dans un wrapper `relative z-10`.
export default function SectionHeroBg({ hero }: { hero: SectionHero | null }) {
  if (!hero?.media_url) return null;
  return (
    <div className="absolute inset-0 z-0">
      {hero.media_kind === "video" ? (
        <video
          className="h-full w-full object-cover"
          src={hero.media_url}
          poster={hero.poster_url ?? undefined}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="h-full w-full object-cover" src={hero.media_url} alt="" aria-hidden />
      )}
      {/* Voile : dégradé du bas (coal opaque) vers le haut, pour garder le texte lisible */}
      <div className="absolute inset-0 bg-gradient-to-t from-coal via-coal/75 to-coal/45" />
    </div>
  );
}
