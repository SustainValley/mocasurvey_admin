const GUIDE_ID = 'moca-booth-operator-guide'

const guideMarkup = `
  <section id="${GUIDE_ID}" class="moca-guide" aria-label="CAFE MOCA 행사 운영 최종 안내">
    <div class="moca-guide__head">
      <div>
        <span class="moca-guide__eyebrow">CAFE MOCA · FINAL OPERATION GUIDE</span>
        <h2>행사 운영 최종 안내</h2>
        <p class="moca-guide__flow"><strong>전체 동선</strong> · 온라인 참여 확인·영수증 → 오프라인 키워드 게임 → 협찬 참여 → 럭키드로우 → 경품·협찬품 수령</p>
        <p class="moca-guide__supplies"><strong>각자 준비물</strong> · 아이패드 · 보조배터리 · 노트북</p>
        <p class="moca-guide__setup"><strong>행사 전 공통 세팅</strong> · 기기 충전 및 사이트 접속 확인 · 유형별 영수증 정리 · 협찬 QR 확인 · 럭키드로우 경품과 포장 협찬품 위치 확인</p>
      </div>
      <span class="moca-guide__people">운영진 3명</span>
    </div>

    <div class="moca-guide__grid">
      <article class="moca-guide__card">
        <div class="moca-guide__role">
          <b>01</b>
          <div>
            <span>입구 담당</span>
            <h3>팝업 소개 · 온라인 확인 · 영수증</h3>
          </div>
        </div>

        <div class="moca-guide__section">
          <span>담당 업무</span>
          <ol>
            <li>학우분께 CAFE MOCA가 <strong>각자의 카페 취향을 찾아보는 카페 팝업</strong>임을 간단히 소개합니다.</li>
            <li>학번을 조회해 <strong>온라인 참여 완료 여부와 카페 유형</strong>을 확인합니다.</li>
            <li>온라인 참여가 확인되면 유형에 맞는 영수증을 전달하고 ② 오프라인 담당으로 안내합니다.</li>
            <li>온라인 기록이 없으면 현장 QR로 온라인 설문을 먼저 참여하도록 안내합니다.</li>
          </ol>
        </div>

        <div class="moca-guide__script">
          <span>첫 안내</span>
          <p>“안녕하세요! 저희는 각자의 카페 취향을 찾아보는 CAFE MOCA 팝업입니다 :) 참여 여부 확인 먼저 도와드리겠습니다. 학번 말씀해주시면 감사하겠습니다!”</p>
        </div>
        <div class="moca-guide__script moca-guide__script--sub">
          <span>온라인 참여 완료</span>
          <p>“온라인 참여 확인되었습니다! ○○형으로 나오셨고요, 여기 유형 영수증 전달드리겠습니다. 영수증 챙겨서 옆 오프라인 게임으로 이동 부탁드리겠습니다 :)”</p>
        </div>
        <div class="moca-guide__script moca-guide__script--sub">
          <span>온라인 기록 없음</span>
          <p>“현재 온라인 참여 기록이 확인되지 않고 있어서요. 먼저 QR을 통해 온라인 설문 참여 부탁드리겠습니다. 완료 후 다시 와주시면 확인 도와드리겠습니다!”</p>
        </div>

        <div class="moca-guide__exception">
          <strong>예외</strong>
          <p>참여했다고 하는데 조회되지 않으면 학번을 다시 확인하고, 필요 시 온라인 설문 완료 화면을 확인합니다.</p>
        </div>
      </article>

      <article class="moca-guide__card">
        <div class="moca-guide__role">
          <b>02</b>
          <div>
            <span>오프라인 담당</span>
            <h3>키워드 게임 · 협찬 · 인스타 안내</h3>
          </div>
        </div>

        <div class="moca-guide__section">
          <span>담당 업무</span>
          <ol>
            <li>온라인 설문에서 사용한 <strong>동일한 학번</strong>을 입력하도록 안내합니다.</li>
            <li>화면 안내에 따라 <strong>키워드 맞추기 게임을 마지막 완료 화면까지</strong> 진행하도록 안내합니다.</li>
            <li>게임 완료 시 오프라인 참여가 DB에 자동 반영되는지 흐름을 확인합니다.</li>
            <li>게임이 끝나면 협찬 QR 참여를 안내하고, <strong>협찬 브랜드에 많은 관심</strong>과 <strong>CAFE MOCA 인스타그램 팔로우</strong>도 함께 부탁드립니다.</li>
            <li>협찬 참여를 시작한 학우분을 ③ 마무리 담당에게 이어줍니다.</li>
          </ol>
        </div>

        <div class="moca-guide__script">
          <span>게임 안내</span>
          <p>“온라인 설문에 입력하셨던 학번과 동일하게 입력 부탁드리겠습니다. 화면 안내에 따라 키워드 게임을 마지막까지 진행해주시면 됩니다 :)”</p>
        </div>
        <div class="moca-guide__script moca-guide__script--sub">
          <span>게임 완료 후</span>
          <p>“게임 완료되셨습니다! 이제 협찬 QR 참여 부탁드리겠습니다. 이번 팝업에 함께해주신 협찬 브랜드에도 많은 관심 부탁드리고, CAFE MOCA 인스타그램도 팔로우해주시면 감사하겠습니다 :) 참여를 모두 마치신 뒤 옆 운영진에게 완료 화면을 보여주세요!”</p>
        </div>

        <div class="moca-guide__exception">
          <strong>예외</strong>
          <p>게임이 중간에 꺼지거나 완료 화면이 나오지 않으면 완료 여부를 확인하고, 완료 기록이 없을 경우 다시 진행하도록 안내합니다.</p>
        </div>
      </article>

      <article class="moca-guide__card">
        <div class="moca-guide__role">
          <b>03</b>
          <div>
            <span>마무리 담당</span>
            <h3>협찬 확인 · 럭키드로우 · 최종 지급</h3>
          </div>
        </div>

        <div class="moca-guide__section">
          <span>담당 업무</span>
          <ol>
            <li>학우분의 <strong>협찬 참여 완료 화면을 직접 확인</strong>합니다.</li>
            <li>확인된 학우분만 본인 학번을 입력해 럭키드로우를 진행하도록 안내합니다.</li>
            <li>럭키드로우는 <strong>학번당 1회</strong>이며 재추첨하지 않습니다.</li>
            <li>결과가 나오면 <strong>럭키드로우 경품 + 미리 포장한 협찬품</strong>을 한 번에 전달합니다.</li>
            <li>지급까지 완료되면 감사 인사 후 참여를 마무리합니다.</li>
          </ol>
        </div>

        <div class="moca-guide__script">
          <span>협찬 확인 → 럭키드로우</span>
          <p>“협찬 참여 완료 화면 한 번 확인 도와드리겠습니다! 네, 모두 확인되었습니다. 이제 마지막 럭키드로우 진행 도와드리겠습니다 :)”</p>
        </div>
        <div class="moca-guide__script moca-guide__script--sub">
          <span>경품 전달</span>
          <p>“축하드립니다! 럭키드로우 경품과 협찬품 함께 전달드리겠습니다 :) CAFE MOCA 팝업에 참여해주셔서 감사합니다!”</p>
        </div>

        <div class="moca-guide__mini">
          <strong>컴포즈 105잔 운영</strong>
          <p>09:50 35잔 · 12:50 35잔 · 14:50 35잔. 각 타임에 남은 수량은 다음 타임으로 이월하며, 행사 전체에서 총 105잔 지급을 기준으로 합니다.</p>
        </div>

        <div class="moca-guide__exception">
          <strong>예외</strong>
          <p>협찬 미완료자는 완료 후 다시 확인합니다. 이미 럭키드로우 참여 기록이 있는 학번은 재추첨하지 않고 기록을 확인합니다. 지급 오류가 있으면 상품을 먼저 추가 지급하지 말고 참여 기록과 재고를 확인합니다.</p>
        </div>

        <div class="moca-guide__close">
          <strong>18:00 마감</strong>
          <p>참여 데이터와 실제 지급 상품·협찬품 재고를 대조하고, 기기와 운영 물품을 정리합니다.</p>
        </div>
      </article>
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

function removeOldRunOfShow(runMain) {
  runMain.querySelector('.run-flow')?.remove()
  runMain.querySelector('.run-workspace')?.remove()
}

function mountGuide() {
  replaceStaleCopy()

  const runMain = document.querySelector('.run-main-responsive')
  if (!runMain) return

  removeOldRunOfShow(runMain)

  if (document.getElementById(GUIDE_ID)) return

  const heading = runMain.querySelector('.run-heading')
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
