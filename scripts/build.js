const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const { marked } = require('marked');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src/content');
const PUBLIC = path.join(ROOT, 'public');
const SITE_URL = (process.env.SITE_URL || 'https://awwra.id').replace(/\/+$/, '');
const SITE_NAME = process.env.SITE_NAME || 'Awwra';
const SITE_DESC = process.env.SITE_DESCRIPTION || 'Website, produk, dan tulisan yang dibuat dengan sengaja.';
const EMAIL = process.env.CONTACT_EMAIL || 'halo@awwra.id';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
const attr = esc;
const absolute = value => /^https?:\/\//i.test(value || '') ? value : `${SITE_URL}${value?.startsWith('/') ? '' : '/'}${value || ''}`;
const slugify = value => String(value || '').trim().toLowerCase()
  .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const validSlug = value => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const safeDate = value => { const date = new Date(value); return Number.isNaN(date.getTime()) ? new Date('2000-01-01T00:00:00Z') : date; };
const displayDate = value => safeDate(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

function readCollection(folder, type) {
  const dir = path.join(SRC, folder);
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir).filter(file => file.endsWith('.md')).sort();
  const records = entries.map(file => {
    const parsed = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
    const data = parsed.data || {};
    const filenameSlug = path.basename(file, '.md');
    const slug = slugify(data.slug || filenameSlug);
    if (!slug || !validSlug(slug)) throw new Error(`Invalid slug in ${folder}/${file}: "${data.slug}"`);
    const record = { ...data, slug, body: parsed.content.trim(), _file: file };
    if (type === 'post') {
      if (!record.title) throw new Error(`${file}: frontmatter "title" is required.`);
      if (!record.date) throw new Error(`${file}: frontmatter "date" is required.`);
      if (!record.description) throw new Error(`${file}: frontmatter "description" is required.`);
    } else {
      record.title = record.name || record.title;
      if (!record.title) throw new Error(`${file}: frontmatter "name" is required.`);
      if (record.price == null || !Number.isFinite(Number(record.price))) throw new Error(`${file}: valid "price" is required.`);
    }
    return record;
  }).filter(item => !item.draft && (type !== 'product' || item.available !== false));

  const seen = new Set();
  for (const item of records) {
    if (seen.has(item.slug)) throw new Error(`Duplicate ${type} slug: "${item.slug}"`);
    seen.add(item.slug);
  }
  return records;
}

