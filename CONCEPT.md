# 새 비서 앱 컨셉 (v4 — 처음부터 다시)

뱀파이어·세레나·고딕 응접실 컨셉은 **버렸다**. 예전 시안과 그림은 `art/`, `design/`에 기록으로만 남아 있다.

## 정해진 것
- **분위기 = 사용자가 보낸 레퍼런스 그림** (공중전화 부스의 소녀와 뒤에 드리운 거대한 해골)
  - 리소 인쇄 느낌: 청록·민트 바탕 + 분홍·빨강 포인트, 망점, 어긋난 인쇄, 거친 질감, 빗줄기, 물감 튐
  - 위에서 비스듬히 내려다보는 구도, 화면 쪽으로 뻗는 손(원근감), 대각선 흐름, 빽빽한 콜라주
  - 힙한 스트리트·펑크 패션, 선글라스·피어싱·체인·네일 같은 장신구
- 앱은 개인 비서: 대화 + 일정·할 일 + 아침 브리핑 + 알림. GitHub Pages(`vecar0.github.io/haru`)에 덮어쓰기
- 대화는 Gemini(설정 "대화 두뇌"에서 모델 선택, lite 안 씀)
- 입체감: 컷마다 배경까지 포함된 완성 그림 + 무료 깊이 정보로 손가락 끌기 시차 효과
- 그림은 사용자가 PixAI로 만든다. Higgsfield는 사용자가 요청할 때만

## 정해진 것 (사용자 답, 11/4)
- **성격·말투: 장난스러운 존댓말.** 능글맞고 놀리지만 챙겨 줌. 호칭 "송휘님". 짧은 문장.
  - 예: "송휘님, 또 미루셨네요? 귀여우셔라." / "3시 회의예요. 늦으시면 제가 전화 계속 걸 거예요."
- **해골: 말 없는 짝꿍.** 소녀 뒤에서 몸짓으로만 반응 (예전 고양이 나비 같은 역할)
  - 마감이 가까우면 뒤에서 점점 다가옴 / 할 일을 끝내면 엄지척 / 오래 안 들어오면 부스 유리를 톡톡
- **앱 컨셉: 「한밤의 공중전화」**
  - 홈 = 비 오는 밤 공중전화 부스. 소녀가 수화기를 들고 있고 해골이 뒤에 드리움
  - 대화 = 통화. 수화기를 들면 통화 시작, 답은 아래 자막처럼
  - 아침 브리핑 = **모닝콜** (정한 시각에 전화 오는 알림 → 받으면 오늘 일정)
  - 놓친 일정·알림 = **부재중 전화** (빨간 숫자 배지)
  - 일정·할 일 = 부스 유리·벽에 붙은 **전단지·스티커**. 끝내면 찢어져 떨어짐
  - 전화 다이얼 패드 = 빠른 메뉴 (예: 1 오늘 일정, 2 할 일, 3 이번 주, 0 설정)

## 캐릭터 (초안)
- 이름: **레나 (Lena)** — 사용자가 고름 (조건: 레로 시작, 두 글자, 섹시하고 세련됨)
- 외모(v4): 은발 + 끝 핑크 울프컷 단발, 머리 위 둥근 핑크 렌즈 선글라스 / 스터드 크롭 가죽 재킷 + 안에 흰 크롭 와이셔츠(깃·단추 있음, 넥타이 없음, 배 드러남), 성인 체형·큰 가슴 / 빨강·검정 체크 미니스커트 / 찢어진 망사 + 통굽 부츠 / 초커, 긴 핑크 네일 + 반지 (얼굴엔 장식 없음, 눈 색은 지정 안 함)
- 구도: 레퍼런스처럼 위에서 비스듬히 내려다봄, 한 손은 수화기, 한 손은 화면 쪽으로 뻗음(원근감), 거대한 해골이 바로 뒤에서 감싸듯 드리움. 정적이지 않게 기울어진 구도 + 펑키한 효과(물감 튐, 망점, 글리치, 빗줄기, 머리 휘날림)
- 기본 표정: 메롱(한쪽 눈 감고 혀 내밀기). 손: 한 손은 초록 수화기, 다른 손은 입술에 손가락(섹시하게, 화면 쪽으로 뻗지 않음)
- **기준 그림(확정): `art/new/lena_base.webp`** (9:16, 윙크+메롱, 입술에 손가락). 고해상도 1136×2048로 교체함. 이전 후보 `art/new/base_candidate.webp`
- 시험 그림: `art/new/test5_lora2.webp` (다른 LoRA로 바꿔서 가장 마음에 듦 — 너무 가깝고 눈이 어둡고 색이 너무 밝은 것만 고치면 됨), `art/new/test3_angle.webp` (위에서 보는 구도는 됐지만 정적임), `art/new/test2_lora.webp` (LoRA 첫 시험 — 그림체·옷은 좋음, 구도가 평범해서 v4로 수정)
- 그림체는 PixAI LoRA: 사용자 LoRA(DiT.3 모델용, 스타일·#귀여운, 제작자 "ピ") — 선명한 선, 밝고 깨끗한 색, 큰 눈. 리소·밤 분위기는 프롬프트로 조금 더한다. 첫 시험 그림: `art/new/test1_ref.webp` (레퍼런스 넣고 만든 것 — 레퍼런스 소녀와 너무 비슷해서 v2로 바꿈)
- 해골: 사람보다 훨씬 큰 검은 해골, 청록·빨강 테두리. 소녀 뒤에서 드리움. 말은 없음

## PixAI 프롬프트 (기준 그림 1장, 현재)
- 세로 9:16(앱에서 양옆을 조금 잘라 화면을 꽉 채움), 배경 포함 완성 그림. 이후 표정·자세는 이 그림을 편집해서 만든다
- 마음에 드는 그림이 나오면 시드를 고정하고 단어만 바꾼다. 손만 이상하면 인페인트로 고친다
- 프롬프트:
  `1girl, adult woman, thick outlines, sharp lineart, detailed eyes, dark eyes, deep eye color, long eyelashes, dark atmosphere, muted colors, neon glow, phone booth at night, graffiti, paint splatter, rain, from above, looking up at viewer, dutch angle, holding green phone receiver to ear, other hand finger on lips, long pink nails, one eye closed, tongue out, playful, seductive, silver wolf cut hair with pink tips, round pink sunglasses on head, choker, long pink nails, black leather jacket, white cropped collared shirt, midriff, large breasts, plaid mini skirt, giant black skeleton behind her`
- 네거티브:
  `lowres, bad anatomy, bad hands, text, watermark, necktie, t-shirt, facial mark, child, blurry, oversaturated, selfie, holding camera, outstretched arm, reaching, extra hands, extra arms, disembodied hand, pov hands, grin, teeth, holding object in other hand`

## 아직 정할 것
- 이름 확정
- 그림이 나오면 화면 시안 확인 후 세부 조정

## 버린 아이디어
- 알약 케이스, 뮤직비디오 컷
