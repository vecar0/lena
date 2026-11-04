// 레나 우편함 서버 (Cloudflare Worker) — 단축어용
// 설정: Cloudflare 대시보드 > Workers > 새 Worker "lena-box" > 이 코드 붙여넣기 > 배포
//       Settings > Bindings > KV namespace 추가: 변수 이름 BOX (새 KV 하나 만들어 연결)
// 엔드포인트 (t = 앱 설정에 보이는 내 열쇠)
//   POST /alarms {t, alarms:[{at:"YYYY-MM-DDTHH:mm", label}]}   앱이 알람 목록을 올림
//   GET  /alarms?t=..&h=26                                       단축어가 앞으로 h시간 안의 알람을 받음
//   GET|POST /in?t=..&text=..                                    단축어(공유하기·잠금화면)가 레나에게 보냄
//   GET  /inbox?t=..                                             앱이 받은 걸 가져가고 비움
const H = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...H, 'Content-Type': 'application/json; charset=utf-8' } });
const T = (t, s = 200) => new Response(t, { status: s, headers: { ...H, 'Content-Type': 'text/plain; charset=utf-8' } });
const ok = t => typeof t === 'string' && /^[a-f0-9]{24,64}$/.test(t);

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: H });
    const u = new URL(req.url), p = u.pathname.replace(/\/+$/, '');
    let body = {};
    if (req.method === 'POST') { const ct = req.headers.get('content-type') || ''; try { body = ct.includes('json') ? await req.json() : Object.fromEntries(await req.formData()); } catch (e) { try { body = { text: await req.text() }; } catch (x) {} } }
    const t = body.t || u.searchParams.get('t');
    if (p === '' || p === '/') return T('lena-box ok');
    if (!ok(t)) return J({ error: 'key' }, 401);

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
    return J({ error: 'not found' }, 404);
  }
};
