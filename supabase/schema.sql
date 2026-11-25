-- Mariage Samicha & Fabrice — schéma Supabase
-- À coller une seule fois dans Supabase > SQL Editor > New query > Run.

-- Photos partagées par les invités
create table if not exists public.photos (
  id          uuid primary key,
  guest_id    uuid not null,
  first_name  text not null,
  last_name   text not null default '',
  path        text not null,
  thumb_path  text not null,
  width       int,
  height      int,
  hidden      boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists photos_created_idx on public.photos (created_at desc);
create index if not exists photos_guest_idx on public.photos (guest_id);

-- Réglages (une seule ligne)
create table if not exists public.settings (
  id         int primary key default 1 check (id = 1),
  mode       text not null default 'reveal' check (mode in ('live', 'reveal')),
  reveal_at  timestamptz default '2027-06-27 11:00:00+02'
);
insert into public.settings (id) values (1) on conflict (id) do nothing;

-- Sécurité : aucune lecture/écriture directe depuis le navigateur.
-- Tout passe par le serveur du site (clé "service_role"), qui applique
-- la règle de révélation.
alter table public.photos   enable row level security;
alter table public.settings enable row level security;

-- Stockage des fichiers : bucket public (les liens contiennent des
-- identifiants aléatoires impossibles à deviner, et la liste des fichiers
-- n'est accessible qu'au serveur).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 15728640, array['image/jpeg'])
on conflict (id) do update
  set public = true, file_size_limit = 15728640, allowed_mime_types = array['image/jpeg'];
