-- CAFE MOCA 운영진 이벤트 로그 분석 RPC
-- moca_survey_events 테이블과 is_moca_admin() 함수가 있는 같은 Supabase 프로젝트에서 실행합니다.

create or replace function public.moca_admin_event_analytics(p_period text default 'all')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_since timestamptz;
  v_events jsonb := '{}'::jsonb;
  v_pages jsonb := '[]'::jsonb;
  v_recent jsonb := '[]'::jsonb;
  v_unique_sessions integer := 0;
  v_total_events integer := 0;
  v_identified_sessions integer := 0;
begin
  if not public.is_moca_admin() then
    raise exception 'admin permission required';
  end if;

  if coalesce(p_period, 'all') = 'today' then
    v_since := date_trunc('day', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul';
  else
    v_since := null;
  end if;

  with filtered as (
    select * from public.moca_survey_events
    where v_since is null or created_at >= v_since
  ), grouped as (
    select event_name,
           count(*)::integer as event_count,
           count(distinct session_id)::integer as session_count
    from filtered
    group by event_name
  )
  select coalesce(
    jsonb_object_agg(event_name, jsonb_build_object('events', event_count, 'sessions', session_count)),
    '{}'::jsonb
  ) into v_events
  from grouped;

  with filtered as (
    select * from public.moca_survey_events
    where (v_since is null or created_at >= v_since)
      and event_name = 'page_view'
      and page is not null
  ), grouped as (
    select page,
           count(*)::integer as views,
           count(distinct session_id)::integer as sessions
    from filtered
    group by page
    order by count(distinct session_id) desc, count(*) desc
  )
  select coalesce(
    jsonb_agg(jsonb_build_object('page', page, 'views', views, 'sessions', sessions)),
    '[]'::jsonb
  ) into v_pages
  from grouped;

  with filtered as (
    select * from public.moca_survey_events
    where v_since is null or created_at >= v_since
  )
  select count(distinct session_id)::integer,
         count(*)::integer,
         count(distinct session_id) filter (where student_id is not null)::integer
  into v_unique_sessions, v_total_events, v_identified_sessions
  from filtered;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', e.id,
        'createdAt', e.created_at,
        'sessionId', e.session_id,
        'studentId', e.student_id,
        'eventName', e.event_name,
        'page', e.page,
        'properties', e.properties
      ) order by e.created_at desc
    ),
    '[]'::jsonb
  ) into v_recent
  from (
    select * from public.moca_survey_events
    where v_since is null or created_at >= v_since
    order by created_at desc
    limit 80
  ) e;

  return jsonb_build_object(
    'period', coalesce(p_period, 'all'),
    'since', v_since,
    'uniqueSessions', coalesce(v_unique_sessions, 0),
    'identifiedSessions', coalesce(v_identified_sessions, 0),
    'totalEvents', coalesce(v_total_events, 0),
    'events', v_events,
    'pages', v_pages,
    'recentEvents', v_recent,
    'generatedAt', now()
  );
end;
$$;

revoke all on function public.moca_admin_event_analytics(text) from public;
grant execute on function public.moca_admin_event_analytics(text) to authenticated;