function icon(name, size = 18) {
  const paths = {
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    close: '<path d="m18 6-12 12M6 6l12 12"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    arrow: '<path d="M7 17 17 7M7 7h10v10"/>',
    'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
    moon: '<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4.4m-6.6 7 6.6 4.4"/>'
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name] || ''}</svg>`;
}

function picture(src, alt, sizes = '(max-width: 700px) 100vw, 50vw', width = 800, height = 1000) {
  if (!src) return '';
  const clean = String(src).replace(/\.(avif|webp|jpe?g|png)$/i, '');
  const sourcePath = path.join(PUBLIC, String(src).replace(/^\//, ''));
  const hasSource = fs.existsSync(sourcePath);
  const hasOptimized = fs.existsSync(path.join(PUBLIC, clean.replace(/^\//, '') + '-400.webp'));
  if (!hasSource && !hasOptimized) {
    return `<span class="media-placeholder" role="img" aria-label="${attr(alt)}"></span>`;
  }
  if (!hasOptimized) {
    return `<img src="${attr(src)}" alt="${attr(alt)}" width="${width}" height="${height}" loading="lazy" decoding="async">`;
  }
  return `<picture>
    <source type="image/avif" srcset="${clean}-400.avif 400w, ${clean}-800.avif 800w, ${clean}-1200.avif 1200w" sizes="${attr(sizes)}">
    <source type="image/webp" srcset="${clean}-400.webp 400w, ${clean}-800.webp 800w, ${clean}-1200.webp 1200w" sizes="${attr(sizes)}">
    <img src="${clean}-800.jpg" srcset="${clean}-400.jpg 400w, ${clean}-800.jpg 800w, ${clean}-1200.jpg 1200w" sizes="${attr(sizes)}" alt="${attr(alt)}" width="${width}" height="${height}" loading="lazy" decoding="async">
  </picture>`;
}

function nav() {
  return `<a class="skip-link" href="#main-content">Lewati ke konten</a>
  <nav class="site-nav" aria-label="Navigasi utama" data-pagefind-ignore>
    <div class="nav-inner">
      <a class="brand" href="/" aria-label="${attr(SITE_NAME)} — Beranda">
        <span class="brand-mark" aria-hidden="true">A</span>
        <span>${esc(SITE_NAME)}</span>
      </a>
      <div class="nav-panel" id="nav-panel" data-nav-panel>
        <a href="/#karya" class="nav-link">Pendekatan</a>
        <a href="/produk/" class="nav-link">Produk</a>
        <a href="/blog/" class="nav-link">Blog</a>
        <a href="/cari/" class="nav-link nav-search">${icon('search', 16)}<span>Cari</span></a>
      </div>
      <div class="nav-actions">
        <button class="icon-button theme-toggle" type="button" aria-label="Ganti tema" title="Ganti tema" data-theme-toggle>${icon('moon', 18)}</button>
        <button class="icon-button menu-toggle" type="button" aria-expanded="false" aria-controls="nav-panel" aria-label="Buka menu" data-menu-toggle>${icon('menu', 20)}</button>
      </div>
    </div>
  </nav>`;
}

function footer() {
  return `<footer class="site-footer" id="kontak" data-pagefind-ignore>
    <div class="footer-inner">
      <div class="footer-intro">
        <p class="eyebrow">Mulai percakapan</p>
        <p class="footer-title">Punya ide yang ingin diwujudkan?</p>
        <a class="text-link" href="mailto:${attr(EMAIL)}">${esc(EMAIL)} ${icon('arrow', 14)}</a>
      </div>
      <div class="footer-column"><span class="footer-label">Jelajahi</span><a href="/produk/">Produk</a><a href="/blog/">Blog</a><a href="/rss.xml">RSS Feed</a></div>
      <div class="footer-column"><span class="footer-label">Lainnya</span><a href="/sitemap.xml">Sitemap</a><a href="/cari/">Pencarian</a><a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub ${icon('arrow', 12)}</a></div>
    </div>
    <div class="footer-bottom"><span>© ${new Date().getFullYear()} ${esc(SITE_NAME)}</span><span>Dibuat dengan sederhana.</span></div>
  </footer>`;
}

function layout({ title, description, canonical, ogImage, body, type = 'website', noindex = false }) {
  const image = ogImage ? absolute(ogImage) : '';
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>
  (() => {
    try {
      const saved = localStorage.getItem('awwra-theme');
      const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = saved === 'dark' || saved === 'light' ? saved : preferred;
    } catch (_) {}
  })();
</script>
<title>${esc(title)}</title>
<meta name="description" content="${attr(description)}">
<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large'}">
<link rel="canonical" href="${attr(canonical)}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="alternate" type="application/rss+xml" title="${attr(SITE_NAME)} RSS" href="/rss.xml">
<meta property="og:type" content="${attr(type)}">
<meta property="og:site_name" content="${attr(SITE_NAME)}">
<meta property="og:title" content="${attr(title)}">
<meta property="og:description" content="${attr(description)}">
<meta property="og:url" content="${attr(canonical)}">
${image ? `<meta property="og:image" content="${attr(image)}">` : ''}
<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">
<meta name="twitter:title" content="${attr(title)}">
<meta name="twitter:description" content="${attr(description)}">
${image ? `<meta name="twitter:image" content="${attr(image)}">` : ''}
<link rel="preload" href="/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/font.css">
<link rel="stylesheet" href="/css/main.css">
</head>
<body>
${nav()}
${body}
${footer()}
<script src="/js/site.js" defer></script>
</body>
</html>`;
}

function productCard(product) {
  return `<article class="product-card" data-tags="${attr((product.tags || []).join(' '))}">
    <a class="product-media" href="/produk/${attr(product.slug)}/">${picture(product.image, product.title)}</a>
    <div class="product-meta">
      <h2 class="product-name"><a href="/produk/${attr(product.slug)}/">${esc(product.title)}</a></h2>
      <p class="product-price">Rp ${Number(product.price).toLocaleString('id-ID')}</p>
      <p class="product-desc">${esc(product.excerpt || product.description || '')}</p>
      ${(product.tags || []).length ? `<p class="product-tag">${esc(product.tags.join(' · '))}</p>` : ''}
    </div>
  </article>`;
}

