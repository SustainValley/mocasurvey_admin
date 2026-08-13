\
-- CAFE MOCA 운영진 사이트용 확장
-- 기존 온라인 설문 schema.sql을 실행한 SAME Supabase 프로젝트에서 실행하세요.

create table if not exists public.moca_admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text not null default '',
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.moca_admin_profiles enable row level security;
-- 클라이언트 직접 조회 정책은 만들지 않습니다. 모든 접근은 관리자 RPC로 제한합니다.

create or replace function public.is_moca_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.moca_admin_profiles
    where user_id = auth.uid()
      and enabled = true
  );
$$;

create or replace function public.moca_admin_me()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.moca_admin_profiles%rowtype;
begin
  select * into v_profile
  from public.moca_admin_profiles
  where user_id = auth.uid()
    and enabled = true;

  if not found then
    return jsonb_build_object('isAdmin', false);
  end if;

  return jsonb_build_object(
    'isAdmin', true,
    'username', v_profile.username,
    'displayName', v_profile.display_name
  );
end;
$$;

create or replace function public.moca_admin_lookup_participant(p_student_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.moca_survey_participants%rowtype;
begin
  if not public.is_moca_admin() then
    raise exception 'admin permission required';
  end if;

  select * into v_row
  from public.moca_survey_participants
  where student_id = trim(p_student_id);

  if not found then
    return jsonb_build_object('status','not_found');
  end if;

  return jsonb_build_object(
    'status','found',
    'id',v_row.id,
    'studentId',v_row.student_id,
    'name',v_row.name,
    'department',v_row.department,
    'surveyStatus',v_row.status,
    'primaryType',v_row.primary_type,
    'secondaryType',v_row.secondary_type,
    'result',v_row.result,
    'completedAt',v_row.completed_at,
    'offlineParticipatedAt',v_row.offline_participated_at
  );
end;
$$;

create or replace function public.moca_admin_list_participants(p_query text default '')
returns table (
  student_id text,
  name text,
  department text,
  primary_type text,
  survey_status text,
  completed_at timestamptz,
  offline_participated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    p.student_id,
    p.name,
    p.department,
    p.primary_type,
    p.status,
    p.completed_at,
    p.offline_participated_at
  from public.moca_survey_participants p
  where public.is_moca_admin()
    and (
      nullif(trim(p_query), '') is null
      or p.student_id ilike '%' || trim(p_query) || '%'
      or p.name ilike '%' || trim(p_query) || '%'
    )
  order by p.completed_at desc nulls last, p.started_at desc
  limit 500;
$$;

create or replace function public.moca_admin_mark_offline(p_student_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.moca_survey_participants%rowtype;
begin
  if not public.is_moca_admin() then
    raise exception 'admin permission required';
  end if;

  select * into v_row
  from public.moca_survey_participants
  where student_id = trim(p_student_id)
  for update;

  if not found then return jsonb_build_object('status','not_found'); end if;
  if v_row.status <> 'completed' then return jsonb_build_object('status','not_completed'); end if;
  if v_row.offline_participated_at is not null then
    return jsonb_build_object(
      'status','already_participated',
      'offlineParticipatedAt',v_row.offline_participated_at
    );
  end if;

  update public.moca_survey_participants
  set offline_participated_at = now(), updated_at = now()
  where id = v_row.id;

  return jsonb_build_object('status','marked','offlineParticipatedAt',now());
end;
$$;

create or replace function public.moca_admin_cancel_offline(p_student_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.moca_survey_participants%rowtype;
begin
  if not public.is_moca_admin() then
    raise exception 'admin permission required';
  end if;

  select * into v_row
  from public.moca_survey_participants
  where student_id = trim(p_student_id)
  for update;

  if not found then return jsonb_build_object('status','not_found'); end if;

  update public.moca_survey_participants
  set offline_participated_at = null, updated_at = now()
  where id = v_row.id;

  return jsonb_build_object('status','cancelled');
end;
$$;

create or replace function public.moca_admin_dashboard_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_completed integer;
  v_offline integer;
  v_in_progress integer;
  v_top_type text;
  v_top_type_count integer;
begin
  if not public.is_moca_admin() then
    raise exception 'admin permission required';
  end if;

  select count(*) filter (where status='completed'),
         count(*) filter (where offline_participated_at is not null),
         count(*) filter (where status='in_progress')
  into v_completed, v_offline, v_in_progress
  from public.moca_survey_participants;

  select primary_type, count(*)::integer
  into v_top_type, v_top_type_count
  from public.moca_survey_participants
  where status='completed' and primary_type is not null
  group by primary_type
  order by count(*) desc
  limit 1;

  return jsonb_build_object(
    'completed', coalesce(v_completed,0),
    'offline', coalesce(v_offline,0),
    'inProgress', coalesce(v_in_progress,0),
    'conversionRate',
      case when coalesce(v_completed,0)=0 then 0
           else round((v_offline::numeric / v_completed::numeric) * 100, 1)
      end,
    'target', 200,
    'remaining', greatest(200 - coalesce(v_offline,0), 0),
    'topType', v_top_type,
    'topTypeCount', coalesce(v_top_type_count,0)
  );
end;
$$;

revoke all on function public.is_moca_admin() from public;
revoke all on function public.moca_admin_me() from public;
revoke all on function public.moca_admin_lookup_participant(text) from public;
revoke all on function public.moca_admin_list_participants(text) from public;
revoke all on function public.moca_admin_mark_offline(text) from public;
revoke all on function public.moca_admin_cancel_offline(text) from public;
revoke all on function public.moca_admin_dashboard_stats() from public;

grant execute on function public.is_moca_admin() to authenticated;
grant execute on function public.moca_admin_me() to authenticated;
grant execute on function public.moca_admin_lookup_participant(text) to authenticated;
grant execute on function public.moca_admin_list_participants(text) to authenticated;
grant execute on function public.moca_admin_mark_offline(text) to authenticated;
grant execute on function public.moca_admin_cancel_offline(text) to authenticated;
grant execute on function public.moca_admin_dashboard_stats() to authenticated;

-- ------------------------------------------------------------
-- 운영진 계정 등록 순서
-- 1) Supabase Dashboard > Authentication > Users에서
--    moca_admin@moca.local 계정과 비밀번호를 생성
-- 2) 생성된 사용자의 UUID를 복사
-- 3) 아래 USER_UUID만 교체해서 실행
--
-- insert into public.moca_admin_profiles(user_id, username, display_name)
-- values ('USER_UUID'::uuid, 'moca_admin', 'MOCA 운영진')
-- on conflict (user_id) do update
-- set username=excluded.username,
--     display_name=excluded.display_name,
--     enabled=true;
