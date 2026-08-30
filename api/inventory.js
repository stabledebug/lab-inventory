export default async function handler(req, res) {
  const pwd = req.headers['x-password'];
  if (!pwd || pwd !== process.env.ACCESS_PASSWORD) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  const repo = process.env.GH_REPO || 'stabledebug/lab-inventory';
  const file = process.env.GH_FILE || 'inventory.json';
  const token = process.env.GH_TOKEN;
  const url = `https://api.github.com/repos/${repo}/contents/${file}`;
  const ghHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'lab-inventory-proxy',
  };
  try {
    if (req.method === 'GET') {
      const r = await fetch(url, { headers: ghHeaders });
      if (r.status === 404) { res.status(404).json({}); return; }
      const j = await r.json();
      res.status(200).json(j);
      return;
    }
    if (req.method === 'PUT') {
      let body = '';
      for await (const chunk of req) body += chunk;
      const parsed = JSON.parse(body);
      const r = await fetch(url, {
        method: 'PUT',
        headers: { ...ghHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'update inventory ' + new Date().toISOString(),
          content: parsed.content,
          sha: parsed.sha,
        }),
      });
      const j = await r.json();
      res.status(r.status).json(j);
      return;
    }
    res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
