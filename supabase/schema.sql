-- ============================================================
--  ROM1 — schéma back-office « réalisations »
--  À exécuter dans Supabase → SQL Editor (projet rom1).
-- ============================================================

-- 1) Table réalisations -------------------------------------------------
create table if not exists public.realisations (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  slug        text unique not null,
  titre       text not null,
  description text,
  univers     text not null,                 -- UNE seule (vin, sceno, art, corporate, hotel)
  exps        text[] not null default '{}',  -- PLUSIEURS (identite, print, photo, web, motion)
  cover_url   text,                           -- image de mise en avant
  media       jsonb not null default '[]'::jsonb, -- [{kind:'image'|'video'|'youtube', url, w?, h?}]
  position    int  not null default 0,
  published   boolean not null default true,
  panel_theme text not null default 'dark',  -- fond du descriptif : 'dark' | 'light'
  website     text                            -- URL du site du projet (bouton « Voir le site »)
);

-- Pour une base déjà créée avant l'ajout de ces colonnes :
alter table public.realisations
  add column if not exists panel_theme text not null default 'dark';
alter table public.realisations
  add column if not exists website text;
alter table public.realisations
  add column if not exists partners jsonb not null default '[]'::jsonb;

-- updated_at automatique
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists trg_realisations_updated on public.realisations;
create trigger trg_realisations_updated
  before update on public.realisations
  for each row execute function public.touch_updated_at();

-- 2) RLS ---------------------------------------------------------------
alter table public.realisations enable row level security;

-- Lecture publique : uniquement les réalisations publiées (site live)
create policy "réalisations publiées lisibles par tous"
  on public.realisations for select
  to anon, authenticated
  using (published = true);

-- L'admin (authentifié) lit tout, y compris les brouillons
create policy "admin lit toutes les réalisations"
  on public.realisations for select
  to authenticated
  using (true);

-- Écriture réservée aux authentifiés (= admin ; les inscriptions publiques
-- DOIVENT être désactivées dans Auth → sinon n'importe qui aurait l'écriture)
create policy "admin insère"
  on public.realisations for insert to authenticated with check (true);
create policy "admin met à jour"
  on public.realisations for update to authenticated using (true) with check (true);
create policy "admin supprime"
  on public.realisations for delete to authenticated using (true);

-- 3) Storage : bucket des médias (images / vidéos natives) -------------
insert into storage.buckets (id, name, public)
values ('realisations', 'realisations', true)
on conflict (id) do nothing;

create policy "médias réalisations lisibles par tous"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'realisations');
create policy "médias : admin insère"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'realisations');
create policy "médias : admin met à jour"
  on storage.objects for update to authenticated
  using (bucket_id = 'realisations');
create policy "médias : admin supprime"
  on storage.objects for delete to authenticated
  using (bucket_id = 'realisations');

-- 4) Réglages du site (ligne unique) : vidéo de fond du hero, etc. ------
create table if not exists public.site_settings (
  id                text primary key default 'global' check (id = 'global'),
  hero_video_url    text,   -- URL Storage de la vidéo de fond du hero (optionnelle)
  hero_video_poster text,   -- image de remplacement / premier plan (optionnelle)
  updated_at        timestamptz not null default now()
);

-- garantit la présence de la ligne unique
insert into public.site_settings (id) values ('global')
on conflict (id) do nothing;

drop trigger if exists trg_site_settings_updated on public.site_settings;
create trigger trg_site_settings_updated
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

alter table public.site_settings enable row level security;

create policy "réglages lisibles par tous"
  on public.site_settings for select to anon, authenticated using (true);
create policy "réglages : admin insère"
  on public.site_settings for insert to authenticated with check (true);
create policy "réglages : admin met à jour"
  on public.site_settings for update to authenticated using (true) with check (true);

-- 5) Hero des sections (métiers + univers) -----------------------------
--    Une ligne par section. id = "metier:<key>" ou "univers:<key>".
--    media = image OU vidéo (fond plein écran + voile sur la page).
--    title / intro vides = on retombe sur les valeurs par défaut de data.ts.
create table if not exists public.section_heroes (
  id          text primary key,             -- "metier:identite" | "univers:vin"
  media_url   text,
  media_kind  text,                          -- 'image' | 'video'
  poster_url  text,                          -- cover de la vidéo (optionnel)
  title       text,
  intro       text,
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_section_heroes_updated on public.section_heroes;
create trigger trg_section_heroes_updated
  before update on public.section_heroes
  for each row execute function public.touch_updated_at();

alter table public.section_heroes enable row level security;

create policy "hero sections lisibles par tous"
  on public.section_heroes for select to anon, authenticated using (true);
create policy "hero sections : admin insère"
  on public.section_heroes for insert to authenticated with check (true);
create policy "hero sections : admin met à jour"
  on public.section_heroes for update to authenticated using (true) with check (true);
create policy "hero sections : admin supprime"
  on public.section_heroes for delete to authenticated using (true);

-- NB : les hero des PAGES (savoir-faire, à-propos) réutilisent cette table,
-- avec id = "page:<slug>" (ex. "page:savoir-faire"). Aucune colonne en plus.

-- 6) Clients (grille de logos « Ils nous font confiance », page à-propos) ----
create table if not exists public.clients (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  logo_url   text,                          -- logo (bucket realisations, sous clients/)
  url        text,                          -- lien vers le site client (optionnel)
  position   int  not null default 0,
  published  boolean not null default true,
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_clients_updated on public.clients;
create trigger trg_clients_updated
  before update on public.clients
  for each row execute function public.touch_updated_at();

alter table public.clients enable row level security;

create policy "clients publiés lisibles par tous"
  on public.clients for select to anon, authenticated using (published = true);
create policy "admin lit tous les clients"
  on public.clients for select to authenticated using (true);
create policy "clients : admin insère"
  on public.clients for insert to authenticated with check (true);
create policy "clients : admin met à jour"
  on public.clients for update to authenticated using (true) with check (true);
create policy "clients : admin supprime"
  on public.clients for delete to authenticated using (true);

-- 7) Collaborateurs (section « Les collaborateurs », page à-propos) -----------
create table if not exists public.collaborators (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  role       text,
  body       text,                          -- description
  photo_url  text,                          -- portrait (bucket realisations, sous collaborateurs/)
  position   int  not null default 0,
  published  boolean not null default true,
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_collaborators_updated on public.collaborators;
create trigger trg_collaborators_updated
  before update on public.collaborators
  for each row execute function public.touch_updated_at();

alter table public.collaborators enable row level security;

create policy "collaborateurs publiés lisibles par tous"
  on public.collaborators for select to anon, authenticated using (published = true);
create policy "admin lit tous les collaborateurs"
  on public.collaborators for select to authenticated using (true);
create policy "collaborateurs : admin insère"
  on public.collaborators for insert to authenticated with check (true);
create policy "collaborateurs : admin met à jour"
  on public.collaborators for update to authenticated using (true) with check (true);
create policy "collaborateurs : admin supprime"
  on public.collaborators for delete to authenticated using (true);
