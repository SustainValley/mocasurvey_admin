import { useEffect, useMemo, useState } from 'react'
import { getAdminSession, getEventAnalytics } from './adminStore'
import { supabase } from './supabase'

const EVENT_LABELS = {
  survey_entry: '사이트 진입',
  start_cta_click: '시작 CTA 클릭',
  mobile_id_selected: '열람증 이미지 선택',
  ocr_success: '열람증 인식 성공',
  ocr_failed: '열람증 인식 실패',
  identity_confirm_cta_click: '정보 확인 CTA',
  survey_started: '설문 시작',
  part1_completed: 'STEP 1 완료',
  part2_completed: 'STEP 2 완료',
  step3_started: 'STEP 3 진입',
  step3_rank_completed: 'TOP 3 선택 완료',
  step3_compare_started: '비교 선택 시작',
  submit_cta_click: '제출 CTA 클릭',
  survey_submit_success: '설문 제출 완료',
  offline_guide_cta_click: '오프라인 안내 CTA',
  page_view: '화면 진입',
}

const PAGE_LABELS = {
  start: '시작',
  upload: '열람증 업로드',
  mobileId: '열람증 업로드',
  review: '정보 확인',
  part1: 'STEP 1',
  part2: 'STEP 2',
  step3Loading: 'STEP 3 연결',
  step3Rank: 'TOP 3 선택',
  step3Modal: '비교 안내',
  step3Compare: '비교 선택',
  resultLoading: '결과 분석',
  result: '결과',
  offlineGuide: '오프라인 안내',
}

const FUNNEL = [
  ['survey_entry', '진입'],
  ['start_cta_click', '시작 CTA'],
  ['survey_started', '설문 시작'],
  ['part1_completed', 'STEP 1 완료'],
  ['part2_completed', 'STEP 2 완료'],
  ['step3_started', 'STEP 3 진입'],
  ['step3_rank_completed', 'TOP 3 완료'],
  ['submit_cta_click', '제출 CTA'],
  ['survey_submit_success', '제출 완료'],
]

function formatKstTime(value) {
  if (!value) return '-'
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date(value))
  } catch {
    return '-'
  }
}

function percent(numerator, denominator) {
  if (!denominator) return 0
  return Math.round((numerator / denominator) * 1000) / 10
}

