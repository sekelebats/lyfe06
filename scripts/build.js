const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const SRC_CONTENT = './src/content';
const PUBLIC = './public';
const SITE_URL = 'https://awwra.id';
const SITE_NAME = 'Awwra';
const SITE_DESC = 'Website statis, blog, dan toko sederhana. Ditulis dalam Markdown, dikendalikan Git.';

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const readCollection = (dir) => {
  const full = path.join(SRC_CONTENT, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter(f => f.endsWith('.md')).map(f => {
    const { data, content } = matter(fs.readFileSync(path.join(full, f), 'utf-8'));
    return { slug: f.replace(/\.md$/, ''), ...data, body: content };
  }).filter(p => !p.draft);
};

const picture = (src, alt, sizes = '(max-width: 768px) 50vw, 33vw', width = 400, height = 500) => {
  if (!src) return '';
  const base = src.replace(/\.[^.]+$/, '');
  return `<picture>
    <source srcset="${base}-400.avif 400w, ${base}-800.avif 800w, ${base}-1200.avif 1200w" sizes="${sizes}" type="image/avif">
    <source srcset="${base}-400.webp 400w, ${base}-800.webp 800w, ${base}-1200.webp 1200w" sizes="${sizes}" type="image/webp">
    <img src="${base}-800.jpg" srcset="${base}-400.jpg 400w, ${base}-800.jpg 800w, ${base}-1200.jpg 1200w" sizes="${sizes}" alt="${esc(alt)}" width="${width}" height="${height}" loading="lazy">
  </picture>`;
};

const layout = ({ title, description, canonical, ogImage, body }) => `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${canonical}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${canonical}" />
${ogImage ? `<meta property="og:image" content="${SITE_URL}${ogImage}" />` : ''}
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
${ogImage ? `<meta name="twitter:image" content="${SITE_URL}${ogImage}" />` : ''}
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="preload" href="/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/font.css">
<link rel="stylesheet" href="/css/main.css">
</head>
<body>
${body}
<script src="/js/filter.js" defer></script>
</body>
</html>`;

const nav = `<nav class="nav" aria-label="Navigasi utama">
  <a href="/" class="brand">
    <svg class="brand-mark" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#121212"/>
      <path d="M8 22 14 10h1.5L21 22h-1.8l-1.5-3.4h-4.4L11.8 22H8zm5-5h3.6L14.9 13 13 17z" fill="#f5f2ec"/>
    </svg>
    <span class="brand-name">Awwra</span>
  </a>
  <div class="nav-links">
    <a href="/#karya" class="nav-link">Karya</a>
    <a href="/produk/" class="nav-link">Produk</a>
    <a href="/blog/" class="nav-link">Blog</a>
    <a href="/#kontak" class="nav-link">Kontak</a>
  </div>
</nav>`;

const footer = `<footer id="kontak" class="footer section-block">
  <div class="stack">
    <p class="eyebrow">Mulai percakapan</p>
    <p class="lead" style="max-width: var(--measure-tight)">Punya ide situs yang ingin dibangun dengan tenang?</p>
  </div>
  <div class="footer-links">
    <a href="mailto:halo@awwra.id">Email</a>
    <a href="https://github.com" rel="noopener">GitHub</a>
    <a href="/rss.xml">RSS</a>
  </div>
</footer>`;

function buildHome(products) {
  const productCards = products.slice(0, 3).map(p => `
    <article class="product-card" data-tags="${esc((p.tags || []).join(' '))}">
      <div class="product-media"><a href="/produk/${p.slug}/">${picture(p.image, p.name)}</a></div>
      <div class="product-meta">
        <h3 class="product-name"><a href="/produk/${p.slug}/">${esc(p.name)}</a></h3>
        <p class="product-price">Rp ${Number(p.price).toLocaleString('id-ID')}</p>
        <p class="product-desc">${esc(p.description)}</p>
        <span class="product-tag">${esc((p.tags || []).join(' · '))}</span>
      </div>
    </article>`).join('');

  const body = `<main class="shell">
    ${nav}
    <header class="hero stack">
      <p class="eyebrow">Static · Git · Markdown</p>
      <h1 class="display">Website yang tenang,<br />cepat, dan mudah dirawat.</h1>
      <p class="lead hero-lede">Saya membangun blog, link-in-bio, dan toko sederhana untuk <span class="strong">Awwra</span>. Konten ditulis dalam Markdown, versi dikendalikan Git.</p>
    </header>
    <section class="stats" aria-label="Ringkasan">
      <div class="stat"><p class="stat-value">$0</p><p class="stat-label">Hosting statis<br>di tier gratis</p></div>
      <div class="stat"><p class="stat-value">&lt;1s</p><p class="stat-label">Waktu muat<br>halaman statis</p></div>
      <div class="stat"><p class="stat-value">100%</p><p class="stat-label">Konten dalam<br>Markdown &amp; Git</p></div>
    </section>
    <section id="karya" class="section-block" aria-labelledby="karya-title">
      <h2 id="karya-title" class="display-sub">Tiga hal yang saya kerjakan dengan baik.</h2>
      <ol class="offering-list">
        <li class="offering"><span class="offering-index">01</span><div class="offering-body"><h3 class="offering-title">Blog &amp; Tulisan</h3><p class="offering-desc">Arsitektur konten berbasis Markdown. Penulis non-teknis memakai CMS, developer memakai <code>.md</code>. Keduanya bertemu di Git.</p></div></li>
        <li class="offering"><span class="offering-index">02</span><div class="offering-body"><h3 class="offering-title">Link in Bio</h3><p class="offering-desc">Satu halaman, satu tujuan. Ringan, tipografis, dan sepenuhnya dapat diedit lewat konten terstruktur.</p></div></li>
        <li class="offering"><span class="offering-index">03</span><div class="offering-body"><h3 class="offering-title">Toko Sederhana</h3><p class="offering-desc">Katalog statis dengan checkout ringan. Tidak perlu backend rumit untuk mulai menjual.</p></div></li>
      </ol>
    </section>
    <section id="produk" class="section-block" aria-labelledby="produk-title">
      <p class="eyebrow">Katalog</p>
      <h2 id="produk-title" class="display-sub">Barang kecil, dibuat dengan sengaja.</h2>
      <div class="filter-bar" role="group" aria-label="Filter produk">
        <button class="filter-chip is-active" data-filter="all">Semua</button>
        <button class="filter-chip" data-filter="cetak">Cetak</button>
        <button class="filter-chip" data-filter="digital">Digital</button>
        <button class="filter-chip" data-filter="alat">Alat</button>
      </div>
      <div class="product-grid">${productCards}</div>
      <p style="margin-block-start: var(--space-6)"><a href="/produk/" class="nav-link">Lihat semua produk →</a></p>
    </section>
    <section id="prinsip" class="section-block" aria-labelledby="prinsip-title">
      <p class="eyebrow">Prinsip kerja</p>
      <h2 id="prinsip-title" class="display-sub">Sedikit alat, banyak kejelasan.</h2>
      <div class="principles">
        <div class="principle"><h3 class="principle-title">Static by default</h3><p class="principle-desc">HTML yang sudah dirender, bukan dirakit saat diminta. Cepat, aman, murah.</p></div>
        <div class="principle"><h3 class="principle-title">Git sebagai arsip</h3><p class="principle-desc">Setiap perubahan tercatat. Konten punya sejarah, bukan sekadar keadaan.</p></div>
        <div class="principle"><h3 class="principle-title">Markdown untuk semua</h3><p class="principle-desc">Non-developer lewat CMS, developer lewat editor favorit. Satu sumber kebenaran.</p></div>
      </div>
    </section>
    ${footer}
  </main>`;

  return layout({ title: `${SITE_NAME} — Website sebagai Karya`, description: SITE_DESC, canonical: `${SITE_URL}/`, ogImage: '/media/og-home.jpg', body });
}

function buildProducts(products) {
  const cards = products.map(p => `
    <article class="product-card" data-tags="${esc((p.tags || []).join(' '))}">
      <div class="product-media"><a href="/produk/${p.slug}/">${picture(p.image, p.name)}</a></div>
      <div class="product-meta">
        <h3 class="product-name"><a href="/produk/${p.slug}/">${esc(p.name)}</a></h3>
        <p class="product-price">Rp ${Number(p.price).toLocaleString('id-ID')}</p>
        <p class="product-desc">${esc(p.description)}</p>
        <span class="product-tag">${esc((p.tags || []).join(' · '))}</span>
      </div>
    </article>`).join('');

  const body = `<main class="shell">
    ${nav}
    <header class="hero stack">
      <p class="eyebrow">Katalog</p>
      <h1 class="display">Produk.</h1>
      <p class="lead">Barang kecil yang dibuat dengan sengaja. Semua tersedia dalam jumlah terbatas.</p>
    </header>
    <section class="section-block">
      <div class="filter-bar" role="group" aria-label="Filter produk">
        <button class="filter-chip is-active" data-filter="all">Semua</button>
        <button class="filter-chip" data-filter="cetak">Cetak</button>
        <button class="filter-chip" data-filter="digital">Digital</button>
        <button class="filter-chip" data-filter="alat">Alat</button>
      </div>
      <div class="product-grid">${cards || '<p class="lead">Belum ada produk.</p>'}</div>
    </section>
    ${footer}
  </main>`;

  return layout({ title: `Produk — ${SITE_NAME}`, description: 'Katalog produk Awwra: cetak, digital, dan alat.', canonical: `${SITE_URL}/produk/`, body });
}

function buildProductDetail(p) {
  const html = marked.parse(p.body || '');
  const body = `<main class="shell">
    ${nav}
    <article class="section-block">
      <p class="eyebrow"><a href="/produk/" class="nav-link">← Katalog</a></p>
      <div style="display:grid; gap:var(--space-6); margin-block-start:var(--space-6)">
        <div class="product-media" style="aspect-ratio:4/5; max-width:28rem">${picture(p.image, p.name, '(max-width: 768px) 100vw, 50vw', 800, 1000)}</div>
        <div>
          <h1 class="display">${esc(p.name)}</h1>
          <p class="product-price" style="font-size:var(--text-lg); margin-block:var(--space-2)">Rp ${Number(p.price).toLocaleString('id-ID')}</p>
          <p class="lead">${esc(p.description)}</p>
          <p class="product-tag" style="margin-block-start:var(--space-3)">${esc((p.tags || []).join(' · '))}</p>
        </div>
      </div>
      <div class="prose" style="margin-block-start:var(--space-10)">${html}</div>
    </article>
    ${footer}
  </main>`;

  return layout({ title: `${p.name} — ${SITE_NAME}`, description: p.description, canonical: `${SITE_URL}/produk/${p.slug}/`, ogImage: p.image, body });
}

function buildBlog(posts) {
  const items = posts.map(p => `
    <li class="offering">
      <time class="offering-index" datetime="${p.date}">${new Date(p.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</time>
      <div class="offering-body">
        <h3 class="offering-title"><a href="/blog/${p.slug}/" style="color:inherit; text-decoration:none">${esc(p.title)}</a></h3>
        <p class="offering-desc">${esc(p.description)}</p>
      </div>
    </li>`).join('');

  const body = `<main class="shell">
    ${nav}
    <header class="hero stack">
      <p class="eyebrow">Tulisan</p>
      <h1 class="display">Blog.</h1>
      <p class="lead">Catatan tentang web, tipografi, dan kerja yang tenang.</p>
    </header>
    <section class="section-block">
      <ol class="offering-list">${items || '<li class="lead">Belum ada tulisan.</li>'}</ol>
    </section>
    ${footer}
  </main>`;

  return layout({ title: `Blog — ${SITE_NAME}`, description: 'Tulisan tentang web, tipografi, dan kerja yang tenang.', canonical: `${SITE_URL}/blog/`, body });
}

function buildBlogPost(p) {
  const html = marked.parse(p.body || '');
  const body = `<main class="shell">
    ${nav}
    <article class="section-block">
      <p class="eyebrow"><a href="/blog/" class="nav-link">← Blog</a></p>
      <header class="stack" style="margin-block-start: var(--space-4)">
        <h1 class="display">${esc(p.title)}</h1>
        <time class="small" datetime="${p.date}" style="color:hsl(var(--subtle-fg)); font-size:var(--text-xs); letter-spacing:var(--tracking-wide)">
          ${new Date(p.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
        </time>
        <p class="lead">${esc(p.description)}</p>
      </header>
      <div class="prose" style="margin-block-start: var(--space-8)">${html}</div>
    </article>
    ${footer}
  </main>`;

  return layout({ title: `${p.title} — ${SITE_NAME}`, description: p.description, canonical: `${SITE_URL}/blog/${p.slug}/`, ogImage: p.cover, body });
}

function buildRss(posts) {
  const items = posts.map(p => `
    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE_URL}/blog/${p.slug}/</link>
      <guid>${SITE_URL}/blog/${p.slug}/</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${esc(p.description)}</description>
    </item>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>${SITE_NAME}</title>
  <link>${SITE_URL}</link>
  <description>${SITE_DESC}</description>
  ${items}
</channel></rss>`;
}

function buildSitemap(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE_URL}${u}</loc></url>`).join('\n')}
</urlset>`;
}

async function main() {
  const products = readCollection('products').sort((a, b) => (a.order || 99) - (b.order || 99));
  const posts = readCollection('posts').sort((a, b) => new Date(b.date) - new Date(a.date));

  fs.mkdirSync(path.join(PUBLIC, 'fonts'), { recursive: true });
  const fontSrc = './node_modules/@fontsource-variable/inter/files';
  if (fs.existsSync(fontSrc)) {
    fs.readdirSync(fontSrc).filter(f => f.endsWith('.woff2'))
      .forEach(f => fs.copyFileSync(path.join(fontSrc, f), path.join(PUBLIC, 'fonts', f)));
  }

  fs.writeFileSync(path.join(PUBLIC, 'index.html'), buildHome(products));

  fs.mkdirSync(path.join(PUBLIC, 'produk'), { recursive: true });
  fs.writeFileSync(path.join(PUBLIC, 'produk/index.html'), buildProducts(products));
  products.forEach(p => {
    const dir = path.join(PUBLIC, 'produk', p.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), buildProductDetail(p));
  });

  fs.mkdirSync(path.join(PUBLIC, 'blog'), { recursive: true });
  fs.writeFileSync(path.join(PUBLIC, 'blog/index.html'), buildBlog(posts));
  posts.forEach(p => {
    const dir = path.join(PUBLIC, 'blog', p.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), buildBlogPost(p));
  });

  fs.writeFileSync(path.join(PUBLIC, 'rss.xml'), buildRss(posts));
  const urls = ['/', '/produk/', '/blog/', ...products.map(p => `/produk/${p.slug}/`), ...posts.map(p => `/blog/${p.slug}/`)];
  fs.writeFileSync(path.join(PUBLIC, 'sitemap.xml'), buildSitemap(urls));
  fs.writeFileSync(path.join(PUBLIC, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  fs.writeFileSync(path.join(PUBLIC, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#121212"/><path d="M8 22 14 10h1.5L21 22h-1.8l-1.5-3.4h-4.4L11.8 22H8zm5-5h3.6L14.9 13 13 17z" fill="#f5f2ec"/></svg>`);

  fs.writeFileSync(path.join(PUBLIC, '_headers'), `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()

/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/media/*
  Cache-Control: public, max-age=31536000, immutable

/css/*.css
/js/*.js
  Cache-Control: public, max-age=3600
`);

  fs.writeFileSync(path.join(PUBLIC, '_redirects'), `/* /404.html 404\n`);

  fs.writeFileSync(path.join(PUBLIC, '404.html'), layout({
    title: `404 — ${SITE_NAME}`,
    description: 'Halaman tidak ditemukan.',
    canonical: `${SITE_URL}/404.html`,
    body: `<main class="shell">${nav}<header class="hero stack"><p class="eyebrow">404</p><h1 class="display">Halaman tidak ditemukan.</h1><p class="lead">Mungkin sudah dipindah, atau belum pernah ada.</p><p><a href="/" class="nav-link">← Kembali ke beranda</a></p></header>${footer}</main>`,
  }));

  console.log(`✓ Built ${products.length} produk, ${posts.length} post`);
}

main().catch(err => { console.error(err); process.exit(1); });
