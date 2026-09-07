const GUIDE_ID = 'moca-booth-operator-guide'

const guideMarkup = `
  <section id="${GUIDE_ID}" class="moca-guide" aria-label="CAFE MOCA 부스 운영 설명">
    <div class="moca-guide__head">
      <div>
        <span class="moca-guide__eyebrow">BOOTH OPERATION GUIDE</span>
        <h2>부스 운영 설명</h2>
        <p>① 입구·영수증 → ② 오프라인 게임·협찬 안내 → ③ 협찬 확인·럭키드로우·경품 전달</p>
      </div>
      <span class="moca-guide__people">운영진 3명</span>
    </div>

    <div class="moca-guide__grid">
      <article class="moca-guide__card">
        <div class="moca-guide__role">
          <b>01</b>
          <div>
            <span>입구 담당</span>
            <h3>팝업 소개 · 학번 확인 · 영수증</h3>
          </div>
        </div>
        <ol>
          <li>CAFE MOCA가 <strong>나의 카페 취향을 찾아보는 팝업</strong>임을 간단히 소개합니다.</li>
          <li>학번으로 온라인 참여 여부와 카페 유형을 확인합니다.</li>
          <li>참여 완료자는 유형에 맞는 영수증을 전달하고 오프라인 게임으로 안내합니다.</li>
          <li>기록이 없으면 온라인 설문을 먼저 참여하도록 안내합니다.</li>
        </ol>
        <div class="moca-guide__script">
          <span>첫 안내 멘트</span>
          <p>“안녕하세요! 저희는 각자의 카페 취향을 찾아보는 CAFE MOCA 팝업입니다 :) 참여 여부 확인 먼저 도와드리겠습니다. 학번 말씀해주시면 감사하겠습니다!”</p>
        </div>
        <div class="moca-guide__script moca-guide__script--sub">
          <span>온라인 참여 완료</span>
          <p>“온라인 참여 확인되었습니다! ○○형으로 나오셨고요, 여기 유형 영수증 전달드리겠습니다. 영수증 챙겨서 옆 오프라인 게임으로 이동 부탁드리겠습니다 :)”</p>
        </div>
        <p class="moca-guide__handoff">다음 담당에게 넘기는 기준 · <strong>온라인 참여 확인 + 영수증 전달 완료</strong></p>
      </article>

      <article class="moca-guide__card">
        <div class="moca-guide__role">
          <b>02</b>
          <div>
            <span>체험 담당</span>
            <h3>오프라인 게임 · 협찬 · 인스타 안내</h3>
          </div>
        </div>
        <ol>
          <li>온라인 설문에서 사용한 <strong>동일한 학번</strong>을 입력하도록 안내합니다.</li>
          <li>키워드 게임을 마지막 완료 화면까지 진행하도록 안내합니다.</li>
          <li>게임 완료 후 협찬 QR 참여 방법을 안내합니다.</li>
          <li><strong>협찬 브랜드에 대한 관심</strong>과 <strong>CAFE MOCA 인스타그램 팔로우</strong>도 함께 부탁드립니다.</li>
        </ol>
        <div class="moca-guide__script">
          <span>게임 안내 멘트</span>
          <p>“온라인 설문에 입력하셨던 학번과 동일하게 입력 부탁드리겠습니다. 이후 화면 안내에 따라 키워드 게임을 마지막까지 진행해주시면 됩니다 :)”</p>
        </div>
        <div class="moca-guide__script moca-guide__script--sub">
          <span>게임 완료 후</span>
          <p>“게임 완료되셨습니다! 이제 협찬 QR 참여 부탁드리겠습니다. 이번 팝업에 함께해주신 협찬 브랜드에도 많은 관심 부탁드리고, CAFE MOCA 인스타그램도 팔로우해주시면 감사하겠습니다 :) 모두 참여하신 뒤 옆 운영진에게 완료 화면을 보여주세요!”</p>
        </div>
        <p class="moca-guide__handoff">다음 담당에게 넘기는 기준 · <strong>게임 완료 + 협찬 참여 시작 안내 완료</strong></p>
      </article>

      <article class="moca-guide__card">
        <div class="moca-guide__role">
          <b>03</b>
          <div>
            <span>마무리 담당</span>
            <h3>협찬 확인 · 럭키드로우 · 경품 전달</h3>
          </div>
        </div>
        <ol>
          <li>협찬 참여 <strong>완료 화면을 직접 확인</strong>합니다.</li>
          <li>확인된 학우만 마지막 럭키드로우로 안내합니다.</li>
          <li>본인 학번을 입력하도록 안내하고, <strong>학번당 1회 참여</strong>인지 확인합니다.</li>
          <li>럭키드로우가 끝나면 <strong>당첨 경품 + 미리 포장한 협찬품</strong>을 한 번에 전달합니다.</li>
        </ol>
        <div class="moca-guide__script">
          <span>협찬 확인 → 럭드</span>
          <p>“협찬 참여 완료 화면 한 번 확인 도와드리겠습니다! 네, 모두 확인되었습니다. 이제 마지막 럭키드로우 진행 도와드리겠습니다 :)”</p>
        </div>
        <div class="moca-guide__script moca-guide__script--sub">
          <span>마무리 멘트</span>
          <p>“축하드립니다! 럭키드로우 경품과 협찬품 함께 전달드리겠습니다 :) CAFE MOCA 팝업에 참여해주셔서 감사합니다!”</p>
        </div>
        <p class="moca-guide__handoff">참여 종료 기준 · <strong>협찬 확인 + 럭드 + 경품·협찬품 전달 완료</strong></p>
      </article>
    </div>

    <div class="moca-guide__notes">
      <div>
        <span>꼭 기억하기</span>
        <p>온라인 확인 전 영수증 전달 X · 게임 마지막 화면 전 완료 X · 협찬 확인 전 럭키드로우 X · 재추첨 X</p>
      </div>
      <div>
        <span>컴포즈 105잔 운영</span>
        <p>09:50 35잔 · 12:50 35잔 · 14:50 35잔 / 남은 수량은 다음 타임으로 이월하며, 행사 전체 총 105잔 지급이 기준입니다.</p>
      </div>
    </div>
  </section>
`

const textReplacements = new Map([
  ['오프라인 6개 체험 완료 시 DB 자동 반영', '오프라인 키워드 게임 완료 시 DB 자동 반영'],
  ['온라인 설문 완료자 중 6개 오프라인 체험을 모두 마친 인원이에요.', '온라인 설문 완료자 중 오프라인 키워드 게임을 완료한 인원이에요.'],
  ['6개 체험 완료 시 자동 반영', '키워드 게임 완료 시 자동 반영'],
  ['오프라인 6개 체험 완료 인원이 DB에 자동 반영되며, 이 수치를 기준으로 재고를 확인해요.', '오프라인 키워드 게임 완료 인원이 DB에 자동 반영되며, 이 수치를 기준으로 재고를 확인해요.'],
])

function replaceStaleCopy(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()

  while (node) {
    const replacement = textReplacements.get(node.nodeValue?.trim())
    if (replacement) node.nodeValue = replacement
    node = walker.nextNode()
  }
}

function mountGuide() {
  replaceStaleCopy()

  const boothMain = document.querySelector('.booth-main-v2')
  if (!boothMain || document.getElementById(GUIDE_ID)) return

  const heading = boothMain.querySelector('.booth-heading')
  if (!heading) return

  heading.insertAdjacentHTML('afterend', guideMarkup)
}

const observer = new MutationObserver(() => mountGuide())
observer.observe(document.documentElement, { childList: true, subtree: true })

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountGuide, { once: true })
} else {
  mountGuide()
}
