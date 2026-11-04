// 오락실 — 리듬 다이얼: 공중전화 키패드에 맞춰 박자 누르기 (음악은 코드로 직접 만든다)
'use strict';
(() => {
const { frame, talk, gcAdd, gimg } = ARC;
const css = `
.rh{position:relative;flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:10px 14px calc(var(--sb) + 14px);overflow:hidden;user-select:none;-webkit-user-select:none;touch-action:manipulation}
.rh::before{content:"";position:absolute;inset:-20px;background:url(assets/lena/poster.jpg) center 30%/cover;filter:blur(14px) brightness(.32) saturate(1.3);transform:scale(var(--pulse,1));transition:transform .08s}
.rh>*{position:relative}
.rtop{display:flex;justify-content:space-between;align-items:flex-end;width:100%;max-width:380px}
.rsc{font-family:'Space Mono',monospace;font-weight:700;font-size:24px;color:var(--mint);text-shadow:2px 2px 0 #000}
.rcb{font-family:'Black Han Sans';font-size:30px;color:var(--yel);text-shadow:3px 3px 0 #000;min-width:80px;text-align:right}
.rjudge{font-family:'Black Han Sans';font-size:26px;height:32px;text-shadow:3px 3px 0 #000}
.rjudge.p{color:var(--yel)}.rjudge.g{color:var(--teal)}.rjudge.m{color:var(--hot)}
.rpad{width:100%;max-width:360px;border-radius:24px;padding:16px;background:linear-gradient(160deg,#1fa65a,#11753d);border:3px solid #000;box-shadow:6px 6px 0 var(--pink),inset 0 1px 0 rgba(255,255,255,.35)}
.rkeys{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.rk{position:relative;aspect-ratio:1.15;border-radius:14px;background:linear-gradient(#f2f4ee,#c9cdc4);border:2.5px solid #000;box-shadow:0 4px 0 #000;font-family:'Space Mono',monospace;font-weight:700;font-size:26px;color:#111;display:grid;place-items:center;overflow:visible}
.rk.dn{transform:translateY(3px);box-shadow:0 1px 0 #000;background:linear-gradient(#ff8fc4,#ff3d9a);color:#fff}
.rk .ring{position:absolute;inset:-4px;border-radius:18px;border:4px solid var(--pink);pointer-events:none;box-shadow:0 0 14px var(--pink)}
.rk .ring.t{border-color:var(--teal);box-shadow:0 0 14px var(--teal)}
.rk .glow{position:absolute;inset:0;border-radius:12px;background:radial-gradient(circle,rgba(255,255,255,.9),rgba(255,61,154,0) 70%);opacity:0;pointer-events:none}
.rk .glow.on{animation:gl .3s ease-out}
@keyframes gl{from{opacity:1;transform:scale(1.2)}to{opacity:0;transform:scale(1.6)}}
.rprog{width:100%;max-width:360px;height:6px;border-radius:3px;background:rgba(0,0,0,.6);overflow:hidden}
.rprog i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--teal),var(--pink))}
.songs{display:grid;gap:10px}
.song{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;background:var(--panel2);border:2px solid #000;box-shadow:4px 4px 0 var(--teal);text-align:left}
.song b{display:block;font-family:'Black Han Sans';font-weight:400;font-size:19px}
.song small{display:block;font-size:12.5px;color:var(--mute);margin-top:2px}
.song .st{margin-left:auto;font-family:'Space Mono',monospace;font-weight:700;color:var(--yel);font-size:14px;text-align:right}
.grade{font-family:'Black Han Sans';font-size:90px;text-align:center;line-height:1;color:var(--yel);text-shadow:5px 5px 0 var(--pink)}
`;
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));