export default function EventAnalyticsPanel() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [open, setOpen] = useState(false)
  const [period, setPeriod] = useState('all')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const checkAdmin = async () => {
      try {
        const session = await getAdminSession()
        if (active) setIsAdmin(Boolean(session))
      } catch {
        if (active) setIsAdmin(false)
      }
    }

    checkAdmin()

    const listener = supabase?.auth.onAuthStateChange(() => {
      window.setTimeout(checkAdmin, 0)
    })

    return () => {
      active = false
      listener?.data?.subscription?.unsubscribe()
    }
  }, [])

  const load = async (selectedPeriod = period, silent = false) => {
    if (!isAdmin) return
    if (!silent) setLoading(true)
    setError('')
    try {
      const next = await getEventAnalytics(selectedPeriod)
      setData(next)
    } catch (err) {
      setError(err?.message || '이벤트 로그를 불러오지 못했어요.')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAdmin) {
      setOpen(false)
      setData(null)
      return undefined
    }

    load(period)
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, period])

  useEffect(() => {
    if (!isAdmin || !open) return undefined
    const timer = window.setInterval(() => load(period, true), 20000)
    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, open, period])

  const eventCount = (name) => Number(data?.events?.[name]?.sessions || 0)
  const entryCount = eventCount('survey_entry')
  const startCount = eventCount('start_cta_click')
  const submitCount = eventCount('survey_submit_success')
  const submitClickCount = eventCount('submit_cta_click')

  const funnel = useMemo(
    () => FUNNEL.map(([eventName, label]) => ({ eventName, label, count: eventCount(eventName) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data],
  )

  if (!isAdmin) return null

  return (
    <>
      <button
        type="button"
        className={`moca-event-fab ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span>LIVE</span>
        <strong>유입·전환</strong>
        {entryCount > 0 && <b>{entryCount}</b>}
      </button>

      {open && <button type="button" className="moca-event-backdrop" aria-label="로그 패널 닫기" onClick={() => setOpen(false)} />}

      <aside className={`moca-event-drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <header className="moca-event-head">
          <div>
            <span>CAFE MOCA · LIVE</span>
            <h2>유입 · 전환 로그</h2>
            <p>설문 진입부터 제출까지 운영 중 실시간으로 확인해요.</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="닫기">×</button>
        </header>

        <div className="moca-event-toolbar">
          <div className="moca-event-period" role="group" aria-label="조회 기간">
            <button type="button" className={period === 'all' ? 'is-active' : ''} onClick={() => setPeriod('all')}>전체</button>
            <button type="button" className={period === 'today' ? 'is-active' : ''} onClick={() => setPeriod('today')}>오늘</button>
          </div>
          <button type="button" className="moca-event-refresh" onClick={() => load(period)} disabled={loading}>
            {loading ? '불러오는 중' : '새로고침'}
          </button>
        </div>

        {error && <p className="moca-event-error">{error}</p>}

        <section className="moca-event-kpis" aria-label="유입 전환 핵심 지표">
          <article><span>진입</span><strong>{entryCount}</strong><b>세션</b></article>
          <article><span>시작 CTA</span><strong>{startCount}</strong><b>{percent(startCount, entryCount)}%</b></article>
          <article><span>제출 CTA</span><strong>{submitClickCount}</strong><b>{percent(submitClickCount, entryCount)}%</b></article>
          <article className="is-primary"><span>제출 완료</span><strong>{submitCount}</strong><b>{percent(submitCount, entryCount)}%</b></article>
        </section>

        <section className="moca-event-section">
          <div className="moca-event-section-head">
            <div><span>01</span><h3>설문 퍼널</h3></div>
            <p>각 단계까지 도달한 고유 세션 수</p>
          </div>

          <div className="moca-event-funnel">
            {funnel.map((stage, index) => {
              const previous = index === 0 ? stage.count : funnel[index - 1].count
              const width = entryCount ? Math.max((stage.count / entryCount) * 100, stage.count ? 4 : 0) : 0
              return (
                <div className="moca-event-funnel-row" key={stage.eventName}>
                  <div className="moca-event-funnel-meta">
                    <span>{stage.label}</span>
                    <strong>{stage.count}</strong>
                    <b>{index === 0 ? '100%' : `${percent(stage.count, previous)}%`}</b>
                  </div>
                  <div className="moca-event-funnel-track"><i style={{ width: `${Math.min(width, 100)}%` }} /></div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="moca-event-section">
          <div className="moca-event-section-head">
            <div><span>02</span><h3>화면별 도달</h3></div>
            <p>page_view 기준 고유 세션</p>
          </div>
          <div className="moca-event-pages">
            {(data?.pages || []).length === 0 && <p className="moca-event-empty">아직 화면 진입 로그가 없어요.</p>}
            {(data?.pages || []).map((item) => (
              <div key={item.page}>
                <span>{PAGE_LABELS[item.page] || item.page || '알 수 없음'}</span>
                <strong>{item.sessions}명</strong>
                <b>{item.views}회</b>
              </div>
            ))}
          </div>
        </section>

        <section className="moca-event-section moca-event-recent-section">
          <div className="moca-event-section-head">
            <div><span>03</span><h3>최근 이벤트</h3></div>
            <p>최대 80건 · 20초 자동 갱신</p>
          </div>

          <div className="moca-event-summary-line">
            <span>고유 세션 <strong>{data?.uniqueSessions || 0}</strong></span>
            <span>학번 확인 세션 <strong>{data?.identifiedSessions || 0}</strong></span>
            <span>전체 이벤트 <strong>{data?.totalEvents || 0}</strong></span>
          </div>

          <div className="moca-event-list">
            {(data?.recentEvents || []).length === 0 && <p className="moca-event-empty">아직 수집된 이벤트가 없어요.</p>}
            {(data?.recentEvents || []).map((event) => (
              <article key={event.id} className="moca-event-log-row">
                <time>{formatKstTime(event.createdAt)}</time>
                <div>
                  <strong>{EVENT_LABELS[event.eventName] || event.eventName}</strong>
                  <span>{event.page ? PAGE_LABELS[event.page] || event.page : '페이지 정보 없음'}</span>
                </div>
                <b>{event.studentId ? `#${event.studentId}` : `S ${String(event.sessionId || '').slice(0, 8)}`}</b>
              </article>
            ))}
          </div>
        </section>
      </aside>
    </>
  )
}
