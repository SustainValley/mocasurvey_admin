import { useEffect, useState } from 'react'
import {
  getAdminSession,
  getDashboardStats,
  listParticipants,
  loginAdmin,
  lookupParticipant,
} from './adminStore'

const FIGMA_LOGO_URL = 'https://www.figma.com/api/mcp/asset/69c701a6-3bb3-4c94-be23-cd34f1da9a7a.svg'
const navItems = ['대시보드', '부스 참여', '참여자', '협찬 재고', '행사 진행표', '성과 보기']

function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ id: '', password: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.id.trim() || !form.password.trim()) {
      setMessage('아이디와 비밀번호를 모두 입력해주세요.')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const admin = await loginAdmin(form.id, form.password)
      onLogin(admin)
    } catch (error) {
      setMessage(error?.message || '로그인에 실패했어요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="brand-panel" aria-label="CAFE MOCA 브랜드 영역">
        <div className="brand-content">
          <div className="logo-card"><img src={FIGMA_LOGO_URL} alt="CAFE MOCA 로고" className="moca-logo" /></div>
          <div className="brand-copy"><h1>CAFE MOCA</h1><p className="operator-label">POP-UP OPERATOR</p><p className="operator-note">운영진 전용 페이지</p></div>
        </div>
      </section>
      <section className="form-panel">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-heading"><h2>운영진 로그인</h2><p>Supabase에 등록된 운영진 계정으로 접속해주세요.</p></div>
          <label className="field"><span>아이디</span><input type="text" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="예: moca_admin" autoComplete="username" /></label>
          <label className="field"><span>비밀번호</span><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" autoComplete="current-password" /></label>
          <button className="login-button" type="submit" disabled={loading}><span>{loading ? '로그인 중...' : '운영진 로그인'}</span></button>
          <p className="account-note">CAFE MOCA 운영진 계정만 이용할 수 있어요.</p>
          {message && <p className="status-message" role="status">{message}</p>}
        </form>
      </section>
    </main>
  )
}

function Sidebar({ active, onNavigate }) {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand"><strong>CAFE MOCA</strong><span>POPUP ADMIN</span></div>
      <nav className="sidebar-nav" aria-label="운영진 메뉴">
        {navItems.map((item) => <button key={item} type="button" className={`sidebar-item ${item === active ? 'is-active' : ''}`} onClick={() => onNavigate(item)}>{item}</button>)}
      </nav>
    </aside>
  )
}

function MetricCard({ label, value }) { return <article className="metric-card"><p>{label}</p><strong>{value}</strong></article> }

function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({ completed: 0, offline: 0, conversionRate: 0, target: 200, remaining: 200, topType: '-', topTypeCount: 0 })
  const [error, setError] = useState('')
  useEffect(() => { getDashboardStats().then(setStats).catch((err) => setError(err.message)) }, [])
  const onlinePct = Math.min((stats.completed / Math.max(stats.target, 1)) * 100, 100)
  const offlinePct = Math.min((stats.offline / Math.max(stats.target, 1)) * 100, 100)
  return (
    <div className="admin-shell"><Sidebar active="대시보드" onNavigate={onNavigate} />
      <main className="dashboard-main">
        <header className="dashboard-heading"><h1>오늘 운영 현황</h1><p>온라인 설문과 오프라인 체험 DB를 실시간으로 확인해요.</p></header>
        {error && <p className="db-error">{error}</p>}
        <section className="metric-grid"><MetricCard label="온라인 참여자" value={`${stats.completed}명`} /><MetricCard label="오프라인 완료" value={`${stats.offline}명`} /><MetricCard label="전환율" value={`${stats.conversionRate ?? 0}%`} /><MetricCard label="남은 제공 가능" value={`${stats.remaining}명분`} /></section>
        <section className="dashboard-grid dashboard-grid-top">
          <article className="panel flow-card"><h3>실시간 참여 흐름</h3>
            <div className="flow-row"><div className="flow-meta"><span>온라인 설문 완료</span><strong>{stats.completed} / {stats.target}</strong></div><div className="progress-track"><div className="progress-fill online" style={{ width: `${onlinePct}%` }} /></div></div>
            <div className="flow-row"><div className="flow-meta"><span>오프라인 자동 완료</span><strong>{stats.offline} / {stats.target}</strong></div><div className="progress-track"><div className="progress-fill offline" style={{ width: `${offlinePct}%` }} /></div></div>
          </article>
          <article className="panel memo-card"><h3>운영 원칙</h3><ul><li>학번 조회 후 온라인 완료 여부 확인</li><li>유형 확인 후 영수증 안내</li><li>오프라인 완료는 체험 사이트에서 자동 기록</li></ul><button type="button" className="pink-action small" onClick={() => onNavigate('부스 참여')}><span>학번 조회 열기</span></button></article>
        </section>
      </main>
    </div>
  )
}

