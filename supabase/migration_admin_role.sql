-- migration_admin_role — Vrai rôle admin (audit sécurité du 05/11/2026)
--
-- Jusqu'ici « connecté = admin » : toutes les policies `to authenticated`
-- laissaient TOUT compte lire compta_clients (emails, SIRET), les factures,
-- les clients, les pages devis et modifier le site. Les routes Pennylane
-- (émettre, envoyer par mail) ne demandaient elles aussi qu'une session.
-- Or l'inscription Supabase était ouverte : n'importe qui pouvait se créer
-- un compte avec la clé publique du site.
--
-- Désormais seul un compte portant app_metadata.role = 'admin' a ces droits.
-- Ce champ ne se pose qu'avec la clé secrète (API admin Supabase) ou
-- ici en SQL : un compte créé par l'API publique n'y a pas accès.

-- 1) is_admin() : lit le rôle EN BASE (pas dans le jeton), donc effet
--    immédiat sans reconnexion.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select (u.raw_app_meta_data ->> 'role') = 'admin'
       from auth.users u
      where u.id = (select auth.uid())),
    false);
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- 2) Les comptes existants du back-office deviennent admin.
--    (liste vérifiée le 05/11/2026 dans le SQL Editor)
update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
 where email in (__EMAILS__);

-- 3) Toute policy réservée aux connectés (rôle `authenticated` seul) exige
--    désormais en plus is_admin(). Les policies publiques (`anon, authenticated`)
--    — lecture du site, passage de commande, formulaire de contact — ne bougent pas.
do $$
declare
  p record;
  q text;
begin
  for p in
    select schemaname, tablename, policyname, qual, with_check
      from pg_policies
     where schemaname in ('public', 'storage')
       and roles = array['authenticated']::name[]
       and coalesce(qual, '') not like '%is_admin()%'
       and coalesce(with_check, '') not like '%is_admin()%'
  loop
    q := format('alter policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
    if p.qual is not null then
      q := q || format(' using ((%s) and public.is_admin())', p.qual);
    end if;
    if p.with_check is not null then
      q := q || format(' with check ((%s) and public.is_admin())', p.with_check);
    end if;
    begin
      execute q;
      raise notice 'ok : %.% — %', p.schemaname, p.tablename, p.policyname;
    exception when others then
      raise warning 'ÉCHEC : %.% — % : %', p.schemaname, p.tablename, p.policyname, sqlerrm;
    end;
  end loop;
end $$;

-- 4) Contrôle : plus aucune policy `authenticated` sans is_admin().
select schemaname, tablename, policyname, cmd
  from pg_policies
 where schemaname in ('public', 'storage')
   and roles = array['authenticated']::name[]
   and coalesce(qual, '') not like '%is_admin()%'
   and coalesce(with_check, '') not like '%is_admin()%';
