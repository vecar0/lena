/* v155 레나TV — 유튜브처럼 쓰는 화면(홈·검색·구독·보관함·영상·채널·재생목록), 모양만 레나 앱 재료.
   읽기 권한(youtube.readonly)이라 좋아요·구독·댓글 쓰기는 '유튜브 앱에서 열기'로. 열쇠는 life.js의 lenaLife.YT(우편함 서버 v4). */
(function () {
  'use strict';
  if (!window.lenaLife || !lenaLife.YT) return;
  const YT = lenaLife.YT, api = (p, q) => YT.api(p, q);
  const E = (t, c, x) => el(t, c, x);
  S.ytLater = S.ytLater || []; S.ytHist = S.ytHist || []; S.ytCh = S.ytCh || {};

  // ---------- 숫자·시간 ----------
  const num = n => { n = +n || 0; if (n >= 1e8) return (n / 1e8).toFixed(n < 1e9 ? 1 : 0).replace(/\.0$/, '') + '억'; if (n >= 1e4) return (n / 1e4).toFixed(n < 1e5 ? 1 : 0).replace(/\.0$/, '') + '만'; if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + '천'; return String(n); };
  const ago = ms => { const s = (Date.now() - ms) / 1e3; if (s < 3600) return Math.max(1, Math.round(s / 60)) + '분 전'; if (s < 86400) return Math.round(s / 3600) + '시간 전'; if (s < 86400 * 7) return Math.round(s / 86400) + '일 전'; if (s < 86400 * 30) return Math.round(s / 86400 / 7) + '주 전'; if (s < 86400 * 365) return Math.round(s / 86400 / 30) + '개월 전'; return Math.round(s / 86400 / 365) + '년 전'; };
  const isoDur = s => { const m = /P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(s || '') || []; return (+m[1] || 0) * 86400 + (+m[2] || 0) * 3600 + (+m[3] || 0) * 60 + (+m[4] || 0); };
  const dur = s => { if (!s) return ''; const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return h ? `${h}:${pad(m)}:${pad(x)}` : `${m}:${pad(x)}`; };
  const short = v => v.dur && v.dur <= 70;

  // ---------- 불러오기 ----------
  const vOf = (x, extra) => ({ id: x.id, t: x.snippet.title, ch: x.snippet.channelTitle, cid: x.snippet.channelId, at: Date.parse(x.snippet.publishedAt), th: ((x.snippet.thumbnails || {}).high || (x.snippet.thumbnails || {}).medium || {}).url || '', dur: x.contentDetails ? isoDur(x.contentDetails.duration) : 0, views: x.statistics ? +x.statistics.viewCount || 0 : 0, likes: x.statistics ? +x.statistics.likeCount || 0 : 0, desc: x.snippet.description || '', live: x.snippet.liveBroadcastContent === 'live', ...(extra || {}) });
  async function videos(ids) { const out = []; for (let i = 0; i < ids.length; i += 50) { const j = await api('videos', { part: 'snippet,contentDetails,statistics', id: ids.slice(i, i + 50).join(',') }); (j.items || []).forEach(x => out.push(vOf(x))); } return ids.map(id => out.find(v => v.id === id)).filter(Boolean); }
  async function chans(ids) { ids = [...new Set(ids)].filter(c => c && !(S.ytCh[c] && Date.now() - S.ytCh[c].at < 7 * 864e5)); for (let i = 0; i < ids.length; i += 50) { const j = await api('channels', { part: 'snippet,statistics', id: ids.slice(i, i + 50).join(',') }); (j.items || []).forEach(c => { S.ytCh[c.id] = { n: c.snippet.title, av: ((c.snippet.thumbnails || {}).default || {}).url || '', subs: +c.statistics.subscriberCount || 0, hide: c.statistics.hiddenSubscriberCount, vids: +c.statistics.videoCount || 0, desc: c.snippet.description || '', at: Date.now() }; }); } save(); }
  async function subs() { if (S.ytSubs && Date.now() - S.ytSubs.at < 6 * 3600e3) return S.ytSubs.list; const list = []; let pt = ''; for (let i = 0; i < 6; i++) { const j = await api('subscriptions', { part: 'snippet', mine: 'true', maxResults: 50, order: 'relevance', ...(pt ? { pageToken: pt } : {}) }); (j.items || []).forEach(s => list.push({ cid: s.snippet.resourceId.channelId, n: s.snippet.title, av: ((s.snippet.thumbnails || {}).default || {}).url || '' })); pt = j.nextPageToken; if (!pt) break; } S.ytSubs = { at: Date.now(), list }; save(); return list; }
  async function uploads(cid, n) { const j = await api('playlistItems', { part: 'contentDetails', playlistId: 'UU' + cid.slice(2), maxResults: n || 4 }); return (j.items || []).map(x => ({ id: x.contentDetails.videoId, at: Date.parse(x.contentDetails.videoPublishedAt || 0) })); }
  async function feed() {
    const sl = await subs(), since = Date.now() - 10 * 864e5, got = []; let i = 0;
    const work = async () => { while (i < sl.length) { const c = sl[i++]; try { (await uploads(c.cid, 4)).forEach(v => { if (v.at > since) got.push(v); }); } catch (e) {} } };
    await Promise.all([1, 2, 3, 4, 5, 6].map(work));
    got.sort((a, b) => b.at - a.at); const vs = await videos(got.slice(0, 60).map(v => v.id)); await chans(vs.map(v => v.cid));
    S.ytFeed = { at: Date.now(), list: vs.map(({ desc, ...v }) => v) }; save(); return S.ytFeed.list;
  }

  // ---------- 화면 틀 ----------
  const css = document.createElement('style');
  css.textContent = `
.ytv{position:absolute;inset:0;z-index:27;background:#07090b;color:#eef4f1;display:none;flex-direction:column;overflow:hidden}
.ytv.on{display:flex}
.ytv:before{content:"";position:absolute;inset:-40px;background:url(assets/lena/poster.jpg) center top/cover;filter:blur(26px) brightness(.3) saturate(1.3);pointer-events:none}
.ytv>*{position:relative}
.yt-top{flex:none;display:flex;align-items:center;gap:8px;padding:calc(var(--st) + 8px) 12px 8px;background:rgba(7,9,11,.72);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-bottom:2px solid #000;box-shadow:0 2px 0 rgba(255,61,154,.35)}
.yt-logo{display:flex;align-items:center;gap:6px;font:400 22px 'Black Han Sans',sans-serif;color:#fff;margin-right:auto;background:none;border:0;padding:0}
.yt-logo i{width:34px;height:24px;border-radius:7px;background:linear-gradient(#ff6fb3,#ff3d9a);border:2px solid #000;box-shadow:0 2px 0 #000;display:grid;place-items:center}
.yt-logo i:after{content:"";border-left:9px solid #fff;border-top:6px solid transparent;border-bottom:6px solid transparent;margin-left:2px}
.yt-logo b{font-weight:400}.yt-logo small{font:700 11px 'Space Mono',monospace;color:#9ff5e4;align-self:flex-start;margin-top:2px}
.yt-ib{flex:none;width:40px;height:40px;border-radius:12px;background:linear-gradient(#f2f3ee,#c9cdc4);border:2px solid #000;box-shadow:0 3px 0 #000;display:grid;place-items:center;padding:0}
.yt-ib svg{width:20px;height:20px;fill:none;stroke:#111;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.yt-ib:active{transform:translateY(2px);box-shadow:0 1px 0 #000}
.yt-sbar{flex:1;display:flex;gap:8px;align-items:center}
.yt-sbar input{flex:1;min-width:0;height:40px;border-radius:20px;border:2px solid #000;background:url(assets/lena/paper_white.webp) center/cover #f3efe6;color:#141414;font-size:16px;padding:0 14px;font-family:inherit}
.yt-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding-bottom:16px}
.yt-chips{display:flex;gap:8px;overflow-x:auto;padding:10px 12px 6px;scrollbar-width:none}.yt-chips::-webkit-scrollbar{display:none}
.yt-chips button{flex:none;height:34px;padding:0 14px;border-radius:10px;border:2px solid #000;background:linear-gradient(#f2f3ee,#c9cdc4);box-shadow:0 2px 0 #000;color:#111;font-weight:800;font-size:13px;white-space:nowrap}
.yt-chips button.on{background:url(assets/lena/paper_yellow.webp) center/cover #f2ea3a}
.yt-card{display:block;width:100%;padding:0;border:0;background:none;color:inherit;text-align:left;font-family:inherit;margin:8px 0 18px}
.yt-th{position:relative;margin:0 12px;aspect-ratio:16/9;border-radius:12px;border:2px solid #000;box-shadow:4px 5px 0 rgba(0,0,0,.6);background:#1c2628 center/cover;overflow:hidden}
.yt-th em{position:absolute;right:8px;bottom:8px;background:rgba(0,0,0,.85);color:#fff;font:700 12px 'Space Mono',monospace;font-style:normal;padding:2px 6px;border-radius:4px}
.yt-th em.live{background:#ff2e6e}
.yt-th u{position:absolute;left:0;right:0;bottom:0;height:4px;background:rgba(255,255,255,.25);text-decoration:none}.yt-th u i{display:block;height:100%;background:#ff3d9a}
.yt-meta{display:flex;gap:12px;padding:12px 14px 0}
.yt-av{flex:none;width:38px;height:38px;border-radius:50%;border:2px solid #000;box-shadow:0 0 0 2px #2fe0c8;background:#26383c center/cover}
.yt-meta div{flex:1;min-width:0}.yt-meta b{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:15px;line-height:1.35;font-weight:700}
.yt-meta small{display:block;margin-top:4px;font-size:12.5px;color:#9aa6a3}
.yt-row{display:flex;gap:10px;width:100%;padding:8px 12px;border:0;background:none;color:inherit;text-align:left;font-family:inherit}
.yt-row .yt-th{width:168px;flex:none;margin:0;border-radius:8px;box-shadow:3px 3px 0 rgba(0,0,0,.6)}
.yt-row div.tx{flex:1;min-width:0}.yt-row b{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:14px;line-height:1.35}
.yt-row small{display:block;margin-top:4px;font-size:12px;color:#9aa6a3}
.yt-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:8px 12px}
.yt-sh{padding:0;border:0;background:none;color:inherit;text-align:left;font-family:inherit}
.yt-sh .yt-th{margin:0;aspect-ratio:9/16;border-radius:10px}
.yt-sh b{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:13px;margin-top:6px}
.yt-h{display:flex;align-items:baseline;justify-content:space-between;margin:16px 14px 6px;font:400 18px 'Black Han Sans',sans-serif}
.yt-h small{font:13px inherit;color:#9aa6a3;font-family:inherit}
.yt-subs{display:flex;gap:14px;overflow-x:auto;padding:12px 14px;scrollbar-width:none;border-bottom:1px solid rgba(255,255,255,.08)}.yt-subs::-webkit-scrollbar{display:none}
.yt-subs button{flex:none;width:64px;padding:0;border:0;background:none;color:#c4cfcc;font-size:11px;font-family:inherit;text-align:center}
.yt-subs .yt-av{width:56px;height:56px;margin:0 auto 6px}.yt-subs span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.yt-subs button.on .yt-av{box-shadow:0 0 0 3px #ff3d9a}
.yt-player{flex:none;position:relative;width:100%;aspect-ratio:16/9;background:#000;border-bottom:2px solid #000}.yt-player iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.yt-w{padding:12px 14px}
.yt-w h2{margin:0;font-size:18px;line-height:1.35;font-weight:800}
.yt-w .st{margin-top:6px;font-size:12.5px;color:#9aa6a3}
.yt-chan{display:flex;align-items:center;gap:10px;margin-top:14px;padding:0;border:0;background:none;color:inherit;font-family:inherit;width:100%;text-align:left}
.yt-chan div{flex:1;min-width:0}.yt-chan b{display:block;font-size:15px}.yt-chan small{font-size:12px;color:#9aa6a3}
.yt-acts{display:flex;gap:8px;overflow-x:auto;margin:14px -14px 0;padding:0 14px 4px;scrollbar-width:none}.yt-acts::-webkit-scrollbar{display:none}
.yt-acts button,.yt-acts a{flex:none;display:flex;align-items:center;gap:6px;height:38px;padding:0 14px;border-radius:19px;border:2px solid #000;background:linear-gradient(#f2f3ee,#c9cdc4);box-shadow:0 2px 0 #000;color:#111;font-weight:800;font-size:13px;text-decoration:none;white-space:nowrap}
.yt-acts .pk{background:linear-gradient(#ff6fb3,#ff3d9a);color:#fff}
.yt-acts .on{background:url(assets/lena/paper_teal.webp) center/cover #9ff5e4}
.yt-desc{margin-top:14px;padding:12px 14px;border:2px solid #000;border-radius:4px;background:linear-gradient(rgba(243,239,230,.55),rgba(243,239,230,.55)),#f3efe6 url(assets/lena/paper_white.webp) center/cover;color:#141414;box-shadow:3px 4px 0 rgba(0,0,0,.55);font-size:13.5px;line-height:1.55;white-space:pre-wrap;word-break:break-word;width:100%;text-align:left;font-family:inherit;display:block}
.yt-desc b{display:block;font-size:12.5px;margin-bottom:4px}
.yt-desc.cl{max-height:7.6em;overflow:hidden;-webkit-mask:linear-gradient(#000 60%,transparent)}
.yt-cm{display:flex;gap:10px;padding:10px 14px}.yt-cm .yt-av{width:32px;height:32px;box-shadow:none}
.yt-cm div{flex:1;min-width:0}.yt-cm small{font-size:12px;color:#9aa6a3}.yt-cm p{margin:3px 0 0;font-size:14px;line-height:1.5;white-space:pre-wrap;word-break:break-word}
.yt-cm em{font-style:normal;font-size:12px;color:#9aa6a3;display:block;margin-top:4px}
.yt-chhd{display:flex;flex-direction:column;align-items:center;gap:6px;padding:18px 14px 10px;text-align:center}
.yt-chhd .yt-av{width:84px;height:84px;box-shadow:0 0 0 3px #ff3d9a}
.yt-chhd b{font:400 24px 'Black Han Sans',sans-serif}.yt-chhd small{font-size:12.5px;color:#9aa6a3}
.yt-msg{margin:30px 20px;text-align:center;color:#c4cfcc;font-size:14px;line-height:1.6}
.yt-nav{flex:none;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));height:calc(58px + var(--sb));padding-bottom:var(--sb);background:#101315;border-top:2px solid #000;box-shadow:inset 0 2px 0 rgba(47,224,200,.28)}
.yt-nav button{background:none;border:0;color:#9aa6a3;font-size:11px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-family:inherit}
.yt-nav svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.yt-nav button.on{color:#7dffb5;text-shadow:0 0 8px rgba(125,255,181,.6)}
.yt-more{display:block;margin:4px auto 14px;height:40px;padding:0 18px;border-radius:12px;border:2px solid #000;background:linear-gradient(#f2f3ee,#c9cdc4);box-shadow:0 2px 0 #000;color:#111;font-weight:800;font-size:13px}
.yt-pv{display:flex;gap:10px;overflow-x:auto;margin:6px 0 4px;padding-bottom:4px;scrollbar-width:none}.yt-pv::-webkit-scrollbar{display:none}
.yt-pv button{flex:none;width:200px;padding:0;border:0;background:none;color:inherit;text-align:left;font-family:inherit}
.yt-pv .yt-th{margin:0;border-radius:8px;box-shadow:3px 3px 0 rgba(0,0,0,.6)}.yt-pv b{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:13px;margin-top:6px}
`;
  document.head.appendChild(css);
  const SV = {
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    home: '<svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/></svg>',
    shorts: '<svg viewBox="0 0 24 24"><rect x="6" y="2.5" width="12" height="19" rx="4"/><path d="M10.5 9.5v5l4-2.5z"/></svg>',
    subs: '<svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="3"/><path d="M6 4h12M10 11v5l4-2.5z"/></svg>',
    lib: '<svg viewBox="0 0 24 24"><path d="M4 5h4v14H4zM10 5h4v14h-4zM16 6l3.5-.8 3 13.6-3.5.8z"/></svg>'
  };
  const root = E('div', 'ytv'); root.id = 'ytv'; app.appendChild(root);
  const top = E('div', 'yt-top'), body = E('div', 'yt-body'), nav = E('nav', 'yt-nav');
  root.append(top, body, nav);
  const st = { tab: 'home', chip: 'all', stack: [], q: '', sub: '' };
  const ib = (svg, lab, f) => { const b = E('button', 'yt-ib'); b.innerHTML = svg; b.setAttribute('aria-label', lab); b.onclick = f; return b; };
  function topBar(mode) {
    top.innerHTML = '';
    if (mode === 'search') {
      const bar = E('div', 'yt-sbar'), i = E('input'); i.type = 'search'; i.placeholder = '레나TV 검색'; i.value = st.q; i.enterKeyHint = 'search';
      i.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); st.q = i.value.trim(); if (st.q) { i.blur(); push({ v: 'results', q: st.q }); } } };
      bar.appendChild(i); top.append(ib(SV.back, '뒤로', back), bar); setTimeout(() => i.focus(), 40); return;
    }
    const lg = E('button', 'yt-logo'); lg.innerHTML = '<i></i><b>레나TV</b><small>KR</small>'; lg.onclick = () => { st.stack = []; tab('home'); };
    top.append(st.stack.length ? ib(SV.back, '뒤로', back) : E('span'), lg, ib(SV.search, '검색', () => push({ v: 'search' })), ib(SV.x, '닫기', close));
  }
  const TABS = [['home', '홈', SV.home], ['shorts', '쇼츠', SV.shorts], ['subs', '구독', SV.subs], ['lib', '보관함', SV.lib]];
  TABS.forEach(([k, l, svg]) => { const b = E('button'); b.innerHTML = svg; b.appendChild(document.createTextNode(l)); b.dataset.k = k; b.onclick = () => { st.stack = []; tab(k); }; nav.appendChild(b); });
  function tab(k) { st.tab = k; nav.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.k === k)); draw(); }
  function push(p) { st.stack.push(p); draw(); }
  function back() { st.stack.pop(); draw(); }
  function open(p) { if (!S.yt || !S.yt.on) { openSheet('lyt'); return; } root.classList.add('on'); st.stack = p ? [p] : []; tab(st.tab || 'home'); }
  function close() { root.classList.remove('on'); body.innerHTML = ''; try { lenaLife.render(); } catch (e) {} }

  // ---------- 카드 ----------
  const thumb = (v, w) => { const t = E('div', 'yt-th'); if (v.th) t.style.backgroundImage = `url("${v.th}")`; if (v.live) t.appendChild(E('em', 'live', 'LIVE')); else if (v.dur) t.appendChild(E('em', null, dur(v.dur))); const h = S.ytHist.find(x => x.id === v.id); if (h && h.p) { const u = E('u'), i = E('i'); i.style.width = Math.min(100, h.p) + '%'; u.appendChild(i); t.appendChild(u); } return t; };
  const avOf = cid => { const a = E('span', 'yt-av'), c = S.ytCh[cid]; if (c && c.av) a.style.backgroundImage = `url("${c.av}")`; return a; };
  const metaTxt = v => [v.ch, v.views ? `조회수 ${num(v.views)}회` : '', v.at ? ago(v.at) : ''].filter(Boolean).join(' · ');
  function card(v) { const b = E('button', 'yt-card'), m = E('div', 'yt-meta'), d = E('div'); b.appendChild(thumb(v)); const av = avOf(v.cid); av.onclick = e => { e.stopPropagation(); push({ v: 'chan', cid: v.cid }); }; d.append(E('b', null, v.t), E('small', null, metaTxt(v))); m.append(av, d); b.appendChild(m); b.onclick = () => push({ v: 'watch', vid: v }); return b; }
  function rowCard(v) { const b = E('button', 'yt-row'), d = E('div', 'tx'); b.appendChild(thumb(v)); d.append(E('b', null, v.t), E('small', null, metaTxt(v))); b.appendChild(d); b.onclick = () => push({ v: 'watch', vid: v }); return b; }
  function shortCard(v) { const b = E('button', 'yt-sh'); b.append(thumb(v), E('b', null, v.t)); b.onclick = () => push({ v: 'watch', vid: v }); return b; }
  const msg = t => E('div', 'yt-msg', t);
  const errTxt = e => /login|401/.test(String(e && (e.code || e.message))) ? '구글 로그인이 풀렸어. 놀기 탭 › 유튜브 설정에서 다시 로그인해 줘.' : /403/.test(String(e && e.message)) ? '오늘 쓸 수 있는 유튜브 양을 다 썼어(구글 하루 한도). 내일 다시 돼.' : '유튜브를 못 불러왔어. 잠깐 뒤 다시 해 봐.';
  async function load(B, f) { const w = msg('불러오는 중…'); B.appendChild(w); try { await f(); w.remove(); } catch (e) { w.textContent = errTxt(e); if (/login/.test(String(e && e.code))) S.yt.on = 0; } }

  // ---------- 화면들 ----------
  let gen = 0;
  function draw() {
    const my = ++gen, p = st.stack[st.stack.length - 1]; body.innerHTML = ''; body.scrollTop = 0;
    const alive = () => my === gen;
    topBar(p && p.v === 'search' ? 'search' : '');
    nav.style.display = p && p.v === 'watch' ? 'none' : '';
    if (p) return ({ search: () => {}, results: () => vResults(p, alive), watch: () => vWatch(p, alive), chan: () => vChan(p, alive), pl: () => vPl(p, alive) })[p.v]();
    ({ home: vHome, shorts: vShorts, subs: vSubs, lib: vLib })[st.tab](alive);
  }
  const fresh = () => S.ytFeed && Date.now() - S.ytFeed.at < 30 * 60e3 && S.ytFeed.list.length && S.ytFeed.list[0].cid;
  async function ensureFeed() { if (!fresh()) await feed(); return S.ytFeed.list; }
  const CH = [['all', '전체'], ['today', '오늘'], ['new', '안 본 영상'], ['long', '20분 이상'], ['short', '10분 이하'], ['later', '나중에 볼 영상']];
  function vHome(alive) {
    const ch = E('div', 'yt-chips'); CH.forEach(([k, l]) => { const b = E('button', st.chip === k ? 'on' : '', l); b.onclick = () => { st.chip = k; draw(); }; ch.appendChild(b); }); body.appendChild(ch);
    const box = E('div'); body.appendChild(box);
    const put = list => { if (!alive()) return; box.innerHTML = ''; const seen = new Set(S.ytHist.map(h => h.id)), t0 = new Date(); t0.setHours(0, 0, 0, 0);
      let L = st.chip === 'later' ? S.ytLater : list.filter(v => !short(v));
      if (st.chip === 'today') L = L.filter(v => v.at >= t0.getTime()); if (st.chip === 'new') L = L.filter(v => !seen.has(v.id)); if (st.chip === 'long') L = L.filter(v => v.dur >= 1200); if (st.chip === 'short') L = L.filter(v => v.dur && v.dur <= 600);
      if (!L.length) box.appendChild(msg(st.chip === 'later' ? '나중에 볼 영상이 없어. 영상 화면에서 \'나중에\'를 눌러 둬.' : '보여 줄 영상이 없어.'));
      L.forEach(v => box.appendChild(card(v)));
      const r = E('button', 'yt-more', `새로 고침 · ${S.ytFeed ? ago(S.ytFeed.at) : ''}`); r.onclick = () => { S.ytFeed = null; draw(); }; box.appendChild(r); };
    if (fresh() || st.chip === 'later') put(S.ytFeed ? S.ytFeed.list : []); else load(box, async () => put(await ensureFeed()));
  }
  function vShorts(alive) {
    body.appendChild(E('div', 'yt-h', '쇼츠'));
    const g = E('div', 'yt-grid'); body.appendChild(g);
    const put = list => { if (!alive()) return; const L = list.filter(short); if (!L.length) { body.appendChild(msg('구독한 채널의 새 쇼츠가 없어.')); return; } L.forEach(v => g.appendChild(shortCard(v))); };
    if (fresh()) put(S.ytFeed.list); else load(body, async () => put(await ensureFeed()));
  }
  function vSubs(alive) {
    const rowE = E('div', 'yt-subs'), box = E('div'); body.append(rowE, box);
    load(body, async () => { const sl = await subs(); if (!alive()) return;
      const all = E('button', st.sub ? '' : 'on'); const a0 = E('span', 'yt-av'); a0.style.cssText = 'background:linear-gradient(#ff6fb3,#ff3d9a)'; all.append(a0, E('span', null, '전체')); all.onclick = () => { st.sub = ''; draw(); }; rowE.appendChild(all);
      sl.forEach(c => { const b = E('button', st.sub === c.cid ? 'on' : ''), av = E('span', 'yt-av'); if (c.av) av.style.backgroundImage = `url("${c.av}")`; b.append(av, E('span', null, c.n)); b.onclick = () => { st.sub = st.sub === c.cid ? '' : c.cid; draw(); }; b.ondblclick = () => push({ v: 'chan', cid: c.cid }); rowE.appendChild(b); });
      if (st.sub) { const c = sl.find(x => x.cid === st.sub); const h = E('div', 'yt-h'); const go = E('button', 'yt-more', '채널 보기 ›'); go.style.margin = '0'; go.onclick = () => push({ v: 'chan', cid: st.sub }); h.append(E('span', null, c ? c.n : ''), go); box.appendChild(h); }
      const list = await ensureFeed(); if (!alive()) return; const L = list.filter(v => !st.sub || v.cid === st.sub);
      if (!L.length) box.appendChild(msg(st.sub ? '이 채널은 최근 10일 동안 새 영상이 없어. 채널 보기를 눌러 봐.' : '새 영상이 없어.'));
      L.forEach(v => box.appendChild(rowCard(v)));
      body.appendChild(E('div', 'yt-msg', `구독 ${sl.length}개`)); });
  }
  function vLib(alive) {
    const sec = (t, L, emptyT) => { const h = E('div', 'yt-h'); h.append(E('span', null, t), E('small', null, L.length ? L.length + '개' : '')); body.appendChild(h); if (!L.length) { body.appendChild(E('div', 'yt-msg', emptyT)); return; } const pv = E('div', 'yt-pv'); pv.style.padding = '0 14px'; L.slice(0, 20).forEach(v => { const b = E('button'); b.append(thumb(v), E('b', null, v.t)); b.onclick = () => push({ v: 'watch', vid: v }); pv.appendChild(b); }); body.appendChild(pv); };
    sec('최근 본 영상', S.ytHist, '아직 본 영상이 없어.');
    sec('나중에 볼 영상', S.ytLater, '영상 화면에서 \'나중에\'를 누르면 여기 모여.');
    const h = E('div', 'yt-h'); h.append(E('span', null, '내 재생목록')); body.appendChild(h); const box = E('div'); body.appendChild(box);
    load(box, async () => { const j = await api('playlists', { part: 'snippet,contentDetails', mine: 'true', maxResults: 25 }); if (!alive()) return; const L = j.items || [];
      if (!L.length) box.appendChild(E('div', 'yt-msg', '재생목록이 없어.'));
      L.forEach(p => { const b = E('button', 'yt-row'), t = E('div', 'yt-th'), th = (p.snippet.thumbnails || {}).medium; if (th) t.style.backgroundImage = `url("${th.url}")`; t.appendChild(E('em', null, `${p.contentDetails.itemCount}개`)); const d = E('div', 'tx'); d.append(E('b', null, p.snippet.title), E('small', null, '재생목록')); b.append(t, d); b.onclick = () => push({ v: 'pl', id: p.id, t: p.snippet.title }); box.appendChild(b); }); });
    const lk = E('button', 'yt-more', '좋아요 표시한 영상'); lk.onclick = () => push({ v: 'pl', id: 'LL', t: '좋아요 표시한 영상' }); body.appendChild(lk);
    if (S.ytHist.length) { const c = E('button', 'yt-more', '본 기록 지우기'); c.onclick = () => { if (confirm('레나TV에서 본 기록을 지울까?')) { S.ytHist = []; save(); draw(); } }; body.appendChild(c); }
  }
  function vResults(p, alive) {
    body.appendChild(E('div', 'yt-h', `'${p.q}' 검색 결과`));
    load(body, async () => { const j = await api('search', { part: 'snippet', q: p.q, type: 'video', maxResults: 20, regionCode: 'KR', relevanceLanguage: 'ko', safeSearch: 'moderate' }); const ids = (j.items || []).map(x => x.id.videoId).filter(Boolean); const vs = await videos(ids); await chans(vs.map(v => v.cid)); if (!alive()) return;
      if (!vs.length) body.appendChild(msg('검색 결과가 없어.')); vs.forEach(v => body.appendChild(card(v))); });
  }
  function vPl(p, alive) {
    body.appendChild(E('div', 'yt-h', p.t));
    load(body, async () => { const j = await api('playlistItems', { part: 'contentDetails', playlistId: p.id, maxResults: 50 }); const vs = await videos((j.items || []).map(x => x.contentDetails.videoId)); if (!alive()) return; if (!vs.length) body.appendChild(msg('비어 있어.')); vs.forEach(v => body.appendChild(rowCard(v))); });
  }
  function vChan(p, alive) {
    load(body, async () => { await chans([p.cid]); const c = S.ytCh[p.cid] || { n: '' }; if (!alive()) return;
      const hd = E('div', 'yt-chhd'); hd.append(avOf(p.cid), E('b', null, c.n), E('small', null, [c.hide ? '' : `구독자 ${num(c.subs)}명`, `동영상 ${num(c.vids)}개`].filter(Boolean).join(' · '))); body.appendChild(hd);
      const acts = E('div', 'yt-acts'); acts.style.justifyContent = 'center'; acts.style.margin = '4px 0 6px'; const a = E('a', null, '유튜브 앱에서 열기'); a.href = `https://www.youtube.com/channel/${p.cid}`; a.target = '_blank'; a.rel = 'noopener'; acts.appendChild(a); body.appendChild(acts);
      if (c.desc) { const d = E('button', 'yt-desc cl', c.desc); d.style.margin = '8px 14px'; d.style.width = 'calc(100% - 28px)'; d.onclick = () => d.classList.toggle('cl'); body.appendChild(d); }
      body.appendChild(E('div', 'yt-h', '동영상'));
      const ids = (await uploads(p.cid, 30)).map(v => v.id), vs = await videos(ids); if (!alive()) return;
      vs.forEach(v => body.appendChild(short(v) ? rowCard(v) : card(v))); });
  }
  function vWatch(p, alive) {
    const v0 = p.vid; nav.style.display = 'none';
    const pl = E('div', 'yt-player'), fr = document.createElement('iframe');
    fr.src = `https://www.youtube.com/embed/${v0.id}?playsinline=1&autoplay=1&rel=0&modestbranding=1`; fr.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; fr.allowFullscreen = true; fr.title = v0.t || '영상';
    pl.appendChild(fr); body.appendChild(pl);
    // 본 기록
    S.ytHist = [{ id: v0.id, t: v0.t, ch: v0.ch, cid: v0.cid, th: v0.th, dur: v0.dur, at: v0.at, seen: Date.now() }].concat(S.ytHist.filter(h => h.id !== v0.id)).slice(0, 60); save();
    const w = E('div', 'yt-w'); body.appendChild(w);
    load(w, async () => {
      let v = v0; if (!v.desc || !v.cid) { const r = await videos([v0.id]); if (r[0]) v = r[0]; } await chans([v.cid]); if (!alive()) return;
      const c = S.ytCh[v.cid] || {};
      w.append(E('h2', null, v.t), E('div', 'st', [v.views ? `조회수 ${num(v.views)}회` : '', v.at ? ago(v.at) : '', v.likes ? `좋아요 ${num(v.likes)}` : ''].filter(Boolean).join(' · ')));
      const chb = E('button', 'yt-chan'), cd = E('div'); cd.append(E('b', null, v.ch || c.n || ''), E('small', null, c.subs && !c.hide ? `구독자 ${num(c.subs)}명` : '')); chb.append(avOf(v.cid), cd); chb.onclick = () => push({ v: 'chan', cid: v.cid }); w.appendChild(chb);
      const acts = E('div', 'yt-acts'), later = S.ytLater.some(x => x.id === v.id);
      const lb = E('button', later ? 'on' : '', later ? '✓ 나중에 볼 영상' : '나중에'); lb.onclick = () => { const i = S.ytLater.findIndex(x => x.id === v.id); if (i >= 0) S.ytLater.splice(i, 1); else S.ytLater.unshift({ id: v.id, t: v.t, ch: v.ch, cid: v.cid, th: v.th, dur: v.dur, at: v.at, views: v.views }); save(); lb.classList.toggle('on', i < 0); lb.textContent = i < 0 ? '✓ 나중에 볼 영상' : '나중에'; };
      const pb = E('button', 'pk', '놀기 시간에 넣기'); pb.onclick = () => { const t = addItem(`유튜브 · ${v.t}`.slice(0, 80), '', 'todo'); t.play = true; t.yt = v.id; t.mins = Math.max(10, Math.ceil((v.dur || 600) / 60 / 5) * 5); lenaLife.placeOne(t); save(); toast(t.plan ? `${lenaLife.whenTxt(t.plan)}에 넣어 놨어 · ${t.mins}분` : '빈 자리가 없어서 할 일 탭에 뒀어.'); };
      const sh = E('button', null, '공유'); sh.onclick = () => { const u = `https://youtu.be/${v.id}`; if (navigator.share) navigator.share({ title: v.t, url: u }).catch(() => {}); else navigator.clipboard.writeText(u).then(() => toast('링크 복사했어.')); };
      const ln = E('button', null, '레나랑 얘기'); ln.onclick = () => { close(); lenaLife.go('lena'); setTimeout(() => { const m = $('msg'); if (m) { m.value = `이 영상 봤어: "${v.t}" (${v.ch}) `; m.focus(); try { syncSend(); } catch (e) {} } }, 200); };
      const op = E('a', null, '유튜브 앱 (좋아요·댓글)'); op.href = `https://youtu.be/${v.id}`; op.target = '_blank'; op.rel = 'noopener';
      acts.append(pb, lb, sh, ln, op); w.appendChild(acts);
      if (v.desc) { const d = E('button', 'yt-desc cl'); d.append(E('b', null, [v.views ? `조회수 ${num(v.views)}회` : '', v.at ? new Date(v.at).toLocaleDateString('ko-KR') : ''].filter(Boolean).join('  ')), document.createTextNode(v.desc)); d.onclick = () => d.classList.toggle('cl'); w.appendChild(d); }
      // 댓글
      const ch = E('div'); body.appendChild(ch);
      try { const j = await api('commentThreads', { part: 'snippet', videoId: v.id, maxResults: 20, order: 'relevance', textFormat: 'plainText' }); if (!alive()) return; const L = j.items || [];
        const h = E('div', 'yt-h'); h.append(E('span', null, '댓글'), E('small', null, L.length ? `인기순 ${L.length}개` : '')); ch.appendChild(h);
        L.forEach(x => { const s = x.snippet.topLevelComment.snippet, r = E('div', 'yt-cm'), av = E('span', 'yt-av'), d = E('div'); if (s.authorProfileImageUrl) av.style.backgroundImage = `url("${s.authorProfileImageUrl}")`; d.append(E('small', null, `${s.authorDisplayName} · ${ago(Date.parse(s.publishedAt))}`), E('p', null, s.textOriginal || s.textDisplay), E('em', null, `좋아요 ${num(s.likeCount)}${x.snippet.totalReplyCount ? ` · 답글 ${x.snippet.totalReplyCount}개` : ''}`)); r.append(av, d); ch.appendChild(r); });
      } catch (e) { ch.appendChild(E('div', 'yt-msg', '댓글을 볼 수 없는 영상이야.')); }
      // 다음 영상: 같은 채널 + 구독 새 영상
      const nx = E('div'); body.appendChild(nx); nx.appendChild(E('div', 'yt-h', '다음 영상'));
      try { const ids = (await uploads(v.cid, 8)).map(x => x.id).filter(id => id !== v.id).slice(0, 6), more = await videos(ids); if (!alive()) return; more.forEach(x => nx.appendChild(rowCard(x))); } catch (e) {}
      ((S.ytFeed && S.ytFeed.list) || []).filter(x => x.id !== v.id && x.cid !== v.cid && !short(x)).slice(0, 8).forEach(x => nx.appendChild(rowCard(x)));
    });
  }

  // ---------- 놀기 탭 카드 ----------
  function card2(P, sm) {
    if (!S.box || !S.boxTok) { P.appendChild(el('div', 'lf-muted', '유튜브는 단축어 우편함 서버(설정 › 단축어)를 먼저 연결해야 써.')); return; }
    if (!(S.yt && S.yt.on)) { P.appendChild(el('div', 'lf-muted', '구글 로그인을 한 번 해 두면 레나TV에서 구독 새 영상·검색·쇼츠·재생목록을 다 봐.')); const b = el('button', 'lf-big', '유튜브 연결하기'); b.onclick = () => openSheet('lyt'); P.appendChild(b); return; }
    if (sm) sm.textContent = S.ytFeed ? `${ago(S.ytFeed.at)} 새로 고침` : '';
    const L = ((S.ytFeed && S.ytFeed.list) || []).filter(v => !short(v)).slice(0, 8);
    if (L.length) { const pv = E('div', 'yt-pv'); L.forEach(v => { const b = E('button'); b.append(thumb(v), E('b', null, v.t)); b.onclick = () => open({ v: 'watch', vid: v }); pv.appendChild(b); }); P.appendChild(pv); }
    const o = el('button', 'lf-big', '레나TV 열기'); o.onclick = () => open(); P.appendChild(o);
    const s2 = el('button', 'lf-ghost', '유튜브 설정'); s2.onclick = () => openSheet('lyt'); P.appendChild(s2);
    if (!fresh()) feed().then(() => { try { lenaLife.render(); } catch (e) {} }).catch(() => {});
  }
  window.lenaYT = { open, close, card: card2, watch: v => open({ v: 'watch', vid: v }), feed, num, ago };
})();
