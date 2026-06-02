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
