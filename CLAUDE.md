# 레나 (Lena) — 한밤의 공중전화 비서 웹앱

송휘님(사용자)의 개인 비서 웹앱. 캐릭터 '레나'와 말 없는 해골 짝꿍이 나온다. (예전 '하루' 앱은 git 기록에 남아 있다. 새 앱은 하루 코드를 쓰지 않고 처음부터 만들었다.)
사용자는 개발자가 아니다. **답은 한국어로, 쉽고 짧게, 오해 없게.** 무엇을 바꿨는지와 사용자가 할 일(확인 방법)만 알려준다.

## 배포
- 앱: https://vecar0.github.io/haru/ — 이 저장소(GitHub Pages, main). 파일: `index.html`(화면·CSS), `app.js`(전부의 동작), `sw.js`, `manifest.json`, `icon-180.png`, `icon-512.png`, `assets/lena/`(그림·영상)
- **배포할 때마다 `sw.js`의 캐시 버전 `lena-vN`을 1 올린다** (현재 v6). 그림을 추가하면 `sw.js`의 목록 `F`에도 넣는다.
- 아이폰 홈 화면에 설치해서 쓴다. 업데이트 확인은 "앱 완전 종료 후 다시 열기". 아이콘을 바꾸면 홈 화면에서 지우고 Safari에서 다시 "홈 화면에 추가".
- 알림 서버: Cloudflare Worker `haru-push` (https://haru-push.vecar0473.workers.dev) 그대로 사용. 엔드포인트 `/vapid` `/sync` `/test` `/status`. `/sync`의 plan은 `{reminders:[{id,at,body}],routines:[],water:null,tz,brief:null}` 형식 — 레나 앱은 reminders만 쓴다(전단지 10분 전·정각, 예약 전화, 모닝콜 8일치). 알림 제목은 sw.js가 '레나'로 바꿔 보여 준다.
- AI: Gemini (키는 앱 설정, 폰에만). 대화 모델 자동=가장 새 Flash(lite 제외), 2.5는 thinkingBudget 512. 목소리 `gemini-2.5-flash-preview-tts`, 기본 목소리 Leda.

## 앱 구조 (app.js)
- 저장: `localStorage['lena1']` → `S` (name, key, items, calls, memory, diary, history, coins, coinDays, morning, mcDone, voice, vname, srv, uid/sec/sub/pushOn, ack, fired). 처음 실행 때 예전 `haru2`에서 이름·키·알림 연결만 가져온다.
- **앱을 열면 밖 모드(음성통화 화면)**: 고양이 프사(`assets/lena/cat.jpg`, 하얀 고양이·머리 위 핑크 선글라스·초록 수화기 — 원본 `art/new/avatar/cat_pin_5.png`(사용 중, 선글라스 그라데이션), 다른 후보 1~4·6), 이름·통화 시간, 대화, 버튼 6개(키패드·전단지·**영상통화**·예약 전화·부재중·스피커=목소리 켜기). 배경 영상은 멈춰 둔다. "영상통화"를 누르면 아래 부스 화면으로, 부스 화면 위쪽 "음성으로"를 누르면 다시 밖 모드로.
- 홈(영상통화) = 비 오는 공중전화 부스(배경 영상 `assets/lena/bg.mp4`, 끊김 없이 반복, 번쩍임 줄임). 위: 부재중 배지·시계. 유리에 붙은 전단지(다음 일정 분홍, 할 일 노랑), 동전 수. 지난 일정이 있으면 해골 손이 유리를 "똑똑". 아래: 레나 자막, 버튼 다이얼/수화기 들기/전단지.
- 다이얼(공중전화 키패드, DTMF 소리): 1 오늘 2 할 일 3 이번 주(전단지 시트 탭) 4 예약 전화 5 음성사서함(기억) 6 통화 일기 7 모닝콜 8 동전함 9 부재중 ✱ 통화 기록 0 설정 # 닫기.
- 통화 = Gemini 대화(스트리밍 자막, 사진, 음성 입력 SpeechRecognition, 목소리). 답 JSON: reply, mood(tease/happy/worry/pout/surprise/calm → 스티커 팝), add, done, remove, callback, remember, diary. 저장하면 "✓ … 되돌리기" 쪽지.
- 전단지를 떼면(끝냄) 찢어지는 연출 + 동전 1개. 동전 3개로 "특별 통화"(길게 칭찬).
- 모닝콜: 정한 시각 알림 + 앱을 열면 걸려오는 전화 화면 → 받으면 오늘 브리핑, "5분만…"이면 5분 뒤 다시. 2시간 안에 안 받으면 부재중.
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
