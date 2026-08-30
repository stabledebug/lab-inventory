export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      
      // API 路由
      if (url.pathname === '/api/inventory') {
        // 从 KV 读取密码和 token
        const storedPassword = await env.SECRETS.get('ACCESS_PASSWORD');
        const ghToken = await env.SECRETS.get('GH_TOKEN');
        
        const pwd = request.headers.get('x-password');
        if (!pwd || pwd !== storedPassword) {
          return new Response(JSON.stringify({ error: 'unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }
        
        const repo = env.GH_REPO || 'stabledebug/lab-inventory';
        const file = env.GH_FILE || 'inventory.json';
        const ghUrl = `https://api.github.com/repos/${repo}/contents/${file}`;
        const ghHeaders = {
          Authorization: `Bearer ${ghToken}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'lab-inventory-proxy',
        };
        try {
          if (request.method === 'GET') {
            const r = await fetch(ghUrl, { headers: ghHeaders });
            if (r.status === 404) {
              return new Response(JSON.stringify({}), { 
                status: 200, 
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
              });
            }
            return new Response(await r.text(), { 
              status: r.status, 
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
            });
          }
          if (request.method === 'PUT') {
            const body = await request.json();
            const r = await fetch(ghUrl, {
              method: 'PUT',
              headers: { ...ghHeaders, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: 'update inventory ' + new Date().toISOString(),
                content: body.content,
                sha: body.sha,
              }),
            });
            return new Response(await r.text(), { 
              status: r.status, 
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
            });
          }
          return new Response(JSON.stringify({ error: 'method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        } catch (e) {
          return new Response(JSON.stringify({ error: String(e) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }
      }
      
      // 静态资源
      if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
        return env.ASSETS.fetch(request);
      }
      
      return new Response('Assets binding not available', { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
      
    } catch (e) {
      return new Response('Worker error: ' + (e.message || e) + '\n' + (e.stack || ''), { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  },
};
