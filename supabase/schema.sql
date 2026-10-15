-- Database untuk Asesmen Reflektif SPMI
-- Jalankan seluruh skrip ini sekali di Supabase SQL Editor.

create table if not exists public.participants (
  participant_key uuid primary key,
  name text not null check (char_length(trim(name)) between 2 and 120),
  institution text not null check (char_length(trim(institution)) between 2 and 180),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assessment_responses (
  id uuid primary key default gen_random_uuid(),
  participant_key uuid not null references public.participants(participant_key) on delete cascade,
  stage text not null check (stage in ('pretest','posttest')),
  answers jsonb not null check (jsonb_typeof(answers) = 'array' and jsonb_array_length(answers) = 5),
  score smallint not null check (score between 0 and 5),
  total smallint not null default 5 check (total = 5),
  submitted_at timestamptz not null default now(),
  consented_at timestamptz not null default now(),
  unique (participant_key, stage)
);

create table if not exists public.reflection_responses (
  id uuid primary key default gen_random_uuid(),
  participant_key uuid not null unique references public.participants(participant_key) on delete cascade,
  q1 text not null check (char_length(trim(q1)) between 3 and 2500),
  q2 text not null check (char_length(trim(q2)) between 3 and 2500),
  q3 text not null check (char_length(trim(q3)) between 3 and 2500),
  submitted_at timestamptz not null default now(),
  consented_at timestamptz not null default now()
);

create index if not exists assessment_responses_stage_submitted_idx
  on public.assessment_responses(stage, submitted_at desc);
create index if not exists reflection_responses_submitted_idx
  on public.reflection_responses(submitted_at desc);
create index if not exists participants_institution_idx
  on public.participants(institution);

-- Formulir publik tidak mengakses tabel secara langsung.
-- Semua penulisan/pembacaan melewati Cloudflare Pages Functions di sisi server.
alter table public.participants enable row level security;
alter table public.assessment_responses enable row level security;
alter table public.reflection_responses enable row level security;

revoke all on table public.participants from anon, authenticated;
revoke all on table public.assessment_responses from anon, authenticated;
revoke all on table public.reflection_responses from anon, authenticated;

-- Catatan:
-- ID peserta dibuat otomatis di browser dan disimpan di localStorage untuk memasangkan
-- pretest/posttest/refleksi pada perangkat yang sama. Nama dan instansi tetap diminta
-- di setiap formulir. Kiriman ulang dari ID perangkat yang sama memperbarui respons
-- pada tahap yang sama, bukan membuat duplikat.
