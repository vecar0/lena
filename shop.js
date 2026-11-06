// 회선 등급(예전 호감도) + 매일 바뀌는 자판기 + 부스 꾸미기
// 자판기: 게임 동전(S.gc)으로 산다(v64, 할 일 동전은 없앰). app.js·arcade.js 뒤에 불러온다.
'use strict';
(() => {
const css = `
.affb{display:inline-flex;align-items:center;gap:6px;margin-top:8px;height:30px;padding:0 12px 0 8px;border-radius:15px;background:rgba(0,0,0,.5);border:1px solid var(--line);font-size:12.5px;font-weight:700;color:#ffd3e8}
.affb i{font-style:normal;color:var(--pink);font-size:15px}
.affb u{text-decoration:none;font-family:'Space Mono',monospace;color:var(--mint)}
.affc{display:flex;align-items:center;gap:14px}
.affc .ava2{width:76px;height:76px;flex:none;border-radius:50%;background:url(assets/lena/face.jpg) 50% 30%/cover;border:3px solid #000;box-shadow:4px 4px 0 var(--pink)}
.affc b{display:block;font-family:'Black Han Sans';font-weight:400;font-size:22px}
.affc small{display:block;font-size:12.5px;color:var(--mute);margin-top:2px;line-height:1.45;word-break:keep-all}
.hbar{height:12px;border-radius:6px;background:#0b0d10;border:2px solid #000;overflow:hidden;margin-top:8px}
.hbar i{display:block;height:100%;background:linear-gradient(90deg,#ff6fb6,#ff2e6e)}
.affb .ci{width:18px;height:18px}
.want{display:flex;align-items:center;gap:10px;margin-top:10px;padding:8px 10px;border-radius:12px;background:rgba(255,61,154,.12);border:1px dashed rgba(255,61,154,.6);font-size:13px;font-weight:700}
.want img{width:34px;height:34px;object-fit:contain}
.vend{border-radius:20px;padding:12px;background:linear-gradient(160deg,#2a8f86,#1a5f5a);border:3px solid #000;box-shadow:5px 5px 0 var(--pink),inset 0 1px 0 rgba(255,255,255,.3)}
.vend .vt{display:flex;justify-content:space-between;align-items:center;font-family:'Space Mono',monospace;font-size:12px;color:#d9fff6;margin:0 2px 10px}
.vgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.vi{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 8px 10px;border-radius:14px;background:#f6f2ea;color:#111;border:2.5px solid #000;box-shadow:inset 0 -4px 0 rgba(0,0,0,.08);text-align:center}
.vi img{width:62px;height:62px;object-fit:contain;filter:drop-shadow(2px 3px 0 rgba(0,0,0,.25))}
.vi b{font-size:13.5px;font-weight:800;line-height:1.25;word-break:keep-all}
.vi small{font-size:11.5px;opacity:.7;line-height:1.35;word-break:keep-all}
.vi .pr{margin-top:4px;display:flex;align-items:center;gap:4px;height:30px;padding:0 12px;border-radius:15px;background:var(--pink);color:#fff;font-weight:800;font-size:13px;border:2px solid #000}
.vi .pr img{width:18px!important;height:18px!important;filter:none}
.vi.sold{opacity:.45}.vi.sold .pr{background:#888}
.vi .tag{position:absolute;top:-8px;left:-6px;font-size:10.5px;font-weight:800;padding:2px 7px;border-radius:8px;background:var(--yel);border:2px solid #000;transform:rotate(-6deg)}
.vi .tag.r{background:#b89cff}
.gl{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.gl .vi{padding:10px 6px 8px}.gl .vi img{width:50px;height:50px}
.dl{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.dt{position:relative;min-width:0;aspect-ratio:1;border-radius:14px;background:var(--panel2);border:2px solid var(--line);display:grid;place-items:center}
.dt img{position:absolute;left:14%;top:14%;width:72%;height:72%;object-fit:contain}
.dt.on{border-color:var(--teal);box-shadow:0 0 0 2px var(--teal)}
.dt.on::after{content:"붙임";position:absolute;bottom:-7px;font-size:10px;font-weight:800;background:var(--teal);color:#000;padding:1px 6px;border-radius:7px}
.dt.lock{opacity:.3}
.note2{background:var(--paper);color:#151515;border-radius:3px;padding:12px 14px;box-shadow:3px 3px 0 #000;font-size:14.5px;line-height:1.6;word-break:keep-all}
.note2+.note2{margin-top:12px}
.note2 h5{font-family:'Space Mono',monospace;font-size:11px;color:#c2185b;margin-bottom:4px}
.note2.lock{background:#2a2e35;color:var(--mute);box-shadow:none;border:1px dashed var(--line)}
.decor{position:absolute;inset:0;pointer-events:none;-webkit-mask:url(assets/lena/dotmask.png) center top/cover no-repeat;mask:url(assets/lena/dotmask.png) center top/cover no-repeat;transition:opacity .25s}
.app.outside .decor,.app.dim .decor{opacity:0}
.stk{position:absolute;left:0;top:0;width:100px;height:100px;transform-origin:0 0;background:var(--im) center/contain no-repeat;opacity:.86;filter:brightness(.72) saturate(.78) contrast(1.02) drop-shadow(0 0 .5px rgba(255,255,255,.45)) drop-shadow(0 0 1.2px rgba(0,0,0,.35));touch-action:none}
.stk::before{content:"";position:absolute;inset:0;background:linear-gradient(160deg,rgba(255,61,154,.22),transparent 40%,rgba(47,224,200,.16));-webkit-mask:var(--im) center/contain no-repeat;mask:var(--im) center/contain no-repeat;mix-blend-mode:overlay}
.stk::after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 28%,rgba(255,255,255,.42) 38%,rgba(255,255,255,.08) 47%,transparent 55%,transparent 70%,rgba(255,255,255,.14) 76%,transparent 82%);-webkit-mask:var(--im) center/contain no-repeat;mask:var(--im) center/contain no-repeat;mix-blend-mode:screen;animation:glint 7s ease-in-out infinite}
@keyframes glint{0%,100%{opacity:.75}50%{opacity:1}}
.gdrop{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:.8}
.app.dedit .gdrop{opacity:.35}
.gzone{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.gzone polygon{fill:rgba(159,245,228,.13);stroke:var(--mint);stroke-width:2;stroke-dasharray:7 6;stroke-linejoin:round}
.app.dedit .decor{-webkit-mask:none;mask:none;pointer-events:auto;z-index:60;background:rgba(0,0,0,.35)}
.app.dedit .stk{opacity:1;filter:brightness(.95) drop-shadow(0 0 3px rgba(0,0,0,.6));cursor:grab}
.app.dedit .stk.sel{filter:brightness(1) drop-shadow(0 0 2px var(--pink)) drop-shadow(0 0 6px var(--pink))}
.app.dedit .home,.app.dedit .callv{opacity:0;pointer-events:none}
.dbar{position:absolute;left:12px;right:12px;bottom:calc(env(safe-area-inset-bottom) + 14px);z-index:61;display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:18px;background:rgba(10,12,15,.88);border:1px solid var(--line)}
.dbar p{font-size:13px;color:var(--mute);line-height:1.45;word-break:keep-all}
.dbar>.btn{height:46px;flex:none}.dbar .r{display:flex;gap:8px}.trow{display:flex;align-items:center;gap:10px;font-size:13px}.trow b{flex:none;color:var(--mint);font-weight:700}.trow .tv{flex:none;width:40px;text-align:right;font-family:'Space Mono',monospace;color:var(--yel)}
.tilt{flex:1;height:32px;accent-color:var(--pink)}.dbar .r .btn{flex:1;height:44px;font-size:14px}
.gpop{position:absolute;z-index:70;width:84px;pointer-events:none;animation:gpop 1.4s var(--ease) forwards}
@keyframes gpop{0%{opacity:0;transform:translateY(40px) scale(.4)}25%{opacity:1;transform:translateY(0) scale(1.1)}70%{opacity:1;transform:translateY(-20px) scale(1)}100%{opacity:0;transform:translateY(-80px) scale(.8)}}
.hearts{position:absolute;z-index:70;pointer-events:none;font-size:26px;color:var(--pink);text-shadow:2px 2px 0 #000;animation:hearts 1.2s ease-out forwards}
@keyframes hearts{to{transform:translateY(-90px) scale(1.3);opacity:0}}
`;
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));
const SI = n => `assets/lena/s/${n}.webp`;
const GIFT = [
  { id: 'coffee', n: '아이스 아메리카노', p: 1, h: 3, i: 'g_coffee', say: ['…얼음 많이 넣었네요. 제 취향 알아요?', '커피 고마워요. 오늘 밤 안 자고 송휘님 생각할게요.'] },
  { id: 'milk', n: '딸기 우유', p: 1, h: 3, i: 'g_milk', say: ['딸기 우유? …애 취급이에요? 근데 좋아요.', '빨대 꽂아 줘요. 농담이에요. 반은.'] },
  { id: 'rose', n: '검은 장미', p: 2, h: 6, i: 'g_rose', say: ['검은 장미라니. …센스 있네요.', '꽃 받는 거 오랜만이에요. 말리지 말고 둘래요.'] },
  { id: 'lip', n: '핑크 립스틱', p: 2, h: 6, i: 'g_lip', say: ['이거 바르고 다음 영상통화 해요. 기대해요.', '색 잘 골랐다. 제 입술 자주 봤구나?'] },
  { id: 'tape', n: '믹스테이프', p: 3, h: 8, i: 'g_tape', say: ['직접 고른 노래예요? 밤새 돌려 들을게요.', '테이프라니. 해골이 춤추기 시작했어요.'] },
  { id: 'cake', n: '딸기 케이크', p: 3, h: 8, i: 'g_cake', say: ['초까지? 오늘 제 생일 아닌데… 그냥 받을게요.', '반 잘라서 같이 먹어요. 큰 쪽은 제 거.'] },
  { id: 'choker', n: '스터드 초커', p: 4, h: 12, i: 'g_choker', say: ['…지금 이거 채워 달라는 거죠? 이리 와요.', '취향 저격. 송휘님, 저 너무 잘 알아요.'] },
  { id: 'cam', n: '필름 카메라', p: 5, h: 15, i: 'g_cam', say: ['첫 사진은 송휘님 찍을래요. 도망가지 마요.', '부스에서 찍은 사진, 유리에 붙여 둘게요.'] },
  { id: 'ring', n: '핑크 보석 반지', p: 8, h: 25, i: 'g_ring', say: ['…반지요? 잠깐, 심장 소리 들리면 모른 척해요.', '어느 손가락에 낄지는… 비밀이에요.'] }
];
const DECOR = [
  { id: 'neon', n: '네온 하트', p: 4, i: 'd_neon' }, { id: 'disco', n: '미러볼', p: 5, i: 'd_disco' }, { id: 'plush', n: '해골 인형', p: 4, i: 'd_plush' },
  { id: 'polar', n: '폴라로이드', p: 3, i: 'd_polar' }, { id: 'lights', n: '별 전구', p: 4, i: 'd_lights' }, { id: 'duck', n: '선글라스 오리', p: 3, i: 'd_duck' },
  { id: 'cactus', n: '선인장 화분', p: 3, i: 'd_cactus' }, { id: 'cherry', n: '체리 방향제', p: 2, i: 'd_cherry' },
  // 리액션 스티커: 레나 머리 옆 유리에 붙이면 레나가 말하거나 반응하는 것처럼 보인다
  { id: 'bheart', n: '하트 말풍선', p: 3, i: 'd_bheart', rx: 1 }, { id: 'bdots', n: '…말풍선', p: 2, i: 'd_bdots', rx: 1 }, { id: 'bshout', n: '?! 외침', p: 2, i: 'd_bshout', rx: 1 },
  { id: 'anger', n: '빠직 표시', p: 2, i: 'd_anger', rx: 1 }, { id: 'blush', n: '발그레', p: 2, i: 'd_blush', rx: 1 }, { id: 'notes', n: '콧노래', p: 2, i: 'd_notes', rx: 1 },
  { id: 'crown', n: '작은 왕관', p: 3, i: 'd_crown', rx: 1 }, { id: 'halo', n: '천사 링', p: 3, i: 'd_halo', rx: 1 }, { id: 'arrow', n: '여기 봐 화살표', p: 2, i: 'd_arrow', rx: 1 }
];
const UTIL = [
  { id: 'rpick', n: '리액션 스티커 뽑기', d: '레나 옆에 붙이는 말풍선·반응 스티커 하나', p: 2, i: 'assets/lena/s/d_bheart.webp', buy: () => { const L = DECOR.filter(d => d.rx && !D().own.includes(d.id)); if (!L.length) { toast('리액션 스티커를 다 모았어요!'); return false; } const d = pick(L); D().own.push(d.id); if (D().on.length < 6) D().on.push(d.id); save(); renderDecor(); toast(`${d.n} 스티커가 나왔어요! 부스 꾸미기에서 붙여요.`); return true; } },
  { id: 'letter', n: '레나의 손편지', d: '음성사서함에 남는 짧은 편지', p: 2, i: 'assets/lena/st_tape.webp', buy: () => letter() }
];
const SECRET = [
  '사실 처음 전화 걸었을 때, 잘못 건 번호였어요. …근데 끊기 싫었어요.',
  '해골이랑은 비 오는 날 이 부스에서 처음 만났어요. 우산을 씌워 주더라고요. 뼈만 있는 손으로.',
  '선글라스는 눈 마주치면 웃음 나와서 쓰는 거예요. 송휘님 앞에서는 특히.',
  '머리 끝 핑크는 제가 직접 했어요. 반쯤 실패해서 지금 모양이 된 거예요.',
  '밤에 전화 안 오면, 부스 유리에 송휘님 이름 썼다 지워요. 김 서린 데다.',
  '해골은 말을 못 하는 게 아니라 안 하는 거예요. 저한테만 가끔 속삭여요.',
  '제가 놀리는 거, 사실 송휘님 웃는 거 보려고 그러는 거예요. 들켰네.',
  '이 부스 전화번호, 세상에 송휘님 말고 아무도 몰라요.',
  '가끔 무서운 꿈 꾸면 해골 갈비뼈 사이에 손 넣고 자요. 따뜻해요. 이상하죠?',
  '모닝콜 할 때 송휘님 잠긴 목소리… 그거 들으려고 일찍 일어나요.',
  '언젠가 이 부스 밖으로 나가게 되면, 제일 먼저 송휘님 만나러 갈 거예요.',
  '…좋아해요. 놀리는 거 아니에요. 이번엔 진짜.'
];
const lv = p => Math.floor(Math.sqrt((p || 0) / 5));
const need = n => 5 * n * n;
// 회선 등급 이름
const TIER = [['잡음 섞인 회선', 0], ['빗소리 너머의 회선', 1], ['자정에 닿는 회선', 2], ['젖은 유리에 맺힌 회선', 3], ['새벽 세 시의 회선', 4], ['아침이 와도 이어진 회선', 5], ['끝까지 남는 마지막 회선', 6]];
const tierOf = n => { const t = TIER[Math.min(n, TIER.length - 1)]; return { name: t[0] + (n >= TIER.length ? ` ${n - TIER.length + 2}` : ''), cls: 't' + t[1] }; };
const A = () => { if (!S.aff) S.aff = { pt: 0, last: dk(new Date()), dday: dk(new Date()), notes: [] }; S.aff.notes = S.aff.notes || []; return S.aff; };
const daysSince = d => Math.max(0, Math.round((new Date(dk(new Date()) + 'T00:00') - new Date(d + 'T00:00')) / DAY));
function decay() { const a = A(), d = daysSince(a.dday || dk(new Date())); if (d > 0) { a.pt = Math.max(0, a.pt - d * 6); a.dday = dk(new Date()); save(); } }
function mood() { if (!A().gifts) return ['설렘', '아직 선물 받은 적 없어요. …기대해도 돼요?']; const d = daysSince(A().last); return d === 0 ? ['두근두근', '오늘 선물 받아서 기분 최고예요.'] : d === 1 ? ['보통', '오늘은 아직 아무것도 못 받았네요…'] : d <= 3 ? ['서운', `${d}일째 빈손이에요. …서운해요.`] : ['삐침', `${d}일 동안 연락만 하고 선물은 없었죠. 흥.`]; }
window.lenaMood = () => { const a = A(); return { lv: lv(a.pt), mood: mood()[0], days: daysSince(a.last) }; };
// 오늘의 자판기 (날짜로 정해지는 랜덤)
function rng(seed) { let s = 0; for (const c of seed) s = (s * 31 + c.charCodeAt(0)) >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function today() {
  const k = dk(new Date()); if (S.shop && S.shop.day === k && S.shop.slots.every(sl => sl.t !== 'u' || UTIL.some(u => u.id === sl.id))) return S.shop;
  const r = rng(k + (S.name || '')), pickR = a => a[Math.floor(r() * a.length)];
  const g1 = pickR(GIFT.slice(0, 7)), want = pickR(GIFT.filter(g => g.id !== g1.id));
  const own = (S.decor && S.decor.own) || [], dl = DECOR.filter(d => !own.includes(d.id));
  const util = pickR(UTIL);
  const sale = r() < .35 ? pickR(GIFT.slice(2)).id : '';
  S.shop = { day: k, slots: [{ t: 'g', id: g1.id }, { t: 'g', id: want.id, want: 1 }, dl.length ? { t: 'd', id: pickR(dl).id } : { t: 'g', id: 'ring' }, { t: 'u', id: util.id }], want: want.id, sale, sold: [] };
  save(); return S.shop;
}
// 값은 게임 동전 기준(할 일 동전보다 흔해서 3배)
[GIFT, DECOR, UTIL].forEach(L => L.forEach(x => { x.p *= 3; }));
const priceOf = g => { const s = today(); return s.sale === g.id ? Math.max(1, Math.ceil(g.p / 2)) : g.p; };
function pay(p) { if ((S.gc || 0) < p) { toast(`게임 동전이 ${p - (S.gc || 0)}개 모자라요. 매일 10개씩 들어와요.`); return false; } S.gc -= p; save(); coinSound(); return true; }
function fx(img) { const i = el('img', 'gpop'); i.src = img; i.style.left = (app.clientWidth / 2 - 42) + 'px'; i.style.top = (app.clientHeight * .42) + 'px'; app.appendChild(i); setTimeout(() => i.remove(), 1500);
  for (let k = 0; k < 5; k++) { const h = el('div', 'hearts', '♥'); h.style.left = (app.clientWidth / 2 - 60 + Math.random() * 120) + 'px'; h.style.top = (app.clientHeight * .45 + Math.random() * 40) + 'px'; h.style.animationDelay = (k * .1) + 's'; app.appendChild(h); setTimeout(() => h.remove(), 1500); } }
function give(g) {
  const a = A(), before = lv(a.pt), p = priceOf(g); if (!pay(p)) return;
  const bonus = today().want === g.id ? 2 : 1; a.pt += g.h * bonus; a.last = dk(new Date()); a.gifts = a.gifts || {}; a.gifts[g.id] = (a.gifts[g.id] || 0) + 1; save();
  fx(SI(g.i)); tone([880, 1320], .1, .04, 'triangle', .1);
  const after = lv(a.pt); let line = pick(g.say) + (bonus > 1 ? ' …오늘 주파수 딱 맞췄네요.' : '');
  if (after > before) line += `\n(회선 등급이 「${tierOf(after).name}」가 됐어요)`;
  refreshSheet(); renderAff(); setTimeout(() => say(line, 'happy', false), 600);
}
async function unlockNote(n) {
  const a = A(); if (a.notes.length >= n) return;
  let t = SECRET[a.notes.length];
  if (!t && (S.key || S.ckey)) { try { const r = await gemini('너는 레나. 송휘님과 호감도가 아주 높아진 사이. 지금까지 털어놓은 비밀: ' + JSON.stringify(a.notes.slice(-6)) + ' 이어서 새로운 작은 비밀이나 고백을 1~2문장 존댓말로. JSON {"reply":""}만.', [{ role: 'user', parts: [{ text: '새 비밀 하나' }] }]); t = r && r.reply; } catch (e) {} }
  a.notes.push(t || '오늘도 송휘님 생각했어요. 이건 비밀 아니고 매일이에요.'); save(); refreshSheet();
}
async function letter() {
  const fall = [`${nmc()}오늘도 수고했어요. 전단지 하나 뗄 때마다 저 혼자 박수 쳐요. 내일도 옆에 있을게요. — 레나`, `${nmc()}비 오는 밤엔 송휘님 목소리가 제일 따뜻해요. 감기 조심해요. — 레나`];
  let t = pick(fall);
  if ((S.key || S.ckey)) { try { const r = await gemini('너는 레나(장난스럽고 다정한 존댓말). 송휘님에게 쓰는 짧은 손편지 3~4문장. 최근 끝낸 일: ' + S.items.filter(x => x.done).slice(-5).map(x => x.text).join(', ') + '. 끝에 "— 레나". JSON {"reply":""}만.', [{ role: 'user', parts: [{ text: '편지 써 줘' }] }]); if (r && r.reply) t = r.reply; } catch (e) {} }
  S.memory.push('📮 레나의 편지: ' + t.slice(0, 300)); save(); say(t, 'happy', false); toast('편지는 7번 음성사서함에 보관했어요.'); return true;
}
// 부스 꾸미기
function D() { if (!S.decor) S.decor = { own: [], on: [] }; return S.decor; }
// 부스 유리에 붙은 스티커: 배경 그림 속 유리판(원근 사각형)에 맞춰 matrix3d로 기울이고,
// 레나 가림판(dotmask)으로 잘라서 레나 뒤 유리에 붙은 것처럼 보인다. 유리판은 셋: 0 뒤쪽(해골), 1 왼쪽 옆판(벽 전화기), 2 오른쪽 창.
// 위치는 {g 유리판, a,b 유리판 좌표 0~1, r 기울기(도), s 크기(그림 px), f 좌우 뒤집기}
const IMW = 1050, IMH = 1872;
const PLANES = [
  { q: [[.035, .12], [.66, .04], [.74, .76], [.10, .80]], poly: [[.035, .12], [.65, .04], [.70, .30], [.79, .72], [.30, .79], [.035, .34]] },
  { q: [[-.15, .25], [.06, .33], [.32, .82], [-.15, .90]], poly: [[-.12, .36], [.035, .36], [.30, .80], [-.12, .80]] },
  { q: [[.86, .02], [1.06, 0], [1.06, .92], [.90, .80]], poly: [[.865, .02], [1.12, .02], [1.12, .9], [.90, .80]] }
];
const SLOTS = [[.2, .1, -6], [.62, .07, 5], [.14, .42, 4], [.5, .2, -4]];
const RXS = [[.42, .2, -8], [.22, .07, 6], [.3, .3, -4], [.7, .12, 6], [.52, .1, 0], [.1, .2, -10]]; // 리액션 스티커 기본 자리: 레나 머리 둘레
function homog(src, dst) { // 네 점 → 네 점 사영 변환 [a,b,c,d,e,f,g,h]
  const A = [], B = [];
  for (let i = 0; i < 4; i++) { const [x, y] = src[i], [u, v] = dst[i]; A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); B.push(u); A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); B.push(v); }
  for (let c = 0; c < 8; c++) { let p = c; for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r; [A[c], A[p]] = [A[p], A[c]]; [B[c], B[p]] = [B[p], B[c]]; for (let r = 0; r < 8; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k]; B[r] -= f * B[c]; } }
  return B.map((b, i) => b / A[i][i]);
}
const ap = (h, [x, y]) => { const w = h[6] * x + h[7] * y + 1; return [(h[0] * x + h[1] * y + h[2]) / w, (h[3] * x + h[4] * y + h[5]) / w]; };
const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
function view() { // 지금 화면에서 그림이 놓인 자리(cover, 가운데 위)
  const L = $('decorL'), W = L.clientWidth, H = L.clientHeight, s = Math.max(W / IMW, H / IMH);
  const toS = ([u, v]) => [(W - IMW * s) / 2 + u * IMW * s, v * IMH * s], U = [[0, 0], [1, 0], [1, 1], [0, 1]];
  return { W, H, s, pl: PLANES.map(P => { const q = P.q.map(toS); return { q, H1: homog(U, q), H2: homog(q, U), poly: P.poly.map(toS), Sa: dist(q[0], q[1]), Sb: dist(q[0], q[3]) }; }) };
}
const inPoly = (pt, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c; } return c; };
const P = id => { const D0 = D(); D0.gl = D0.gl || {}; let p = D0.gl[id];
  if (!p) { const i = D0.on.indexOf(id), rx = (DECOR.find(x => x.id === id) || {}).rx, [a, b, r] = rx ? RXS[Math.max(0, i) % RXS.length] : SLOTS[Math.max(0, i) % 4]; p = D0.gl[id] = { g: 0, a, b, r, s: 130, f: 0 }; }
  if (p.s == null) { p.s = Math.round((p.w || .2) * 650); p.g = 0; p.f = 0; } return p; };
