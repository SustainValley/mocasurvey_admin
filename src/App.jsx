import { useEffect, useState } from 'react'
import {
  getAdminSession,
  getDashboardStats,
  listParticipants,
  loginAdmin,
  lookupParticipant,
} from './adminStore'

const FIGMA_LOGO_URL =
  'https://www.figma.com/api/mcp/asset/69c701a6-3bb3-4c94-be23-cd34f1da9a7a.svg'

const navItems = ['대시보드', '부스 참여', '참여자', '협찬 재고', '행사 진행표', '성과 보기']

const TYPE_META = {
  expert: {
    name: '전문성형',
    receiptName: 'Coffee Nerd',
    receiptImage: 'https://www.figma.com/api/mcp/asset/9c68c335-0a01-495f-b902-3ce1cfd97283.png',
    figmaNode: '2461-806',
  },
  visual: {
    name: '디저트 비주얼형',
    receiptName: 'Dessert Lover',
    receiptImage: 'https://www.figma.com/api/mcp/asset/6a6946f8-a4d2-4073-8554-39da89a0a17f.png',
    figmaNode: '2461-935',
  },
  archive: {
    name: '취향 아카이브형',
    receiptName: 'Mood Seeker',
    receiptImage: 'https://www.figma.com/api/mcp/asset/c729bb21-baf7-46cd-b46a-d5c77a296f87.png',
    figmaNode: '2461-1018',
  },
  story: {
    name: '운영자 서사형',
    receiptName: 'Coffee in between',
    receiptImage: 'https://www.figma.com/api/mcp/asset/b35a5fde-b4ab-4f52-abee-72f4cb3b40b6.png',
    figmaNode: '2461-1307',
  },
  event: {
    name: '경험 이벤트형',
    receiptName: 'My kind of Place',
    receiptImage: 'https://www.figma.com/api/mcp/asset/da79bdc9-ad11-463c-bf84-b514122da835.png',
    figmaNode: '2461-1413',
  },
  slow: {
    name: '슬로우 무드형',
    receiptName: 'My Own Space',
    receiptImage: 'https://www.figma.com/api/mcp/asset/1152c6ee-8b72-4895-8018-039cc86a5b32.png',
    figmaNode: '2461-1532',
  },
}

function getTypeName(type) {
  if (!type) return '결과 없음'
  return TYPE_META[type]?.name || type
}

function formatKst(value) {
  if (!value) return '-'
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(value))
  } catch {
    return '-'
  }
}

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
          <div className="logo-card">
            <img src={FIGMA_LOGO_URL} alt="CAFE MOCA 로고" className="moca-logo" />
          </div>
          <div className="brand-copy">
            <h1>CAFE MOCA</h1>
            <p className="operator-label">POP-UP OPERATOR</p>
            <p className="operator-note">운영진 전용 페이지</p>
          </div>
        </div>
      </section>

      <section className="form-panel">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-heading">
            <h2>운영진 로그인</h2>
            <p>Supabase에 등록된 운영진 계정으로 접속해주세요.</p>
          </div>

          <label className="field">
            <span>아이디</span>
            <input
              type="text"
              value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              placeholder="예: moca_admin"
              autoComplete="username"
            />
          </label>

          <label className="field">
            <span>비밀번호</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          <button className="login-button" type="submit" disabled={loading}>
            <span>{loading ? '로그인 중...' : '운영진 로그인'}</span>
          </button>

          <p className="account-note">CAFE MOCA 운영진 계정만 이용할 수 있어요.</p>
          {message && <p className="status-message" role="status">{message}</p>}
        </form>
      </section>
    </main>
  )
}

