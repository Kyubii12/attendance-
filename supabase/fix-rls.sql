-- ============================================================
-- Run this in Supabase SQL Editor to fix registration
-- https://supabase.com/dashboard/project/ovdxvzlhffdfeghjcsem/sql
-- ============================================================

-- Create tables if they don't exist yet
create table if not exists public.students (
  id          uuid primary key default gen_random_uuid(),
  student_id  text not null unique,
  name        text not null,
  department  text not null,
  year_level  text not null default '1st Year',
  email       text,
  enrolled_at timestamptz not null default now(),
  is_active   boolean not null default true
);

create table if not exists public.attendance_logs (
  id         uuid primary key default gen_random_uuid(),
  student_id text not null references public.students(student_id) on delete cascade,
  status     text not null check (status in ('Present','Late','Absent')),
  confidence numeric(5,2) not null default 0,
  logged_at  timestamptz not null default now(),
  subject    text,
  faculty_id text
);

create table if not exists public.demo_requests (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  role       text not null,
  department text not null,
  message    text,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text not null,
  message    text not null,
  created_at timestamptz not null default now(),
  is_read    boolean not null default false
);

-- Enable RLS
alter table public.students         enable row level security;
alter table public.attendance_logs  enable row level security;
alter table public.demo_requests    enable row level security;
alter table public.contact_messages enable row level security;

-- Drop ALL existing policies to start clean
do $$ declare
  r record;
begin
  for r in select policyname, tablename from pg_policies where schemaname = 'public' loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- Students: fully open for demo (read + insert by anyone)
create policy "allow_select_students" on public.students for select using (true);
create policy "allow_insert_students" on public.students for insert with check (true);
create policy "allow_update_students" on public.students for update using (true);
create policy "allow_delete_students" on public.students for delete using (true);

-- Attendance logs: fully open
create policy "allow_select_attendance" on public.attendance_logs for select using (true);
create policy "allow_insert_attendance" on public.attendance_logs for insert with check (true);
create policy "allow_delete_attendance" on public.attendance_logs for delete using (true);

-- Demo requests: open insert + select
create policy "allow_insert_demo"  on public.demo_requests for insert with check (true);
create policy "allow_select_demo"  on public.demo_requests for select using (true);

-- Contact messages: open insert + select
create policy "allow_insert_contact" on public.contact_messages for insert with check (true);
create policy "allow_select_contact" on public.contact_messages for select using (true);
create policy "allow_update_contact" on public.contact_messages for update using (true);

-- Realtime
alter publication supabase_realtime add table public.attendance_logs;
alter publication supabase_realtime add table public.students;

-- Seed sample students
insert into public.students (student_id, name, department, year_level, email) values
  ('2021-0001','Juan D. Santos',   'BSMT',   '3rd Year','juan.santos@npcmst.edu.ph'),
  ('2021-0002','Maria R. Cruz',    'BSCS',   '2nd Year','maria.cruz@npcmst.edu.ph'),
  ('2021-0003','Carlo M. Reyes',   'BSMT',   '3rd Year','carlo.reyes@npcmst.edu.ph'),
  ('2021-0004','Ana P. Lim',       'BSIT',   '2nd Year','ana.lim@npcmst.edu.ph'),
  ('2021-0005','Jose B. Garcia',   'BSMar.E','4th Year','jose.garcia@npcmst.edu.ph'),
  ('2021-0006','Liza T. Ramos',    'BSECE',  '1st Year','liza.ramos@npcmst.edu.ph'),
  ('2021-0007','Mark A. Dela Cruz','BSCS',   '2nd Year','mark.delacruz@npcmst.edu.ph'),
  ('2021-0008','Rosa M. Valdez',   'BSMT',   '1st Year','rosa.valdez@npcmst.edu.ph')
on conflict (student_id) do nothing;

-- Seed sample attendance
insert into public.attendance_logs (student_id, status, confidence, subject) values
  ('2021-0001','Present',98.5,'Marine Engineering'),
  ('2021-0002','Present',97.2,'Data Structures'),
  ('2021-0003','Late',   96.1,'Marine Engineering'),
  ('2021-0004','Present',99.0,'Web Development'),
  ('2021-0005','Present',95.3,'Ship Operations'),
  ('2021-0006','Absent', 0,   'Circuit Theory'),
  ('2021-0007','Present',98.1,'Data Structures'),
  ('2021-0008','Late',   94.7,'Marine Engineering')
on conflict do nothing;