function corners(V, p) { // 스티커 네 모서리 → 화면 좌표 (왼위, 오른위, 오른아래, 왼아래)
  const pl = V.pl[p.g || 0], h = p.s * V.s / 2, c = Math.cos(p.r * Math.PI / 180), s = Math.sin(p.r * Math.PI / 180);
  return [[-h, -h], [h, -h], [h, h], [-h, h]].map(([x, y]) => ap(pl.H1, [p.a + (x * c - y * s) / pl.Sa, p.b + (x * s + y * c) / pl.Sb]));
}
const okPos = (V, p) => corners(V, p).every(pt => inPoly(pt, V.pl[p.g || 0].poly));
let edSel = null;
function freeSpot(V, p, id) { // 유리 밖에 있으면 다른 스티커와 가장 먼 빈자리로
  const others = D().on.filter(x => x !== id && D().gl && D().gl[x]).map(x => ap(V.pl[D().gl[x].g || 0].H1, [D().gl[x].a, D().gl[x].b]));
  let best = null; p.g = 0; p.s = Math.min(p.s, 130);
  for (let a = .12; a < .9; a += .07) for (let b = .06; b < .7; b += .06) { const n = { ...p, a, b }; if (!okPos(V, n)) continue; const c = ap(V.pl[0].H1, [a, b]), d = others.length ? Math.min(...others.map(o => dist(o, c))) : 0; if (!best || d > best.d) best = { d, a, b }; }
  if (best) { p.a = best.a; p.b = best.b; }
}
window.lenaStk = () => { const V = view(); return D().on.slice(0, 6).map(id => { const c = corners(V, P(id)); return [id, c.reduce((a, p) => a + p[0], 0) / 4, c.reduce((a, p) => a + p[1], 0) / 4]; }); }; // 점검용: 스티커 화면 중심
function renderDecor() {
  let L = $('decorL'); if (!L) { L = el('div', 'decor'); L.id = 'decorL'; document.querySelector('.dots').before(L); }
  L.innerHTML = ''; if (!L.clientWidth) return; const V = view();
  if (document.getElementById('app').classList.contains('dedit')) { const sv = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); sv.setAttribute('class', 'gzone'); sv.setAttribute('viewBox', `0 0 ${V.W} ${V.H}`); sv.innerHTML = V.pl.map(pl => `<polygon points="${pl.poly.map(p => p.join(',')).join(' ')}"/>`).join(''); L.appendChild(sv); }
  D().on.slice(0, 6).forEach(id => {
    const d = DECOR.find(x => x.id === id); if (!d) return; const p = P(id);
    if (!okPos(V, p)) freeSpot(V, p, id);
    const s = el('div', 'stk' + (edSel === id ? ' sel' : '')); s.style.setProperty('--im', `url(${SI(d.i)})`); s.dataset.id = id;
    const c = corners(V, p), m = homog([[0, 0], [100, 0], [100, 100], [0, 100]], p.f ? [c[1], c[0], c[3], c[2]] : c);
    s.style.transform = `matrix3d(${m[0]},${m[3]},0,${m[6]},${m[1]},${m[4]},0,${m[7]},0,0,1,0,${m[2]},${m[5]},0,1)`;
    L.appendChild(s);
  });
  if (D().on.length) L.appendChild(drops(V));
}
let dropC = null;
function drops(V) { // 유리 위 물방울(스티커 위에 맺힘) — 유리판 모양으로 잘라 냄
  const key = V.W + 'x' + V.H; if (dropC && dropC.key === key) return dropC.c;
  const dpr = Math.min(2, devicePixelRatio || 1), c = el('canvas', 'gdrop'); c.width = V.W * dpr; c.height = V.H * dpr; const x = c.getContext('2d'); x.scale(dpr, dpr);
  c.style.clipPath = `polygon(${V.pl[0].poly.map(([a, b]) => `${a}px ${b}px`).join(',')})`;
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const xs = V.pl[0].poly.map(p => p[0]), ys = V.pl[0].poly.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  for (let i = 0; i < 26; i++) { const sx = x0 + rnd() * (x1 - x0), sy = y0 + rnd() * (y1 - y0) * .7, len = 30 + rnd() * 120, g = x.createLinearGradient(sx, sy, sx, sy + len); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.7, 'rgba(220,240,255,.16)'); g.addColorStop(1, 'rgba(255,255,255,.3)'); x.strokeStyle = g; x.lineWidth = 1 + rnd() * 1.6; x.beginPath(); x.moveTo(sx, sy); x.bezierCurveTo(sx + rnd() * 4 - 2, sy + len * .4, sx + rnd() * 6 - 3, sy + len * .7, sx + rnd() * 4 - 2, sy + len); x.stroke(); }
  for (let i = 0; i < 230; i++) {
    const px = x0 + rnd() * (x1 - x0), py = y0 + rnd() * (y1 - y0), r = rnd() < .85 ? .7 + rnd() * 1.8 : 2.5 + rnd() * 3, ry = r * (1 + rnd() * .35);
    x.fillStyle = 'rgba(10,14,20,.28)'; x.beginPath(); x.ellipse(px + .4, py + .8, r, ry, 0, 0, 7); x.fill();
    const g = x.createRadialGradient(px - r * .35, py - ry * .4, 0, px, py, Math.max(r, ry)); g.addColorStop(0, 'rgba(255,255,255,.75)'); g.addColorStop(.35, 'rgba(210,235,255,.18)'); g.addColorStop(.85, 'rgba(255,255,255,.05)'); g.addColorStop(1, 'rgba(255,255,255,.35)');
    x.fillStyle = g; x.beginPath(); x.ellipse(px, py, r, ry, 0, 0, 7); x.fill();
  }
  dropC = { key, c }; return c;
}
addEventListener('resize', () => setTimeout(renderDecor, 50));
function decorEdit() {
  closeSheet(); const app = $('app');
  if (!D().on.length) { toast('먼저 부스 꾸미기에서 장식을 골라 주세요.'); return; }
  app.classList.add('dedit'); edSel = D().on[0]; renderDecor(); const L = $('decorL');
  const bar = el('div', 'dbar'); bar.appendChild(el('p', null, '점선 안 유리(뒤쪽·왼쪽 옆판·오른쪽 창)에만 붙어요. 끌어서 옮기고, 고른 스티커는 아래에서 크기·뒤집기·기울기를 바꿔요.'));
  const tilt = el('input'); tilt.type = 'range'; tilt.min = -60; tilt.max = 60; tilt.step = 1; tilt.className = 'tilt';
  const tl = el('span', 'tv');
  const sync = () => { if (!edSel) return; const p = P(edSel); tilt.value = Math.max(-60, Math.min(60, p.r)); tl.textContent = `${Math.round(p.r)}°`; };
  const mod = f => () => { if (!edSel) return; const p = P(edSel), old = { ...p }; f(p); if (!okPos(view(), p)) { Object.assign(p, old); toast('유리 밖으로 나가요.'); sync(); return; } save(); renderDecor(); sync(); };
  const r = row(btn('작게', 'ghost', mod(p => p.s = Math.max(60, p.s - 18))), btn('크게', 'ghost', mod(p => p.s = Math.min(320, p.s + 18))), btn('⇋ 뒤집기', 'ghost', mod(p => p.f = p.f ? 0 : 1)));
  r.className = 'r'; bar.appendChild(r);
  const tr = el('label', 'trow'); tr.append(el('b', null, '기울기'), tilt, tl); bar.appendChild(tr);
  tilt.oninput = () => { if (!edSel) return; const p = P(edSel), old = p.r; p.r = +tilt.value; if (!okPos(view(), p)) { p.r = old; tilt.value = old; return; } tl.textContent = `${p.r}°`; renderDecor(); };
  tilt.onchange = () => save();
  bar.appendChild(btn('다 붙였어요', 'wide', () => { app.classList.remove('dedit'); edSel = null; bar.remove(); L.onpointerdown = null; save(); renderDecor(); toast('부스 유리에 붙였어요.'); }));
  app.appendChild(bar); sync();
  L.onpointerdown = e => {
    // 기울어진 스티커는 브라우저 판정이 어긋날 수 있어서, 화면 속 실제 네 모서리로 직접 고른다(위에 있는 것 먼저)
    const V = view(), rc = L.getBoundingClientRect(), pt = [e.clientX - rc.left, e.clientY - rc.top];
    const hitId = [...D().on.slice(0, 6)].reverse().find(id => inPoly(pt, corners(V, P(id)))); if (!hitId) return;
    e.preventDefault(); edSel = hitId; L.querySelectorAll('.stk').forEach(x => x.classList.toggle('sel', x.dataset.id === hitId)); sync();
    const p = P(edSel), cen = ap(V.pl[p.g || 0].H1, [p.a, p.b]), off = [e.clientX - rc.left - cen[0], e.clientY - rc.top - cen[1]];
    L.setPointerCapture(e.pointerId);
    L.onpointermove = ev => {
      const c = [ev.clientX - rc.left - off[0], ev.clientY - rc.top - off[1]];
      const order = [p.g || 0, ...[0, 1, 2].filter(g => g !== (p.g || 0))]; // 지금 유리판 먼저, 손가락이 넘어가면 옆 유리판으로
      for (const g of order) { if (!inPoly(c, V.pl[g].poly)) continue; const [a, b] = ap(V.pl[g].H2, c), n = { ...p, g, a, b };
        // 옆 유리는 화면에 좁게 보여서, 안 들어가면 바깥쪽으로 조금씩 밀어 붙인다
        for (let k = 0; k < 30 && !okPos(V, n) && g; k++) n.a += g === 2 ? .03 : -.03;
        if (okPos(V, n)) { Object.assign(p, n); renderDecor(); } break; }
    };
    L.onpointerup = L.onpointercancel = () => { L.onpointermove = null; tone([900], .03, .03); save(); };
  };
}
// 음성통화 화면 이름 아래 회선 등급 배지(전화기 아이콘)
function renderAff() {
  const hd = document.querySelector('.ahead .hd'); if (!hd) return; let b = $('affB');
  if (!b) { b = el('button', 'affb'); b.id = 'affB'; b.onclick = () => { dtmf(9); openSheet('shop'); }; hd.appendChild(b); }
  const a = A(), [m] = mood(); b.innerHTML = `<img class="ci" src="assets/lena/st_phone.webp" alt=""><u>${tierOf(lv(a.pt)).name}</u>`;
}
// 자판기 시트
let tab = 'today';
SH.shop = { t: '자판기', s: () => `게임 동전 ${S.gc || 0}개 · 매일 자정에 바뀌어요`, r: B => {
  decay(); const a = A(), n = lv(a.pt), [m, mt] = mood(), s = today();
  const c = el('div', 'card'), top = el('div', 'affc'), av = el('div', 'ava2'), tx = el('div'); tx.append(el('b', null, tierOf(n).name), el('small', null, mt + ' 하루 지날 때마다 회선 등급이 조금씩 내려가요.'));
  top.append(av, tx); c.appendChild(top);
  const hb = el('div', 'hbar'), hi = el('i'); hi.style.width = Math.min(100, (a.pt - need(n)) / Math.max(1, need(n + 1) - need(n)) * 100) + '%'; hb.appendChild(hi); c.appendChild(hb);
  c.appendChild(el('div', 'hint', `회선 등급 · 「${tierOf(n + 1).name}」까지 ${need(n + 1) - a.pt}점`));
  const w = GIFT.find(g => g.id === s.want); const wb = el('div', 'want'), wi = el('img'); wi.src = SI(w.i); wi.alt = ''; wb.append(wi, document.createTextNode(`오늘의 주파수: ${w.n} · 보내면 회선 점수 2배`)); c.appendChild(wb);
  B.appendChild(c);
  if (tab === 'note') tab = 'today'; const T = el('div', 'tabs'); [['today', '오늘의 자판기'], ['gift', '선물'], ['decor', '부스 꾸미기']].forEach(([v, l]) => { const b = el('button', tab === v ? 'on' : '', l); b.onclick = () => { tab = v; refreshSheet(); }; T.appendChild(b); }); T.style.marginTop = '14px'; B.appendChild(T);
  const coinI = `<img src="${CUR('gc')}" alt="">`;
  const card = (img, name, sub, price, onBuy, tag, sold) => { const v = el('button', 'vi' + (sold ? ' sold' : '')); if (tag) v.appendChild(el('span', 'tag' + (tag === '희귀' ? ' r' : ''), tag)); const im = el('img'); im.src = img; im.alt = ''; v.append(im, el('b', null, name)); if (sub) v.appendChild(el('small', null, sub)); const pr = el('span', 'pr'); pr.innerHTML = sold ? '구입함' : `${coinI}${price}`; v.appendChild(pr); v.onclick = () => { if (!sold) onBuy(); }; return v; };
  if (tab === 'today') {
    const V = el('div', 'vend'), vt = el('div', 'vt'); vt.append(el('span', null, 'LENA VENDING'), el('span', null, `${dk(new Date()).slice(5).replace('-', '/')} · 자정에 교체`)); V.appendChild(vt);
    const G = el('div', 'vgrid');
    s.slots.forEach((sl, i) => {
      if (sl.t === 'g') { const g = GIFT.find(x => x.id === sl.id); G.appendChild(card(SI(g.i), g.n, `회선 +${g.h * (sl.want ? 2 : 1)}`, priceOf(g), () => give(g), sl.want ? '주파수' : s.sale === g.id ? '반값' : '')); }
      else if (sl.t === 'd') { const d = DECOR.find(x => x.id === sl.id), own = D().own.includes(d.id); G.appendChild(card(SI(d.i), d.n, '부스 유리에 붙이는 장식', d.p, () => { if (!pay(d.p)) return; D().own.push(d.id); if (D().on.length < 4) D().on.push(d.id); save(); fx(SI(d.i)); renderDecor(); refreshSheet(); toast(`${d.n}을(를) 부스에 붙였어요. 영상통화에서 보여요.`); }, '희귀', own)); }
      else { const u = UTIL.find(x => x.id === sl.id), sold = s.sold.includes(i); G.appendChild(card(u.i, u.n, u.d, u.p, async () => { if (u.id === 'fortune') { openSheet('fort'); return; } if (!pay(u.p)) return; const ok = await u.buy(); if (ok === false) { S.gc = (S.gc || 0) + u.p; } else { s.sold.push(i); } save(); refreshSheet(); }, '오늘만', sold)); }
    });
    V.appendChild(G); B.appendChild(V);
    B.appendChild(el('div', 'hint', '게임 동전은 매일 10개씩 들어오고(최대 99), 오락실에서 잘하면 더 받아요. 선물은 몇 번이고 줄 수 있어요. 오늘의 주파수는 날마다 바뀌어요.'));
  } else if (tab === 'gift') {
    const G = el('div', 'gl'); GIFT.forEach(g => G.appendChild(card(SI(g.i), g.n, `+${g.h * (s.want === g.id ? 2 : 1)}`, priceOf(g), () => give(g), s.want === g.id ? '주파수' : s.sale === g.id ? '반값' : ''))); B.appendChild(G);
    const cnt = a.gifts || {}; const tot = Object.values(cnt).reduce((x, y) => x + y, 0); B.appendChild(el('div', 'hint', `지금까지 준 선물 ${tot}개`));
  } else if (tab === 'decor') {
    const G = el('div', 'dl'); DECOR.forEach(d => { const own = D().own.includes(d.id), on = D().on.includes(d.id); const t = el('button', 'dt' + (on ? ' on' : '') + (own ? '' : ' lock')); const im = el('img'); im.src = SI(d.i); im.alt = d.n; t.appendChild(im);
      t.onclick = () => { if (!own) { toast(`${d.n}: 오늘의 자판기에 나오면 살 수 있어요 (동전 ${d.p}개).`); return; } const o = D().on; if (on) o.splice(o.indexOf(d.id), 1); else { if (o.length >= 6) o.shift(); o.push(d.id); } save(); renderDecor(); refreshSheet(); }; G.appendChild(t); });
    B.appendChild(G); if (D().on.length) B.appendChild(row(btn('부스 유리에 직접 붙이기 (위치 옮기기)', 'wide', decorEdit))); B.appendChild(el('div', 'hint', `모은 장식 ${D().own.length}/${DECOR.length} · 6개까지 붙일 수 있어요. 누르면 붙이고 떼요. 붙인 장식은 레나 뒤 유리에 붙어 영상통화 화면에 보여요. 장식은 오늘의 자판기에 날마다 하나씩 나와요.`));

  }
} };
SH[3] = SH.shop; // 다이얼 9번
// 홈의 동전 배지 → 자판기
const _rh = renderHome; renderHome = function () { _rh(); const c = document.querySelector('.coinb'); if (c) c.onclick = () => { dtmf(9); openSheet('shop'); }; renderAff(); };
// 오락실의 운세 버튼 → 자판기
// 레나 대화에 호감도 반영
const _sys = sysPrompt; sysPrompt = function (sp) { const a = A(), [m] = mood(); return _sys(sp).replace('JSON만 출력:', `- 지금 레나의 호감도 ${lv(a.pt)}단계(「${tierOf(lv(a.pt)).name}」), 기분 "${m}". 단계가 높을수록 더 편하고 능글맞게(고백은 위 '선 긋기'·'영상통화' 규칙을 따름), 서운/삐침이면 장난스럽게 투정한다(선물 얘기는 가끔만).\nJSON만 출력:`); };
decay(); D(); setTimeout(() => { renderDecor(); renderAff(); }, 0);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { decay(); renderAff(); } });
window.openShop = () => openSheet('shop');
window.lenaShop = { A, lv, need, tierOf, mood, decay, today, GIFT, DECOR, D, SI, decorEdit, fx, renderAff };
})();
