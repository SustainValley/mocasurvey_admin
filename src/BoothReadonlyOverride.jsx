import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { lookupParticipant } from './adminStore'

const STABLE_LOGO_URL =
  'https://raw.githubusercontent.com/SustainValley/mocasurvey-offline/main/public/assets/cafe-moca-logo.png'

// 온라인 설문 src/surveyData.js의 TYPE_META와 동일한 표기
const TYPE_META = {
  slow: { name: '슬로우 무드형' },
  visual: { name: '디저트 비주얼형' },
  story: { name: '운영자 서사형' },
  archive: { name: '취향 아카이브형' },
  expert: { name: '전문성형' },
  event: { name: '경험 이벤트형' },
}

function getTypeName(value) {
  if (!value) return '결과 없음'
  return TYPE_META[value]?.name || value
}

function formatKst(value) {
  if (!value) return { date: '-', time: '-' }

  try {
    const parts = new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      hourCycle: 'h23',
    }).formatToParts(new Date(value))

    const pick = (type) => parts.find((part) => part.type === type)?.value || ''

    return {
      date: `${pick('year')}.${pick('month')}.${pick('day')}`,
      time: `${pick('hour')}:${pick('minute')}`,
    }
  } catch {
    return { date: '-', time: '-' }
  }
}

function StatusBadge({ ok, yes, no }) {
  return (
    <span className={`badge ${ok ? 'badge-green' : 'badge-pink'}`}>
      {ok ? yes : no}
    </span>
  )
}

function TimeBlock({ value, emptyText = '기록 없음' }) {
  if (!value) {
    return <p className="booth-status-empty">{emptyText}</p>
  }

  const { date, time } = formatKst(value)

  return (
    <div className="booth-status-time">
      <span>완료 시각</span>
      <div>
        <strong>{date}</strong>
        <b>{time}</b>
      </div>
    </div>
  )
}

