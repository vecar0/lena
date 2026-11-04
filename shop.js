// 레나 호감도 + 매일 바뀌는 자판기 + 부스 꾸미기 + 레나 수첩
// 할 일 동전(S.coins)을 계속 쓰는 곳. app.js·arcade.js 뒤에 불러온다.
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
.dl{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.dt{position:relative;aspect-ratio:1;border-radius:14px;background:var(--panel2);border:2px solid var(--line);display:grid;place-items:center}
.dt img{width:72%;height:72%;object-fit:contain}
.dt.on{border-color:var(--teal);box-shadow:0 0 0 2px var(--teal)}
.dt.on::after{content:"붙임";position:absolute;bottom:-7px;font-size:10px;font-weight:800;background:var(--teal);color:#000;padding:1px 6px;border-radius:7px}
.dt.lock{opacity:.3}
.note2{background:var(--paper);color:#151515;border-radius:3px;padding:12px 14px;box-shadow:3px 3px 0 #000;font-size:14.5px;line-height:1.6;word-break:keep-all}
.note2+.note2{margin-top:12px}
.note2 h5{font-family:'Space Mono',monospace;font-size:11px;color:#c2185b;margin-bottom:4px}
.note2.lock{background:#2a2e35;color:var(--mute);box-shadow:none;border:1px dashed var(--line)}
.decor{position:absolute;inset:0;pointer-events:none;z-index:3}
.decor img{position:absolute;width:58px;filter:drop-shadow(3px 4px 0 rgba(0,0,0,.55));animation:dsw 4s ease-in-out infinite alternate}
@keyframes dsw{to{transform:translateY(-4px) rotate(var(--r2,3deg))}}
.app.dim .decor{opacity:0}
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
  { id: 'cactus', n: '선인장 화분', p: 3, i: 'd_cactus' }, { id: 'cherry', n: '체리 방향제', p: 2, i: 'd_cherry' }
];
const UTIL = [
  { id: 'fortune', n: '오늘의 운세 전화', d: '레나가 오늘 운세를 봐 줘요', p: 1, i: 'assets/lena/st_star.webp', buy: () => fortuneCall() },
  { id: 'gc', n: '게임 동전 5개', d: '오락실에서 쓰는 동전', p: 1, i: 'assets/lena/st_coin.webp', buy: () => { S.gc = Math.min(999, (S.gc || 0) + 5); save(); toast('게임 동전 +5'); return true; } },
  { id: 'boost', n: '전화국 2시간 부스트', d: '해골 전화국 수익 ×2', p: 1, i: 'assets/lena/g/b_neon.webp', buy: () => { if (!S.idl) { toast('해골 전화국을 먼저 한 번 열어 주세요.'); return false; } S.idl.boost = Math.max(Date.now(), S.idl.boost || 0) + 2 * 3600e3; save(); toast('2시간 동안 전화국 수익 ×2!'); return true; } },
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
const A = () => { if (!S.aff) S.aff = { pt: 0, last: dk(new Date()), dday: dk(new Date()), notes: [] }; return S.aff; };
const daysSince = d => Math.max(0, Math.round((new Date(dk(new Date()) + 'T00:00') - new Date(d + 'T00:00')) / DAY));
function decay() { const a = A(), d = daysSince(a.dday || dk(new Date())); if (d > 0) { a.pt = Math.max(0, a.pt - d * 6); a.dday = dk(new Date()); save(); } }
function mood() { if (!A().gifts) return ['설렘', '아직 선물 받은 적 없어요. …기대해도 돼요?']; const d = daysSince(A().last); return d === 0 ? ['두근두근', '오늘 선물 받아서 기분 최고예요.'] : d === 1 ? ['보통', '오늘은 아직 아무것도 못 받았네요…'] : d <= 3 ? ['서운', `${d}일째 빈손이에요. …서운해요.`] : ['삐침', `${d}일 동안 연락만 하고 선물은 없었죠. 흥.`]; }
window.lenaMood = () => { const a = A(); return { lv: lv(a.pt), mood: mood()[0], days: daysSince(a.last) }; };
// 오늘의 자판기 (날짜로 정해지는 랜덤)
function rng(seed) { let s = 0; for (const c of seed) s = (s * 31 + c.charCodeAt(0)) >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function today() {
  const k = dk(new Date()); if (S.shop && S.shop.day === k) return S.shop;
  const r = rng(k + (S.name || '')), pickR = a => a[Math.floor(r() * a.length)];
  const g1 = pickR(GIFT.slice(0, 7)), want = pickR(GIFT.filter(g => g.id !== g1.id));
  const own = (S.decor && S.decor.own) || [], dl = DECOR.filter(d => !own.includes(d.id));
  const util = pickR(UTIL);
  const sale = r() < .35 ? pickR(GIFT.slice(2)).id : '';
  S.shop = { day: k, slots: [{ t: 'g', id: g1.id }, { t: 'g', id: want.id, want: 1 }, dl.length ? { t: 'd', id: pickR(dl).id } : { t: 'g', id: 'ring' }, { t: 'u', id: util.id }], want: want.id, sale, sold: [] };
  save(); return S.shop;
}
const priceOf = g => { const s = today(); return s.sale === g.id ? Math.max(1, Math.ceil(g.p / 2)) : g.p; };
function pay(p) { if ((S.coins || 0) < p) { toast(`할 일 동전이 ${p - (S.coins || 0)}개 모자라요. 전단지 떼고 와요.`); return false; } S.coins -= p; coinSound(); return true; }
function fx(img) { const i = el('img', 'gpop'); i.src = img; i.style.left = (app.clientWidth / 2 - 42) + 'px'; i.style.top = (app.clientHeight * .42) + 'px'; app.appendChild(i); setTimeout(() => i.remove(), 1500);
  for (let k = 0; k < 5; k++) { const h = el('div', 'hearts', '♥'); h.style.left = (app.clientWidth / 2 - 60 + Math.random() * 120) + 'px'; h.style.top = (app.clientHeight * .45 + Math.random() * 40) + 'px'; h.style.animationDelay = (k * .1) + 's'; app.appendChild(h); setTimeout(() => h.remove(), 1500); } }
function give(g) {
  const a = A(), before = lv(a.pt), p = priceOf(g); if (!pay(p)) return;
  const bonus = today().want === g.id ? 2 : 1; a.pt += g.h * bonus; a.last = dk(new Date()); a.gifts = a.gifts || {}; a.gifts[g.id] = (a.gifts[g.id] || 0) + 1; save();
  fx(SI(g.i)); tone([880, 1320], .1, .04, 'triangle', .1);
  const after = lv(a.pt); let line = pick(g.say) + (bonus > 1 ? ' …제가 갖고 싶었던 거 어떻게 알았어요?' : '');
  if (after > before) { line += `\n(호감도 ${after}단계! 레나 수첩에 새 이야기가 생겼어요)`; unlockNote(after); }
  refreshSheet(); renderAff(); setTimeout(() => say(line, 'happy', false), 600);
}
async function unlockNote(n) {
  const a = A(); if (a.notes.length >= n) return;
  let t = SECRET[a.notes.length];
  if (!t && S.key) { try { const r = await gemini('너는 레나. 송휘님과 호감도가 아주 높아진 사이. 지금까지 털어놓은 비밀: ' + JSON.stringify(a.notes.slice(-6)) + ' 이어서 새로운 작은 비밀이나 고백을 1~2문장 존댓말로. JSON {"reply":""}만.', [{ role: 'user', parts: [{ text: '새 비밀 하나' }] }]); t = r && r.reply; } catch (e) {} }
  a.notes.push(t || '오늘도 송휘님 생각했어요. 이건 비밀 아니고 매일이에요.'); save(); refreshSheet();
}
async function letter() {
  const fall = [`${nmc()}오늘도 수고했어요. 전단지 하나 뗄 때마다 저 혼자 박수 쳐요. 내일도 옆에 있을게요. — 레나`, `${nmc()}비 오는 밤엔 송휘님 목소리가 제일 따뜻해요. 감기 조심해요. — 레나`];
  let t = pick(fall);
  if (S.key) { try { const r = await gemini('너는 레나(장난스럽고 다정한 존댓말). 송휘님에게 쓰는 짧은 손편지 3~4문장. 최근 끝낸 일: ' + S.items.filter(x => x.done).slice(-5).map(x => x.text).join(', ') + '. 끝에 "— 레나". JSON {"reply":""}만.', [{ role: 'user', parts: [{ text: '편지 써 줘' }] }]); if (r && r.reply) t = r.reply; } catch (e) {} }
  S.memory.push('📮 레나의 편지: ' + t.slice(0, 300)); save(); say(t, 'happy', false); toast('편지는 5번 음성사서함에 보관했어요.'); return true;
}
// 부스 꾸미기
const SLOTS = [[3, 50, -8], [78, 42, 6], [6, 68, 5], [80, 62, -6]];
function D() { if (!S.decor) S.decor = { own: [], on: [] }; return S.decor; }
function renderDecor() {
  let L = $('decorL'); if (!L) { L = el('div', 'decor'); L.id = 'decorL'; $('home').insertBefore(L, $('home').firstChild.nextSibling); }
  L.innerHTML = ''; D().on.slice(0, 4).forEach((id, i) => { const d = DECOR.find(x => x.id === id); if (!d) return; const im = el('img'); im.src = SI(d.i); im.alt = ''; const [x, y, r] = SLOTS[i]; im.style.left = x + '%'; im.style.top = y + '%'; im.style.transform = `rotate(${r}deg)`; im.style.setProperty('--r2', (r + 4) + 'deg'); im.style.animationDelay = (i * .7) + 's'; L.appendChild(im); });
}
// 음성통화 화면 이름 아래 호감도 배지
function renderAff() {
  const hd = document.querySelector('.ahead .hd'); if (!hd) return; let b = $('affB');
  if (!b) { b = el('button', 'affb'); b.id = 'affB'; b.onclick = () => { dtmf(8); openSheet('shop'); }; hd.appendChild(b); }
  const a = A(), [m] = mood(); b.innerHTML = `<i>♥</i>호감도 <u>${lv(a.pt)}</u> · ${m}`;
}
// 자판기 시트
let tab = 'today';
SH.shop = { t: '레나 자판기', s: () => `할 일 동전 ${S.coins || 0}개 · 매일 자정에 바뀌어요`, r: B => {
  decay(); const a = A(), n = lv(a.pt), [m, mt] = mood(), s = today();
  const c = el('div', 'card'), top = el('div', 'affc'), av = el('div', 'ava2'), tx = el('div'); tx.append(el('b', null, `호감도 ${n}단계 · ${m}`), el('small', null, mt + ' 하루 지날 때마다 호감도가 조금씩 내려가요.'));
  top.append(av, tx); c.appendChild(top);
  const hb = el('div', 'hbar'), hi = el('i'); hi.style.width = Math.min(100, (a.pt - need(n)) / Math.max(1, need(n + 1) - need(n)) * 100) + '%'; hb.appendChild(hi); c.appendChild(hb);
  c.appendChild(el('div', 'hint', `다음 단계까지 ${need(n + 1) - a.pt}점 · 단계가 오르면 레나 수첩에 비밀 이야기가 하나씩 열려요`));
  const w = GIFT.find(g => g.id === s.want); const wb = el('div', 'want'), wi = el('img'); wi.src = SI(w.i); wi.alt = ''; wb.append(wi, document.createTextNode(`오늘 레나가 갖고 싶은 것: ${w.n} (호감도 2배)`)); c.appendChild(wb);
  B.appendChild(c);
  const T = el('div', 'tabs'); [['today', '오늘의 자판기'], ['gift', '선물'], ['decor', '부스 꾸미기'], ['note', '레나 수첩']].forEach(([v, l]) => { const b = el('button', tab === v ? 'on' : '', l); b.onclick = () => { tab = v; refreshSheet(); }; T.appendChild(b); }); T.style.marginTop = '14px'; B.appendChild(T);
  const coinI = '<img src="assets/lena/st_coin.webp" alt="">';
  const card = (img, name, sub, price, onBuy, tag, sold) => { const v = el('button', 'vi' + (sold ? ' sold' : '')); if (tag) v.appendChild(el('span', 'tag' + (tag === '희귀' ? ' r' : ''), tag)); const im = el('img'); im.src = img; im.alt = ''; v.append(im, el('b', null, name)); if (sub) v.appendChild(el('small', null, sub)); const pr = el('span', 'pr'); pr.innerHTML = sold ? '구입함' : `${coinI}${price}`; v.appendChild(pr); v.onclick = () => { if (!sold) onBuy(); }; return v; };
  if (tab === 'today') {
    const V = el('div', 'vend'), vt = el('div', 'vt'); vt.append(el('span', null, 'LENA VENDING'), el('span', null, `${dk(new Date()).slice(5).replace('-', '/')} · 자정에 교체`)); V.appendChild(vt);
    const G = el('div', 'vgrid');
    s.slots.forEach((sl, i) => {
      if (sl.t === 'g') { const g = GIFT.find(x => x.id === sl.id); G.appendChild(card(SI(g.i), g.n, `호감도 +${g.h * (sl.want ? 2 : 1)}`, priceOf(g), () => give(g), sl.want ? '원하는 것' : s.sale === g.id ? '반값' : '')); }
      else if (sl.t === 'd') { const d = DECOR.find(x => x.id === sl.id), own = D().own.includes(d.id); G.appendChild(card(SI(d.i), d.n, '부스 유리에 붙이는 장식', d.p, () => { if (!pay(d.p)) return; D().own.push(d.id); if (D().on.length < 4) D().on.push(d.id); save(); fx(SI(d.i)); renderDecor(); refreshSheet(); toast(`${d.n}을(를) 부스에 붙였어요. 영상통화에서 보여요.`); }, '희귀', own)); }
      else { const u = UTIL.find(x => x.id === sl.id), sold = s.sold.includes(i); G.appendChild(card(u.i, u.n, u.d, u.p, async () => { if (u.id === 'fortune' && S.fortDay === dk(new Date())) { toast('오늘 운세는 이미 들었어요.'); return; } if (u.id !== 'fortune' && !pay(u.p)) return; if (u.id === 'fortune') { closeSheet(); fortuneCall(); s.sold.push(i); save(); return; } const ok = await u.buy(); if (ok === false) { S.coins += u.p; } else { s.sold.push(i); } save(); refreshSheet(); }, '오늘만', sold)); }
    });
    V.appendChild(G); B.appendChild(V);
    B.appendChild(el('div', 'hint', '전단지를 떼면 할 일 동전 1개. 선물은 몇 번이고 줄 수 있어요. 레나가 갖고 싶은 건 날마다 바뀌어요.'));
  } else if (tab === 'gift') {
    const G = el('div', 'gl'); GIFT.forEach(g => G.appendChild(card(SI(g.i), g.n, `+${g.h * (s.want === g.id ? 2 : 1)}`, priceOf(g), () => give(g), s.want === g.id ? '원하는 것' : s.sale === g.id ? '반값' : ''))); B.appendChild(G);
    const cnt = a.gifts || {}; const tot = Object.values(cnt).reduce((x, y) => x + y, 0); B.appendChild(el('div', 'hint', `지금까지 준 선물 ${tot}개`));
  } else if (tab === 'decor') {
    const G = el('div', 'dl'); DECOR.forEach(d => { const own = D().own.includes(d.id), on = D().on.includes(d.id); const t = el('button', 'dt' + (on ? ' on' : '') + (own ? '' : ' lock')); const im = el('img'); im.src = SI(d.i); im.alt = d.n; t.appendChild(im);
      t.onclick = () => { if (!own) { toast(`${d.n}: 오늘의 자판기에 나오면 살 수 있어요 (동전 ${d.p}개).`); return; } const o = D().on; if (on) o.splice(o.indexOf(d.id), 1); else { if (o.length >= 4) o.shift(); o.push(d.id); } save(); renderDecor(); refreshSheet(); }; G.appendChild(t); });
    B.appendChild(G); B.appendChild(el('div', 'hint', `모은 장식 ${D().own.length}/${DECOR.length} · 4개까지 붙일 수 있어요. 누르면 붙이고 떼요. 장식은 오늘의 자판기에 날마다 하나씩 나와요.`));
  } else {
    const L = a.notes; if (!L.length) B.appendChild(empty('아직 비어 있어요. 호감도 1단계가 되면 첫 비밀이 열려요.', 'st_heart'));
    L.forEach((t, i) => { const d = el('div', 'note2'); d.append(el('h5', null, `${i + 1}단계 · 레나의 비밀`), document.createTextNode(t)); B.appendChild(d); });
    const nx = el('div', 'note2 lock'); nx.textContent = `${L.length + 1}단계가 되면 다음 이야기가 열려요.`; B.appendChild(nx);
  }
} };
// 홈의 동전 배지 → 자판기
const _rh = renderHome; renderHome = function () { _rh(); const c = document.querySelector('.coinb'); if (c) c.onclick = () => { dtmf(8); openSheet('shop'); }; renderAff(); };
// 오락실의 운세 버튼 → 자판기
// 레나 대화에 호감도 반영
const _sys = sysPrompt; sysPrompt = function (sp) { const a = A(), [m] = mood(); return _sys(sp).replace('JSON만 출력:', `- 지금 레나의 호감도 ${lv(a.pt)}단계, 기분 "${m}". 단계가 높을수록 더 다정하고 솔직하게, 서운/삐침이면 장난스럽게 투정한다(선물 얘기는 가끔만).\nJSON만 출력:`); };
decay(); D(); setTimeout(() => { renderDecor(); renderAff(); }, 0);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { decay(); renderAff(); } });
window.openShop = () => openSheet('shop');
})();
