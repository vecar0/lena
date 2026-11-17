// 레나 우편함 서버 (Cloudflare Worker) — 단축어용
// 설정: Cloudflare 대시보드 > Workers > 새 Worker "lena-box" > 이 코드 붙여넣기 > 배포
//       Settings > Bindings > KV namespace 추가: 변수 이름 BOX (새 KV 하나 만들어 연결)
// 엔드포인트 (t = 앱 설정에 보이는 내 열쇠)
//   POST /alarms {t, alarms:[{at:"YYYY-MM-DDTHH:mm", label}]}   앱이 알람 목록을 올림
//   GET  /alarms?t=..&h=26                                       단축어가 앞으로 h시간 안의 알람을 받음
//   GET|POST /in?t=..&text=..                                    단축어(공유하기·잠금화면)가 레나에게 보냄
//   GET  /inbox?t=..                                             앱이 받은 걸 가져가고 비움
//   POST /in?t=..&src=share  (본문 = 파일 그대로: 사진·PDF·글)      v2: 공유하기로 파일 보내기. 글이면 메모로, 아니면 파일로 보관(15MB까지, 14일)
//   GET  /file?t=..&id=..                                        앱이 파일을 받아 가면 지움
//   POST /state {t, w, st:[{s,e,l}], on, pause, tz}               v3: 앱이 위젯 내용·공부 시간(ms)을 올림
//   GET  /widget?t=..                                            v3: 홈 화면 위젯(Scriptable)이 받아 감
//   GET  /now?t=..                                               v3: 단축어 자동화가 물어봄 → '공부 중 · 과목 · HH:mm까지' 또는 '자유'
//   GET  /yt/login?t=.. → 구글 로그인 → /yt/cb                     v4: 유튜브 구독 읽기(설정 > 변수: YT_ID, YT_SECRET)
//   GET  /yt/token?t=..                                          v4: 앱이 유튜브 열쇠(1시간짜리)를 받아 감
//   GET  /yt/off?t=..                                            v4: 연결 끊기
const H = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...H, 'Content-Type': 'application/json; charset=utf-8' } });
const T = (t, s = 200) => new Response(t, { status: s, headers: { ...H, 'Content-Type': 'text/plain; charset=utf-8' } });
const ok = t => typeof t === 'string' && /^[a-f0-9]{24,64}$/.test(t);
const VER = 'v4';
const nowOf = o => { const n = Date.now(); if (!o || o.on === false || (o.pause || 0) > n) return { study: false }; const b = (o.st || []).find(x => x.s <= n && n < x.e); if (!b) return { study: false }; return { study: true, l: b.l, until: new Date(b.e - (o.tz || 0) * 60000).toISOString().slice(11, 16) }; };

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: H });
    const u = new URL(req.url), p = u.pathname.replace(/\/+$/, '');
    let body = {}, raw = null, ctype = '';
    if (req.method === 'POST') { const ct = (req.headers.get('content-type') || '').toLowerCase(); ctype = ct;
      if (ct.includes('json')) { try { body = await req.json(); } catch (e) {} }
      else if (ct.includes('form')) { try { const f = await req.formData(); for (const [k, v] of f) { if (typeof v === 'string') body[k] = v; else { raw = await v.arrayBuffer(); ctype = v.type || ''; body.name = v.name; } } } catch (e) {} }
      else { raw = await req.arrayBuffer(); } }
    let t = body.t || u.searchParams.get('t');
    if (p === '' || p === '/') return T('lena-box ok ' + VER);
    // v4 유튜브: 구글이 돌려보낼 때는 열쇠가 state에 들어 있음
    if (p === '/yt/cb') t = u.searchParams.get('state');
    if (!ok(t)) return J({ error: 'key' }, 401);

    if (p.startsWith('/yt/')) {
      const cb = u.origin + '/yt/cb', HT = h => new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><body style="font:18px sans-serif;padding:32px;background:#0f1719;color:#eef4f1">${h}</body>`, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      if (!env.YT_ID || !env.YT_SECRET) return p === '/yt/token' ? J({ error: 'setup' }) : HT('클라우드플레어 Worker 설정 › 변수에 YT_ID, YT_SECRET을 먼저 넣어 줘.');
      if (p === '/yt/login') return Response.redirect('https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({ client_id: env.YT_ID, redirect_uri: cb, response_type: 'code', scope: 'https://www.googleapis.com/auth/youtube.readonly', access_type: 'offline', prompt: 'consent', state: t }), 302);
      if (p === '/yt/cb') {
        const code = u.searchParams.get('code'); if (!code) return HT('로그인이 취소됐어. 레나 앱에서 다시 해 줘.');
        const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code, client_id: env.YT_ID, client_secret: env.YT_SECRET, redirect_uri: cb, grant_type: 'authorization_code' }) });
        const j = await r.json(); if (!j.refresh_token) return HT('연결 실패: ' + (j.error_description || j.error || '열쇠를 못 받음') + '<br>레나 앱에서 다시 로그인해 줘.');
        await env.BOX.put('y:' + t, j.refresh_token); return HT('연결됐어 ✓<br><br>이제 레나 앱으로 돌아가서 <b>연결 확인</b>을 눌러.');
      }
      if (p === '/yt/token') {
        const rt = await env.BOX.get('y:' + t); if (!rt) return J({ error: 'login' });
        const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ refresh_token: rt, client_id: env.YT_ID, client_secret: env.YT_SECRET, grant_type: 'refresh_token' }) });
        const j = await r.json(); if (!j.access_token) { if (j.error === 'invalid_grant') await env.BOX.delete('y:' + t); return J({ error: j.error === 'invalid_grant' ? 'login' : 'google' }); }
        return J({ access_token: j.access_token, expires_in: j.expires_in });
      }
      if (p === '/yt/off') { await env.BOX.delete('y:' + t); return J({ ok: true }); }
    }
    if (p === '/alarms' && req.method === 'POST') {
      const list = (Array.isArray(body.alarms) ? body.alarms : []).filter(a => a && /^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(a.at)).slice(0, 60).map(a => ({ at: a.at, label: String(a.label || '레나').slice(0, 40) }));
      await env.BOX.put('a:' + t, JSON.stringify({ list, tz: +body.tz || 0, up: Date.now() }), { expirationTtl: 60 * 60 * 24 * 40 });
      return J({ ok: true, n: list.length });
    }
    if (p === '/alarms') {
      const d = JSON.parse((await env.BOX.get('a:' + t)) || '{"list":[],"tz":0}');
      const hrs = Math.min(72, Math.max(1, +u.searchParams.get('h') || 26));
      const nowLocal = Date.now() - (d.tz || 0) * 60000, end = nowLocal + hrs * 3600e3;
      const out = d.list.filter(a => { const ms = Date.parse(a.at + ':00Z'); return ms > nowLocal && ms <= end; }).map(a => ({ at: a.at, time: a.at.slice(11, 16), label: a.label }));
      if (u.searchParams.get('f') === 'text') return T(out.map(a => a.time + ' ' + a.label).join('\n'));
      return J({ alarms: out, count: out.length });
    }
    if (p === '/in' && raw && raw.byteLength) {
      // 공유하기로 온 본문: 글이면 메모, 사진·PDF 등은 파일로 보관
      const isText = /^text\//.test(ctype) || (!ctype && raw.byteLength < 20000 && !new Uint8Array(raw.slice(0, 512)).some(b => b === 0));
      if (isText) body.text = new TextDecoder().decode(raw);
      else {
        if (raw.byteLength > 15e6) return T('파일이 너무 커요(15MB까지).', 413);
        const id = crypto.randomUUID().slice(0, 12), type = (ctype.split(';')[0] || 'application/octet-stream').trim();
        await env.BOX.put('f:' + t + ':' + id, raw, { expirationTtl: 60 * 60 * 24 * 14, metadata: { type } });
        const k = 'i:' + t, cur = JSON.parse((await env.BOX.get(k)) || '[]');
        cur.push({ file: id, type, size: raw.byteLength, name: String(body.name || u.searchParams.get('name') || '').slice(0, 80), at: Date.now(), src: String(u.searchParams.get('src') || 'share').slice(0, 20) });
        await env.BOX.put(k, JSON.stringify(cur.slice(-30)), { expirationTtl: 60 * 60 * 24 * 14 });
        return T(`레나가 파일을 받았어요(${type.split('/')[1] || '파일'}). 앱을 열면 보여 줄게요.`);
      }
    }
    if (p === '/file') {
      const id = u.searchParams.get('id') || '', key = 'f:' + t + ':' + id;
      const { value, metadata } = await env.BOX.getWithMetadata(key, { type: 'arrayBuffer' });
      if (!value) return T('없어요(이미 받았거나 14일이 지났어요).', 404);
      if (u.searchParams.get('keep') !== '1') await env.BOX.delete(key);
      return new Response(value, { headers: { ...H, 'Content-Type': (metadata && metadata.type) || 'application/octet-stream' } });
    }
    if (p === '/in') {
      const text = String(body.text || u.searchParams.get('text') || '').trim().slice(0, 2000);
      if (!text) return T('보낼 내용이 비어 있어요.', 400);
      const k = 'i:' + t, cur = JSON.parse((await env.BOX.get(k)) || '[]');
      cur.push({ text, at: Date.now(), src: String(body.src || u.searchParams.get('src') || '').slice(0, 20) });
      await env.BOX.put(k, JSON.stringify(cur.slice(-30)), { expirationTtl: 60 * 60 * 24 * 14 });
      return T('레나가 받았어요. 앱을 열면 정리해 둘게요.');
    }
    if (p === '/inbox') {
      const k = 'i:' + t, cur = JSON.parse((await env.BOX.get(k)) || '[]');
      if (cur.length) await env.BOX.delete(k);
      return J({ items: cur });
    }
    if (p === '/state' && req.method === 'POST') {
      const o = { w: body.w || null, st: (Array.isArray(body.st) ? body.st : []).slice(0, 40).map(b => ({ s: +b.s, e: +b.e, l: String(b.l || '공부').slice(0, 40) })), on: body.on !== false, pause: +body.pause || 0, tz: +body.tz || 0, up: Date.now() };
      await env.BOX.put('s:' + t, JSON.stringify(o), { expirationTtl: 60 * 60 * 24 * 14 });
      return J({ ok: true });
    }
    if (p === '/widget' || p === '/now') {
      const o = JSON.parse((await env.BOX.get('s:' + t)) || 'null'), n = nowOf(o);
      if (p === '/widget') return J({ ...(o && o.w || {}), up: o ? o.up : 0, now: n });
      if (u.searchParams.get('f') === 'json') return J(n);
      return T(n.study ? `공부 중 · ${n.l} · ${n.until}까지` : '자유');
    }
    return J({ error: 'not found' }, 404);
  }
};
