// 레나가 먼저 챙기기 2: 대화 후속 질문 + 날씨
// app.js·proactive.js 뒤에 불러와서 sysPrompt·apply·plan·설정을 감싼다.
'use strict';
(() => {
const today = () => dk(new Date());
const F = () => { if (!S.follow) S.follow = []; return S.follow; };            // [{id, at, q, asked}]
const W = () => { if (!S.wx) S.wx = { on: false }; return S.wx; };            // {on, lat, lon, data:{at, days:[{d,pop,max,min,code}]}, said}
const when = t => { const d = new Date(t), k = dk(d), n = new Date(); const tm = new Date(n); tm.setDate(n.getDate() + 1); return (k === dk(n) ? '오늘 ' : k === dk(tm) ? '내일 ' : `${d.getMonth() + 1}/${d.getDate()} `) + hm(d); };
const PO = () => { if (!S.pro) S.pro = {}; if (S.pro.follow === undefined) S.pro.follow = true; return S.pro; };

// ---------- 날씨 (Open-Meteo, 키 없음) ----------
const WX = c => c === 0 ? '맑음' : c <= 3 ? '구름' : c <= 48 ? '안개' : c <= 57 ? '이슬비' : c <= 67 ? '비' : c <= 77 ? '눈' : c <= 82 ? '소나기' : c <= 86 ? '눈' : '뇌우';
const wet = d => d && (d.pop >= 50 || (d.code >= 51 && d.code <= 67) || (d.code >= 80 && d.code <= 99));
const snowy = d => d && ((d.code >= 71 && d.code <= 77) || d.code === 85 || d.code === 86);
async function wxFetch(force) {
  const w = W(); if (!w.on || w.lat == null) return;
  if (!force && w.data && Date.now() - w.data.at < 2 * 3600e3) return;
  try {
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${w.lat}&longitude=${w.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=3`);
    if (!r.ok) return; const j = await r.json(), D = j.daily || {};
    w.data = { at: Date.now(), days: (D.time || []).map((d, i) => ({ d, code: D.weather_code[i], max: Math.round(D.temperature_2m_max[i]), min: Math.round(D.temperature_2m_min[i]), pop: D.precipitation_probability_max[i] || 0 })) };
    save(); pushSync(true);
  } catch (e) {}
}
const wxDay = k => { const w = W(); return w.data && w.data.days.find(x => x.d === k); };
const tmrKey = () => { const d = new Date(); d.setDate(d.getDate() + 1); return dk(d); };
const wxLine = d => `${WX(d.code)} ${d.min}~${d.max}° 강수 ${d.pop}%`;
function wxSay() { // 하루 첫 열기에 눈에 띄는 날씨만 레나가 먼저 말함
  const w = W(), t = wxDay(today()); if (!w.on || !t || w.said === today()) return null;
  w.said = today(); save();
  if (snowy(t)) return `${nmc()}오늘 눈 소식 있어요(${t.min}~${t.max}°). 미끄러우니까 천천히 다녀요.`;
  if (wet(t)) return `${nmc()}오늘 비 와요. 강수 ${t.pop}%. 우산 꼭 챙겨요. …젖으면 감기 걸려요.`;
  if (t.max >= 33) return `${nmc()}오늘 엄청 더워요, 최고 ${t.max}°. 물 많이 마셔요.`;
  if (t.min <= -5) return `${nmc()}오늘 많이 추워요, 최저 ${t.min}°. 목도리 해요.`;
  return null;
}
function wxEnable(B) {
  if (!navigator.geolocation) { toast('이 폰에선 위치를 못 써요.'); return; }
  toast('위치 허용을 눌러 주세요. 날씨만 봐요.');
  navigator.geolocation.getCurrentPosition(p => { const w = W(); w.on = true; w.lat = +p.coords.latitude.toFixed(2); w.lon = +p.coords.longitude.toFixed(2); w.data = null; save(); wxFetch(true).then(() => { refreshSheet(); const t = wxDay(today()); toast(t ? `날씨 켰어요. 오늘 ${wxLine(t)}` : '날씨 켰어요.'); }); },
    () => toast('위치를 못 받았어요. 아이폰 설정 > 개인정보 > 위치에서 Safari를 허용해 주세요.'), { timeout: 15000, maximumAge: 6 * 3600e3 });
}

// ---------- 대화 후속 질문 ----------
function dueFollow() { const now = Date.now(); return F().filter(f => !f.asked && f.at <= now && now - f.at < 3 * 86400e3).sort((a, b) => a.at - b.at)[0]; }
function askFirst() { // 앱을 열었을 때 레나가 먼저: 후속 질문 > 날씨
  if ($('inc') && $('inc').classList.contains('on')) return;
  const f = PO().follow !== false && dueFollow();
  if (f) { f.asked = Date.now(); S.history.push({ role: 'assistant', content: f.q, at: Date.now() }); save(); pushSync(true); say(f.q, 'calm', false); if (app.classList.contains('calling')) renderLog(); return; }
  const l = wxSay(); if (l) { S.history.push({ role: 'assistant', content: l, at: Date.now() }); save(); say(l, 'worry', false); if (app.classList.contains('calling')) renderLog(); }
}

// ---------- Gemini에 알려 주기 ----------
const _sys = sysPrompt; sysPrompt = function (sp) {
  let s = _sys(sp);
  const pend = F().filter(f => !f.asked).map(f => `${localISO(new Date(f.at))} ${f.q}`), asked = F().filter(f => f.asked && Date.now() - f.asked < 12 * 3600e3).map(f => f.q);
  const t = wxDay(today()), m = wxDay(tmrKey());
  s = s.replace('JSON만 출력:', `- 전단지로 붙이진 않았지만 앞으로 있을 일·걱정거리(면접, 병원, 시험, 발표, 약속, 아픈 곳 등)를 말하면 follow에 {"at":"YYYY-MM-DDTHH:mm"(그 일이 끝났을 즈음의 미래 시각, 모르면 다음 날 저녁 7시),"q":"그때 레나가 먼저 할 질문 한 문장(예: 면접 어땠어요? 떨렸죠?)"}. add로 붙인 일정은 넣지 않는다(이미 챙김). 이미 있는 것과 겹치지 않게, 한 번에 1~2개.
나중에 물어볼 것: ${JSON.stringify(pend.slice(0, 8))}${asked.length ? `\n방금 레나가 먼저 물어본 것: ${JSON.stringify(asked)} (사용자가 답하면 그 얘기를 이어 간다)` : ''}${t ? `\n날씨: 오늘 ${wxLine(t)}${m ? `, 내일 ${wxLine(m)}` : ''} (필요할 때만 자연스럽게 언급)` : ''}
JSON만 출력:`);
  return s.replace(/"repeat":\[\]\}/, '"repeat":[],"follow":[]}');
};
const _apply = apply; apply = function (r) {
  const res = _apply(r), now = Date.now(), got = [];
  (r.follow || []).forEach(x => { if (!x || !x.q || !x.at) return; const t = new Date(x.at).getTime(); if (!(t > now && t - now < 14 * 86400e3)) return; if (F().some(f => !f.asked && f.q === x.q)) return; const f = { id: 'fu' + now + got.length, at: t, q: String(x.q).slice(0, 120), asked: 0 }; F().push(f); got.push(f); });
  if (!got.length) return res;
  while (F().length > 40) F().shift();
  save(); pushSync(true);
  const txt = got.map(f => `${when(f.at)}쯤 '${f.q}' 물어볼게요`).join(' · '), undo = () => { S.follow = F().filter(f => !got.includes(f)); save(); pushSync(true); };
  if (res) { res.querySelector('span').textContent += ' · ' + txt; const b = res.querySelector('button'); if (b) { const o = b.onclick; b.onclick = () => { undo(); o && o(); }; } return res; }
  return noteEl(txt, undo);
};

// ---------- 알림 예약 ----------
const _plan = plan; plan = function () {
  const p = _plan(), now = Date.now(), n = nmc(), add = [], o = PO();
  if (o.follow !== false) F().forEach(f => { if (!f.asked && f.at > now) add.push({ id: f.id, at: f.at, body: n + f.q }); });
  const w = W(), m = wxDay(tmrKey());
  if (w.on && m) { const eve = new Date(); eve.setHours(21, 30, 0, 0); const morn = new Date(m.d + 'T07:30');
    const line = snowy(m) ? `내일 눈 와요(${m.min}~${m.max}°). 신발 미끄럽지 않은 걸로 꺼내 둬요.` : wet(m) ? `내일 비 와요, 강수 ${m.pop}%. 우산 현관에 꺼내 둬요.` : m.max >= 33 ? `내일 최고 ${m.max}°래요. 시원하게 입어요.` : m.min <= -5 ? `내일 최저 ${m.min}°… 따뜻하게 입고 나가요.` : '';
    if (line && eve.getTime() > now) add.push({ id: 'wx_e_' + m.d, at: eve.getTime(), body: n + line });
    if ((wet(m) && m.pop >= 60 || snowy(m)) && morn.getTime() > now) add.push({ id: 'wx_m_' + m.d, at: morn.getTime(), body: `${n}${snowy(m) ? '눈 오는 날이에요' : '비 오는 날이에요'}. 우산 챙겼어요?` }); }
  p.reminders = p.reminders.concat(add).sort((a, b) => a.at - b.at).slice(0, 180);
  return p;
};

// ---------- 설정 ----------
const _s0 = SH[0].r; SH[0].r = B => {
  _s0(B); const o = PO(), w = W();
  const sec = el('div', 'card');
  const r1 = el('div', 'row'); r1.appendChild(el('div', 't', '대화 후속 질문')).style.flex = '1'; r1.appendChild(pills([[true, '켜기'], [false, '끄기']], o.follow !== false, v => { o.follow = v; save(); pushSync(true); refreshSheet(); })); sec.appendChild(r1);
  const pend = F().filter(f => !f.asked && f.at > Date.now());
  sec.appendChild(el('div', 'hint', pend.length ? `기다리는 질문 ${pend.length}개 · 다음: ${when(pend[0].at)} '${pend[0].q}'` : '대화에서 "내일 면접 있어"처럼 말하면, 끝날 즈음 레나가 먼저 어땠는지 물어봐요.'));
  const r2 = el('div', 'row'); r2.style.marginTop = '12px'; r2.appendChild(el('div', 't', '날씨 챙기기')).style.flex = '1';
  r2.appendChild(pills([[true, '켜기'], [false, '끄기']], !!w.on, v => { if (v) { if (w.lat == null) return wxEnable(B); w.on = true; save(); wxFetch(true).then(refreshSheet); } else { w.on = false; save(); pushSync(true); refreshSheet(); } })); sec.appendChild(r2);
  const t = wxDay(today()), m = wxDay(tmrKey());
  sec.appendChild(el('div', 'hint', w.on && t ? `오늘 ${wxLine(t)}${m ? ` · 내일 ${wxLine(m)}` : ''}` : '비·눈·폭염·한파가 오면 전날 밤 9시 반에 미리 알려 줘요. 처음 켤 때 위치를 한 번 물어봐요(날씨에만 써요).'));
  const bk = [...B.querySelectorAll('.lbl')].find(x => x.textContent === '백업') || null;
  B.insertBefore(lbl('레나가 챙길 것'), bk); B.insertBefore(sec, bk);
};

// ---------- 시작·다시 열 때 ----------
const kick = () => wxFetch().then(() => setTimeout(askFirst, 600));
setTimeout(kick, 3800);
document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(kick, 1200); });
window.lenaFollow = { dueFollow, askFirst, wxSay, wxFetch }; // 점검용
})();
