const fs = require('node:fs');
const path = require('node:path');

const publicDir = path.resolve('public');
const generated = [
  'index.html', 'produk', 'blog', 'cari', 'rss.xml', 'sitemap.xml',
  'robots.txt', '404.html', 'favicon.svg', '_headers', '_redirects',
  'pagefind', 'fonts', 'media'
];

for (const item of generated) {
  const target = path.join(publicDir, item);
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
}
fs.mkdirSync(publicDir, { recursive: true });
