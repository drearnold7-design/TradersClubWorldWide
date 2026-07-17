-- ============================================================
-- COURSE PLATFORM EXTENSIONS — Phase 7
-- Adds: bookmarks, certificates
-- (courses/lessons/enrollments/progress already exist from Phase 1)
-- ============================================================

create table lesson_bookmarks (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) not null,
  lesson_id uuid references lessons(id) not null,
  note text,
  created_at timestamptz not null default now(),
  unique (profile_id, lesson_id)
);

create table certificates (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) not null,
  course_id uuid references courses(id) not null,
  issued_at timestamptz not null default now(),
  certificate_number text unique not null,
  unique (profile_id, course_id)
);

alter table lesson_bookmarks enable row level security;
alter table certificates enable row level security;

create policy "bookmarks_own" on lesson_bookmarks for all
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "certificates_own_read" on certificates for select
  using (profile_id = auth.uid() or is_staff());

-- Auto-issue a certificate when every lesson in a course is marked complete
create or replace function check_course_completion()
returns trigger as $$
declare
  total_lessons int;
  completed_lessons int;
  cert_number text;
begin
  select count(*) into total_lessons from lessons where course_id = (
    select course_id from lessons where id = new.lesson_id
  );

  select count(*) into completed_lessons
  from lesson_progress lp
  join lessons l on l.id = lp.lesson_id
  where lp.profile_id = new.profile_id
    and l.course_id = (select course_id from lessons where id = new.lesson_id)
    and lp.is_complete = true;

  if completed_lessons >= total_lessons and total_lessons > 0 then
    cert_number := 'TCW-' || upper(substr(md5(random()::text), 1, 8));
    insert into certificates (profile_id, course_id, certificate_number)
    values (
      new.profile_id,
      (select course_id from lessons where id = new.lesson_id),
      cert_number
    )
    on conflict (profile_id, course_id) do nothing;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_check_completion
  after insert or update on lesson_progress
  for each row execute function check_course_completion();