function Sidebar({ active = '대시보드', onNavigate }) {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <strong>CAFE MOCA</strong>
        <span>POPUP ADMIN</span>
      </div>

      <nav className="sidebar-nav" aria-label="운영진 메뉴">
        {navItems.map((item) => (
          <button
            key={item}
            type="button"
            className={`sidebar-item ${item === active ? 'is-active' : ''}`}
            onClick={() => onNavigate(item)}
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  )
}


const numberedNavItems = [
  ['01', '대시보드'],
  ['02', '부스 참여'],
  ['03', '참여자'],
  ['04', '협찬 재고'],
  ['05', '행사 진행표'],
  ['06', '성과 보기'],
]

function GlobalSidebar({ active, isOpen, onToggle, onNavigate }) {
  return (
    <aside className={`global-sidebar ${isOpen ? 'is-open' : 'is-collapsed'}`}>
      <div className="global-sidebar-top">
        <button
          type="button"
          className="global-sidebar-toggle"
          onClick={onToggle}
          aria-label={isOpen ? '네비게이션 닫기' : '네비게이션 열기'}
          title={isOpen ? '네비게이션 닫기' : '네비게이션 열기'}
        >
          {isOpen ? '‹' : '☰'}
        </button>

        {isOpen ? (
          <div className="global-sidebar-brand">
            <strong>CAFE MOCA</strong>
            <span>POPUP ADMIN</span>
          </div>
        ) : (
          <strong className="global-sidebar-mini-brand">M</strong>
        )}
      </div>

      <nav className="global-sidebar-nav" aria-label="운영진 메뉴">
        {numberedNavItems.map(([no, item]) => (
          <button
            key={item}
            type="button"
            title={!isOpen ? item : undefined}
            className={`global-sidebar-item ${item === active ? 'is-active' : ''}`}
            onClick={() => onNavigate(item)}
          >
            <b>{no}</b>
            {isOpen && <span>{item}</span>}
          </button>
        ))}
      </nav>
    </aside>
  )
}

function getActiveNav(page) {
  if (page === 'dashboard') return '대시보드'
  if (page === 'booth') return '부스 참여'
  if (page === 'participants') return '참여자'
  if (page === 'sponsor') return '협찬 재고'
  if (page === 'analytics') return '성과 보기'
  if (page === 'runofshow' || /^runDetail0[2-8]$/.test(page)) return '행사 진행표'
  return ''
}

function MetricCard({ label, value }) {
  return (
    <article className="metric-card">
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  )
}

function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    completed: 0,
    offline: 0,
    conversionRate: 0,
    target: 200,
    remaining: 200,
    topType: '-',
    topTypeCount: 0,
  })
  const [error, setError] = useState('')

  useEffect(() => {
    getDashboardStats().then(setStats).catch((err) => setError(err.message))
  }, [])

  const onlinePct = Math.min((stats.completed / Math.max(stats.target, 1)) * 100, 100)
  const offlinePct = Math.min((stats.offline / Math.max(stats.target, 1)) * 100, 100)

  return (
    <div className="admin-shell">
      <Sidebar active="대시보드" onNavigate={onNavigate} />

      <main className="dashboard-main">
        <header className="dashboard-heading">
          <h1>오늘 운영 현황</h1>
          <p>온라인 설문 DB와 연결된 실시간 현황이에요.</p>
        </header>

        {error && <p className="db-error">{error}</p>}

        <section className="metric-grid" aria-label="운영 핵심 지표">
          <MetricCard label="온라인 참여자" value={`${stats.completed}명`} />
          <MetricCard label="오프라인 완료" value={`${stats.offline}명`} />
          <MetricCard label="전환율" value={`${stats.conversionRate ?? 0}%`} />
          <MetricCard label="남은 제공 가능" value={`${stats.remaining}명분`} />
        </section>

        <section className="dashboard-grid dashboard-grid-top">
          <article className="panel flow-card">
            <h3>실시간 참여 흐름</h3>
            <div className="flow-row">
              <div className="flow-meta">
                <span>온라인 설문 완료</span>
                <strong>{stats.completed} / {stats.target}</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill online" style={{ width: `${onlinePct}%` }} />
              </div>
            </div>

            <div className="flow-row">
              <div className="flow-meta">
                <span>오프라인 참여 완료</span>
                <strong>{stats.offline} / {stats.target}</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill offline" style={{ width: `${offlinePct}%` }} />
              </div>
            </div>
          </article>

          <article className="panel memo-card">
            <h3>오늘 메모</h3>
            <ul>
              <li>미루꾸 팔로우 안내</li>
              <li>담터 채널 안내</li>
              <li>오프라인 6개 체험 완료 시 DB 자동 반영</li>
            </ul>
            <button type="button" className="pink-action small" onClick={() => onNavigate('부스 참여')}>
              <span>부스 참여 확인 열기</span>
            </button>
          </article>
        </section>

        <section className="dashboard-grid dashboard-grid-bottom">
          <article className="panel summary-card">
            <h3>온라인 설문 결과</h3>
            <p>온라인 설문 완료 데이터를 기준으로 자동 집계해요.</p>
            <strong>대표 유형 {getTypeName(stats.topType)} · {stats.topTypeCount || 0}명</strong>
          </article>

          <article className="panel summary-card">
            <h3>오프라인 부스 결과</h3>
            <p>온라인 설문 완료자 중 6개 오프라인 체험을 모두 마친 인원이에요.</p>
            <strong>오프라인 완료 {stats.offline}명</strong>
          </article>
        </section>

        <button type="button" className="analytics-button" onClick={() => onNavigate('성과 보기')}>
          전체 온라인·오프라인 성과 자세히 보기
        </button>
      </main>
    </div>
  )
}

function CompactRail({ onMenu }) {
  return (
    <aside className="booth-rail">
      <button className="hamburger" type="button" onClick={onMenu} aria-label="메뉴 열기">
        ☰
      </button>
      <strong>MOCA</strong>
    </aside>
  )
}

