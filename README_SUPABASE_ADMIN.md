# CAFE MOCA 운영진 사이트 — 온라인 설문 Supabase 연동

이 운영진 사이트는 업로드한 온라인 설문 프로젝트와 **같은 Supabase 프로젝트**를 사용하도록 연결되어 있습니다.

## 1. 기존 온라인 설문 Supabase에 관리자 SQL 추가

Supabase Dashboard → SQL Editor에서:

`supabase/admin_extension.sql`

전체를 실행합니다.

## 2. 운영진 로그인 계정 생성

Supabase Dashboard → Authentication → Users → Add user에서 예:

- Email: `moca_admin@moca.local`
- Password: 원하는 운영진 비밀번호

계정을 만든 뒤 해당 User UUID를 복사합니다.

그 다음 SQL Editor에서:

```sql
insert into public.moca_admin_profiles(user_id, username, display_name)
values ('여기에_USER_UUID'::uuid, 'moca_admin', 'MOCA 운영진')
on conflict (user_id) do update
set username=excluded.username,
    display_name=excluded.display_name,
    enabled=true;
```

운영진 웹에서는:
- 아이디: `moca_admin`
- 비밀번호: 위에서 만든 비밀번호

로 로그인합니다. 내부적으로 `moca_admin@moca.local`로 로그인합니다.

## 3. 온라인 설문과 동일한 환경변수 복사

온라인 설문의 실제 `.env`에 사용 중인 값을 운영진 프로젝트의 `.env`에도 동일하게 넣습니다.

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

**service_role 키는 절대 프론트에 넣지 마세요.**

## 4. 연결되는 기존 데이터

- `moca_survey_participants.student_id`
- `name`
- `department`
- `status`
- `primary_type`
- `secondary_type`
- `result`
- `completed_at`
- `offline_participated_at`

운영진에서 오프라인 완료를 누르면 같은 학생 레코드의 `offline_participated_at`이 기록됩니다.

## 5. 현재 실데이터 연결 화면

- 운영진 로그인
- 대시보드 온라인/오프라인 인원 및 전환율
- 부스 참여 학번 조회
- 오프라인 완료 / 취소
- 참여자 목록 및 검색
- 협찬 재고(오프라인 완료 인원 기준)
- 성과 보기

행사 진행표는 운영 가이드 UI이므로 DB와 무관하게 그대로 동작합니다.
