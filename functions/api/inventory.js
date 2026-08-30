export async function onRequest(context) {
  const { request, env } = context;
  const pwd = request.headers.get('x-password');
  if (!pwd || pwd !== env.ACCESS_PASSWORD) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const repo = env.GH_REPO || 'stabledebug/lab-inventory';
  const file = env.GH_FILE || 'inventory.json';
  const token = env.GH_TOKEN;
  const url = `https://api.github.com/repos/${repo}/contents/${file}`;
  const ghHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'lab-inventory-proxy',
  };
  try {
    if (request.method === 'GET') {
      const r = await fetch(url, { headers: ghHeaders });
      if (r.status === 404) {
        return new Response(JSON.stringify({}), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      const j = await r.json();
      return new Response(JSON.stringify(j), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (request.method === 'PUT') {
      const body = await request.json();
      const r = await fetch(url, {
        method: 'PUT',
        headers: { ...ghHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'update inventory ' + new Date().toISOString(),
          content: body.content,
          sha: body.sha,
        }),
      });
      const j = await r.json();
      return new Response(JSON.stringify(j), { status: r.status, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: 'method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
