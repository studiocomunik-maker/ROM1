-- MIGRATION COMPTA — à exécuter SEULE dans le SQL Editor (pas tout schema.sql !).
-- Idempotente : ré-exécutable sans erreur. Ensuite, exécuter seed_compta_2025.sql.
-- Données PRIVÉES : aucune lecture anon, tout passe par le rôle authenticated.

create table if not exists public.compta_clients (
  id           uuid primary key default gen_random_uuid(),
  intitule     text not null,               -- nom tel qu'écrit sur les factures
  nom_legal    text,                        -- dénomination officielle (SIRENE)
  siret        text,                        -- 14 chiffres
  adresse      text,
  email        text,                        -- destinataire des factures (envoi Pennylane)
  pennylane_id text,                        -- id client côté Pennylane
  updated_at   timestamptz not null default now()
);

alter table public.compta_clients add column if not exists email text;

drop trigger if exists trg_compta_clients_updated on public.compta_clients;
create trigger trg_compta_clients_updated
  before update on public.compta_clients
  for each row execute function public.touch_updated_at();

alter table public.compta_clients enable row level security;

drop policy if exists "compta clients : admin lit" on public.compta_clients;
create policy "compta clients : admin lit"
  on public.compta_clients for select to authenticated using (true);
drop policy if exists "compta clients : admin insère" on public.compta_clients;
create policy "compta clients : admin insère"
  on public.compta_clients for insert to authenticated with check (true);
drop policy if exists "compta clients : admin met à jour" on public.compta_clients;
create policy "compta clients : admin met à jour"
  on public.compta_clients for update to authenticated using (true) with check (true);
drop policy if exists "compta clients : admin supprime" on public.compta_clients;
create policy "compta clients : admin supprime"
  on public.compta_clients for delete to authenticated using (true);

create table if not exists public.compta_factures (
  id            uuid primary key default gen_random_uuid(),
  numero        text not null,              -- tel qu'imprimé sur la facture (doublons possibles)
  date_emission date not null,
  client_id     uuid references public.compta_clients(id) on delete set null,
  designation   text,
  total         numeric(10,2),              -- total facture
  acompte       numeric(10,2) not null default 0,
  montant       numeric(10,2) not null,     -- reste à payer = montant facturé (règle Romain)
  fichier       text,                       -- nom du PDF source (NAS /03 - COMPTE/Facture/<année>/)
  pennylane_id  text,                       -- id facture côté Pennylane
  updated_at    timestamptz not null default now()
);

create index if not exists idx_compta_factures_date on public.compta_factures (date_emission);
create index if not exists idx_compta_factures_client on public.compta_factures (client_id);

drop trigger if exists trg_compta_factures_updated on public.compta_factures;
create trigger trg_compta_factures_updated
  before update on public.compta_factures
  for each row execute function public.touch_updated_at();

alter table public.compta_factures enable row level security;

drop policy if exists "compta factures : admin lit" on public.compta_factures;
create policy "compta factures : admin lit"
  on public.compta_factures for select to authenticated using (true);
drop policy if exists "compta factures : admin insère" on public.compta_factures;
create policy "compta factures : admin insère"
  on public.compta_factures for insert to authenticated with check (true);
drop policy if exists "compta factures : admin met à jour" on public.compta_factures;
create policy "compta factures : admin met à jour"
  on public.compta_factures for update to authenticated using (true) with check (true);
drop policy if exists "compta factures : admin supprime" on public.compta_factures;
create policy "compta factures : admin supprime"
  on public.compta_factures for delete to authenticated using (true);
