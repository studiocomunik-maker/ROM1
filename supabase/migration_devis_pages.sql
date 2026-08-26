-- MIGRATION PAGES DEVIS — à exécuter SEULE dans le SQL Editor.
-- Idempotente : ré-exécutable sans erreur.
--
-- Objet : la présentation web d'un devis (l'argumentaire détaillé qu'on envoie
-- au client, avec le PDF Pennylane téléchargeable en tête). Le devis comptable
-- reste dans Pennylane ; ici on stocke la page qui l'accompagne, son historique
-- de versions, et le lien vers le PDF.
--
-- Confidentialité : la table n'est PAS lisible par anon. La page publique passe
-- par la fonction `devis_page_public(slug)` (security definer) : sans connaître
-- le slug, on ne peut rien lire — et on ne peut pas non plus lister les autres
-- devis. Les pages en brouillon ne sortent jamais.

create table if not exists public.devis_pages (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,        -- /devis/<slug> — sert de secret
  client_id      uuid references public.compta_clients(id) on delete set null,
  client_nom     text not null,               -- affiché en tête de page
  projet         text not null,               -- « Site internet — Résidence Les Castalies »
  devis_numero   text,                        -- n° tel qu'écrit dans Pennylane
  pennylane_quote_id text,                    -- id du devis côté Pennylane
  pdf_url        text,                        -- public_file_url Pennylane (ou autre lien PDF)
  statut         text not null default 'brouillon',  -- brouillon | envoye | accepte | refuse
  version        integer not null default 0,  -- 0 = jamais publié
  date_emission  date not null default current_date,
  valide_jusquau date,
  total          numeric(10,2),
  contenu        text not null default '',    -- document HTML complet de la présentation
  updated_at     timestamptz not null default now()
);

create index if not exists idx_devis_pages_client on public.devis_pages (client_id);

drop trigger if exists trg_devis_pages_updated on public.devis_pages;
create trigger trg_devis_pages_updated
  before update on public.devis_pages
  for each row execute function public.touch_updated_at();

-- Historique : une ligne par version publiée (la dernière = celle affichée).
create table if not exists public.devis_page_versions (
  id         uuid primary key default gen_random_uuid(),
  page_id    uuid not null references public.devis_pages(id) on delete cascade,
  version    integer not null,
  contenu    text not null,
  note       text,                            -- « ajout de l'option agenda », etc.
  pdf_url    text,
  total      numeric(10,2),
  created_at timestamptz not null default now(),
  unique (page_id, version)
);

create index if not exists idx_devis_page_versions_page
  on public.devis_page_versions (page_id, version desc);

-- ---------------------------------------------------------------- RLS
alter table public.devis_pages enable row level security;
alter table public.devis_page_versions enable row level security;

drop policy if exists "devis pages : admin lit" on public.devis_pages;
create policy "devis pages : admin lit"
  on public.devis_pages for select to authenticated using (true);
drop policy if exists "devis pages : admin insère" on public.devis_pages;
create policy "devis pages : admin insère"
  on public.devis_pages for insert to authenticated with check (true);
drop policy if exists "devis pages : admin met à jour" on public.devis_pages;
create policy "devis pages : admin met à jour"
  on public.devis_pages for update to authenticated using (true) with check (true);
drop policy if exists "devis pages : admin supprime" on public.devis_pages;
create policy "devis pages : admin supprime"
  on public.devis_pages for delete to authenticated using (true);

drop policy if exists "devis versions : admin lit" on public.devis_page_versions;
create policy "devis versions : admin lit"
  on public.devis_page_versions for select to authenticated using (true);
drop policy if exists "devis versions : admin insère" on public.devis_page_versions;
create policy "devis versions : admin insère"
  on public.devis_page_versions for insert to authenticated with check (true);
drop policy if exists "devis versions : admin supprime" on public.devis_page_versions;
create policy "devis versions : admin supprime"
  on public.devis_page_versions for delete to authenticated using (true);

-- ------------------------------------------------- lecture publique par slug
-- security definer : contourne la RLS pour CETTE lecture précise, à condition
-- de fournir le slug exact. Aucun listing possible.
create or replace function public.devis_page_public(p_slug text)
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'slug',           d.slug,
    'client_nom',     d.client_nom,
    'projet',         d.projet,
    'devis_numero',   d.devis_numero,
    'pdf_url',        d.pdf_url,
    'statut',         d.statut,
    'version',        d.version,
    'date_emission',  d.date_emission,
    'valide_jusquau', d.valide_jusquau,
    'total',          d.total,
    'contenu',        d.contenu,
    'updated_at',     d.updated_at,
    'versions', coalesce(
      (select json_agg(json_build_object(
                'version',    v.version,
                'note',       v.note,
                'created_at', v.created_at
              ) order by v.version desc)
         from public.devis_page_versions v
        where v.page_id = d.id),
      '[]'::json)
  )
  from public.devis_pages d
  where d.slug = p_slug
    and d.statut <> 'brouillon'
    and d.version > 0;
$$;

revoke all on function public.devis_page_public(text) from public;
grant execute on function public.devis_page_public(text) to anon, authenticated;