// 노래: bpm, 마디 수, 음계, 멜로디 패턴(16분 음표 칸에 음 번호, -1 쉼)
const SONGS = [
  { id: 'call', n: '자정의 통화', sub: '느긋하게 · 쉬움', bpm: 96, bars: 32, root: 220, lvl: 1, mel: [0, -1, -1, -1, 2, -1, -1, -1, 4, -1, -1, -1, 2, -1, -1, -1, 5, -1, -1, -1, 4, -1, -1, -1, 2, -1, -1, -1, 0, -1, -1, -1] },
  { id: 'rain', n: '네온 레인', sub: '통통 튀게 · 보통', bpm: 118, bars: 40, root: 196, lvl: 2, mel: [0, -1, 2, -1, 4, -1, -1, 3, -1, 2, -1, -1, 4, -1, 5, -1, 7, -1, 5, -1, 4, -1, -1, 2, -1, 4, -1, -1, 0, -1, -1, -1] },
  { id: 'night', n: '끝없는 밤 (메들리)', sub: '틀릴 때까지 계속 · 하트 10개', bpm: 112, bars: 600, root: 207.65, lvl: 2, endless: 1, mel: [0, -1, 2, 4, -1, 5, -1, 4, 2, -1, 0, -1, 4, -1, 7, -1, 5, -1, 4, 2, -1, 4, 5, -1, 7, -1, 9, -1, 7, 5, 4, -1] },
  { id: 'rave', n: '해골 레이브', sub: '정신없이 · 어려움', bpm: 138, bars: 48, root: 174.6, lvl: 3, mel: [0, -1, 0, 2, -1, 4, -1, 2, 5, -1, 4, -1, 2, 4, -1, 7, -1, 5, 4, -1, 2, -1, 4, 5, 7, -1, 5, -1, 4, 2, 0, -1] }
];
const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
const freq = (root, k) => root * Math.pow(2, PENTA[k % PENTA.length] / 12);
const KEY_OF = n => [1, 2, 3, 4, 5, 6, 7, 8, 9][n % 9];

const DIF = [{ n: '쉬움', ap: 1.15, p: .085, g: .17, keep: .55, add: 0, mul: .8, rw: .7 }, { n: '보통', ap: .9, p: .07, g: .14, keep: 1, add: 0, mul: 1, rw: 1 }, { n: '어려움', ap: .7, p: .055, g: .11, keep: 1, add: .35, mul: 1.35, rw: 1.5 }, { n: '악몽', ap: .55, p: .045, g: .09, keep: 1, add: .6, mul: 1.8, rw: 2 }];
const dif = () => Math.min(S.rhDif ?? 1, unl());
// 어려움은 아무 곡 A 이상, 악몽은 어려움에서 S를 받으면 열린다
const unl = () => { const r = S.rh || {}; return Object.keys(r).some(k => k.endsWith(':2') && r[k].g === 'S') ? 3 : Object.values(r).some(x => 'SA'.includes(x.g)) ? 2 : 1; };
const rk = (song) => dif() === 1 ? song.id : song.id + ':' + dif();
function chart(song) {
  const D = DIF[dif()];
  const step = 60 / song.bpm / 4, notes = []; let lastKey = 5;
  const total = song.bars * 16;
  for (let i = 0; i < total; i++) {
    const bar = i / 16 | 0, m = song.mel[i % 32];
    if (bar < 2 || bar >= song.bars - 1) continue; // 앞 두 마디는 준비
    let take = m >= 0;
    if (song.lvl === 1 && i % 8) take = false;
    if (song.lvl === 2 && i % 2) take = take && Math.random() < .5;
    if (!take && song.lvl === 3 && i % 4 === 0 && Math.random() < .5) take = true;
    if (take && Math.random() > D.keep) take = false;
    if (!take && i % 2 === 0 && Math.random() < D.add) take = true;
    if (!take) continue;
    let k = m >= 0 ? (m * 3 + bar) % 9 + 1 : (lastKey + 4) % 9 + 1;
    if (k === lastKey && Math.random() < .6) k = k % 9 + 1;
    lastKey = k; notes.push({ t: i * step, k, m: Math.max(0, m) });
  }
  return { notes, len: total * step };
}

