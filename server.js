const http = require('http'), fs = require('fs'), p = require('path');
const s = http.createServer((q, r) => {
  let f = q.url === '/' ? '/index.html' : q.url.split('?')[0];
  try {
    const d = fs.readFileSync(p.join(process.cwd(), f));
    r.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    r.end(d);
  } catch (e) { r.writeHead(404); r.end('nf'); }
});
s.listen(8123, () => console.log('ready'));
