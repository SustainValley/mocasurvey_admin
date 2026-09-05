-- CAFE MOCA 운영진 사이트용 확장
-- 운영진 페이지는 상태 조회 전용으로 사용합니다.

create table if not exists public.moca_admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text not null default '',
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.moca_admin_profiles enable row level security;

create or replace function public.is_moca_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.moca_admin_profiles
    where user_id = auth.uid() and enabled = true
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
  select * into v_profile from public.moca_admin_profiles
  where user_id = auth.uid() and enabled = true;
  if not found then return jsonb_build_object('isAdmin', false); end if;
  return jsonb_build_object('isAdmin', true, 'username', v_profile.username, 'displayName', v_profile.display_name);
end;
$$;

create or replace function public.moca_admin_lookup_participant_v2(p_student_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.moca_survey_participants%rowtype;
  v_lucky public.lucky_draw_student_results%rowtype;
begin
  if not public.is_moca_admin() then raise exception 'admin permission required'; end if;
  select * into v_row from public.moca_survey_participants where student_id = trim(p_student_id);
  if not found then return jsonb_build_object('status','not_found'); end if;
  select * into v_lucky from public.lucky_draw_student_results where student_id = v_row.student_id;
  return jsonb_build_object(
    'status','found',
    'id',v_row.id,
    'studentId',v_row.student_id,
    'name',v_row.name,
    'department',v_row.department,
    'surveyStatus',v_row.status,
    'primaryType',v_row.primary_type,
    'secondaryType',v_row.secondary_type,
    'completedAt',v_row.completed_at,
    'offlineParticipatedAt',v_row.offline_participated_at,
    'luckyDrawParticipated', v_lucky.id is not null,
    'luckyDrawnAt', v_lucky.drawn_at,
    'prizeRank', v_lucky.prize_rank,
    'prizeName', v_lucky.prize_name
  );
end;
$$;

create or replace function public.moca_admin_list_participants_v2(p_query text default '')
returns table (
  student_id text,
  name text,
  department text,
  primary_type text,
  survey_status text,
  completed_at timestamptz,
  offline_participated_at timestamptz,
  lucky_draw_participated boolean,
  lucky_drawn_at timestamptz,
  prize_rank smallint,
  prize_name text
)
language sql
security definer
set search_path = public
as $$
  select p.student_id, p.name, p.department, p.primary_type, p.status,
         p.completed_at, p.offline_participated_at,
         (l.id is not null), l.drawn_at, l.prize_rank, l.prize_name
  from public.moca_survey_participants p
  left join public.lucky_draw_student_results l on l.student_id = p.student_id
  where public.is_moca_admin()
    and (
      nullif(trim(p_query), '') is null
      or p.student_id ilike '%' || trim(p_query) || '%'
      or p.name ilike '%' || trim(p_query) || '%'
    )
  order by p.completed_at desc nulls last, p.started_at desc
  limit 500;
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
  if not public.is_moca_admin() then raise exception 'admin permission required'; end if;
  select count(*) filter (where status='completed'),
         count(*) filter (where offline_participated_at is not null),
         count(*) filter (where status='in_progress')
  into v_completed, v_offline, v_in_progress
  from public.moca_survey_participants;
  select primary_type, count(*)::integer into v_top_type, v_top_type_count
  from public.moca_survey_participants
  where status='completed' and primary_type is not null
  group by primary_type order by count(*) desc limit 1;
  return jsonb_build_object(
    'completed', coalesce(v_completed,0),
    'offline', coalesce(v_offline,0),
    'inProgress', coalesce(v_in_progress,0),
    'conversionRate', case when coalesce(v_completed,0)=0 then 0 else round((v_offline::numeric / v_completed::numeric) * 100, 1) end,
    'target', 200,
    'remaining', greatest(200 - coalesce(v_offline,0), 0),
    'topType', v_top_type,
    'topTypeCount', coalesce(v_top_type_count,0)
  );
end;
$$;

revoke all on function public.is_moca_admin() from public;
revoke all on function public.moca_admin_me() from public;
revoke all on function public.moca_admin_lookup_participant_v2(text) from public;
revoke all on function public.moca_admin_list_participants_v2(text) from public;
revoke all on function public.moca_admin_dashboard_stats() from public;

grant execute on function public.is_moca_admin() to authenticated;
grant execute on function public.moca_admin_me() to authenticated;
grant execute on function public.moca_admin_lookup_participant_v2(text) to authenticated;
grant execute on function public.moca_admin_list_participants_v2(text) to authenticated;
grant execute on function public.moca_admin_dashboard_stats() to authenticated;