let ctxA = null, sched = 0, st = null;
function sound(t0, song) {
  const a = audio(); if (!a) return; ctxA = a;
  const step = 60 / song.bpm / 4, total = song.bars * 16; let i = 0;
  const out = a.createGain(); out.gain.value = .55; out.connect(a.destination);
  const noise = (() => { const b = a.createBuffer(1, a.sampleRate * .2, a.sampleRate), d = b.getChannelData(0); for (let j = 0; j < d.length; j++) d[j] = Math.random() * 2 - 1; return b; })();
  const env = (g, at, v, dur) => { g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(v, at + .005); g.gain.exponentialRampToValueAtTime(.0001, at + dur); };
  const kick = at => { const o = a.createOscillator(), g = a.createGain(); o.frequency.setValueAtTime(150, at); o.frequency.exponentialRampToValueAtTime(40, at + .15); env(g, at, .9, .22); o.connect(g); g.connect(out); o.start(at); o.stop(at + .25); };
  const hat = (at, v) => { const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = noise; f.type = 'highpass'; f.frequency.value = 7000; env(g, at, v, .05); s.connect(f); f.connect(g); g.connect(out); s.start(at); s.stop(at + .06); };
  const snare = at => { const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = noise; f.type = 'bandpass'; f.frequency.value = 1800; env(g, at, .5, .14); s.connect(f); f.connect(g); g.connect(out); s.start(at); s.stop(at + .16); };
  const bass = (at, fr, dur) => { const o = a.createOscillator(), f = a.createBiquadFilter(), g = a.createGain(); o.type = 'sawtooth'; o.frequency.value = fr; f.type = 'lowpass'; f.frequency.value = 500; env(g, at, .32, dur); o.connect(f); f.connect(g); g.connect(out); o.start(at); o.stop(at + dur + .02); };
  const pad = (at, fr, dur) => { [1, 1.5, 2.005].forEach(m => { const o = a.createOscillator(), g = a.createGain(); o.type = 'triangle'; o.frequency.value = fr * m; g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(.045, at + .2); g.gain.linearRampToValueAtTime(0, at + dur); o.connect(g); g.connect(out); o.start(at); o.stop(at + dur + .05); }); };
  const prog = [0, 3, 4, 2];
  const tick = () => {
    if (!st || st.stop) return;
    while (i < total && t0 + i * step < a.currentTime + .25) {
      const at = t0 + i * step, s = i % 16, bar = i / 16 | 0, root = song.root / 2 * Math.pow(2, PENTA[prog[bar % 4]] / 12);
      if (s % 4 === 0 && (song.lvl > 1 || s % 8 === 0)) kick(at);
      if (s % 8 === 4 && bar >= 1) snare(at);
      if (s % 2 === 0 && bar >= 1) hat(at, s % 4 ? .12 : .2);
      if (song.lvl === 3 && s % 2 && bar >= 4) hat(at, .08);
      if (s % 4 === 2 || (song.lvl > 1 && s % 8 === 0)) bass(at, root, step * 1.8);
      if (s === 0) pad(at, root * 2, step * 16);
      i++;
    }
    sched = setTimeout(tick, 60);
  };
  tick();
  return out;
}
function blip(out, fr) { const a = ctxA; if (!a) return; const o = a.createOscillator(), o2 = a.createOscillator(), g = a.createGain(), at = a.currentTime; o.type = 'square'; o2.type = 'sine'; o.frequency.value = fr; o2.frequency.value = fr * 2; g.gain.setValueAtTime(.0001, at); g.gain.linearRampToValueAtTime(.12, at + .005); g.gain.exponentialRampToValueAtTime(.0001, at + .22); o.connect(g); o2.connect(g); g.connect(out || a.destination); o.start(at); o2.start(at); o.stop(at + .25); o2.stop(at + .25); }