function postCard(post) {
  return `<article class="post-card">
    <div class="post-meta"><time datetime="${attr(safeDate(post.date).toISOString())}">${displayDate(post.date)}</time>${(post.tags || []).slice(0, 2).map(tag => `<span>${esc(tag)}</span>`).join('')}</div>
    <h2 class="post-title"><a href="/blog/${attr(post.slug)}/">${esc(post.title)}</a></h2>
    <p class="post-excerpt">${esc(post.excerpt || post.description)}</p>
    <a class="text-link" href="/blog/${attr(post.slug)}/">Baca tulisan ${icon('arrow', 14)}</a>
  </article>`;
}

function home(products, posts) {
  const approach = [
    {
      number: '01',
      title: 'Markdown & Git',
      text: 'Saya suka menulis dengan Markdown dan mengelola perubahan menggunakan Git. Konten tetap berupa teks yang sederhana, portabel, dan mudah dirawat.'
    },
    {
      number: '02',
      title: 'Static first',
      text: 'Saya menyukai website statis: HTML yang sudah disiapkan saat build, runtime yang minimal, dan lebih sedikit hal yang perlu berjalan di browser.'
    },
    {
      number: '03',
      title: 'Minimal, fast & light',
      text: 'Saya memilih stack seperlunya, menjaga halaman tetap cepat dan ringan, serta membangun dengan pendekatan mobile-first.'
    }
  ];

  const approachCards = approach.map(item => `
    <article class="approach-item">
      <span class="approach-number">${item.number}</span>
      <h3>${esc(item.title)}</h3>
      <p>${esc(item.text)}</p>
    </article>
  `).join('');

  const visibleProducts = products.slice(0, 3);
  const visiblePosts = posts.slice(0, 3);

  const body = `<main id="main-content" class="page-shell">
    <div data-pagefind-body>
      <header class="hero" aria-labelledby="home-title">
        <p class="eyebrow">Static · Git · Markdown</p>
        <h1 class="hero-title" id="home-title">I like simple things <span>built to last.</span></h1>
        <div class="hero-copy">
          <p>Saya suka Markdown, Git, dan website statis. Saya menikmati cara kerja yang sederhana: konten sebagai teks, perubahan tercatat, dan halaman yang sudah siap disajikan.</p>
          <p>Saya menyukai stack yang minimalis, fast, light, dan built to last. Dengan pendekatan mobile-first, performa bukan tambahan, tetapi bagian dari desain sejak awal.</p>
        </div>
        <ul class="hero-principles" aria-label="Prinsip yang saya sukai">
          <li>Minimal stack</li>
          <li>Fast &amp; light</li>
          <li>Static first</li>
          <li>Mobile-first</li>
        </ul>
      </header>

      <section class="content-section approach-section" id="karya" aria-labelledby="approach-title">
        <div class="section-heading">
          <div>
            <p class="eyebrow">My approach</p>
            <h2 class="section-title" id="approach-title">Less complexity, more clarity.</h2>
          </div>
          <p class="section-intro">Prinsip sederhana yang memandu cara saya membuat dan merawat sesuatu di web.</p>
        </div>
        <div class="approach-grid">${approachCards}</div>
      </section>

      <section class="content-section" id="produk" aria-labelledby="produk-title">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Selected products</p>
            <h2 class="section-title" id="produk-title">Products.</h2>
          </div>
          <a class="text-link" href="/produk/">Semua produk ${icon('arrow', 14)}</a>
        </div>
        <div class="product-grid">${visibleProducts.map(productCard).join('') || '<p class="empty-state">Belum ada produk.</p>'}</div>
      </section>

      <section class="content-section" id="blog" aria-labelledby="blog-title">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Writing &amp; notes</p>
            <h2 class="section-title" id="blog-title">Latest writing.</h2>
          </div>
          <a class="text-link" href="/blog/">Semua tulisan ${icon('arrow', 14)}</a>
        </div>
        <div class="post-list">${visiblePosts.map(postCard).join('') || '<p class="empty-state">Belum ada tulisan.</p>'}</div>
      </section>
    </div>
  </main>`;

  return layout({
    title: `${SITE_NAME} — Static, Git & Markdown`,
    description: 'Saya suka Markdown, Git, website statis, serta stack minimalis yang fast, light, mobile-first, dan built to last.',
    canonical: `${SITE_URL}/`,
    body
  });
}