function ReadonlyBoothPage() {
  const [studentId, setStudentId] = useState('')
  const [participant, setParticipant] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const lookup = async () => {
    const id = studentId.trim()
    if (!id) return

    setLoading(true)
    setMessage('')

    try {
      const data = await lookupParticipant(id)
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

  const onlineComplete = participant?.surveyStatus === 'completed'
  const offlineComplete = Boolean(participant?.offlineParticipatedAt)
  const luckyComplete = Boolean(participant?.luckyDrawParticipated)
  const primaryTypeName = getTypeName(participant?.primaryType)
  const secondaryTypeName = getTypeName(participant?.secondaryType)

  return (
    <main className="booth-main booth-readonly-main">
      <header className="booth-heading booth-readonly-heading">
        <h1>부스 참여 확인</h1>
        <p>학번으로 온라인·오프라인·럭키드로우 상태를 한 번에 확인해요.</p>
      </header>

      <section className="booth-card lookup-card booth-readonly-lookup">
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

      <section className={`booth-card participant-card booth-readonly-participant ${participant ? '' : 'is-empty'}`}>
        <h2>02&nbsp;&nbsp;참여자 상태</h2>

        {participant ? (
          <>
            <div className="booth-readonly-person-row">
              <div>
                <strong className="booth-readonly-person-name">{participant.name || '이름 없음'}</strong>
                <p className="participant-meta">
                  {participant.studentId}&nbsp;&nbsp;·&nbsp;&nbsp;{participant.department || '학과 미입력'}
                </p>
              </div>

              <div className="participant-top booth-readonly-badges">
                <StatusBadge ok={onlineComplete} yes="온라인 완료" no="온라인 미완료" />
                <StatusBadge ok={offlineComplete} yes="오프라인 완료" no="오프라인 미완료" />
                <StatusBadge ok={luckyComplete} yes="럭키드로우 완료" no="럭키드로우 전" />
              </div>
            </div>

            <div className="booth-type-result">
              <span>온라인 설문 결과</span>
              <div className="booth-type-copy">
                <strong>{primaryTypeName}</strong>
                <b>보조 유형 · {secondaryTypeName}</b>
              </div>
            </div>

            <div className="booth-readonly-status-grid">
              <article className={`booth-readonly-status-card ${onlineComplete ? 'is-complete' : ''}`}>
                <div className="booth-status-card-head">
                  <span>온라인 설문</span>
                  <strong>{onlineComplete ? '완료' : '미완료'}</strong>
                </div>
                <TimeBlock value={participant.completedAt} emptyText="온라인 설문 완료 기록 없음" />
              </article>

              <article className={`booth-readonly-status-card ${offlineComplete ? 'is-complete' : ''}`}>
                <div className="booth-status-card-head">
                  <span>오프라인 체험</span>
                  <strong>{offlineComplete ? '완료' : '미완료'}</strong>
                </div>
                <TimeBlock
                  value={participant.offlineParticipatedAt}
                  emptyText="6개 체험 완료 시 자동 반영"
                />
              </article>

              <article className={`booth-readonly-status-card ${luckyComplete ? 'is-complete' : ''}`}>
                <div className="booth-status-card-head">
                  <span>럭키드로우</span>
                  <strong>{luckyComplete ? `${participant.prizeRank || '-'}등` : '참여 전'}</strong>
                </div>
                {luckyComplete && (
                  <p className="booth-prize-name">{participant.prizeName || '상품 기록 있음'}</p>
                )}
                <TimeBlock
                  value={participant.luckyDrawnAt}
                  emptyText="온라인 + 오프라인 완료 후 참여 가능"
                />
              </article>
            </div>
          </>
        ) : (
          <p className="empty-guide">학번을 입력하고 참여자를 조회해주세요.</p>
        )}
      </section>

      <section className="booth-card operation-card booth-readonly-operation">
        <h2>03&nbsp;&nbsp;운영진 확인</h2>
        <div className="booth-operation-grid">
          <div>
            <span className="eyebrow">입장 시 확인</span>
            <strong>온라인 완료 여부 · 결과 유형</strong>
            <p>참여자가 온라인 설문을 완료했는지와 결과 유형을 확인해주세요.</p>
          </div>
          <div>
            <span className="eyebrow">오프라인 완료</span>
            <strong>운영진 수동 처리 없음</strong>
            <p>6개 카페 체험을 끝내면 DB에 자동으로 완료 시각까지 저장돼요.</p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default function BoothReadonlyOverride() {
  const [portalTarget, setPortalTarget] = useState(null)

  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return undefined

    let activeShell = null
    let portal = null
    let hiddenChildren = []

    const restore = () => {
      hiddenChildren.forEach((node) => {
        if (node?.isConnected) node.style.display = ''
      })
      hiddenChildren = []
      if (portal?.parentNode) portal.parentNode.removeChild(portal)
      portal = null
      activeShell = null
      setPortalTarget(null)
    }

    const sync = () => {
      document.querySelectorAll('img.moca-logo').forEach((img) => {
        if (img.getAttribute('src') !== STABLE_LOGO_URL) {
          img.setAttribute('src', STABLE_LOGO_URL)
        }
      })

      const shell = document.querySelector('.booth-shell')

      if (!shell) {
        if (activeShell) restore()
        return
      }

      if (shell === activeShell && portal?.isConnected) return

      if (activeShell && shell !== activeShell) restore()

      activeShell = shell
      portal = document.createElement('div')
      portal.className = 'booth-readonly-portal'

      hiddenChildren = Array.from(shell.children)
      hiddenChildren.forEach((node) => {
        node.style.display = 'none'
      })

      shell.appendChild(portal)
      setPortalTarget(portal)
    }

    sync()

    const observer = new MutationObserver(sync)
    observer.observe(root, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      restore()
    }
  }, [])

  return portalTarget ? createPortal(<ReadonlyBoothPage />, portalTarget) : null
}