function StatusBadge({ ok, yes, no }) { return <span className={`badge ${ok ? 'badge-green' : 'badge-pink'}`}>{ok ? yes : no}</span> }
function formatTime(value) { if (!value) return '-'; try { return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Seoul' }).format(new Date(value)) } catch { return '-' } }

function BoothPage({ onNavigate }) {
  const [studentId, setStudentId] = useState('')
  const [participant, setParticipant] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const lookup = async () => {
    if (!studentId.trim()) return
    setLoading(true); setMessage('')
    try {
      const data = await lookupParticipant(studentId)
      if (!data || data.status === 'not_found') { setParticipant(null); setMessage('해당 학번의 온라인 설문 기록을 찾지 못했어요.'); return }
      setParticipant(data)
    } catch (error) { setMessage(error.message) } finally { setLoading(false) }
  }
  const onlineComplete = participant?.surveyStatus === 'completed'
  const offlineComplete = Boolean(participant?.offlineParticipatedAt)
  const luckyComplete = Boolean(participant?.luckyDrawParticipated)
  return (
    <div className="admin-shell"><Sidebar active="부스 참여" onNavigate={onNavigate} />
      <main className="participants-main">
        <header className="participants-heading"><h1>학번 조회</h1><p>운영진은 상태만 확인해요. 오프라인 완료는 체험 종료 시 자동으로 저장됩니다.</p></header>
        <section className="participant-search"><input value={studentId} onChange={(e) => setStudentId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && lookup()} placeholder="학번 입력" /><button type="button" onClick={lookup} disabled={loading}>{loading ? '조회 중...' : '참여자 조회'}</button></section>
        {message && <p className="db-message">{message}</p>}
        <section className={`booth-card participant-card ${participant ? '' : 'is-empty'}`}>
          <h2>참여자 상태</h2>
          {participant ? <>
            <div className="participant-top"><strong>{participant.name || '이름 없음'}</strong><StatusBadge ok={onlineComplete} yes="온라인 완료" no="온라인 미완료" /><StatusBadge ok={offlineComplete} yes="오프라인 완료" no="오프라인 미완료" /><StatusBadge ok={luckyComplete} yes="럭키드로우 완료" no="럭키드로우 전" /></div>
            <p className="participant-meta">{participant.studentId} · {participant.department || '학과 미입력'}</p>
            <div className="result-row"><strong>유형&nbsp;&nbsp;{participant.primaryType || '결과 없음'}</strong><strong>온라인 완료 시각&nbsp;&nbsp;{formatTime(participant.completedAt)}</strong></div>
            <div className="result-row"><strong>오프라인 완료 시각&nbsp;&nbsp;{formatTime(participant.offlineParticipatedAt)}</strong><strong>럭키드로우&nbsp;&nbsp;{luckyComplete ? `${participant.prizeRank || '-'}등 · ${participant.prizeName || '상품 기록 있음'}` : '참여 전'}</strong></div>
          </> : <p className="empty-guide">학번을 입력하고 참여자를 조회해주세요.</p>}
        </section>
        <section className="booth-card operation-card"><h2>현장 확인 순서</h2><span className="eyebrow">운영진 확인</span><p className="guide-quote">“온라인 설문 완료 여부와 결과 유형을 확인해주세요.”</p><strong className="check-line">학번 조회 · 온라인 완료 확인 · 유형 확인</strong><p className="finish-note">오프라인 참여 완료 버튼은 없습니다. 6개 체험을 모두 끝내면 DB에 자동 반영돼요.</p></section>
      </main>
    </div>
  )
}

function ParticipantsPage({ onNavigate }) {
  const [query, setQuery] = useState('')
  const [participants, setParticipants] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const load = async (search = '') => { setLoading(true); setMessage(''); try { setParticipants(await listParticipants(search)) } catch (error) { setMessage(error.message) } finally { setLoading(false) } }
  useEffect(() => { load('') }, [])
  return (
    <div className="admin-shell"><Sidebar active="참여자" onNavigate={onNavigate} />
      <main className="participants-main"><header className="participants-heading"><h1>참여자</h1><p>온라인·오프라인·럭키드로우 상태를 조회해요. 관리자에서 참여 상태를 변경하지 않습니다.</p></header>
        <section className="participant-search"><input type="search" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load(query)} placeholder="학번 또는 이름 검색" /><button type="button" onClick={() => load(query)}>{loading ? '검색 중...' : '검색'}</button></section>
        {message && <p className="db-message">{message}</p>}
        <section className="participants-table-card"><h2>참여자 목록</h2>
          <div className="participant-table-header"><span>학번</span><span>이름</span><span>유형</span><span>온라인</span><span>오프라인</span><span>럭키드로우</span></div>
          <div className="participant-table-body">{participants.map((p, index) => { const online = p.survey_status === 'completed'; const offline = Boolean(p.offline_participated_at); const lucky = Boolean(p.lucky_draw_participated); return <div key={p.student_id} className={`participant-table-row ${index % 2 ? 'is-alt' : ''}`}><strong>{p.student_id}</strong><span>{p.name || '-'}</span><span>{p.primary_type || '-'}</span><div><span className={`table-badge ${online ? 'online-complete' : 'offline-pending'}`}>{online ? '완료' : '진행 중'}</span></div><div><span className={`table-badge ${offline ? 'offline-complete' : 'offline-pending'}`}>{offline ? '완료' : '미완료'}</span></div><div><span className={`table-badge ${lucky ? 'offline-complete' : 'offline-pending'}`}>{lucky ? `${p.prize_rank || '-'}등` : '참여 전'}</span></div></div> })}{!loading && participants.length === 0 && <div className="participant-empty">검색 결과가 없어요.</div>}</div>
        </section>
      </main>
    </div>
  )
}

function SponsorPage({ onNavigate }) {
  const [offline, setOffline] = useState(0)
  useEffect(() => { getDashboardStats().then((s) => setOffline(s.offline || 0)).catch(() => {}) }, [])
  const stocks = [{ name: '미루꾸커피', total: 720, unit: '스틱' }, { name: '담터', total: 200, unit: '개' }, { name: '티코리아', total: 200, unit: '개' }].map((s) => ({ ...s, given: offline, remaining: Math.max(s.total - offline, 0) }))
  return <div className="admin-shell"><Sidebar active="협찬 재고" onNavigate={onNavigate} /><main className="sponsor-main"><header className="sponsor-heading"><h1>협찬 재고</h1><p>오프라인 자동 완료 인원({offline}명)을 기준으로 표시해요.</p></header><section className="sponsor-stock-list">{stocks.map((s) => <article className="sponsor-stock-card" key={s.name}><h2>{s.name}</h2><div className="sponsor-stock-values"><strong>{s.total}{s.unit}</strong><span>{s.given} 기준</span><strong>{s.remaining} 남음</strong></div></article>)}</section><section className="sponsor-note"><h2>운영 메모</h2><p>오프라인 완료 수치는 체험 사이트에서 자동 반영됩니다. 실제 지급 수량과 차이가 없는지만 현장에서 확인해주세요.</p></section></main></div>
}

function RunOfShowPage({ onNavigate }) {
  const steps = [
    ['01','오픈 준비','기기·영수증·상품·협찬품 세팅'],
    ['02','온라인 결과 확인','학번 조회 → 온라인 완료 여부·유형 확인 → 영수증 전달'],
    ['03','키워드 맞추기','6개 카페 피드 체험 진행'],
    ['04','오프라인 자동 완료','6개 체험 종료 시 DB에 자동 기록'],
    ['05','럭키드로우','온라인+오프라인 완료자만 1회 참여'],
    ['06','협찬 · 상품 지급','당첨 결과와 실물 지급 확인'],
  ]
  return <div className="admin-shell"><Sidebar active="행사 진행표" onNavigate={onNavigate} /><main className="run-main run-main-responsive"><header className="run-heading"><h1>행사 진행 안내</h1><p>수동 완료 단계 없이 자동 연동 기준으로 정리했어요.</p></header><section className="run-flow"><span>현장 기본 흐름</span><strong>학번 조회 → 온라인 완료·유형 확인 → 영수증 → 오프라인 체험 → 자동 완료 → 럭키드로우 → 상품 지급</strong></section><section className="run-step-list">{steps.map(([no,title,desc]) => <article className="run-step" key={no}><div className="run-step-number">{no}</div><div className="run-step-title"><strong>{title}</strong><span>CAFE MOCA</span></div><p>{desc}</p></article>)}</section></main></div>
}

function AnalyticsPage({ onNavigate }) {
  const [stats, setStats] = useState({ completed: 0, offline: 0, conversionRate: 0, target: 200, remaining: 200, topType: '-', topTypeCount: 0 })
  useEffect(() => { getDashboardStats().then(setStats).catch(() => {}) }, [])
  return <div className="admin-shell"><Sidebar active="성과 보기" onNavigate={onNavigate} /><main className="analytics-main"><header className="analytics-heading"><h1>성과 보기</h1><p>온라인 설문과 자동 기록된 오프라인 완료 데이터를 함께 확인해요.</p></header><section className="analytics-metric-grid"><article className="analytics-metric-card"><strong className="analytics-metric-label">온라인 완료</strong><strong className="analytics-metric-value">{stats.completed}명</strong></article><article className="analytics-metric-card"><strong className="analytics-metric-label">오프라인 완료</strong><strong className="analytics-metric-value">{stats.offline}명</strong></article><article className="analytics-metric-card"><strong className="analytics-metric-label">전환율</strong><strong className="analytics-metric-value">{stats.conversionRate || 0}%</strong></article><article className="analytics-metric-card"><strong className="analytics-metric-label">대표 유형</strong><strong className="analytics-metric-value">{stats.topType || '-'}</strong></article></section></main></div>
}

export default function App() {
  const [page, setPage] = useState('login')
  const [checkingSession, setCheckingSession] = useState(true)
  useEffect(() => { getAdminSession().then((admin) => { if (admin) setPage('dashboard') }).finally(() => setCheckingSession(false)) }, [])
  const navigate = (item) => {
    if (item === '대시보드') setPage('dashboard')
    else if (item === '부스 참여') setPage('booth')
    else if (item === '참여자') setPage('participants')
    else if (item === '협찬 재고') setPage('sponsor')
    else if (item === '행사 진행표') setPage('runofshow')
    else if (item === '성과 보기') setPage('analytics')
  }
  if (checkingSession) return <main className="session-loading">운영진 계정을 확인하고 있어요...</main>
  if (page === 'login') return <LoginPage onLogin={() => setPage('dashboard')} />
  if (page === 'booth') return <BoothPage onNavigate={navigate} />
  if (page === 'participants') return <ParticipantsPage onNavigate={navigate} />
  if (page === 'sponsor') return <SponsorPage onNavigate={navigate} />
  if (page === 'runofshow') return <RunOfShowPage onNavigate={navigate} />
  if (page === 'analytics') return <AnalyticsPage onNavigate={navigate} />
  return <Dashboard onNavigate={navigate} />
}
