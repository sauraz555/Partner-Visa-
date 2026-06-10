-- SQL SCHEMA FOR INTERLACE PARTNER VISA EVIDENCE BUILDER
-- Execute this script in your Supabase SQL Editor to set up the database tables.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROJECTS TABLE
-- ============================================================
create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  applicant_name text not null,
  partner_name text not null,
  visa_subclass text not null check (visa_subclass in ('309', '100', '820', '801', 'custom')),
  relationship_commenced text,
  marriage_date text,
  current_residence text,
  relationship_narrative text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.projects enable row level security;

-- RLS Policies
create policy "Users can view their own projects"
  on public.projects for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own projects"
  on public.projects for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on public.projects for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on public.projects for delete
  to authenticated
  using (auth.uid() = user_id);


-- ============================================================
-- 2. EVIDENCE FILES TABLE
-- ============================================================
create table if not exists public.evidence_files (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  original_filename text not null,
  mime_type text not null,
  size_bytes bigint not null,
  thumbnail_url text,
  preview_url text,
  status text not null default 'processing',
  processing_stage text,
  processing_progress integer default 0,
  
  -- Classification
  suggested_category text,
  confirmed_category text,
  category_confidence text,
  category_status text not null default 'ai_suggested',
  
  -- Date
  suggested_date text,
  confirmed_date text,
  date_approximate boolean default false,
  date_approximate_level text default 'day',
  date_status text not null default 'ai_suggested',
  
  -- Location
  suggested_location text,
  confirmed_location text,
  location_status text not null default 'ai_suggested',
  
  -- People
  suggested_people text[] default '{}'::text[],
  confirmed_people text[] default '{}'::text[],
  people_status text not null default 'ai_suggested',
  
  -- Caption
  suggested_caption text,
  confirmed_caption text,
  caption_status text not null default 'ai_suggested',
  
  -- Source type
  source_type text default 'photograph',
  
  -- Quality
  quality_score integer,
  is_blurry boolean default false,
  is_duplicate boolean default false,
  duplicate_group_id text,
  
  -- Redaction (stored as JSON array)
  has_redactions boolean default false,
  redactions jsonb default '[]'::jsonb not null,
  
  -- Review
  notes text,
  include_in_document boolean default true not null,
  evidence_number integer,
  
  uploaded_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.evidence_files enable row level security;

-- RLS Policies (checking project ownership)
create policy "Users can view evidence from their projects"
  on public.evidence_files for select
  to authenticated
  using (project_id in (select id from public.projects where user_id = auth.uid()));

create policy "Users can insert evidence into their projects"
  on public.evidence_files for insert
  to authenticated
  with check (project_id in (select id from public.projects where user_id = auth.uid()));

create policy "Users can update evidence in their projects"
  on public.evidence_files for update
  to authenticated
  using (project_id in (select id from public.projects where user_id = auth.uid()))
  with check (project_id in (select id from public.projects where user_id = auth.uid()));

create policy "Users can delete evidence from their projects"
  on public.evidence_files for delete
  to authenticated
  using (project_id in (select id from public.projects where user_id = auth.uid()));


-- ============================================================
-- 3. TIMELINE MILESTONES TABLE
-- ============================================================
create table if not exists public.timeline_milestones (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  date text not null,
  event text not null,
  key boolean default false not null,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.timeline_milestones enable row level security;

-- RLS Policies
create policy "Users can view milestones from their projects"
  on public.timeline_milestones for select
  to authenticated
  using (project_id in (select id from public.projects where user_id = auth.uid()));

create policy "Users can insert milestones into their projects"
  on public.timeline_milestones for insert
  to authenticated
  with check (project_id in (select id from public.projects where user_id = auth.uid()));

create policy "Users can update milestones in their projects"
  on public.timeline_milestones for update
  to authenticated
  using (project_id in (select id from public.projects where user_id = auth.uid()))
  with check (project_id in (select id from public.projects where user_id = auth.uid()));

create policy "Users can delete milestones from their projects"
  on public.timeline_milestones for delete
  to authenticated
  using (project_id in (select id from public.projects where user_id = auth.uid()));


-- ============================================================
-- 4. STORAGE BUCKET CONFIGURATION
-- ============================================================
-- Run these SQL statements to initialize the storage bucket for evidence files
insert into storage.buckets (id, name, public) 
values ('evidence-vault', 'evidence-vault', true)
on conflict (id) do nothing;

-- Storage RLS Security Policies
create policy "Allow authenticated uploads"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'evidence-vault');

create policy "Allow authenticated select access"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'evidence-vault');

create policy "Allow authenticated delete access"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'evidence-vault');