function menu() {
  frame('리듬 다이얼', B => {
    talk(B, 'l', '키패드가 반짝이면 테두리가 버튼에 딱 맞을 때 눌러요. …제 심장 박자랑 맞춰 볼래요?');
    const L = el('div', 'songs');
    SONGS.forEach(s => { let r; const b = el('button', 'song'); const t = el('div'); t.append(el('b', null, s.n), el('small', null, `${s.sub} · ${s.bpm} BPM`)); const sc = el('div', 'st'); sc.innerHTML = (r = (S.rh || {})[rk(s)]) ? `${ci('medal')}${r.g}<br>${r.s}` : '—'; b.append(t, sc); b.onclick = () => { dtmf(s.lvl); play(s); }; L.appendChild(b); });
    const P = el('div', 'pills'); P.style.margin = '0 0 10px'; DIF.forEach((d, i) => { const lock = i > unl(); const b = el('button', dif() === i ? 'on' : '', lock ? '🔒 ' + d.n : d.n); b.onclick = () => { if (lock) { toast(i === 2 ? '아무 곡이나 A 등급을 받으면 열려요.' : '어려움에서 S 등급을 받으면 열려요.'); return; } S.rhDif = i; save(); menu(); }; P.appendChild(b); });
    B.appendChild(P); B.appendChild(L);
    B.appendChild(el('div', 'hint', `${DIF[dif()].n}: 링이 ${DIF[dif()].ap}초 동안 줄어들어요 · 점수 ×${DIF[dif()].mul} · 동전 ×${DIF[dif()].rw}`));
    B.appendChild(el('div', 'rules', '판정: 딱 맞으면 PERFECT, 조금 어긋나면 GOOD, 놓치면 MISS. 콤보가 이어질수록 점수가 커져요. 등급에 따라 게임 동전을 받아요(S 8 · A 5 · B 3 · C 1). 소리를 켜고 해 주세요.'));
  }, true);
}