function productsPage(products) {
  const tags = [...new Set(products.flatMap(p => p.tags || []))];
  const body = `<main id="main-content" class="page-shell">
    <div data-pagefind-body>
      <header class="page-hero"><p class="eyebrow">Katalog / Awwra</p><h1 class="page-title" data-pagefind-meta="title">Produk.</h1><p class="page-description">Pilihan produk yang dibuat dengan perhatian pada fungsi, bentuk, dan detail.</p></header>
      <section class="content-section compact-section" aria-label="Daftar produk">
        ${tags.length ? `<div class="filter-bar" role="group" aria-label="Filter produk"><button class="filter-chip is-active" type="button" data-filter="all" aria-pressed="true">Semua</button>${tags.map(tag => `<button class="filter-chip" type="button" data-filter="${attr(tag)}" aria-pressed="false">${esc(tag)}</button>`).join('')}</div>` : ''}
        <div class="product-grid" data-product-grid>${products.map(productCard).join('') || '<p>Belum ada produk.</p>'}</div>
      </section>
    </div>
  </main>`;
  return layout({ title: `Produk — ${SITE_NAME}`, description: 'Jelajahi katalog produk Awwra.', canonical: `${SITE_URL}/produk/`, body });
}

function productDetail(product) {
  const body = `<main id="main-content" class="page-shell">
    <div data-pagefind-body>
      <article class="detail-layout">
        <div class="detail-media">${picture(product.image, product.title, '(max-width: 800px) 100vw, 48vw', 1000, 1200)}</div>
        <div class="detail-content"><a class="back-link" href="/produk/">${icon('arrow-left', 15)}<span>Semua produk</span></a><p class="eyebrow">Produk / Awwra</p><h1 class="page-title" data-pagefind-meta="title">${esc(product.title)}</h1><p class="product-price detail-price">Rp ${Number(product.price).toLocaleString('id-ID')}</p><p class="page-description">${esc(product.description)}</p>${(product.tags || []).map(tag => `<span class="tag">${esc(tag)}</span>`).join('')}<div class="prose">${marked.parse(product.body || '')}</div></div>
      </article>
      <div class="share-tools" data-pagefind-ignore><button class="share-button" type="button" data-share>${icon('share', 16)} Bagikan produk</button><span class="share-status" aria-live="polite"></span></div>
    </div>
  </main>`;
  return layout({ title: `${product.title} — ${SITE_NAME}`, description: product.description, canonical: `${SITE_URL}/produk/${product.slug}/`, ogImage: product.image, body });
}

function blogPage(posts) {
  const body = `<main id="main-content" class="page-shell">
    <div data-pagefind-body>
      <header class="page-hero"><p class="eyebrow">Jurnal / Awwra</p><h1 class="page-title" data-pagefind-meta="title">Blog.</h1><p class="page-description">Catatan tentang web, desain, teknologi, dan proses membuat sesuatu dengan lebih baik.</p></header>
      <section class="content-section compact-section"><div class="post-list">${posts.map(postCard).join('') || '<p>Belum ada tulisan.</p>'}</div></section>
    </div>
  </main>`;
  return layout({ title: `Blog — ${SITE_NAME}`, description: 'Tulisan tentang web, desain, teknologi, dan proses kreatif.', canonical: `${SITE_URL}/blog/`, body });
}

function blogPost(post) {
  const body = `<main id="main-content" class="page-shell">
    <div data-pagefind-body>
      <article class="article">
        <header class="article-header"><a class="back-link" href="/blog/">${icon('arrow-left', 15)}<span>Semua tulisan</span></a><p class="eyebrow">Catatan / Awwra</p><h1 class="article-title" data-pagefind-meta="title">${esc(post.title)}</h1><div class="article-meta"><time datetime="${attr(safeDate(post.date).toISOString())}">${displayDate(post.date)}</time>${(post.tags || []).map(tag => `<span>${esc(tag)}</span>`).join('')}</div><p class="article-description">${esc(post.excerpt || post.description)}</p>${post.cover ? `<div class="article-cover">${picture(post.cover, post.title, '(max-width: 800px) 100vw, 760px', 1200, 675)}</div>` : ''}</header>
        <div class="prose">${marked.parse(post.body || '')}</div>
        <div class="share-tools" data-pagefind-ignore><button class="share-button" type="button" data-share>${icon('share', 16)} Bagikan tulisan</button><span class="share-status" aria-live="polite"></span></div>
      </article>
    </div>
  </main>`;
  return layout({ title: `${post.title} — ${SITE_NAME}`, description: post.description, canonical: `${SITE_URL}/blog/${post.slug}/`, ogImage: post.cover, type: 'article', body });
}

