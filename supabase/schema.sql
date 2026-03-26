-- ============================================================
-- NPCMST AttendAI — Full Schema (run in Supabase SQL Editor)
-- ============================================================

-- ── Students ────────────────────────────────────────────────
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

-- ── Attendance logs ─────────────────────────────────────────
create table if not exists public.attendance_logs (
  id         uuid primary key default gen_random_uuid(),
  student_id text not null references public.students(student_id) on delete cascade,
  status     text not null check (status in ('Present','Late','Absent')),
  confidence numeric(5,2) not null default 0,
  logged_at  timestamptz not null default now(),
  subject    text,
  faculty_id text
);

-- ── Demo requests ────────────────────────────────────────────
create table if not exists public.demo_requests (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  role       text not null,
  department text not null,
  message    text,
  created_at timestamptz not null default now()
);

-- ── Contact messages ─────────────────────────────────────────
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text not null,
  message    text not null,
  created_at timestamptz not null default now(),
  is_read    boolean not null default false
);

-- ── Admin profiles (linked to Supabase Auth) ─────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  role       text not null default 'admin' check (role in ('admin','faculty')),
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── RLS ──────────────────────────────────────────────────────
alter table public.students          enable row level security;
alter table public.attendance_logs   enable row level security;
alter table public.demo_requests     enable row level security;
alter table public.contact_messages  enable row level security;
alter table public.profiles          enable row level security;

-- Drop old policies if re-running
drop policy if exists "Public read students"        on public.students;
drop policy if exists "Public read attendance"      on public.attendance_logs;
drop policy if exists "Public insert attendance"    on public.attendance_logs;
drop policy if exists "Public insert demo_requests" on public.demo_requests;
drop policy if exists "Public insert contact"       on public.contact_messages;

-- Students: public read AND insert, admin update/delete
create policy "Public read students"   on public.students for select using (true);
create policy "Public insert students" on public.students for insert with check (true);
create policy "Admin update students"  on public.students for update
  using (auth.role() = 'authenticated');
create policy "Admin delete students"  on public.students for delete
  using (auth.role() = 'authenticated');

-- Attendance: public read/insert (camera logs), admin full
create policy "Public read attendance"   on public.attendance_logs for select using (true);
create policy "Public insert attendance" on public.attendance_logs for insert with check (true);
create policy "Admin delete attendance"  on public.attendance_logs for delete
  using (auth.role() = 'authenticated');

-- Demo requests: public insert, admin read
create policy "Public insert demo_requests" on public.demo_requests for insert with check (true);
create policy "Admin read demo_requests"    on public.demo_requests for select
  using (auth.role() = 'authenticated');

-- Contact messages: public insert, admin read/update
create policy "Public insert contact"  on public.contact_messages for insert with check (true);
create policy "Admin read contact"     on public.contact_messages for select
  using (auth.role() = 'authenticated');
create policy "Admin update contact"   on public.contact_messages for update
  using (auth.role() = 'authenticated');

-- Profiles: owner read/update
create policy "Own profile"  on public.profiles for select using (auth.uid() = id);
create policy "Own update"   on public.profiles for update using (auth.uid() = id);

-- ── Realtime ─────────────────────────────────────────────────
alter publication supabase_realtime add table public.attendance_logs;
alter publication supabase_realtime add table public.students;

-- ── Seed students ────────────────────────────────────────────
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

-- ── Seed attendance ──────────────────────────────────────────
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