function play(song) {
  const B = frame(song.n, () => {}, true, true);
  const R = el('div', 'rh'); B.appendChild(R);
  R.innerHTML = '<div class="rtop"><div class="rsc" id="rSc">0</div><div class="rcb" id="rCb"></div></div><div class="rjudge" id="rJd">준비…</div><div class="rpad"><div class="rkeys" id="rKeys"></div></div><div class="rprog"><i id="rPg"></i></div>';
  const K = R.querySelector('#rKeys'), keys = {};
  for (let k = 1; k <= 9; k++) { const b = el('button', 'rk', k); const gl = el('div', 'glow'); b.appendChild(gl); b.dataset.k = k; keys[k] = b; K.appendChild(b); }
  const { notes, len } = chart(song); const D = DIF[dif()], AP = D.ap; // 테두리가 줄어드는 시간
  const a = audio(); if (!a) { toast('소리를 켤 수 없어요.'); return; }
  const t0 = a.currentTime + 1.2; let raf = 0;
  st = { stop: false, score: 0, combo: 0, max: 0, p: 0, g: 0, m: 0, idx: 0, live: [], life: 10 };
  const out = sound(t0, song);
  ARC.cleanup = () => { if (st) st.stop = true; clearTimeout(sched); cancelAnimationFrame(raf); try { out && out.disconnect(); } catch (e) {} st = null; };
  const J = (txt, c) => { const j = $('rJd'); j.textContent = txt; j.className = 'rjudge ' + c; };
  function judge(k) {
    if (!st) return; const now = a.currentTime - t0; let best = null, bd = 1;
    for (const n of st.live) if (!n.done && n.k === k) { const d = Math.abs(n.t - now); if (d < bd) { bd = d; best = n; } }
    blip(out, freq(song.root * 2, best ? best.m + 2 : k));
    const key = keys[k]; key.classList.add('dn'); setTimeout(() => key.classList.remove('dn'), 90);
    if (!best || bd > D.g + .05) return;
    best.done = true; best.el && best.el.remove();
    if (song.endless && st.life < 10) st.life = Math.min(10, st.life + (bd <= .07 ? .25 : .1));
    if (bd <= D.p) { st.p++; st.combo++; st.score += Math.round((100 + st.combo * 4) * D.mul); J('PERFECT', 'p'); } else if (bd <= D.g) { st.g++; st.combo++; st.score += Math.round((50 + st.combo * 2) * D.mul); J('GOOD', 'g'); } else { miss(); return; }
    st.max = Math.max(st.max, st.combo); const gl = key.querySelector('.glow'); gl.classList.remove('on'); void gl.offsetWidth; gl.classList.add('on');
  }
  function miss() { st.m++; st.combo = 0; J('MISS', 'm'); if (song.endless) { st.life--; if (st.life <= 0) setTimeout(finish, 50); } }
  Object.values(keys).forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); judge(+b.dataset.k); }));
  const kd = e => { const k = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, q: 1, w: 2, e: 3, a: 4, s: 5, d: 6, z: 7, x: 8, c: 9 }[e.key]; if (k) judge(k); };
  addEventListener('keydown', kd); const oc = ARC.cleanup; ARC.cleanup = () => { removeEventListener('keydown', kd); oc(); };
  const beat = 60 / song.bpm;
  function loop() {
    if (!st || st.stop) return; const now = a.currentTime - t0;
    while (st.idx < notes.length && notes[st.idx].t - AP <= now) { const n = notes[st.idx++]; const r = el('div', 'ring' + (n.k % 2 ? '' : ' t')); keys[n.k].appendChild(r); n.el = r; st.live.push(n); }
    for (const n of st.live) { if (n.done) continue; const u = (n.t - now) / AP; if (n.el) { const s = 1 + Math.max(0, u) * 1.2; n.el.style.transform = `scale(${s})`; n.el.style.opacity = Math.min(1, 1.6 - u); } if (now - n.t > D.g + .05) { n.done = true; n.el && n.el.remove(); miss(); } }
    st.live = st.live.filter(n => !n.done);
    $('rSc').textContent = st.score.toLocaleString() + (song.endless ? '  ' + '♥'.repeat(Math.max(0, Math.ceil(st.life))) : ''); $('rCb').textContent = st.combo > 2 ? st.combo + ' COMBO' : '';
    $('rPg').style.width = Math.max(0, Math.min(100, now / len * 100)) + '%';
    const ph = ((now % beat) + beat) % beat / beat; R.style.setProperty('--pulse', 1 + Math.max(0, .04 - ph * .08));
    if (now < 0 && $('rJd').textContent === '준비…' && now > -.6) J('시작!', 'g');
    if (now > len + .3) return finish();
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
  function finish() {
    if (!st || st.stop) return; const done = song.endless ? (st.p + st.g + st.m) : notes.length; const tot = done || 1, acc = (st.p + st.g * .6) / tot, g = acc >= .92 ? 'S' : acc >= .8 ? 'A' : acc >= .6 ? 'B' : 'C', reward = song.endless ? Math.min(20, 1 + Math.floor((st.p + st.g) / 50)) : Math.max(1, Math.round({ S: 8, A: 5, B: 3, C: 1 }[g] * D.rw));
    S.rh = S.rh || {}; const prev = S.rh[rk(song)]; if (!prev || st.score > prev.s) S.rh[rk(song)] = { s: st.score, g }; save(); gcAdd(reward);
    const res = { ...st }; ARC.cleanup = null; st.stop = true; clearTimeout(sched); setTimeout(() => { try { out.disconnect(); } catch (e) {} }, 400); st = null;
    frame(song.n, B2 => {
      B2.appendChild(el('div', 'grade', g));
      const s = el('div', 'rules'); s.innerHTML = `점수 <b>${res.score.toLocaleString()}</b> · 최대 콤보 <b>${res.max}</b><br>PERFECT ${res.p} · GOOD ${res.g} · MISS ${res.m} · 정확도 ${Math.round(acc * 100)}%<br>${ci('gc')}게임 동전 <b>+${reward}</b>`; B2.appendChild(s);
      talk(B2, 'l', g === 'S' ? '…지금 그 손가락, 반칙이에요. 너무 잘하잖아요.' : g === 'A' ? '박자 감각 좋은데요? 춤도 잘 춰요?' : g === 'B' ? '나쁘지 않아요. 한 번 더 하면 A예요.' : '박자보다 제 얼굴을 너무 봤죠?');
      B2.appendChild(row(btn('다시 하기', 'wide', () => play(song)), btn('노래 고르기', 'ghost wide', menu)));
    }, true);
    coinSound();
  }
}

ARC.reg({ id: 'rhythm', order: 2, name: '리듬 다이얼', ban: 'rhythm', icon: gimg('s_phone'), color: '#2fe0c8', sub: () => { const r = S.rh || {}; const best = Object.values(r).map(x => x.g).sort((a, b) => 'SABC'.indexOf(a) - 'SABC'.indexOf(b))[0]; return `키패드로 박자 맞추기 · ${best ? '최고 ' + best : '노래 4곡'}`; }, start: menu });
})();