function BoothPage({ onNavigate }) {
  const [studentId, setStudentId] = useState('')
  const [participant, setParticipant] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const lookup = async () => {
    if (!studentId.trim()) return
    setLoading(true)
    setMessage('')
    try {
      const data = await lookupParticipant(studentId)
      if (!data || data.status === 'not_found') {
        setParticipant(null)
        setMessage('해당 학번의 온라인 설문 기록을 찾지 못했어요.')
        return
      }
      setParticipant(data)
    } catch (error) {
      setParticipant(null)
      setMessage(error?.message || '참여 기록을 불러오지 못했어요.')
    } finally {
      setLoading(false)
    }
  }

  const offlineComplete = Boolean(participant?.offlineParticipatedAt)
  const onlineComplete = participant?.surveyStatus === 'completed'
  const luckyComplete = Boolean(participant?.luckyDrawParticipated)
  const primaryType = TYPE_META[participant?.primaryType] || null

  return (
    <div className="booth-shell">
      <CompactRail onMenu={() => onNavigate('대시보드')} />

      <main className="booth-main booth-main-v2">
        <header className="booth-heading">
          <h1>부스 참여 확인</h1>
          <p>학번으로 온라인 유형과 참여 상태를 확인하고, 제공할 영수증까지 바로 확인해요.</p>
        </header>

        <section className="booth-card lookup-card booth-lookup-v2">
          <h2>01&nbsp;&nbsp;학번 조회</h2>
          <label>
            <span>학번</span>
            <div className="lookup-row">
              <input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && lookup()}
                placeholder="2023XXXXXX"
                inputMode="numeric"
              />
              <button type="button" onClick={lookup} disabled={loading}>
                {loading ? '조회 중...' : '참여자 조회'}
              </button>
            </div>
          </label>
        </section>

        {message && <p className="db-message">{message}</p>}

        <section className={`booth-card participant-card booth-participant-v2 ${participant ? '' : 'is-empty'}`}>
          <h2>02&nbsp;&nbsp;참여자 상태</h2>

          {participant ? (
            <>
              <div className="participant-top booth-person-head">
                <div className="booth-person-copy">
                  <strong>{participant.name || '이름 없음'}</strong>
                  <p className="participant-meta">
                    {participant.studentId}&nbsp;&nbsp;·&nbsp;&nbsp;{participant.department || '학과 미입력'}
                  </p>
                </div>
                <div className="booth-status-badges">
                  <span className={`badge ${onlineComplete ? 'badge-green' : 'badge-pink'}`}>
                    {onlineComplete ? '온라인 완료' : '온라인 미완료'}
                  </span>
                  <span className={`badge ${offlineComplete ? 'badge-green' : 'badge-pink'}`}>
                    {offlineComplete ? '오프라인 완료' : '오프라인 미완료'}
                  </span>
                  <span className={`badge ${luckyComplete ? 'badge-green' : 'badge-pink'}`}>
                    {luckyComplete ? '럭키드로우 완료' : '럭키드로우 전'}
                  </span>
                </div>
              </div>

              <div className="booth-type-result">
                <span>온라인 설문 결과</span>
                <div>
                  <strong>{getTypeName(participant.primaryType)}</strong>
                  {participant.secondaryType && <b>보조 유형 · {getTypeName(participant.secondaryType)}</b>}
                </div>
              </div>

              {onlineComplete && primaryType && (
                <section className={`receipt-match-card receipt-${participant.primaryType}`}>
                  <div className="receipt-match-copy">
                    <span>제공할 영수증</span>
                    <strong>{primaryType.name}</strong>
                    <b>{primaryType.receiptName}</b>
                    <p>주 유형에 맞는 실제 영수증 디자인이에요. 참가자에게 같은 영수증을 제공해주세요.</p>
                    <a
                      href={`https://www.figma.com/design/qxhzdRnKh6isdZBbiXMLjX/Design_MOCA?node-id=${primaryType.figmaNode}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Figma 원본 보기
                    </a>
                  </div>
                  <div className="receipt-preview-wrap">
                    <img src={primaryType.receiptImage} alt={`${primaryType.name} ${primaryType.receiptName} 영수증`} />
                  </div>
                </section>
              )}

              <div className="booth-status-grid">
                <article className="booth-status-card">
                  <span>온라인 설문</span>
                  <strong>{onlineComplete ? '완료' : '미완료'}</strong>
                  <p>{onlineComplete ? `완료 시각 · ${formatKst(participant.completedAt)}` : '온라인 설문 완료 기록 없음'}</p>
                </article>
                <article className="booth-status-card">
                  <span>오프라인 체험</span>
                  <strong>{offlineComplete ? '완료' : '미완료'}</strong>
                  <p>{offlineComplete ? `완료 시각 · ${formatKst(participant.offlineParticipatedAt)}` : '6개 체험 완료 시 자동 반영'}</p>
                </article>
                <article className="booth-status-card">
                  <span>럭키드로우</span>
                  <strong>{luckyComplete ? `${participant.prizeRank || '-'}등 · ${participant.prizeName || '상품 확인'}` : '참여 전'}</strong>
                  <p>{luckyComplete ? `완료 시각 · ${formatKst(participant.luckyDrawnAt)}` : '온라인 + 오프라인 완료 후 참여 가능'}</p>
                </article>
              </div>
            </>
          ) : (
            <p className="empty-guide">학번을 입력하고 참여자를 조회해주세요.</p>
          )}
        </section>

      </main>
    </div>
  )
}

function ParticipantsPage({ onNavigate }) {
  const [query, setQuery] = useState('')
  const [participants, setParticipants] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async (search = '') => {
    setLoading(true)
    setMessage('')
    try {
      const rows = await listParticipants(search)
      setParticipants(rows)
    } catch (error) {
      setMessage(error?.message || '참여자 목록을 불러오지 못했어요.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load('')
  }, [])

  return (
    <div className="admin-shell">
      <Sidebar active="참여자" onNavigate={onNavigate} />

      <main className="participants-main">
        <header className="participants-heading">
          <h1>참여자</h1>
          <p>온라인·오프라인·럭키드로우 상태를 같은 DB에서 확인해요.</p>
        </header>

        <section className="participant-search" aria-label="참여자 검색">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load(query)}
            placeholder="학번 또는 이름 검색"
          />
          <button type="button" onClick={() => load(query)}>{loading ? '검색 중...' : '검색'}</button>
        </section>

        {message && <p className="db-message">{message}</p>}

        <section className="participants-table-card participants-table-v2">
          <h2>참여자 목록</h2>

          <div className="participant-table-header participant-table-header-v2">
            <span>학번</span><span>이름</span><span>유형</span><span>온라인</span><span>오프라인</span><span>럭키드로우</span>
          </div>

          <div className="participant-table-body">
            {participants.map((participant, index) => {
              const offline = Boolean(participant.offline_participated_at)
              const online = participant.survey_status === 'completed'
              const lucky = Boolean(participant.lucky_draw_participated)
              return (
                <div key={participant.student_id} className={`participant-table-row participant-table-row-v2 ${index % 2 === 1 ? 'is-alt' : ''}`}>
                  <strong data-label="학번">{participant.student_id}</strong>
                  <span data-label="이름">{participant.name || '-'}</span>
                  <span data-label="유형" className="participant-type-name">{getTypeName(participant.primary_type)}</span>
                  <div data-label="온라인"><span className={`table-badge ${online ? 'online-complete' : 'offline-pending'}`}>{online ? '온라인 완료' : '진행 중'}</span></div>
                  <div data-label="오프라인"><span className={`table-badge ${offline ? 'offline-complete' : 'offline-pending'}`}>{offline ? '오프라인 완료' : '미참여'}</span></div>
                  <div data-label="럭키드로우"><span className={`table-badge ${lucky ? 'offline-complete' : 'offline-pending'}`}>{lucky ? `${participant.prize_rank || '-'}등 · ${participant.prize_name || '완료'}` : '참여 전'}</span></div>
                </div>
              )
            })}

            {!loading && participants.length === 0 && <div className="participant-empty">검색 결과가 없어요.</div>}
          </div>
        </section>
      </main>
    </div>
  )
}

const sponsorStocks = [
  { name: '미루꾸커피', total: 720, unit: '스틱', given: 74 },
  { name: '담터', total: 200, unit: '개', given: 74 },
  { name: '티코리아', total: 200, unit: '개', given: 74 },
]

function SponsorPage({ onNavigate }) {
  const [offline, setOffline] = useState(0)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getDashboardStats().then((stats) => setOffline(stats.offline || 0)).catch((err) => setMessage(err.message))
  }, [])

  const stocks = sponsorStocks.map((stock) => ({
    ...stock,
    given: offline,
    remaining: Math.max(stock.total - offline, 0),
  }))

  return (
    <div className="admin-shell">
      <Sidebar active="협찬 재고" onNavigate={onNavigate} />

      <main className="sponsor-main">
        <header className="sponsor-heading">
          <h1>협찬 재고</h1>
          <p>같은 DB의 오프라인 완료 인원({offline}명)을 기준으로 자동 계산해요.</p>
        </header>

        {message && <p className="db-message">{message}</p>}

        <section className="sponsor-stock-list" aria-label="협찬 재고 현황">
          {stocks.map((stock) => (
            <article className="sponsor-stock-card" key={stock.name}>
              <h2>{stock.name}</h2>
              <div className="sponsor-stock-values">
                <strong>{stock.total}{stock.unit}</strong>
                <span>{stock.given} 지급</span>
                <strong>{stock.remaining} 남음</strong>
              </div>
            </article>
          ))}
        </section>

        <section className="sponsor-note">
          <h2>운영 메모</h2>
          <p>오프라인 6개 체험 완료 인원이 DB에 자동 반영되며, 이 수치를 기준으로 재고를 확인해요.</p>
        </section>
      </main>
    </div>
  )
}

const runOfShowSteps = [
  { no: '01', title: '오픈 준비', phase: '행사 전', desc: '기기·영수증·상품·협찬품 세팅' },
  { no: '02', title: '온라인 결과 확인 · 영수증', phase: '참여 시작', desc: '학번 조회 후 한국어 유형 확인, 유형에 맞는 영수증 제공', highlight: true },
  { no: '03', title: '키워드 맞추기 게임', phase: '체험 1', desc: '카페 SNS 피드에서 느껴지는 핵심 키워드 선택' },
  { no: '04', title: '카페 정보 우선순위', phase: '체험 2', desc: '게시물에서 먼저 보는 정보 약 8개를 중요도 순으로 정렬' },
  { no: '05', title: '럭키드로우', phase: '체험 3', desc: '1인 1회 추첨 후 등수 기록' },
  { no: '06', title: '협찬 · 상품 지급', phase: '마무리', desc: '당첨 상품과 협찬품을 조건 확인 후 지급' },
  { no: '07', title: '예외 처리', phase: '필요 시', desc: '중복·온라인 미완료·잘못된 완료·지급 오류 처리' },
  { no: '08', title: '마감', phase: '18:00', desc: '참여 데이터와 실물 재고 대조 후 정리' },
]

function NumberedSidebar({ active = '행사 진행표', onNavigate }) {
  const numbered = [
    ['01', '대시보드'],
    ['02', '부스 참여'],
    ['03', '참여자'],
    ['04', '협찬 재고'],
    ['05', '행사 진행표'],
    ['06', '성과 보기'],
  ]

  return (
    <aside className="numbered-sidebar">
      <div className="sidebar-brand">
        <strong>CAFE MOCA</strong>
        <span>POPUP ADMIN</span>
      </div>

      <nav className="numbered-nav" aria-label="운영진 메뉴">
        {numbered.map(([no, item]) => (
          <button
            key={item}
            type="button"
            className={`numbered-nav-item ${item === active ? 'is-active' : ''}`}
            onClick={() => onNavigate(item)}
          >
            <b>{no}</b>
            <span>{item}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}

function RunOfShowDetailPanel({ step, onClose }) {
  if (!step) {
    return (
      <aside className="run-inline-detail is-empty">
        <div className="run-inline-empty">
          <strong>단계를 선택해주세요</strong>
          <p>상세 보기를 누르면 운영 멘트와 확인사항이 여기에 표시돼요.</p>
        </div>
      </aside>
    )
  }

  const detail02 = {
    no: '02',
    title: '온라인 결과 확인 · 영수증',
    phase: '참여 시작',
    purpose: '온라인 참여자를 학번으로 확인하고, 한국어 결과 유형에 맞는 영수증을 정확하게 전달합니다. 오프라인 완료는 6개 체험 종료 시 자동 기록됩니다.',
    steps: [
      '참여자에게 온라인 결과 화면을 보여달라고 안내',
      '학번만 입력해 온라인 참여 기록 조회',
      '서버에 표시된 유형과 참여자가 보여준 결과 유형을 빠르게 대조',
      '해당 유형의 영수증 출력·전달',
      '오프라인 6개 체험을 모두 마치면 완료 상태가 자동 반영되는지 확인',
    ],
    scripts: [
      '“안녕하세요! 온라인 체험하신 결과 화면 한번 보여주시고, 학번만 말씀해주세요.”',
      '“확인됐어요! 결과에 맞는 영수증 먼저 드릴게요. 이어서 현장 체험 진행해주시면 됩니다 :)”',
    ],
    checks: '학번 조회 성공 · 온라인 완료 여부 · 한국어 유형 일치 · 영수증 유형 일치 · 오프라인 완료 자동 반영',
  }

  const detail01 = {
    no: '01',
    title: '오픈 준비',
    phase: '행사 전',
    purpose: '행사 시작 전 필요한 기기와 출력물, 상품, 협찬품을 모두 준비해 바로 운영 가능한 상태로 맞춥니다.',
    steps: [
      '태블릿·노트북 전원 및 네트워크 확인',
      '영수증 출력 테스트',
      '상품·협찬품 수량과 위치 확인',
      '운영진별 담당 위치와 진행 순서 공유',
      '부스 동선과 대기 공간 최종 확인',
    ],
    scripts: [
      '“오픈 전에 기기, 영수증, 상품 수량부터 한 번씩 확인해주세요.”',
    ],
    checks: '기기 충전 · 인터넷 연결 · 출력 테스트 · 상품 수량 · 운영진 역할 분담',
  }

  const data =
    step.no === '01'
      ? detail01
      : step.no === '02'
        ? detail02
        : { ...remainingRunDetails[step.no], no: step.no }

  return (
    <aside className="run-inline-detail">
      <div className="run-inline-detail-header">
        <div>
          <span>{data.no}</span>
          <h2>{data.title}</h2>
          <p>{data.phase}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="상세 닫기">×</button>
      </div>

      <div className="run-inline-purpose">
        <span>이 단계의 목적</span>
        <strong>{data.purpose}</strong>
      </div>

      <div className="run-inline-section">
        <h3>진행 순서</h3>
        <div className="run-inline-steps">
          {data.steps.map((item, index) => (
            <div className="run-inline-step" key={`${data.no}-${index}`}>
              <b>{index + 1}</b>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="run-inline-script">
        <span>실제 운영 멘트</span>
        {data.scripts.map((script, index) => (
          <strong key={`${data.no}-script-${index}`}>{script}</strong>
        ))}
      </div>

      <div className="run-inline-check">
        <span>할 때 확인</span>
        <strong>{data.checks}</strong>
      </div>
    </aside>
  )
}

function RunOfShowPage({ onNavigate }) {
  const [selected, setSelected] = useState(null)

  return (
    <main className="run-main run-main-responsive">
      <header className="run-heading">
        <h1>행사 진행 안내</h1>
        <p>단계를 누르면 같은 화면에서 실제 운영 멘트와 확인사항을 바로 확인할 수 있어요.</p>
      </header>

      <section className="run-flow">
        <span>현장 기본 흐름</span>
        <strong>
          학번 조회 → 한국어 결과 유형 확인 → 영수증 제공 → 오프라인 체험 → 완료 자동 반영 → 럭키드로우 → 상품·협찬 지급
        </strong>
      </section>

      <div className={`run-workspace ${selected ? 'has-selection' : ''}`}>
        <section className="run-step-list" aria-label="행사 진행 단계">
          {runOfShowSteps.map((step) => (
            <article
              className={`run-step ${step.highlight ? 'is-highlight' : ''} ${selected?.no === step.no ? 'is-selected' : ''}`}
              key={step.no}
            >
              <div className="run-step-number">{step.no}</div>

              <div className="run-step-title">
                <strong>{step.title}</strong>
                <span>{step.phase}</span>
              </div>

              <p>{step.desc}</p>

              <button type="button" onClick={() => setSelected(step)}>
                {selected?.no === step.no ? '열림' : '상세 보기'}
              </button>

              {selected?.no === step.no && (
                <div className="run-inline-mobile">
                  <RunOfShowDetailPanel step={selected} onClose={() => setSelected(null)} />
                </div>
              )}
            </article>
          ))}
        </section>

        <div className="run-inline-desktop">
          <RunOfShowDetailPanel step={selected} onClose={() => setSelected(null)} />
        </div>
      </div>
    </main>
  )
}

const analyticsMetrics = [
  { label: '온라인 완료율', value: '93.0%' },
  { label: '오프라인 전환율', value: '39.8%' },
  { label: '협찬 소진율', value: '37.0%' },
  { label: '예외율', value: '2.1%' },
]

function AnalyticsPage({ onNavigate }) {
  const [stats, setStats] = useState({
    completed: 0, offline: 0, conversionRate: 0, target: 200, remaining: 200, topType: '-', topTypeCount: 0,
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    getDashboardStats().then(setStats).catch((err) => setMessage(err.message))
  }, [])

  const onlineRate = stats.target ? ((stats.completed / stats.target) * 100).toFixed(1) : '0.0'
  const sponsorRate = stats.target ? ((stats.offline / stats.target) * 100).toFixed(1) : '0.0'

  return (
    <div className="admin-shell">
      <Sidebar active="성과 보기" onNavigate={onNavigate} />

      <main className="analytics-main">
        <header className="analytics-heading">
          <h1>성과 보기</h1>
          <p>온라인 설문 DB와 오프라인 완료 데이터를 함께 확인해요.</p>
        </header>

        {message && <p className="db-message">{message}</p>}

        <section className="analytics-metric-grid" aria-label="행사 핵심 지표">
          <article className="analytics-metric-card"><strong className="analytics-metric-label">온라인 완료율</strong><strong className="analytics-metric-value">{onlineRate}%</strong></article>
          <article className="analytics-metric-card"><strong className="analytics-metric-label">오프라인 전환율</strong><strong className="analytics-metric-value">{stats.conversionRate || 0}%</strong></article>
          <article className="analytics-metric-card"><strong className="analytics-metric-label">협찬 소진율</strong><strong className="analytics-metric-value">{sponsorRate}%</strong></article>
          <article className="analytics-metric-card"><strong className="analytics-metric-label">온라인 완료</strong><strong className="analytics-metric-value">{stats.completed}명</strong></article>
        </section>

        <section className="analytics-result-grid">
          <article className="analytics-result-card">
            <h2>온라인 설문 결과</h2>
            <span className="analytics-eyebrow">대표 유형</span>
            <strong className="analytics-result-main">{getTypeName(stats.topType)} · {stats.topTypeCount || 0}명</strong>
            <div className="analytics-result-list">
              <span>설문 완료 {stats.completed}명</span>
              <span>목표 {stats.target}명</span>
              <span>진행 중 {stats.inProgress || 0}명</span>
            </div>
          </article>

          <article className="analytics-result-card">
            <h2>오프라인 부스 결과</h2>
            <span className="analytics-eyebrow">오프라인 완료</span>
            <strong className="analytics-result-main">{stats.offline}명</strong>
            <div className="analytics-result-list">
              <span>전환율 {stats.conversionRate || 0}%</span>
              <span>남은 제공 가능 {stats.remaining}명분</span>
              <span>온라인 완료자 기준 자동 집계</span>
            </div>
          </article>
        </section>

        <section className="analytics-detail-card">
          <h2>행사 성과 상세</h2>
          <div className="analytics-detail-grid">
            <div><span>온라인 참여</span><strong>{stats.completed}명</strong></div>
            <div><span>오프라인 참여</span><strong>{stats.offline}명</strong></div>
            <div><span>대표 유형</span><strong>{getTypeName(stats.topType)}</strong></div>
            <div><span>남은 제공</span><strong>{stats.remaining}명분</strong></div>
          </div>
          <p>온라인 설문과 현장 참여가 같은 학번 레코드로 연결되어 실시간으로 반영돼요.</p>
        </section>
      </main>
    </div>
  )
}

const runDetail02Steps = [
  '참여자에게 온라인 결과 화면을 보여달라고 안내',
  '학번만 입력해 온라인 참여 기록 조회',
  '서버에 표시된 유형과 참여자가 보여준 결과 유형을 빠르게 대조',
  '해당 유형의 영수증 출력·전달',
  '오프라인 6개 체험을 모두 마치면 완료 상태가 자동 반영되는지 확인',
]

function RunDetail02({ onBack }) {
  return (
    <main className="run-detail-page">
      <div className="run-detail-accent" />

      <section className="run-detail-content">
        <header className="run-detail-heading">
          <span>02</span>
          <h1>온라인 결과 확인 · 영수증</h1>
          <p>참여 시작</p>
        </header>

        <section className="run-purpose-card">
          <span>이 단계의 목적</span>
          <strong>
            온라인 참여자를 학번으로 확인하고, 한국어 결과 유형에 맞는 영수증을 정확하게 전달합니다. 오프라인 완료는 6개 체험 종료 시 자동 기록됩니다.
          </strong>
        </section>

        <section className="run-order-section">
          <h2>진행 순서</h2>
          <div className="run-order-list">
            {runDetail02Steps.map((step, index) => (
              <div className="run-order-row" key={step}>
                <span className={`run-order-number ${index === 0 ? 'is-current' : ''}`}>
                  {index + 1}
                </span>
                <p className={index === 0 ? 'is-current' : ''}>{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="run-script-card">
          <span>실제 운영 멘트</span>
          <strong>“안녕하세요! 온라인 체험하신 결과 화면 한번 보여주시고, 학번만 말씀해주세요.”</strong>
          <strong>“확인됐어요! 결과에 맞는 영수증 먼저 드릴게요. 이어서 현장 체험 진행해주시면 됩니다 :)”</strong>
        </section>

        <section className="run-check-card">
          <span>할 때 확인</span>
          <strong>학번 조회 성공 · 온라인 완료 여부 · 한국어 유형 일치 · 영수증 유형 일치 · 오프라인 완료 자동 반영</strong>
        </section>

        <button className="run-back-button" type="button" onClick={onBack}>
          ← 행사 진행표로 돌아가기
        </button>
      </section>
    </main>
  )
}


const remainingRunDetails = {
  '03': {
    title: '키워드 맞추기 게임',
    phase: '체험 1',
    accent: '#e2f1f7',
    purpose: 'AI가 만든 카페 SNS 피드가 의도한 브랜드 분위기와 키워드를 소비자가 실제로 동일하게 인식하는지 확인합니다.',
    steps: [
      '아이패드에서 카페 SNS 피드 1개 제시',
      '참여자가 피드를 보고 떠오르는 핵심 키워드 선택',
      '선택 결과를 저장',
      '다음 피드가 있다면 동일 방식 반복',
      '완료 후 정보 우선순위 단계로 안내',
    ],
    scripts: [
      '“이제 카페 SNS 피드를 보고, 이 카페에서 가장 강하게 느껴지는 키워드를 골라주세요.”',
      '“정답을 맞히는 게임이라기보다 실제로 어떤 인상을 받으셨는지를 보는 거라 편하게 골라주시면 돼요!”',
    ],
    checks: '모든 참여자 동일 이미지·조건 · 운영진이 정답 암시하지 않기 · 선택 결과 저장 여부 확인',
  },
  '04': {
    title: '카페 정보 우선순위 정하기',
    phase: '체험 2',
    accent: '#dff5ec',
    purpose: '카페 게시물을 볼 때 소비자가 어떤 정보를 먼저 확인하는지 우선순위 데이터를 수집합니다.',
    steps: [
      '아이패드에 약 8개 정보 항목 표시',
      '참여자에게 평소 중요하게 보는 순서대로 정렬하도록 안내',
      '드래그 또는 순위 선택으로 1~8위 결정',
      '최종 순위 저장 확인',
      '럭키드로우 단계로 안내',
    ],
    scripts: [
      '“이번에는 카페 게시물을 볼 때 어떤 정보를 먼저 보는지 순서대로 정해주세요.”',
      '“정답은 없고요, 평소 카페를 찾을 때 실제로 보는 기준대로 편하게 정해주시면 됩니다.”',
    ],
    checks: '같은 순위 중복 방지 · 1~8위 모두 입력 · 답을 유도하지 않기 · 저장 완료 표시 확인',
  },
  '05': {
    title: '럭키드로우',
    phase: '체험 3',
    accent: '#fff2b8',
    purpose: '현장 체험 완료 후 1인 1회 추첨으로 상품 등수를 결정하고 지급 기록과 연결합니다.',
    steps: [
      '앞선 현장 체험 완료 여부 확인',
      '럭키드로우 화면에서 1인 1회 추첨',
      '당첨 등수 즉시 표시',
      '등수 데이터를 참여자 기록에 저장',
      '협찬·상품 지급 단계로 이동',
    ],
    scripts: [
      '“체험은 모두 끝났고요! 마지막으로 럭키드로우 한 번 진행해볼게요. 여기 한 번 눌러주세요!”',
      '“오, ○등 나오셨어요! 상품이랑 협찬 제품 같이 챙겨드릴게요.”',
    ],
    checks: '1인 1회만 · 재추첨 금지 · 등수 저장 확인 · 실물 상품 재고와 지급 가능 여부 확인',
  },
  '06': {
    title: '협찬 · 상품 지급',
    phase: '마무리',
    accent: '#ffe5d3',
    purpose: '럭키드로우 상품과 협찬 제품을 누락 없이 지급하고, 브랜드별 필수 조건이 있는 경우에만 간단히 안내합니다.',
    steps: [
      '럭키드로우 등수 확인',
      '해당 등수 상품 준비',
      '협찬 제품 구성 확인',
      '브랜드별 필수 조건만 짧게 안내',
      '조건 확인 후 상품+협찬품 함께 지급',
      '지급 수량을 재고에 반영',
    ],
    scripts: [
      '“당첨되신 상품이랑 협찬 제품 같이 챙겨드릴게요.”',
      '“협찬 제품은 브랜드 참여 조건이 있는 것만 짧게 안내드릴게요. 확인해주시면 바로 같이 드리겠습니다!”',
      '“참여해주셔서 감사합니다. 즐겁게 받아가세요 :)”',
    ],
    checks: '필수/제안 조건 구분 · 조건을 과하게 강요하지 않기 · 상품+협찬품 누락 확인 · 실제 지급 후 재고 반영',
  },
  '07': {
    title: '예외 처리',
    phase: '필요 시',
    accent: '#ffe0e6',
    purpose: '현장에서 발생하는 조회·중복·지급 오류를 빠르게 복구하고 데이터와 실제 지급 상태를 맞춥니다.',
    steps: [
      '학번 재조회',
      '현재 온라인/오프라인 참여 상태 확인',
      '잘못 완료한 경우 참여 취소 또는 복구',
      '이미 지급된 상품·협찬 여부 확인',
      '수정 후 데이터와 실물 상태 다시 대조',
    ],
    scripts: [
      '“잠시만요, 참여 기록 먼저 확인해드릴게요.”',
      '“기록 확인 후 바로 이어서 도와드릴게요.”',
    ],
    checks: '중복 참여 · 온라인 미완료 · 잘못된 완료 처리 · 럭키드로우 중복 · 상품/협찬 지급 오류',
  },
  '08': {
    title: '마감',
    phase: '18:00',
    accent: '#ffe8f2',
    purpose: '행사 종료 후 참여 데이터, 상품·협찬 재고, 예외 기록을 최종 대조하고 부스를 정리합니다.',
    steps: [
      '최종 온라인/오프라인 참여 인원 확인',
      '럭키드로우 등수별 지급 수량 확인',
      '상품·협찬 잔여 수량 실물 카운트',
      '예외 처리 미완료 건 정리',
      '태블릿·프린터·출력물·쓰레기 정리',
      '최종 성과 페이지에서 데이터 확인',
    ],
    scripts: [
      '“마지막 참여자 처리 후 참여 인원과 남은 상품 수량부터 맞춰주세요.”',
    ],
    checks: '서버 수량 = 실물 수량 · 미처리 예외 0건 · 영수증/기기 회수 · 행사 공간 원상복구',
  },
}

function RunDetailPage({ detail, onBack }) {
  const isLong = detail.steps.length > 5 || detail.scripts.length > 2

  return (
    <main
      className={`run-detail-page run-detail-generic ${isLong ? 'is-long' : ''}`}
      style={{ '--detail-accent': detail.accent }}
    >
      <div className="run-detail-accent" />

      <section className="run-detail-content">
        <header className="run-detail-heading">
          <span>{detail.no}</span>
          <h1>{detail.title}</h1>
          <p>{detail.phase}</p>
        </header>

        <section className="run-purpose-card">
          <span>이 단계의 목적</span>
          <strong>{detail.purpose}</strong>
        </section>

        <section className="run-order-section">
          <h2>진행 순서</h2>
          <div className="run-order-list">
            {detail.steps.map((step, index) => (
              <div className="run-order-row" key={`${detail.no}-${index}`}>
                <span className={`run-order-number ${index === 0 ? 'is-current' : ''}`}>
                  {index + 1}
                </span>
                <p className={index === 0 ? 'is-current' : ''}>{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="run-script-card">
          <span>실제 운영 멘트</span>
          {detail.scripts.map((script, index) => (
            <strong key={`${detail.no}-script-${index}`}>{script}</strong>
          ))}
        </section>

        <section className="run-check-card">
          <span>할 때 확인</span>
          <strong>{detail.checks}</strong>
        </section>

        <button className="run-back-button" type="button" onClick={onBack}>
          ← 행사 진행표로 돌아가기
        </button>
      </section>
    </main>
  )
}

export default function App() {
  const [page, setPage] = useState('login')
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window === 'undefined' ? true : window.innerWidth > 860)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    let active = true
    const sessionTimeout = new Promise((resolve) => {
      window.setTimeout(() => resolve(null), 3000)
    })

    Promise.race([getAdminSession().catch(() => null), sessionTimeout])
      .then((admin) => {
        if (!active) return
        if (admin) setPage('dashboard')
      })
      .finally(() => {
        if (active) setCheckingSession(false)
      })

    return () => {
      active = false
    }
  }, [])

  const navigate = (item) => {
    if (item === '대시보드') setPage('dashboard')
    else if (item === '부스 참여') setPage('booth')
    else if (item === '참여자') setPage('participants')
    else if (item === '협찬 재고') setPage('sponsor')
    else if (item === '행사 진행표') setPage('runofshow')
    else if (item === '성과 보기') setPage('analytics')
    else if (item === '상세02') setPage('runDetail02')
    else if (/^상세0[3-8]$/.test(item)) setPage(`runDetail${item.slice(-2)}`)

    if (typeof window !== 'undefined' && window.innerWidth <= 860) setSidebarOpen(false)
  }

  if (checkingSession) {
    return <main className="session-loading">운영진 계정을 확인하고 있어요...</main>
  }

  if (page === 'login') {
    return <LoginPage onLogin={() => setPage('dashboard')} />
  }

  let content = null

  if (page === 'dashboard') content = <Dashboard onNavigate={navigate} />
  else if (page === 'booth') content = <BoothPage onNavigate={navigate} />
  else if (page === 'participants') content = <ParticipantsPage onNavigate={navigate} />
  else if (page === 'sponsor') content = <SponsorPage onNavigate={navigate} />
  else if (page === 'runofshow') content = <RunOfShowPage onNavigate={navigate} />
  else if (page === 'analytics') content = <AnalyticsPage onNavigate={navigate} />
  else if (page === 'runDetail02') {
    content = <RunDetail02 onBack={() => setPage('runofshow')} />
  } else if (/^runDetail0[3-8]$/.test(page)) {
    const no = page.slice(-2)
    content = (
      <RunDetailPage
        detail={{ ...remainingRunDetails[no], no }}
        onBack={() => setPage('runofshow')}
      />
    )
  }

  return (
    <div className={`admin-app-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <GlobalSidebar
        active={getActiveNav(page)}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((open) => !open)}
        onNavigate={navigate}
      />
      <div className="admin-app-content">
        {content}
      </div>
    </div>
  )
}
