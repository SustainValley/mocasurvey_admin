import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { lookupParticipant } from './adminStore'

const STABLE_LOGO_URL =
  'https://raw.githubusercontent.com/SustainValley/mocasurvey-offline/main/public/assets/cafe-moca-logo.png'

function formatTime(value) {
  if (!value) return '-'
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'Asia/Seoul',
    }).format(new Date(value))
  } catch {
    return '-'
  }
}

function StatusBadge({ ok, yes, no }) {
  return (
    <span className={`badge ${ok ? 'badge-green' : 'badge-pink'}`}>
      {ok ? yes : no}
    </span>
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

  return (
    <main className="booth-main booth-readonly-main">
      <header className="booth-heading">
        <h1>부스 참여 확인</h1>
        <p>학번으로 온라인·오프라인·럭키드로우 상태를 한 번에 확인해요.</p>
      </header>

      <section className="booth-card lookup-card">
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

      <section className={`booth-card participant-card ${participant ? '' : 'is-empty'}`}>
        <h2>02&nbsp;&nbsp;참여자 상태</h2>

        {participant ? (
          <>
            <div className="participant-top booth-readonly-badges">
              <strong>{participant.name || '이름 없음'}</strong>
              <StatusBadge ok={onlineComplete} yes="온라인 완료" no="온라인 미완료" />
              <StatusBadge ok={offlineComplete} yes="오프라인 완료" no="오프라인 미완료" />
              <StatusBadge ok={luckyComplete} yes="럭키드로우 완료" no="럭키드로우 전" />
            </div>

            <p className="participant-meta">
              {participant.studentId}&nbsp;&nbsp;·&nbsp;&nbsp;{participant.department || '학과 미입력'}
            </p>

            <div className="booth-readonly-status-grid">
              <article className="booth-readonly-status-card">
                <span>온라인 설문</span>
                <strong>{participant.primaryType || '결과 없음'}</strong>
                <small>{onlineComplete ? `완료 · ${formatTime(participant.completedAt)}` : '미완료'}</small>
              </article>

              <article className="booth-readonly-status-card">
                <span>오프라인 체험</span>
                <strong>{offlineComplete ? '참여 완료' : '미완료'}</strong>
                <small>{offlineComplete ? formatTime(participant.offlineParticipatedAt) : '6개 체험 완료 시 자동 반영'}</small>
              </article>

              <article className="booth-readonly-status-card">
                <span>럭키드로우</span>
                <strong>
                  {luckyComplete
                    ? `${participant.prizeRank || '-'}등 · ${participant.prizeName || '상품 기록 있음'}`
                    : '참여 전'}
                </strong>
                <small>{luckyComplete ? formatTime(participant.luckyDrawnAt) : '온라인 + 오프라인 완료 후 참여 가능'}</small>
              </article>
            </div>
          </>
        ) : (
          <p className="empty-guide">학번을 입력하고 참여자를 조회해주세요.</p>
        )}
      </section>

      <section className="booth-card operation-card">
        <h2>03&nbsp;&nbsp;운영진 확인</h2>
        <span className="eyebrow">입장 시 확인</span>
        <p className="guide-quote">“온라인 설문 완료 여부와 결과 유형을 확인해주세요.”</p>
        <span className="eyebrow second">오프라인 완료</span>
        <strong className="check-line">운영진 수동 처리 없음 · 체험 사이트에서 자동 저장</strong>
        <p className="finish-note">
          참가자가 6개 카페 체험을 모두 끝내면 DB의 오프라인 완료 상태가 자동으로 바뀝니다.
        </p>
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
