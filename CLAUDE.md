# 레나 (Lena) — 한밤의 공중전화 비서 웹앱

송휘님(사용자)의 개인 비서 웹앱. 캐릭터 '레나'와 말 없는 해골 짝꿍이 나온다. (예전 '하루' 앱은 git 기록에 남아 있다. 새 앱은 하루 코드를 쓰지 않고 처음부터 만들었다.)
사용자는 개발자가 아니다. **답은 한국어로, 쉽고 짧게, 오해 없게.** 무엇을 바꿨는지와 사용자가 할 일(확인 방법)만 알려준다.

## 배포
- 앱: https://vecar0.github.io/lena/ — 이 저장소(vecar0/lena, 예전 이름 haru)(GitHub Pages, main). 파일: `index.html`(화면·CSS), `app.js`(전부의 동작), `sw.js`, `manifest.json`, `icon-180.png`, `icon-512.png`, `assets/lena/`(그림·영상)
- **배포할 때마다 `sw.js`의 캐시 버전 `lena-vN`을 1 올린다** (현재 v17). 그림을 추가하면 `sw.js`의 목록 `F`에도 넣는다.
- 아이폰 홈 화면에 설치해서 쓴다. 업데이트 확인은 "앱 완전 종료 후 다시 열기". 아이콘을 바꾸면 홈 화면에서 지우고 Safari에서 다시 "홈 화면에 추가".
- 알림 서버: Cloudflare Worker `haru-push` (https://haru-push.vecar0473.workers.dev) 그대로 사용. 엔드포인트 `/vapid` `/sync` `/test` `/status`. `/sync`의 plan은 `{reminders:[{id,at,body}],routines:[],water:null,tz,brief:null}` 형식 — 레나 앱은 reminders만 쓴다(전단지 10분 전·정각, 예약 전화, 모닝콜 8일치). 알림 제목은 sw.js가 '레나'로 바꿔 보여 준다.
- AI: Gemini (키는 앱 설정, 폰에만). 대화 모델 자동=가장 새 Flash(lite 제외), 2.5는 thinkingBudget 512. 레나 목소리(TTS)는 사용자가 빼서 쓰지 않는다(`speak()`는 빈 함수).

## 앱 구조 (app.js)
- 저장: `localStorage['lena1']` → `S` (name, key, items, calls, memory, diary, history, coins, coinDays, morning, mcDone, srv, uid/sec/sub/pushOn, ack, fired). 처음 실행 때 예전 `haru2`에서 이름·키·알림 연결만 가져온다.
- **앱을 열면 밖 모드(음성통화 화면)**: 고양이 프사(`assets/lena/cat.jpg`, 하얀 고양이·머리 위 핑크 선글라스·초록 수화기 — 원본 `art/new/avatar/cat_pin_5.png`(사용 중, 선글라스 그라데이션), 다른 후보 1~4·6), 이름·통화 시간, 대화, 버튼 6개(키패드·전단지·**영상통화**·예약 전화·부재중·설정). 배경 영상은 멈춰 둔다. "영상통화"를 누르면 아래 부스 화면으로, 부스 화면 위쪽 "음성으로"를 누르면 다시 밖 모드로.
- 홈(영상통화) = 비 오는 공중전화 부스(배경 영상 `assets/lena/bg.mp4`, 끊김 없이 반복, 번쩍임 줄임). 위: 부재중 배지·시계. 유리에 붙은 전단지(다음 일정 분홍, 할 일 노랑), 동전 수. 지난 일정이 있으면 해골 손이 유리를 "똑똑". 아래: 레나 자막, 버튼 다이얼/수화기 들기/전단지.
- 다이얼(공중전화 키패드, DTMF 소리): 1 오늘 2 할 일 3 이번 주(전단지 시트 탭) 4 예약 전화 5 음성사서함(기억) 6 통화 일기 7 모닝콜 8 오락실 9 부재중 ✱ 통화 기록 0 설정 # 닫기.
- 통화 = Gemini 대화(스트리밍 자막, 사진, 음성 입력 SpeechRecognition). 답 JSON: reply, mood(tease/happy/worry/pout/surprise/calm → 스티커 팝), add, done, remove, callback, remember, diary. 저장하면 "✓ … 되돌리기" 쪽지.
- 전단지를 떼면(끝냄) 찢어지는 연출 + 동전 1개. 동전 3개로 "특별 통화"(길게 칭찬).
- 모닝콜: 정한 시각 알림(받을 때까지 2분마다 5번 더) · 진짜 알람은 iOS 단축어 '레나 알람'(알람 생성)으로 시계 앱에 만든다(`shortcuts://run-shortcut`) + 앱을 열면 걸려오는 전화 화면 → 받으면 오늘 브리핑, "5분만…"이면 5분 뒤 다시. 2시간 안에 안 받으면 부재중.
- 처음 실행: 모르는 번호 전화 → 받으면 레나가 이름을 묻고, 키를 받는다.

## 캐릭터
- 레나: 20대 중반, 은발+끝 핑크 울프컷, 머리 위 둥근 핑크 선글라스, 가죽 재킷+흰 크롭 셔츠, 초커. 장난스럽고 능글맞은, 살짝 섹시한 존댓말(은근한 플러팅까지만), 놀리지만 다 챙겨 줌. 호칭 "송휘님".
- 해골: 말 없는 짝꿍. 몸짓으로만 반응.
- 그림 원본: `art/new/lena_base.webp`(기준 그림), `art/new/lena_loop_src.mp4`(영상 원본). 컨셉·프롬프트 기록은 `CONCEPT.md`.
- UI 그림(`assets/lena/` 스티커·테이프·종이·해골 손)은 Higgsfield GPT Image 2.5로 만들어 잘라 씀.

## 화면 규칙
- 색: 청록 #2fe0c8, 민트 #9ff5e4, 핑크 #ff3d9a, 빨강 #ff2e6e, 노랑 #f2ea3a, 종이 #f3efe6. 글꼴: 제목 Black Han Sans, 숫자 Space Mono, 본문 Pretendard.
- 입력칸 글자 16px(아이폰 확대 방지), 버튼 높이 44 이상. 시트는 `openSheet(번호)`로 열고 `SH[번호]`에 내용 렌더러를 둔다.
- 수정 후 확인: `node --check app.js`, 로컬 서버 + Playwright로 390×844 캡처.

## 남은 일
1. 해골 반응 영상(마감 임박에 다가옴, 엄지척)과 레나 표정 영상 추가.
2. 실제 폰에서 전단지·버튼 위치 미세 조정.

## 앱 아이콘
- `icon-512.png`/`icon-180.png`: 민트 고양이 카드가 아이콘을 꽉 채움(모서리를 아이폰 아이콘 모양에 맞춤), 검은 테두리, 오른쪽 아래에 얇은 핑크 두께 + 광택(`art/new/avatar/cat_pin_5.png`), 위쪽 광택과 부드러운 그림자로 입체감.

## 오락실 (다이얼 8번, 홈의 동전 배지)
- 파일: `arcade.js`(허브·게임 동전·해골 빚 슬롯, 전역 `ARC`), 게임마다 `g_surv.js` `g_rhythm.js` `g_idle.js` `g_cards.js` — `ARC.reg({id,order,name,ban,sub,start})`로 등록. 화면은 `ARC.frame(제목, 내용함수, 뒤로버튼, flat)`, 루프·소리는 `ARC.cleanup`에 정리 함수를 넣는다.
- 게임 동전 `S.gc`: 매일 +10(최대 99), 0개면 하루 한 번 3개 빌림. 할 일 동전 `S.coins`와 따로. 할 일 동전은 특별 통화(3개)·전화국 부스트(1개)에 쓴다.
- 허브 카드는 표지 그림 대신 차분한 카드 + 스프라이트 아이콘(`icon`,`color`). 게임은 오래 이어지게: 서바이버는 한 번 부활 + 5분 뒤 '끝없는 밤', 리듬은 곡 길이 2배 + '끝없는 밤' 메들리(하트 10개), 카드는 사장 뒤로 끝없는 지하(10층마다 강해짐), 슬롯은 빚 완만 + 레나 외상 한 번.
- 게임: ① 빗속의 고양이(서바이버 형식, 캔버스, 5분 버티기) ② 리듬 다이얼(키패드 리듬, 음악은 WebAudio로 직접 합성, 3곡) ③ 해골 전화국(방치형, 꺼 둬도 8시간까지 쌓임, `S.idl`) ④ 해골과 카드 대결(덱 빌딩, 지하 10층, `S.cardRun`) ⑤ 해골 빚 슬롯(클로버핏 같은 빚 갚기 슬롯, 부적, `S.slotRun`).
- 그림: `assets/lena/g/`(Higgsfield GPT Image 2.5로 만든 스프라이트 시트를 잘라 씀; 원본 `art/new/games/`). 표지 `ban_*.jpg`, 서바이버 `s_*`, 부스 `b_*`, 카드 그림 `c_*`, 적 `e_*`, 골목 바닥 `tile.jpg`.

## 레나가 먼저 움직이기 (`proactive.js`, app.js 함수를 감싸서 덧붙임)
- A1 점심(12:30)·밤(22:00) 알림, A2 일정 1시간 전·끝나고 1시간 뒤 "어땠어요?", A3 밀린 일 재촉(15·21시). 설정 `S.pro` (0번 설정 > 레나가 먼저 연락). 모두 `plan()`의 reminders로 서버에 올라감.
- D1 시간 없는 할 일에 시간 제안 카드, D2 지난 일정 "했어요?"(응/내일로/안 할래), D3 반복 일정 `S.reps`(2주 치 전단지 자동 생성, `rkey`, 지운 건 `S.repSkip`), D4 밀린 전단지 한 번에 정리 시트 `SH.cl`(해골 손 "똑똑"을 누르면 열림). Gemini 답에 `repeat`, add 항목에 `alarm:true`.
## 단축어 연결 (`box.js` + 서버 `box-worker.js`)
- 새 Cloudflare Worker `lena-box`(KV 바인딩 `BOX`)를 사용자가 직접 배포해야 함. 앱 0번 설정 > 단축어에서 주소 입력. 열쇠 `S.boxTok`.
- B2: 앱이 `/alarms`에 모닝콜·⏰ 표시 전단지 시간을 올리고, 밤 10시 단축어 자동화가 받아 시계 알람 생성. C3 공유 시트 단축어·C4 잠금화면/제어센터 단축어가 `/in`으로 보내면 앱이 `/inbox`를 가져와 통화로 정리.
- 영상 화면 점무늬는 `.dots` 층, 레나 모양을 오려 낸 `assets/lena/dotmask.png`(rembg isnet-anime로 만든 가림판)로 레나 위에만 안 깔림. 오락실의 레나 말풍선 사진은 음성통화일 때 고양이, 영상통화일 때 레나 얼굴(`.talkr i.face`).
- 화면 높이: `.app{position:fixed;inset:0}`. visualViewport로 높이를 맞추는 건 키보드가 올라와 있을 때만(아이폰 홈 화면 앱은 평소 높이를 상태바만큼 작게 알려 줘서 아래가 비었었음).
