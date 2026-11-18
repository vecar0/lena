/* v156 유튜브 — 유튜브 앱처럼 쓰는 화면(홈·인기·쇼츠 넘겨 보기·검색 필터·구독·보관함·영상(이어 보기·속도·자막·반복·자동 재생·미니 플레이어·챕터)·채널 탭·재생목록), 모양만 레나 앱 재료.
   읽기 권한(youtube.readonly)이라 좋아요·구독·댓글 쓰기는 '유튜브 앱에서 열기'로. 열쇠는 life.js의 lenaLife.YT(우편함 서버 v4). */
(function () {
  'use strict';
  if (!window.lenaLife || !lenaLife.YT) return;
  const LY = lenaLife.YT, api = (p, q) => LY.api(p, q);
  const E = (t, c, x) => el(t, c, x);
  S.ytLater = S.ytLater || []; S.ytHist = S.ytHist || []; S.ytCh = S.ytCh || {}; S.ytHide = S.ytHide || []; S.ytHideCh = S.ytHideCh || []; S.ytQ = S.ytQ || []; S.ytSet = Object.assign({ auto: 1, rate: 1, cc: 0, loop: 0 }, S.ytSet || {});
  const ok = v => !S.ytHide.includes(v.id) && !S.ytHideCh.includes(v.cid);

  // ---------- 숫자·시간 ----------
  const num = n => { n = +n || 0; if (n >= 1e8) return (n / 1e8).toFixed(n < 1e9 ? 1 : 0).replace(/\.0$/, '') + '억'; if (n >= 1e4) return (n / 1e4).toFixed(n < 1e5 ? 1 : 0).replace(/\.0$/, '') + '만'; if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + '천'; return String(n); };
  const ago = ms => { const s = (Date.now() - ms) / 1e3; if (s < 3600) return Math.max(1, Math.round(s / 60)) + '분 전'; if (s < 86400) return Math.round(s / 3600) + '시간 전'; if (s < 86400 * 7) return Math.round(s / 86400) + '일 전'; if (s < 86400 * 30) return Math.round(s / 86400 / 7) + '주 전'; if (s < 86400 * 365) return Math.round(s / 86400 / 30) + '개월 전'; return Math.round(s / 86400 / 365) + '년 전'; };
  const isoDur = s => { const m = /P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(s || '') || []; return (+m[1] || 0) * 86400 + (+m[2] || 0) * 3600 + (+m[3] || 0) * 60 + (+m[4] || 0); };
  const dur = s => { if (!s) return ''; const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return h ? `${h}:${pad(m)}:${pad(x)}` : `${m}:${pad(x)}`; };
  const short = v => v.dur && v.dur <= 70;

  // ---------- 불러오기 ----------
  const vOf = (x, extra) => ({ id: x.id, t: x.snippet.title, ch: x.snippet.channelTitle, cid: x.snippet.channelId, at: Date.parse(x.snippet.publishedAt), th: ((x.snippet.thumbnails || {}).high || (x.snippet.thumbnails || {}).medium || {}).url || '', dur: x.contentDetails ? isoDur(x.contentDetails.duration) : 0, views: x.statistics ? +x.statistics.viewCount || 0 : 0, likes: x.statistics ? +x.statistics.likeCount || 0 : 0, desc: x.snippet.description || '', live: x.snippet.liveBroadcastContent === 'live', tags: (x.snippet.tags || []).slice(0, 8), cmts: x.statistics ? +x.statistics.commentCount || 0 : 0, ...(extra || {}) });
  async function videos(ids) { const out = []; for (let i = 0; i < ids.length; i += 50) { const j = await api('videos', { part: 'snippet,contentDetails,statistics', id: ids.slice(i, i + 50).join(',') }); (j.items || []).forEach(x => out.push(vOf(x))); } return ids.map(id => out.find(v => v.id === id)).filter(Boolean); }
  async function chans(ids) { ids = [...new Set(ids)].filter(c => c && !(S.ytCh[c] && S.ytCh[c].v2 && Date.now() - S.ytCh[c].at < 7 * 864e5)); for (let i = 0; i < ids.length; i += 50) { const j = await api('channels', { part: 'snippet,statistics,brandingSettings', id: ids.slice(i, i + 50).join(',') }); (j.items || []).forEach(c => { S.ytCh[c.id] = { n: c.snippet.title, av: ((c.snippet.thumbnails || {}).default || {}).url || '', subs: +c.statistics.subscriberCount || 0, hide: c.statistics.hiddenSubscriberCount, vids: +c.statistics.videoCount || 0, desc: c.snippet.description || '', since: Date.parse(c.snippet.publishedAt) || 0, views: +c.statistics.viewCount || 0, cc: c.snippet.country || '', ban: ((c.brandingSettings || {}).image || {}).bannerExternalUrl || '', v2: 1, at: Date.now() }; }); } save(); }
  async function subs() { if (S.ytSubs && Date.now() - S.ytSubs.at < 6 * 3600e3) return S.ytSubs.list; const list = []; let pt = ''; for (let i = 0; i < 6; i++) { const j = await api('subscriptions', { part: 'snippet', mine: 'true', maxResults: 50, order: 'relevance', ...(pt ? { pageToken: pt } : {}) }); (j.items || []).forEach(s => list.push({ cid: s.snippet.resourceId.channelId, n: s.snippet.title, av: ((s.snippet.thumbnails || {}).default || {}).url || '' })); pt = j.nextPageToken; if (!pt) break; } S.ytSubs = { at: Date.now(), list }; save(); return list; }
  async function uploadsP(cid, n, pt) { const j = await api('playlistItems', { part: 'contentDetails', playlistId: 'UU' + cid.slice(2), maxResults: n || 4, ...(pt ? { pageToken: pt } : {}) }); return { items: (j.items || []).map(x => ({ id: x.contentDetails.videoId, at: Date.parse(x.contentDetails.videoPublishedAt || 0) })), next: j.nextPageToken || '' }; }
  const uploads = async (cid, n) => (await uploadsP(cid, n)).items;
  async function capi(path, q) {
    const u = p => `https://www.googleapis.com/youtube/v3/${path}?${new URLSearchParams(p)}`;
    const call = async (url, h) => { const r = await fetch(url, h); const j = await r.json().catch(() => ({})); if (!r.ok) { const e = new Error('api ' + r.status); e.st = r.status; e.reason = (((j.error || {}).errors || [])[0] || {}).reason || ''; throw e; } return j; };
    if (S.ytKey) return call(u({ ...q, key: S.ytKey }));
    return call(u(q), { headers: { Authorization: 'Bearer ' + await LY.token() } });
  }
  const POP = {};
  async function popular(cat) { const k = cat || '0'; if (POP[k] && Date.now() - POP[k].at < 30 * 60e3) return POP[k].list; const j = await api('videos', { part: 'snippet,contentDetails,statistics', chart: 'mostPopular', regionCode: 'KR', hl: 'ko', maxResults: 30, ...(cat ? { videoCategoryId: cat } : {}) }); const list = (j.items || []).map(x => vOf(x)); await chans(list.map(v => v.cid)); POP[k] = { at: Date.now(), list }; return list; }
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

.yt-dots{flex:none;width:28px;height:32px;margin:-4px -8px 0 0;display:grid;place-items:center;font-size:20px;color:#c4cfcc;align-self:flex-start}
.yt-row .yt-dots{margin:0}
.yt-ov{position:absolute;inset:0;z-index:9;background:rgba(0,0,0,.55);display:flex;align-items:flex-end}
.yt-msh{width:100%;max-height:80%;overflow:auto;padding:14px 12px calc(12px + var(--sb));background:#f3efe6 url(assets/lena/paper_white.webp) center/cover;color:#141414;border-top:2px solid #000;border-radius:16px 16px 0 0;box-shadow:0 -4px 0 rgba(255,61,154,.5)}
.yt-msh>b{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:14px;padding:0 6px 10px;border-bottom:1px dashed rgba(0,0,0,.3);margin-bottom:4px}
.yt-msh button{display:block;width:100%;min-height:46px;text-align:left;padding:0 8px;border:0;background:none;font-size:15px;font-weight:700;color:#141414;font-family:inherit}
.yt-msh button.x{text-align:center;color:#555;margin-top:4px;border-top:1px dashed rgba(0,0,0,.3)}
.yt-ln{color:#2fe0c8;text-decoration:none;font-weight:700}.yt-desc .yt-ln{color:#0b7d6d}
.yt-pw{position:absolute;left:0;right:0;z-index:4;display:none;background:#000}
.yt-pw.on{display:block}.yt-pw.gone{display:none!important}
.yt-pf{position:relative;width:100%;aspect-ratio:16/9;background:#000}.yt-pf iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.yt-mb{display:none}
.yt-pw.mini{top:auto;bottom:calc(58px + var(--sb));height:64px;display:flex;background:#101315;border-top:2px solid #000;box-shadow:0 -2px 0 rgba(255,61,154,.4)}
.yt-pw.mini .yt-pf{width:114px;height:64px;flex:none;aspect-ratio:auto}
.yt-pw.mini .yt-mb{flex:1;min-width:0;display:flex;align-items:center}
.yt-mb .tx{flex:1;min-width:0;height:64px;padding:0 10px;border:0;background:none;color:#eef4f1;text-align:left;font-family:inherit}
.yt-mb .tx b{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.yt-mb .tx small{display:block;font-size:11.5px;color:#9aa6a3;margin-top:2px}
.yt-mb .pp,.yt-mb .xx{flex:none;width:44px;height:64px;border:0;background:none;display:grid;place-items:center;padding:0}
.yt-mb svg{width:22px;height:22px;fill:none;stroke:#eef4f1;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}.yt-mb .pp svg{fill:#eef4f1}
.yt-ctl{display:flex;gap:6px;overflow-x:auto;margin:0 -14px 10px;padding:0 14px 2px;scrollbar-width:none}.yt-ctl::-webkit-scrollbar{display:none}
.yt-ctl button{flex:none;height:32px;padding:0 12px;border-radius:8px;border:1.5px solid #000;background:#1c2628;color:#c4cfcc;font:700 12.5px 'Space Mono',monospace}
.yt-ctl button.on{background:#9ff5e4;color:#111}
.yt-tags{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px;font-size:12.5px}
.yt-chan a.ysub{flex:none;height:36px;line-height:32px;padding:0 16px;border-radius:18px;border:2px solid #000;background:linear-gradient(#ff6fb3,#ff3d9a);color:#fff;font-weight:800;font-size:13px;text-decoration:none;box-shadow:0 2px 0 #000}
.yt-chan a.ysub.on{background:linear-gradient(#f2f3ee,#c9cdc4);color:#111}
.yt-chan .yt-av,.yt-chan div{cursor:pointer}
.yt-cps{display:flex;gap:8px;overflow-x:auto;padding:0 0 4px;scrollbar-width:none}.yt-cps::-webkit-scrollbar{display:none}
.yt-cps button{flex:none;width:150px;padding:8px 10px;border:2px solid #000;border-radius:6px;background:#f3efe6;color:#141414;text-align:left;font-family:inherit;box-shadow:2px 3px 0 rgba(0,0,0,.6)}
.yt-cps em{display:block;font:700 12px 'Space Mono',monospace;font-style:normal;color:#ff2e6e}.yt-cps span{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:13px;font-weight:700;margin-top:2px}
.yt-q{margin-top:14px;border:2px solid #000;border-radius:8px;background:#101315;overflow:hidden}
.yt-q .hd{display:flex;align-items:baseline;gap:8px;width:100%;padding:10px 12px;border:0;background:url(assets/lena/paper_yellow.webp) center/cover #f2ea3a;color:#141414;font-family:inherit;text-align:left}
.yt-q .hd small{font-size:12px;color:#444}
.yt-row.now{background:rgba(255,61,154,.18)}
.yt-cm .yt-rb{margin-top:6px;padding:4px 0;border:0;background:none;color:#2fe0c8;font-weight:800;font-size:13px;font-family:inherit}
.yt-cm.rp{padding:8px 0}.yt-cm.rp .yt-av{width:24px;height:24px}
.yt-crow{display:flex;align-items:center;gap:12px;width:100%;padding:10px 14px;border:0;background:none;color:inherit;text-align:left;font-family:inherit}
.yt-crow .yt-av{width:52px;height:52px}.yt-crow div{flex:1;min-width:0}.yt-crow b{display:block;font-size:15px}.yt-crow small{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:12px;color:#9aa6a3;margin-top:2px}
.yt-flt .yt-chips{padding-top:4px;padding-bottom:2px}.yt-flt{padding-top:6px}
.yt-qh{display:flex;align-items:center}.yt-qh .q{flex:1;min-width:0;display:flex;align-items:center;gap:12px;height:48px;padding:0 14px;border:0;background:none;color:inherit;font-size:15px;font-family:inherit;text-align:left}
.yt-qh .q span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.yt-qh svg{flex:none;width:20px;height:20px;fill:none;stroke:#9aa6a3;stroke-width:2}
.yt-qh .x{flex:none;width:44px;height:48px;border:0;background:none;color:#9aa6a3;font-size:16px}
.yt-ban{margin:10px 12px 0;aspect-ratio:6.2/1;border-radius:10px;border:2px solid #000;background:#1c2628 center/cover}
.yt-inf{display:grid;grid-template-columns:auto 1fr;gap:8px 14px;margin:8px 14px;padding:12px 14px;border:2px solid #000;border-radius:6px;background:#101315;font-size:13.5px}.yt-inf span{color:#9aa6a3}
.yt-row.lk{align-items:center;padding:12px 14px}.yt-row.lk .ic{font-size:22px;width:40px;text-align:center}
.yt-th em.pl{left:auto}
.yt-body.yt-shv{scroll-snap-type:y mandatory;padding:0}
.yt-sv{position:relative;scroll-snap-align:start;scroll-snap-stop:always;background:#000 center/contain no-repeat;overflow:hidden}
.yt-sv .f{position:absolute;inset:0}.yt-sv .f iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.yt-sv .sinf{position:absolute;left:12px;right:72px;bottom:16px;pointer-events:none;text-shadow:0 1px 3px #000}
.yt-sv .sinf .shc{pointer-events:auto;display:flex;align-items:center;gap:8px;padding:0;border:0;background:none;color:#fff;font-weight:800;font-size:14px;font-family:inherit}.yt-sv .sinf .yt-av{width:32px;height:32px}
.yt-sv .sinf p{margin:8px 0 0;font-size:14px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.yt-sv .sd{position:absolute;right:8px;bottom:16px;display:flex;flex-direction:column;gap:14px}
.yt-sv .sd button{width:52px;padding:0;border:0;background:none;color:#fff;display:flex;flex-direction:column;align-items:center;gap:3px;font-family:inherit}
.yt-sv .sd svg{width:44px;height:44px;padding:10px;border-radius:50%;background:rgba(20,20,20,.7);border:2px solid #000;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.yt-sv .sd small{font-size:11.5px;font-weight:700;text-shadow:0 1px 3px #000}

/* v158 배치는 유튜브 모바일, 색·재료는 레나 앱 */
.yt-top{padding:calc(var(--st) + 4px) 8px 6px 12px;gap:2px}
.yt-logo{font-size:21px;gap:6px}
.yt-logo i{width:32px;height:22px}
.yt-ib{background:none;border:0;box-shadow:none;border-radius:50%}
.yt-ib svg{stroke:#eef4f1}
.yt-ib:active{transform:none;box-shadow:none;background:rgba(159,245,228,.18)}
.yt-chips{gap:8px;padding:8px 12px 12px}
.yt-chips button{height:32px;padding:0 12px;border-radius:8px;border-width:1.5px;font-size:13.5px}
.yt-card{margin:0 0 22px}
.yt-card>.yt-th{margin:0;border-radius:0;border:0;border-bottom:2px solid #000;box-shadow:none}
.yt-th u i{background:#ff3d9a}
.yt-meta{padding:12px 12px 0}
.yt-h{margin:18px 12px 8px}
.yt-subs{border-bottom:0;padding:8px 12px 12px}
.yt-nav{height:calc(52px + var(--sb))}
.yt-nav button.on svg{fill:rgba(125,255,181,.25)}
.yt-w{padding:12px 12px 4px}
.yt-ctl button{border-radius:16px}
.yt-tags .yt-ln{color:#2fe0c8}
.yt-chan{margin-top:12px}
.yt-chan a.ysub{height:36px;line-height:32px;border-radius:18px}
.yt-acts{margin-top:12px;margin-left:-12px;margin-right:-12px;padding:0 12px 4px}
.yt-acts button,.yt-acts a{height:36px;border-radius:18px}
.yt-desc{border-radius:12px;margin-top:12px}
.yt-desc.cl{-webkit-mask:none;max-height:5.2em}
.yt-cps button{border-radius:10px}
.yt-q{border-radius:12px}
.yt-cmw .yt-h{cursor:pointer}
.yt-cmw .yt-h .tg{font-family:Pretendard,sans-serif}
.yt-cmw .yt-h .tg:after{content:"접기 ⌃";font-size:13px}
.yt-cmw.cl{margin:12px;padding:2px 0 8px;border:2px solid #000;border-radius:12px;background:rgba(16,19,21,.85);box-shadow:3px 4px 0 rgba(0,0,0,.55)}
.yt-cmw.cl .yt-h{margin:10px 12px 4px;font-size:16px}
.yt-cmw.cl .yt-h .tg:after{content:"⌄";font-size:16px}
.yt-cmw.cl .yt-chips,.yt-cmw.cl .yt-more,.yt-cmw.cl .yt-cm~*,.yt-cmw.cl .yt-rb,.yt-cmw.cl .yt-cm em,.yt-cmw.cl .yt-cm small{display:none}
.yt-cmw.cl .yt-cm{padding:4px 12px;align-items:center}
.yt-cmw.cl .yt-cm .yt-av{width:24px;height:24px}
.yt-cmw.cl .yt-cm p{margin:0;font-size:13px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.yt-cmw.cl .yt-msg{margin:6px 12px;text-align:left}
.yt-more{border-radius:18px;height:36px}
.yt-msh{border-radius:16px 16px 0 0}
.yt-ban{border-radius:12px}
.yt-inf{border-radius:12px}
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
      const bar = E('div', 'yt-sbar'), i = E('input'); i.type = 'search'; i.placeholder = '유튜브 검색'; i.value = st.q; i.enterKeyHint = 'search';
      i.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); go(i.value); } };
      bar.appendChild(i); top.append(ib(SV.back, '뒤로', back), bar); setTimeout(() => i.focus(), 40); return;
    }
    const lg = E('button', 'yt-logo'); lg.innerHTML = '<i></i><b>유튜브</b>'; lg.onclick = () => { st.stack = []; tab('home'); };
    top.append(st.stack.length ? ib(SV.back, '뒤로', back) : E('span'), lg, ib(SV.search, '검색', () => push({ v: 'search' })), ib(SV.x, '닫기', close));
  }
  function go(q) { q = (q || '').trim(); if (!q) return; st.q = q; S.ytQ = [q].concat(S.ytQ.filter(x => x !== q)).slice(0, 20); save(); if (document.activeElement) document.activeElement.blur(); const p = st.stack[st.stack.length - 1]; if (p && p.v === 'search') st.stack.pop(); push({ v: 'results', q, ty: 'video', or: 'relevance', du: '' }); }
  const TABS = [['home', '홈', SV.home], ['shorts', '쇼츠', SV.shorts], ['subs', '구독', SV.subs], ['lib', '보관함', SV.lib]];
  TABS.forEach(([k, l, svg]) => { const b = E('button'); b.innerHTML = svg; b.appendChild(document.createTextNode(l)); b.dataset.k = k; b.onclick = () => { st.stack = []; tab(k); }; nav.appendChild(b); });
  function tab(k) { st.tab = k; nav.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.k === k)); draw(); }
  function push(p) { st.stack.push(p); draw(); }
  function back() { st.stack.pop(); draw(); }
  function open(p) { if (!S.yt || !S.yt.on) { openSheet('lyt'); return; } root.classList.add('on'); st.stack = p ? [p] : []; tab(st.tab || 'home'); }
  function close() { stop(); root.classList.remove('on'); body.innerHTML = ''; try { lenaLife.render(); } catch (e) {} }

  // ---------- 함께 쓰는 동작 ----------
  const slim = v => ({ id: v.id, t: v.t, ch: v.ch, cid: v.cid, th: v.th, dur: v.dur, at: v.at, views: v.views });
  const isLater = v => S.ytLater.some(x => x.id === v.id);
  function toggleLater(v) { const i = S.ytLater.findIndex(x => x.id === v.id); if (i >= 0) S.ytLater.splice(i, 1); else S.ytLater.unshift(slim(v)); save(); toast(i >= 0 ? '나중에 볼 영상에서 뺐어.' : '나중에 볼 영상에 저장했어.'); return i < 0; }
  function addPlay(v) { const t = addItem(`유튜브 · ${v.t}`.slice(0, 80), '', 'todo'); t.play = true; t.yt = v.id; t.mins = Math.max(10, Math.ceil((v.dur || 600) / 60 / 5) * 5); lenaLife.placeOne(t); save(); toast(t.plan ? `${lenaLife.whenTxt(t.plan)}에 넣어 놨어 · ${t.mins}분` : '빈 자리가 없어서 할 일 탭에 뒀어.'); }
  function share(v, at) { const u = `https://youtu.be/${v.id}${at > 5 ? `?t=${Math.floor(at)}` : ''}`; if (navigator.share) navigator.share({ title: v.t, url: u }).catch(() => {}); else navigator.clipboard.writeText(u).then(() => toast('링크 복사했어.')); }
  function hide(v, ch) { const L = ch ? S.ytHideCh : S.ytHide, k = ch ? v.cid : v.id; L.push(k); save(); draw(); toast(ch ? `'${v.ch}' 채널은 이제 안 보여 줄게.` : '이 영상은 이제 안 보여 줄게.', () => { const i = L.indexOf(k); if (i >= 0) L.splice(i, 1); save(); draw(); }); }
  function menu(v) {
    const ov = E('div', 'yt-ov'), sh = E('div', 'yt-msh'); ov.appendChild(sh); root.appendChild(ov);
    const end = () => ov.remove(); ov.onclick = e => { if (e.target === ov) end(); };
    sh.appendChild(E('b', null, v.t));
    const it = (l, f) => { const b = E('button', null, l); b.onclick = () => { end(); f(); }; sh.appendChild(b); };
    it(isLater(v) ? '나중에 볼 영상에서 빼기' : '나중에 볼 영상에 저장', () => { toggleLater(v); draw(); });
    it('놀기 시간에 넣기', () => addPlay(v));
    it('공유', () => share(v));
    if (v.cid) it('채널로 가기', () => push({ v: 'chan', cid: v.cid }));
    if (S.ytHist.some(h => h.id === v.id)) it('본 기록에서 삭제', () => { S.ytHist = S.ytHist.filter(h => h.id !== v.id); save(); draw(); });
    it('관심 없음', () => hide(v));
    if (v.cid) it('채널 추천 안함', () => hide(v, 1));
    it('유튜브 앱에서 열기', () => window.open(`https://youtu.be/${v.id}`, '_blank'));
    const c = E('button', 'x', '닫기'); c.onclick = end; sh.appendChild(c);
  }
  // 글 속 링크·시간·해시태그
  const TS = s => s.split(':').reduce((a, x) => a * 60 + +x, 0);
  function rich(text) {
    const f = document.createDocumentFragment(), re = /(https?:\/\/[^\s]+)|((?:\d{1,2}:)?\d{1,2}:\d{2})(?![\d:])|(#[^\s#.,!?]+)/g; let i = 0, m0;
    while ((m0 = re.exec(text))) { const m = m0;
      f.appendChild(document.createTextNode(text.slice(i, m.index))); i = re.lastIndex;
      if (m[1]) { const a = E('a', 'yt-ln', m[1].length > 44 ? m[1].slice(0, 42) + '…' : m[1]); a.href = m[1]; a.target = '_blank'; a.rel = 'noopener'; a.onclick = e => e.stopPropagation(); f.appendChild(a); }
      else if (m[2]) { const a = E('span', 'yt-ln', m[2]); a.onclick = e => { e.stopPropagation(); seek(TS(m[2])); }; f.appendChild(a); }
      else { const a = E('span', 'yt-ln', m[3]); a.onclick = e => { e.stopPropagation(); go(m[3]); }; f.appendChild(a); }
    }
    f.appendChild(document.createTextNode(text.slice(i))); return f;
  }
  const chapters = d => { const L = []; (d || '').split('\n').forEach(l => { const m = /^\s*[(\[]?((?:\d{1,2}:)?\d{1,2}:\d{2})[)\]]?\s*[-–:]?\s*(.+)$/.exec(l); if (m) L.push({ t: TS(m[1]), n: m[2].trim() }); }); return L.length >= 3 && L[0].t === 0 ? L : []; };

  // ---------- 플레이어(한 개, 화면을 옮겨도 계속 재생 → 미니 플레이어) ----------
  const pw = E('div', 'yt-pw'), pf = E('div', 'yt-pf'), mb = E('div', 'yt-mb'); pw.append(pf, mb); root.appendChild(pw);
  const mbT = E('button', 'tx'), mbP = E('button', 'pp'), mbX = E('button', 'xx'); mbX.innerHTML = SV.x; mbX.setAttribute('aria-label', '닫기'); mb.append(mbT, mbP, mbX);
  const PL = { v: null, yt: null, fb: null, on: 0, q: null, qi: 0, next: [], playing: 0 };
  let apiP = null;
  const loadApi = () => apiP || (apiP = new Promise((res, rej) => { if (window.YT && YT.Player) return res(); const pv = window.onYouTubeIframeAPIReady; window.onYouTubeIframeAPIReady = () => { pv && pv(); res(); }; const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; s.onerror = rej; document.head.appendChild(s); setTimeout(() => rej(new Error('t')), 8000); }).catch(e => { apiP = null; throw e; }));
  const embed = (id, t) => `https://www.youtube.com/embed/${id}?playsinline=1&autoplay=1&rel=0&modestbranding=1&hl=ko${t ? `&start=${t}` : ''}${S.ytSet.cc ? '&cc_load_policy=1&cc_lang_pref=ko' : ''}`;
  const frame = src => { const fr = document.createElement('iframe'); fr.src = src; fr.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; fr.allowFullscreen = true; return fr; };
  function histAdd(v) { const o = S.ytHist.find(h => h.id === v.id) || {}; S.ytHist = [Object.assign(slim(v), { seen: Date.now(), ts: o.ts || 0, p: o.p || 0 })].concat(S.ytHist.filter(h => h.id !== v.id)).slice(0, 60); save(); }
  function play(v, o) {
    o = o || {}; PL.q = o.q || null; PL.qi = o.qi || 0;
    const same = PL.on && PL.v && PL.v.id === v.id; PL.v = v; PL.on = 1; mbFill();
    if (same) return;
    const h = S.ytHist.find(x => x.id === v.id), t = o.t != null ? o.t : (h && h.ts > 5 && h.p < 95 ? Math.floor(h.ts) : 0); histAdd(v);
    if (PL.yt && PL.yt.loadVideoById) { PL.yt.loadVideoById({ videoId: v.id, startSeconds: t }); return; }
    if (PL.fb) { PL.fb.src = embed(v.id, t); return; }
    pf.innerHTML = ''; const d = E('div'); pf.appendChild(d);
    loadApi().then(() => { if (!PL.on) return; PL.yt = new YT.Player(d, { videoId: PL.v.id, playerVars: { playsinline: 1, autoplay: 1, rel: 0, modestbranding: 1, hl: 'ko', start: t, cc_load_policy: S.ytSet.cc ? 1 : 0, cc_lang_pref: 'ko' }, events: { onReady: e => { try { e.target.setPlaybackRate(S.ytSet.rate); e.target.playVideo(); } catch (x) {} }, onStateChange: onState } }); })
      .catch(() => { if (!PL.on) return; pf.innerHTML = ''; PL.fb = frame(embed(PL.v.id, t)); pf.appendChild(PL.fb); });
  }
  let progT = 0;
  function saveProg() { try { if (!PL.yt || !PL.yt.getCurrentTime || !PL.v) return; const t = PL.yt.getCurrentTime(), d = PL.yt.getDuration() || PL.v.dur, h = S.ytHist.find(x => x.id === PL.v.id); if (h && d) { h.ts = Math.floor(t); h.p = Math.min(100, Math.round(t / d * 100)); save(); } } catch (e) {} }
  function onState(e) {
    PL.playing = e.data === 1; mbFill(); clearInterval(progT);
    if (e.data === 1) { try { PL.yt.setPlaybackRate(S.ytSet.rate); } catch (x) {} progT = setInterval(saveProg, 5000); }
    if (e.data === 2) saveProg();
    if (e.data === 0) { saveProg(); if (S.ytSet.loop) { PL.yt.seekTo(0, true); PL.yt.playVideo(); return; } nextUp(); }
  }
  function nextUp() {
    if (PL.q && PL.qi < PL.q.length - 1) return watchV(PL.q[PL.qi + 1], { q: PL.q, qi: PL.qi + 1 });
    if (S.ytSet.auto && PL.next[0]) watchV(PL.next[0]);
  }
  function watchV(v, o) { o = o || {}; const p = st.stack[st.stack.length - 1]; if (root.classList.contains('on') && p && p.v === 'watch') { st.stack[st.stack.length - 1] = { v: 'watch', vid: v, q: o.q, qi: o.qi }; draw(); } else { play(v, o); layout(false); } }
  function seek(s) { if (PL.yt && PL.yt.seekTo) { PL.yt.seekTo(s, true); PL.yt.playVideo(); } else if (PL.fb && PL.v) PL.fb.src = embed(PL.v.id, s); body.scrollTo({ top: 0, behavior: 'smooth' }); }
  const cur = () => { try { return PL.yt && PL.yt.getCurrentTime ? PL.yt.getCurrentTime() : 0; } catch (e) { return 0; } };
  function stop() { saveProg(); clearInterval(progT); try { if (PL.yt) PL.yt.destroy(); } catch (e) {} PL.yt = null; PL.fb = null; PL.on = 0; PL.playing = 0; pf.innerHTML = ''; pw.className = 'yt-pw'; body.style.paddingBottom = ''; }
  function pause() { try { if (PL.yt && PL.yt.pauseVideo) PL.yt.pauseVideo(); } catch (e) {} }
  function mbFill() { if (!PL.v) return; mbT.innerHTML = ''; mbT.append(E('b', null, PL.v.t || ''), E('small', null, PL.v.ch || '')); mbP.innerHTML = PL.playing ? '<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z"/></svg>'; mbP.setAttribute('aria-label', PL.playing ? '일시정지' : '재생'); mbP.style.display = PL.yt ? '' : 'none'; }
  mbT.onclick = () => push({ v: 'watch', vid: PL.v, q: PL.q, qi: PL.qi });
  mbP.onclick = () => { try { if (PL.playing) PL.yt.pauseVideo(); else PL.yt.playVideo(); } catch (e) {} };
  mbX.onclick = () => stop();
  function layout(watch) {
    body.style.marginTop = ''; body.style.paddingBottom = ''; if (PL.on) saveProg();
    if (!PL.on) { pw.className = 'yt-pw'; return; }
    if (watch) { pw.className = 'yt-pw on full'; pw.style.top = top.offsetHeight + 'px'; body.style.marginTop = Math.round(root.clientWidth * 9 / 16) + 'px'; return; }
    const sh = !st.stack.length && st.tab === 'shorts';
    pw.className = 'yt-pw on mini' + (sh ? ' gone' : ''); pw.style.top = ''; if (!sh) body.style.paddingBottom = '80px';
  }
  new ResizeObserver(() => { const p = st.stack[st.stack.length - 1]; if (root.classList.contains('on')) layout(p && p.v === 'watch'); }).observe(root);

  // ---------- 카드 ----------
  const thumb = v => { const t = E('div', 'yt-th'); if (v.th) t.style.backgroundImage = `url("${v.th}")`; if (v.live) t.appendChild(E('em', 'live', 'LIVE')); else if (v.dur) t.appendChild(E('em', null, dur(v.dur))); const h = S.ytHist.find(x => x.id === v.id); if (h && h.p) { const u = E('u'), i = E('i'); i.style.width = Math.min(100, h.p) + '%'; u.appendChild(i); t.appendChild(u); } return t; };
  const avOf = cid => { const a = E('span', 'yt-av'), c = S.ytCh[cid]; if (c && c.av) a.style.backgroundImage = `url("${c.av}")`; return a; };
  const metaTxt = v => [v.ch, v.views ? `조회수 ${num(v.views)}회` : '', v.at ? ago(v.at) : ''].filter(Boolean).join(' · ');
  const dots = v => { const d = E('span', 'yt-dots', '⋮'); d.setAttribute('role', 'button'); d.setAttribute('aria-label', '메뉴'); d.onclick = e => { e.stopPropagation(); menu(v); }; return d; };
  const W = (v, o) => () => push({ v: 'watch', vid: v, ...(o || {}) });
  function card(v, o) { const b = E('button', 'yt-card'), m = E('div', 'yt-meta'), d = E('div'); b.appendChild(thumb(v)); const av = avOf(v.cid); av.onclick = e => { e.stopPropagation(); push({ v: 'chan', cid: v.cid }); }; d.append(E('b', null, v.t), E('small', null, metaTxt(v))); m.append(av, d, dots(v)); b.appendChild(m); b.onclick = W(v, o); return b; }
  function rowCard(v, o, x) { const b = E('button', 'yt-row'), d = E('div', 'tx'); b.appendChild(thumb(v)); d.append(E('b', null, v.t), E('small', null, metaTxt(v))); b.append(d, x || dots(v)); b.onclick = W(v, o); return b; }
  function shortCard(v) { const b = E('button', 'yt-sh'); b.append(thumb(v), E('b', null, v.t)); b.onclick = W(v); return b; }
  function chanRow(c) { const b = E('button', 'yt-crow'), a = E('span', 'yt-av'), d = E('div'); if (c.av) a.style.backgroundImage = `url("${c.av}")`; const x = S.ytCh[c.cid]; d.append(E('b', null, c.n), E('small', null, x ? [x.hide ? '' : `구독자 ${num(x.subs)}명`, `동영상 ${num(x.vids)}개`].filter(Boolean).join(' · ') : (c.d || ''))); b.append(a, d); b.onclick = () => push({ v: 'chan', cid: c.cid }); return b; }
  const chips = (L, on, f) => { const ch = E('div', 'yt-chips'); L.forEach(([k, l]) => { const b = E('button', on === k ? 'on' : '', l); b.onclick = () => f(k); ch.appendChild(b); }); return ch; };
  const more = (box, f) => { const b = E('button', 'yt-more', '더 보기'); b.onclick = async () => { b.disabled = true; b.textContent = '불러오는 중…'; try { const left = await f(); if (left) { b.disabled = false; b.textContent = '더 보기'; box.appendChild(b); } else b.remove(); } catch (e) { b.textContent = errTxt(e); } }; box.appendChild(b); };
  const msg = t => E('div', 'yt-msg', t);
  const errTxt = e => /login|401/.test(String(e && (e.code || e.message))) ? '구글 로그인이 풀렸어. 놀기 탭 › 유튜브 설정에서 다시 로그인해 줘.' : /403/.test(String(e && e.message)) ? '오늘 쓸 수 있는 유튜브 양을 다 썼어(구글 하루 한도). 내일 다시 돼.' : '유튜브를 못 불러왔어. 잠깐 뒤 다시 해 봐.';
  async function load(B, f) { const w = msg('불러오는 중…'); B.appendChild(w); try { await f(); w.remove(); } catch (e) { w.textContent = errTxt(e); if (/login/.test(String(e && e.code))) S.yt.on = 0; } }
  const replace = p => { st.stack[st.stack.length - 1] = p; draw(); };

  // ---------- 화면들 ----------
  let gen = 0, shObs = null;
  function draw() {
    const my = ++gen, p = st.stack[st.stack.length - 1]; if (shObs) { shObs.disconnect(); shObs = null; }
    body.innerHTML = ''; body.className = 'yt-body'; body.scrollTop = 0;
    const alive = () => my === gen, watch = !!(p && p.v === 'watch');
    topBar(p && p.v === 'search' ? 'search' : '');
    nav.style.display = watch ? 'none' : '';
    layout(watch);
    if (p) return ({ search: vSearch, results: vResults, watch: vWatch, chan: vChan, pl: vPl, local: vLocal, sublist: vSubList })[p.v](p, alive);
    ({ home: vHome, shorts: vShorts, subs: vSubs, lib: vLib })[st.tab](alive);
  }
  const fresh = () => S.ytFeed && Date.now() - S.ytFeed.at < 30 * 60e3 && S.ytFeed.list.length && S.ytFeed.list[0].cid;
  async function ensureFeed() { if (!fresh()) await feed(); return S.ytFeed.list; }
  const CH = [['all', '전체'], ['pop', '인기 급상승'], ['c10', '음악'], ['c20', '게임'], ['c17', '스포츠'], ['c24', '엔터테인먼트'], ['c25', '뉴스'], ['c27', '교육'], ['today', '오늘'], ['new', '안 본 영상'], ['long', '20분 이상'], ['short', '10분 이하'], ['later', '나중에 볼 영상']];
  function vHome(alive) {
    body.appendChild(chips(CH, st.chip, k => { st.chip = k; draw(); }));
    const box = E('div'); body.appendChild(box);
    if (st.chip === 'pop' || /^c\d/.test(st.chip)) { const cat = st.chip === 'pop' ? '' : st.chip.slice(1); load(box, async () => { const L = (await popular(cat)).filter(ok); if (!alive()) return; if (!L.length) box.appendChild(msg('이 주제는 지금 인기 영상이 없어.')); L.forEach(v => box.appendChild(card(v))); }); return; }
    const put = list => { if (!alive()) return; box.innerHTML = ''; const seen = new Set(S.ytHist.map(h => h.id)), t0 = new Date(); t0.setHours(0, 0, 0, 0);
      if (st.chip === 'all') { const cont = S.ytHist.filter(h => h.p > 2 && h.p < 95).slice(0, 10); if (cont.length) { const h = E('div', 'yt-h'); h.append(E('span', null, '이어서 보기')); box.appendChild(h); const pv = E('div', 'yt-pv'); pv.style.padding = '0 14px'; cont.forEach(v => { const b = E('button'); b.append(thumb(v), E('b', null, v.t)); b.onclick = W(v); pv.appendChild(b); }); box.appendChild(pv); } }
      let L = st.chip === 'later' ? S.ytLater : list.filter(v => !short(v) && ok(v));
      if (st.chip === 'today') L = L.filter(v => v.at >= t0.getTime()); if (st.chip === 'new') L = L.filter(v => !seen.has(v.id)); if (st.chip === 'long') L = L.filter(v => v.dur >= 1200); if (st.chip === 'short') L = L.filter(v => v.dur && v.dur <= 600);
      if (!L.length) box.appendChild(msg(st.chip === 'later' ? '나중에 볼 영상이 없어. 영상 화면에서 \'나중에\'를 눌러 둬.' : '보여 줄 영상이 없어. 위의 \'인기 급상승\'도 봐 봐.'));
      L.forEach(v => box.appendChild(card(v)));
      if (st.chip !== 'later') { const r = E('button', 'yt-more', `새로 고침 · ${S.ytFeed ? ago(S.ytFeed.at) : ''}`); r.onclick = () => { S.ytFeed = null; draw(); }; box.appendChild(r); } };
    if (fresh() || st.chip === 'later') put(S.ytFeed ? S.ytFeed.list : []); else load(box, async () => put(await ensureFeed()));
  }
  // 쇼츠: 위아래로 넘겨 보기(보이는 것만 재생)
  let SHX = null;
  function vShorts(alive) {
    pause(); body.classList.add('yt-shv');
    load(body, async () => {
      let L = (await ensureFeed()).filter(v => short(v) && ok(v));
      if (L.length < 6) { if (!SHX) { const j = await api('search', { part: 'snippet', q: '쇼츠', type: 'video', videoDuration: 'short', regionCode: 'KR', relevanceLanguage: 'ko', maxResults: 25, safeSearch: 'moderate' }); SHX = (await videos((j.items || []).map(x => x.id.videoId).filter(Boolean))).filter(v => v.dur && v.dur <= 180); await chans(SHX.map(v => v.cid)); } L = L.concat(SHX.filter(v => ok(v) && !L.some(x => x.id === v.id))); }
      if (!alive()) return; if (!L.length) { body.appendChild(msg('볼 쇼츠가 없어.')); return; }
      const H = body.clientHeight;
      shObs = new IntersectionObserver(es => es.forEach(e => { const s = e.target, v = s._v, f = s.querySelector('.f'); if (e.isIntersecting) { if (!f.firstChild) { f.appendChild(frame(`https://www.youtube.com/embed/${v.id}?playsinline=1&autoplay=1&loop=1&playlist=${v.id}&rel=0&modestbranding=1&hl=ko`)); histAdd(v); } } else f.innerHTML = ''; }), { root: body, threshold: .6 });
      L.forEach(v => {
        const s = E('div', 'yt-sv'); s.style.height = H + 'px'; s._v = v; if (v.th) s.style.backgroundImage = `url("${v.th}")`;
        const f = E('div', 'f'), info = E('div', 'sinf'), cb = E('button', 'shc'), side = E('div', 'sd');
        cb.append(avOf(v.cid), E('span', null, v.ch)); cb.onclick = () => push({ v: 'chan', cid: v.cid });
        info.append(cb, E('p', null, v.t));
        const sb = (svg, l, fn) => { const b = E('button'); b.innerHTML = svg; b.appendChild(E('small', null, l)); b.onclick = fn; side.appendChild(b); };
        sb('<svg viewBox="0 0 24 24"><path d="M7 11v9H4v-9zM7 11l4-8c1.5 0 2.5 1 2 3l-1 4h6c1.2 0 2 1 1.8 2.2l-1.3 6.6c-.2 1-1 1.2-2 1.2H7"/></svg>', v.likes ? num(v.likes) : '좋아요', () => window.open(`https://youtube.com/shorts/${v.id}`, '_blank'));
        sb('<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></svg>', v.cmts ? num(v.cmts) : '댓글', () => push({ v: 'watch', vid: v, cm: 1 }));
        sb('<svg viewBox="0 0 24 24"><path d="M14 5l7 7-7 7M21 12H9c-3 0-6 2-6 7"/></svg>', '공유', () => share(v));
        sb('<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z"/></svg>', isLater(v) ? '저장됨' : '저장', () => { toggleLater(v); });
        sb('<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/></svg>', '더보기', () => menu(v));
        s.append(f, info, side); body.appendChild(s); shObs.observe(s);
      });
    });
  }
  function vSubs(alive) {
    const rowE = E('div', 'yt-subs'), box = E('div'); body.append(rowE, box);
    load(body, async () => { const sl = await subs(); if (!alive()) return;
      const all = E('button', st.sub ? '' : 'on'); const a0 = E('span', 'yt-av'); a0.style.cssText = 'background:rgba(255,255,255,.15)'; all.append(a0, E('span', null, '전체')); all.onclick = () => { st.sub = ''; draw(); }; rowE.appendChild(all);
      sl.forEach(c => { const b = E('button', st.sub === c.cid ? 'on' : ''), av = E('span', 'yt-av'); if (c.av) av.style.backgroundImage = `url("${c.av}")`; b.append(av, E('span', null, c.n)); b.onclick = () => { st.sub = st.sub === c.cid ? '' : c.cid; draw(); }; rowE.appendChild(b); });
      const h = E('div', 'yt-h'); const go2 = E('button', 'yt-more', st.sub ? '채널 보기 ›' : '구독 전체 ›'); go2.style.margin = '0'; go2.onclick = () => push(st.sub ? { v: 'chan', cid: st.sub } : { v: 'sublist', so: 'rel' }); const c = sl.find(x => x.cid === st.sub); h.append(E('span', null, st.sub ? (c ? c.n : '') : '구독 새 영상'), go2); box.appendChild(h);
      const list = await ensureFeed(); if (!alive()) return; const L = list.filter(v => (!st.sub || v.cid === st.sub) && (st.sub || ok(v)));
      if (!L.length) box.appendChild(msg(st.sub ? '이 채널은 최근 10일 동안 새 영상이 없어. 채널 보기를 눌러 봐.' : '새 영상이 없어.'));
      L.forEach(v => box.appendChild(short(v) ? rowCard(v) : card(v))); });
  }
  function vSubList(p, alive) {
    const h = E('div', 'yt-h'); h.append(E('span', null, '구독 채널')); body.appendChild(h);
    body.appendChild(chips([['rel', '관련성순'], ['abc', '가나다순']], p.so, k => replace({ ...p, so: k })));
    load(body, async () => { let sl = (await subs()).slice(); await chans(sl.map(c => c.cid)); if (!alive()) return; if (p.so === 'abc') sl.sort((a, b) => a.n.localeCompare(b.n, 'ko')); h.appendChild(E('small', null, sl.length + '개')); sl.forEach(c => body.appendChild(chanRow(c))); });
  }
  function vLib(alive) {
    const sec = (t, L, emptyT, k) => { const h = E('div', 'yt-h'); h.append(E('span', null, t)); if (L.length) { const a = E('button', 'yt-more', `모두 보기 · ${L.length}`); a.style.margin = '0'; a.onclick = () => push({ v: 'local', k }); h.appendChild(a); } body.appendChild(h); if (!L.length) { body.appendChild(E('div', 'yt-msg', emptyT)); return; } const pv = E('div', 'yt-pv'); pv.style.padding = '0 14px'; L.slice(0, 20).forEach(v => { const b = E('button'); b.append(thumb(v), E('b', null, v.t)); b.onclick = W(v); pv.appendChild(b); }); body.appendChild(pv); };
    sec('기록', S.ytHist, '아직 본 영상이 없어.', 'hist');
    sec('나중에 볼 영상', S.ytLater, '영상 화면에서 \'나중에\'를 누르면 여기 모여.', 'later');
    const lk = E('button', 'yt-row lk'); lk.innerHTML = '<span class="ic">👍</span>'; lk.appendChild(E('b', null, '좋아요 표시한 동영상')); lk.onclick = () => push({ v: 'pl', id: 'LL', t: '좋아요 표시한 동영상' }); body.appendChild(lk);
    const h = E('div', 'yt-h'); h.append(E('span', null, '재생목록')); body.appendChild(h); const box = E('div'); body.appendChild(box);
    load(box, async () => { const j = await api('playlists', { part: 'snippet,contentDetails', mine: 'true', maxResults: 50 }); if (!alive()) return; const L = j.items || [];
      if (!L.length) box.appendChild(E('div', 'yt-msg', '재생목록이 없어.'));
      L.forEach(p => box.appendChild(plRow(p))); });
    if (S.ytHide.length || S.ytHideCh.length) { const c = E('button', 'yt-more', `숨긴 영상·채널 다시 보기 (${S.ytHide.length + S.ytHideCh.length})`); c.onclick = () => { S.ytHide = []; S.ytHideCh = []; save(); draw(); toast('숨긴 걸 다 다시 보여 줄게.'); }; body.appendChild(c); }
  }
  function plRow(p) { const id = typeof p.id === 'string' ? p.id : p.id.playlistId, b = E('button', 'yt-row'), t = E('div', 'yt-th'), th = (p.snippet.thumbnails || {}).medium; if (th) t.style.backgroundImage = `url("${th.url}")`; t.appendChild(E('em', 'pl', p.contentDetails ? `▤ ${p.contentDetails.itemCount}` : '▤')); const d = E('div', 'tx'); d.append(E('b', null, p.snippet.title), E('small', null, `${p.snippet.channelTitle ? p.snippet.channelTitle + ' · ' : ''}재생목록`)); b.append(t, d); b.onclick = () => push({ v: 'pl', id, t: p.snippet.title }); return b; }
  function vLocal(p, alive) {
    const hist = p.k === 'hist', L = hist ? S.ytHist : S.ytLater;
    const h = E('div', 'yt-h'); h.append(E('span', null, hist ? '기록' : '나중에 볼 영상'), E('small', null, L.length + '개')); body.appendChild(h);
    if (L.length) { const a = E('div', 'yt-acts'); a.style.margin = '0 0 6px'; const pa = E('button', 'pk', '▶ 모두 재생'); pa.onclick = () => push({ v: 'watch', vid: L[0], q: L.slice(), qi: 0 }); a.appendChild(pa); if (hist) { const c = E('button', null, '기록 모두 지우기'); c.onclick = () => { if (confirm('유튜브 본 기록을 지울까?')) { S.ytHist = []; save(); draw(); } }; a.appendChild(c); } body.appendChild(a); }
    if (!L.length) body.appendChild(msg('비어 있어.'));
    L.forEach((v, i) => { const x = E('span', 'yt-dots', '✕'); x.setAttribute('role', 'button'); x.setAttribute('aria-label', '빼기'); x.onclick = e => { e.stopPropagation(); L.splice(L.indexOf(v), 1); save(); draw(); }; body.appendChild(rowCard(v, { q: L.slice(), qi: i }, x)); });
  }
  function vSearch() {
    if (!S.ytQ.length) { body.appendChild(msg('찾고 싶은 걸 적고 엔터를 눌러.')); return; }
    S.ytQ.forEach(q => { const r = E('div', 'yt-qh'), b = E('button', 'q'), x = E('button', 'x', '✕'); b.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>'; b.appendChild(E('span', null, q)); b.onclick = () => go(q); x.setAttribute('aria-label', '기록 지우기'); x.onclick = () => { S.ytQ = S.ytQ.filter(y => y !== q); save(); draw(); }; r.append(b, x); body.appendChild(r); });
  }
  function vResults(p, alive) {
    const f = E('div', 'yt-flt');
    f.append(chips([['video', '동영상'], ['live', '라이브'], ['channel', '채널'], ['playlist', '재생목록']], p.ty, k => replace({ ...p, ty: k })));
    if (p.ty === 'video') f.append(chips([['relevance', '관련성'], ['date', '업로드 날짜'], ['viewCount', '조회수'], ['rating', '평점']], p.or, k => replace({ ...p, or: k })), chips([['', '모든 길이'], ['short', '4분 미만'], ['medium', '4~20분'], ['long', '20분 이상']], p.du, k => replace({ ...p, du: k })));
    body.appendChild(f);
    const box = E('div'); body.appendChild(box); let pt = '';
    const page = async () => {
      const q = { part: 'snippet', q: p.q, maxResults: 20, regionCode: 'KR', relevanceLanguage: 'ko', safeSearch: 'moderate', type: p.ty === 'live' ? 'video' : p.ty, ...(p.ty === 'live' ? { eventType: 'live' } : {}), ...(p.ty === 'video' ? { order: p.or, ...(p.du ? { videoDuration: p.du } : {}) } : {}), ...(pt ? { pageToken: pt } : {}) };
      const j = await api('search', q); pt = j.nextPageToken || ''; const it = j.items || []; if (!alive()) return;
      if (p.ty === 'channel') { await chans(it.map(x => x.id.channelId)); if (!alive()) return; it.forEach(x => box.appendChild(chanRow({ cid: x.id.channelId, n: x.snippet.title, av: ((x.snippet.thumbnails || {}).default || {}).url || '', d: x.snippet.description }))); }
      else if (p.ty === 'playlist') it.forEach(x => box.appendChild(plRow(x)));
      else { const vs = await videos(it.map(x => x.id.videoId).filter(Boolean)); await chans(vs.map(v => v.cid)); if (!alive()) return; vs.filter(ok).forEach(v => box.appendChild(short(v) ? rowCard(v) : card(v))); }
      if (!box.children.length) box.appendChild(msg('검색 결과가 없어.'));
      return pt;
    };
    load(box, async () => { if (await page()) more(body, page); });
  }
  function vPl(p, alive) {
    const h = E('div', 'yt-h'); h.append(E('span', null, p.t)); body.appendChild(h);
    const a = E('div', 'yt-acts'); a.style.margin = '0 0 6px'; body.appendChild(a); const box = E('div'); body.appendChild(box);
    const all = []; let pt = '';
    const page = async () => { const j = await api('playlistItems', { part: 'contentDetails', playlistId: p.id, maxResults: 50, ...(pt ? { pageToken: pt } : {}) }); pt = j.nextPageToken || ''; const vs = await videos((j.items || []).map(x => x.contentDetails.videoId)); await chans(vs.map(v => v.cid)); if (!alive()) return; vs.forEach(v => { all.push(v); box.appendChild(rowCard(v, { q: all, qi: all.length - 1 })); }); h.lastChild.textContent = p.t; if (!all.length) box.appendChild(msg('비어 있어.')); return pt; };
    load(box, async () => { const left = await page(); if (!alive() || !all.length) return;
      const pa = E('button', 'pk', '▶ 모두 재생'); pa.onclick = () => push({ v: 'watch', vid: all[0], q: all.slice(), qi: 0 });
      const sf = E('button', null, '⤮ 셔플'); sf.onclick = () => { const q = all.slice().sort(() => Math.random() - .5); push({ v: 'watch', vid: q[0], q, qi: 0 }); };
      a.append(pa, sf); if (left) more(body, page); });
  }
  function vChan(p, alive) {
    load(body, async () => { await chans([p.cid]); const c = S.ytCh[p.cid] || { n: '' }; if (!alive()) return;
      if (c.ban) { const bn = E('div', 'yt-ban'); bn.style.backgroundImage = `url("${c.ban}=w1060-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nfpr-rj")`; body.appendChild(bn); }
      const hd = E('div', 'yt-chhd'); hd.append(avOf(p.cid), E('b', null, c.n), E('small', null, [c.hide ? '' : `구독자 ${num(c.subs)}명`, `동영상 ${num(c.vids)}개`].filter(Boolean).join(' · '))); body.appendChild(hd);
      const acts = E('div', 'yt-acts'); acts.style.justifyContent = 'center'; acts.style.margin = '4px 0 6px';
      const sub = ((S.ytSubs && S.ytSubs.list) || []).some(x => x.cid === p.cid); const sb = E('a', sub ? 'on' : 'pk', sub ? '✓ 구독중' : '구독'); sb.href = `https://www.youtube.com/channel/${p.cid}`; sb.target = '_blank'; sb.rel = 'noopener';
      const sh2 = E('button', null, '공유'); sh2.onclick = () => { const u = `https://www.youtube.com/channel/${p.cid}`; if (navigator.share) navigator.share({ title: c.n, url: u }).catch(() => {}); else navigator.clipboard.writeText(u).then(() => toast('링크 복사했어.')); };
      acts.append(sb, sh2); body.appendChild(acts);
      const ct = p.ct || 'vid';
      body.appendChild(chips([['vid', '동영상'], ['sh', 'Shorts'], ['pl', '재생목록'], ['info', '정보']], ct, k => replace({ ...p, ct: k })));
      const box = E('div'); body.appendChild(box);
      if (ct === 'info') { const d = E('div', 'yt-desc'); d.append(E('b', null, '설명'), rich(c.desc || '설명이 없어.')); d.style.margin = '8px 14px'; d.style.width = 'calc(100% - 28px)'; box.appendChild(d);
        const inf = E('div', 'yt-inf'); [['가입일', c.since ? new Date(c.since).toLocaleDateString('ko-KR') : ''], ['총 조회수', c.views ? `${num(c.views)}회` : ''], ['동영상', `${num(c.vids)}개`], ['구독자', c.hide ? '비공개' : `${num(c.subs)}명`], ['국가', c.cc]].filter(x => x[1]).forEach(([k, v]) => { inf.append(E('span', null, k), E('b', null, v)); }); box.appendChild(inf); return; }
      if (ct === 'pl') { const j = await api('playlists', { part: 'snippet,contentDetails', channelId: p.cid, maxResults: 50 }); if (!alive()) return; const L = j.items || []; if (!L.length) box.appendChild(msg('공개된 재생목록이 없어.')); L.forEach(x => box.appendChild(plRow(x))); return; }
      if (ct === 'sh') { const g = E('div', 'yt-grid'); box.appendChild(g); const vs = (await videos((await uploads(p.cid, 50)).map(v => v.id))).filter(short); if (!alive()) return; if (!vs.length) box.appendChild(msg('최근 쇼츠가 없어.')); vs.forEach(v => g.appendChild(shortCard(v))); return; }
      const so = p.cs || 'new';
      box.appendChild(chips([['new', '최신순'], ['pop', '인기순'], ['old', '날짜순(오래된 것)']], so, k => replace({ ...p, ct: 'vid', cs: k })));
      const list = E('div'); box.appendChild(list); const all = [];
      if (so === 'new') { let pt = ''; const page = async () => { const r = await uploadsP(p.cid, 30, pt); pt = r.next; const vs = (await videos(r.items.map(v => v.id))).filter(v => !short(v)); if (!alive()) return; vs.forEach(v => { all.push(v); list.appendChild(card(v)); }); return pt; }; if (await page()) more(box, page); return; }
      const j = await api('search', { part: 'snippet', channelId: p.cid, type: 'video', order: so === 'pop' ? 'viewCount' : 'date', maxResults: 25, ...(so === 'old' ? { publishedBefore: new Date(c.since ? c.since + 3 * 365 * 864e5 : Date.now()).toISOString() } : {}) });
      let vs = await videos((j.items || []).map(x => x.id.videoId).filter(Boolean)); if (so === 'old') vs.sort((a, b) => a.at - b.at); if (!alive()) return; vs.forEach(v => list.appendChild(card(v))); });
  }
  function vWatch(p, alive) {
    const v0 = p.vid; play(v0, { q: p.q, qi: p.qi }); layout(true);
    const w = E('div', 'yt-w'); body.appendChild(w);
    load(w, async () => {
      let v = v0; if (!v.desc || !v.cid) { const r = await videos([v0.id]); if (r[0]) v = r[0]; } await chans([v.cid]); if (!alive()) return;
      PL.v = Object.assign({}, v0, v); mbFill(); const c = S.ytCh[v.cid] || {};
      // 재생 설정(속도·자막·반복·자동 재생·10초)
      if (PL.yt || !PL.fb) { const ctl = E('div', 'yt-ctl'), RATES = [.5, .75, 1, 1.25, 1.5, 1.75, 2];
        const cb = (l, on, f) => { const b = E('button', on ? 'on' : '', l); b.onclick = () => f(b); ctl.appendChild(b); return b; };
        cb('⟲ 10', 0, () => seek(Math.max(0, cur() - 10)));
        cb('10 ⟳', 0, () => seek(cur() + 10));
        cb(`${S.ytSet.rate}x`, S.ytSet.rate !== 1, b => { S.ytSet.rate = RATES[(RATES.indexOf(S.ytSet.rate) + 1) % RATES.length]; save(); try { PL.yt.setPlaybackRate(S.ytSet.rate); } catch (e) {} b.textContent = `${S.ytSet.rate}x`; b.classList.toggle('on', S.ytSet.rate !== 1); });
        cb('자막', S.ytSet.cc, b => { S.ytSet.cc = S.ytSet.cc ? 0 : 1; save(); b.classList.toggle('on', !!S.ytSet.cc); try { if (S.ytSet.cc) { PL.yt.loadModule('captions'); PL.yt.setOption('captions', 'track', { languageCode: 'ko' }); } else PL.yt.unloadModule('captions'); } catch (e) {} });
        cb('반복', S.ytSet.loop, b => { S.ytSet.loop = S.ytSet.loop ? 0 : 1; save(); b.classList.toggle('on', !!S.ytSet.loop); });
        cb('자동 재생', S.ytSet.auto, b => { S.ytSet.auto = S.ytSet.auto ? 0 : 1; save(); b.classList.toggle('on', !!S.ytSet.auto); });
        w.appendChild(ctl); }
      if (v.tags && v.tags.length) { const tg = E('div', 'yt-tags'); v.tags.slice(0, 4).forEach(t => { const a = E('span', 'yt-ln', '#' + t.replace(/\s+/g, '')); a.onclick = () => go('#' + t.replace(/\s+/g, '')); tg.appendChild(a); }); w.appendChild(tg); }
      w.append(E('h2', null, v.t), E('div', 'st', [v.views ? `조회수 ${num(v.views)}회` : '', v.at ? ago(v.at) : ''].filter(Boolean).join(' · ')));
      const sub = ((S.ytSubs && S.ytSubs.list) || []).some(x => x.cid === v.cid);
      const chb = E('div', 'yt-chan'), cd = E('div'), sb = E('a', sub ? 'ysub on' : 'ysub', sub ? '구독중' : '구독'); sb.href = `https://www.youtube.com/channel/${v.cid}`; sb.target = '_blank'; sb.rel = 'noopener';
      cd.append(E('b', null, v.ch || c.n || ''), E('small', null, c.subs && !c.hide ? `구독자 ${num(c.subs)}명` : '')); const ca = avOf(v.cid); chb.append(ca, cd, sb); ca.onclick = cd.onclick = () => push({ v: 'chan', cid: v.cid }); w.appendChild(chb);
      const acts = E('div', 'yt-acts');
      const lk = E('a', null, `👍 ${v.likes ? num(v.likes) : '좋아요'}`); lk.href = `https://youtu.be/${v.id}`; lk.target = '_blank'; lk.rel = 'noopener';
      const pb = E('button', 'pk', '놀기 시간에 넣기'); pb.onclick = () => addPlay(v);
      const lb = E('button', isLater(v) ? 'on' : '', isLater(v) ? '✓ 저장됨' : '나중에'); lb.onclick = () => { const on = toggleLater(v); lb.classList.toggle('on', on); lb.textContent = on ? '✓ 저장됨' : '나중에'; };
      const sh = E('button', null, '공유'); sh.onclick = () => share(v, cur());
      const ln = E('button', null, '레나랑 얘기'); ln.onclick = () => { close(); lenaLife.go('lena'); setTimeout(() => { const m = $('msg'); if (m) { m.value = `이 영상 봤어: "${v.t}" (${v.ch}) `; m.focus(); try { syncSend(); } catch (e) {} } }, 200); };
      const op = E('a', null, '유튜브 앱 (댓글 쓰기)'); op.href = `https://youtu.be/${v.id}`; op.target = '_blank'; op.rel = 'noopener';
      const mn = E('button', null, '⋯'); mn.setAttribute('aria-label', '더보기'); mn.onclick = () => menu(v);
      acts.append(lk, pb, lb, sh, ln, op, mn); w.appendChild(acts);
      if (v.desc) { const d = E('div', 'yt-desc cl'); d.append(E('b', null, [v.views ? `조회수 ${num(v.views)}회` : '', v.at ? new Date(v.at).toLocaleDateString('ko-KR') : ''].filter(Boolean).join('  ')), rich(v.desc)); d.onclick = () => d.classList.toggle('cl'); w.appendChild(d); }
      const cps = chapters(v.desc); if (cps.length) { const h = E('div', 'yt-h'); h.append(E('span', null, '챕터')); w.appendChild(h); const pv = E('div', 'yt-cps'); cps.forEach(x => { const b = E('button'); b.append(E('em', null, dur(x.t) || '0:00'), E('span', null, x.n)); b.onclick = () => seek(x.t); pv.appendChild(b); }); w.appendChild(pv); }
      // 재생목록 큐
      if (p.q && p.q.length > 1) { const qb = E('div', 'yt-q'), qh = E('button', 'hd'); qh.append(E('b', null, '재생목록'), E('small', null, `${p.qi + 1} / ${p.q.length} · 누르면 펼침`)); const ql = E('div'); ql.hidden = true; qh.onclick = () => { ql.hidden = !ql.hidden; }; p.q.forEach((x, i) => { const r = rowCard(x, null, E('span')); if (i === p.qi) r.classList.add('now'); r.onclick = () => watchV(x, { q: p.q, qi: i }); ql.appendChild(r); }); qb.append(qh, ql); w.appendChild(qb); }
      // 다음 영상 (자동 재생 목록) — 댓글보다 먼저 구해 둠
      const nx = E('div'); let next = [];
      try { const ids = (await uploads(v.cid, 8)).map(x => x.id).filter(id => id !== v.id).slice(0, 6); next = await videos(ids); } catch (e) {}
      next = next.concat(((S.ytFeed && S.ytFeed.list) || []).filter(x => x.id !== v.id && x.cid !== v.cid && !short(x) && ok(x)).slice(0, 10)).filter(x => !short(x));
      if (!alive()) return; PL.next = next;
      // 댓글
      const cm = E('div', 'yt-cmw' + (p.cm ? '' : ' cl')); body.appendChild(cm);
      cm.addEventListener('click', e => { if (cm.classList.contains('cl')) { cm.classList.remove('cl'); e.stopPropagation(); } }, true);
      const cmLoad = order => { cm.innerHTML = ''; const h = E('div', 'yt-h'); h.append(E('span', null, `댓글${v.cmts ? ' ' + num(v.cmts) : ''}`), E('small', 'tg')); h.onclick = () => cm.classList.add('cl'); cm.appendChild(h);
        cm.appendChild(chips([['relevance', '인기 댓글'], ['time', '최신순']], order, k => cmLoad(k)));
        const box = E('div'); cm.appendChild(box); let pt = '';
        const page = async () => { const j = await capi('commentThreads', { part: 'snippet', videoId: v.id, maxResults: 20, order, textFormat: 'plainText', ...(pt ? { pageToken: pt } : {}) }); pt = j.nextPageToken || ''; (j.items || []).forEach(x => box.appendChild(cmt(x.snippet.topLevelComment, x.snippet.totalReplyCount, x.id))); if (!box.children.length) box.appendChild(msg('아직 댓글이 없어.')); return pt; };
        page().then(left => { if (left) more(cm, page); }).catch(e => { cm.classList.remove('cl');
          if (e.reason === 'commentsDisabled') return box.appendChild(msg('이 영상은 올린 사람이 댓글을 막아 놨어.'));
          if (e.st === 403 && !S.ytKey && e.reason !== 'quotaExceeded') { box.appendChild(msg('구글 로그인 권한(읽기 전용)만으로는 댓글이 안 열려. 유튜브 설정에서 \'댓글 보기 키\'를 한 번 넣어 줘.')); const b = E('button', 'yt-more', '댓글 보기 키 넣기'); b.onclick = () => openSheet('lyt'); box.appendChild(b); return; }
          box.appendChild(msg(e.reason === 'quotaExceeded' ? '오늘 쓸 수 있는 유튜브 양을 다 썼어. 내일 다시 돼.' : e.st === 400 && S.ytKey ? '댓글 보기 키가 틀렸어. 유튜브 설정에서 다시 넣어 줘.' : '댓글을 못 불러왔어. 잠깐 뒤 다시 해 봐.')); }); };
      cmLoad('relevance');
      body.appendChild(nx); nx.appendChild(E('div', 'yt-h', S.ytSet.auto ? '다음 영상 · 끝나면 자동 재생' : '다음 영상'));
      next.forEach(x => nx.appendChild(rowCard(x)));
      if (p.cm) setTimeout(() => cm.scrollIntoView({ behavior: 'smooth' }), 300);
    });
  }
  function cmt(c, nRep, tid, isRep) {
    const s = c.snippet, r = E('div', 'yt-cm' + (isRep ? ' rp' : '')), av = E('span', 'yt-av'), d = E('div'); if (s.authorProfileImageUrl) av.style.backgroundImage = `url("${s.authorProfileImageUrl}")`;
    const p = E('p'); p.appendChild(rich(s.textOriginal || s.textDisplay || ''));
    d.append(E('small', null, `${s.authorDisplayName} · ${ago(Date.parse(s.publishedAt))}${s.updatedAt && s.updatedAt !== s.publishedAt ? ' (수정됨)' : ''}`), p, E('em', null, `👍 ${num(s.likeCount)}`));
    if (nRep && tid) { const rb = E('button', 'yt-rb', `▾ 답글 ${nRep}개`), rl = E('div'); let got = 0; rb.onclick = async () => { if (got) { rl.hidden = !rl.hidden; rb.textContent = `${rl.hidden ? '▾' : '▴'} 답글 ${nRep}개`; return; } got = 1; rb.textContent = '불러오는 중…'; try { const j = await capi('comments', { part: 'snippet', parentId: tid, maxResults: 50, textFormat: 'plainText' }); (j.items || []).reverse().forEach(x => rl.appendChild(cmt(x, 0, 0, 1))); rb.textContent = `▴ 답글 ${nRep}개`; } catch (e) { rb.textContent = '답글을 못 불러왔어'; got = 0; } }; d.append(rb, rl); }
    r.append(av, d); return r;
  }

  // ---------- 놀기 탭 카드 ----------
  function card2(P, sm) {
    if (!S.box || !S.boxTok) { P.appendChild(el('div', 'lf-muted', '유튜브는 단축어 우편함 서버(설정 › 단축어)를 먼저 연결해야 써.')); return; }
    if (!(S.yt && S.yt.on)) { P.appendChild(el('div', 'lf-muted', '구글 로그인을 한 번 해 두면 유튜브에서 구독 새 영상·검색·쇼츠·재생목록을 다 봐.')); const b = el('button', 'lf-big', '유튜브 연결하기'); b.onclick = () => openSheet('lyt'); P.appendChild(b); return; }
    if (sm) sm.textContent = S.ytFeed ? `${ago(S.ytFeed.at)} 새로 고침` : '';
    const L = ((S.ytFeed && S.ytFeed.list) || []).filter(v => !short(v)).slice(0, 8);
    if (L.length) { const pv = E('div', 'yt-pv'); L.forEach(v => { const b = E('button'); b.append(thumb(v), E('b', null, v.t)); b.onclick = () => open({ v: 'watch', vid: v }); pv.appendChild(b); }); P.appendChild(pv); }
    const o = el('button', 'lf-big', '유튜브 열기'); o.onclick = () => open(); P.appendChild(o);
    const s2 = el('button', 'lf-ghost', '유튜브 설정'); s2.onclick = () => openSheet('lyt'); P.appendChild(s2);
    if (!fresh()) feed().then(() => { try { lenaLife.render(); } catch (e) {} }).catch(() => {});
  }
  if (typeof SH !== 'undefined' && SH.lyt) { const _r = SH.lyt.r; SH.lyt.r = B => { _r(B);
    const c = el('div', 'card'); c.appendChild(el('div', 'lbl', '댓글 보기 키 (API 키)'));
    const g = el('div', 'lf-guide'); g.innerHTML = '<p>구글 로그인은 읽기 전용이라 <b>댓글</b>이 안 열릴 수 있어. 같은 구글 클라우드 프로젝트에서 키를 하나 만들어 넣으면 댓글이 보여.</p><ol><li>console.cloud.google.com → 위에서 프로젝트 <b>lena</b> 고르기</li><li>왼쪽 메뉴 <b>API 및 서비스</b> → <b>사용자 인증 정보</b></li><li>위 <b>+ 사용자 인증 정보 만들기</b> → <b>API 키</b> → 만든 키 복사</li><li>(더 안전하게) 그 키 → <b>API 제한사항</b> → 키 제한 → <b>YouTube Data API v3</b>만 → 저장</li><li>아래 칸에 붙여 넣고 저장. 키는 이 폰에만 저장되고 백업에도 안 들어가.</li></ol>'; c.appendChild(g);
    const t = inp('password', S.ytKey ? '••••' + S.ytKey.slice(-4) + ' 저장됨' : 'AIza로 시작하는 키'); t.autocomplete = 'off';
    c.appendChild(row(t, btn('저장', '', () => { const v = t.value.trim(); if (!/^AIza[\w-]{20,}$/.test(v)) { toast('AIza로 시작하는 키를 넣어 줘.'); return; } S.ytKey = v; save(); refreshSheet(); toast('저장했어. 이제 영상 댓글이 보여.'); })));
    if (S.ytKey) c.appendChild(row(btn('키 지우기', 'ghost', () => { if (!confirm('댓글 보기 키를 지울까?')) return; S.ytKey = ''; save(); refreshSheet(); })));
    B.appendChild(c); }; }
  window.lenaYT = { open, close, card: card2, watch: v => open({ v: 'watch', vid: v }), feed, num, ago };
})();