function searchPage() {
  const body = `<main id="main-content" class="page-shell">
    <div class="search-page" data-pagefind-ignore>
      <header class="page-hero"><p class="eyebrow">Temukan sesuatu</p><h1 class="page-title">Pencarian.</h1><p class="page-description">Cari artikel dan halaman berdasarkan isi kontennya.</p></header>
      <section class="search-ui"><label class="search-label" for="site-search">Kata kunci</label><input id="site-search" class="search-input" type="search" placeholder="Contoh: Markdown, desain, web..." autocomplete="off"><p class="search-help">Hasil pencarian hanya mengambil isi utama halaman.</p><div id="search-results" class="search-results" aria-live="polite"></div></section>
    </div>
  </main>
  <script src="/js/search.js" defer></script>`;
  return layout({ title: `Pencarian — ${SITE_NAME}`, description: 'Cari isi blog dan halaman Awwra.', canonical: `${SITE_URL}/cari/`, body, noindex: true });
}

function rss(posts) {
  const xml = value => esc(value).replace(/&#39;/g, '&apos;');
  const items = posts.map(post => `<item><title>${xml(post.title)}</title><link>${SITE_URL}/blog/${post.slug}/</link><guid isPermaLink="true">${SITE_URL}/blog/${post.slug}/</guid><pubDate>${new Date(post.date).toUTCString()}</pubDate><description>${xml(post.description)}</description></item>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${xml(SITE_NAME)}</title><link>${SITE_URL}/</link><description>${xml(SITE_DESC)}</description><language>id-ID</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}</channel></rss>`;
}

function sitemap(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${xmlUrl(url)}</loc></url>`).join('')}</urlset>`;
}
function xmlUrl(url) { return esc(`${SITE_URL}${url}`); }

function write(file, content) {
  const target = path.join(PUBLIC, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function main() {
  fs.mkdirSync(PUBLIC, { recursive: true });
  const fontSource = path.join(ROOT, 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2');
  if (fs.existsSync(fontSource)) {
    const fontDir = path.join(PUBLIC, 'fonts');
    fs.mkdirSync(fontDir, { recursive: true });
    fs.copyFileSync(fontSource, path.join(fontDir, 'inter-latin-wght-normal.woff2'));
  } else {
    console.warn('ℹ Inter font file not found. The system font fallback will be used.');
  }
  const products = readCollection('products', 'product').sort((a, b) => Number(a.order || 99) - Number(b.order || 99));
  const posts = readCollection('posts', 'post').sort((a, b) => safeDate(b.date) - safeDate(a.date));

  write('index.html', home(products, posts));
  write('produk/index.html', productsPage(products));
  for (const product of products) write(`produk/${product.slug}/index.html`, productDetail(product));
  write('blog/index.html', blogPage(posts));
  for (const post of posts) write(`blog/${post.slug}/index.html`, blogPost(post));
  write('cari/index.html', searchPage());
  write('rss.xml', rss(posts));
  const urls = ['/', '/produk/', '/blog/', ...products.map(p => `/produk/${p.slug}/`), ...posts.map(p => `/blog/${p.slug}/`)];
  write('sitemap.xml', sitemap(urls));
  write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /cari/\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  write('favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#171717"/><path d="M8 29 18 9h4l10 20h-5l-2-5H15l-2 5H8zm9-9h6l-3-7-3 7z" fill="#fff"/></svg>`);
  write('404.html', layout({ title: `404 — ${SITE_NAME}`, description: 'Halaman tidak ditemukan.', canonical: `${SITE_URL}/404.html`, noindex: true, body: `<main id="main-content" class="page-shell"><div class="not-found"><p class="eyebrow">404 / Tidak ditemukan</p><h1 class="page-title">Halaman ini tidak ada.</h1><p class="page-description">Alamat mungkin berubah atau halaman sudah dipindahkan.</p><a class="button button-primary" href="/">Kembali ke beranda</a></div></main>` }));
  write('_headers', `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Cache-Control: public, max-age=0, must-revalidate

/*.html
  Cache-Control: public, max-age=0, must-revalidate

/css/*
  Cache-Control: public, max-age=86400, stale-while-revalidate=3600

/js/*
  Cache-Control: public, max-age=86400, stale-while-revalidate=3600

/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/media/*
  Cache-Control: public, max-age=31536000, immutable

/pagefind/*
  Cache-Control: public, max-age=31536000, immutable
`);
  write('_redirects', `/search/ /cari/ 301\n`);
  console.log(`✓ Built ${products.length} products and ${posts.length} posts.`);
  console.log(`✓ Site URL: ${SITE_URL}`);
}

try { main(); } catch (error) {
  console.error(`Build failed: ${error.message}`);
  process.exitCode = 1;
}
