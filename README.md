# Awwra — Static Website

Website statis berbasis Node.js + Markdown. HTML dirender saat build, sehingga tidak membutuhkan server backend ketika sudah dipublikasikan di Cloudflare Pages.

## 1. Teknologi

- Node.js 22+
- Express 5 untuk local preview
- `gray-matter` untuk frontmatter Markdown
- `marked` untuk HTML dari Markdown
- `sharp` untuk optimasi gambar (AVIF, WebP, JPEG)
- Pagefind untuk pencarian statis
- Cloudflare Pages untuk hosting
- Inter Variable sebagai font lokal
- Ikon bergaya Lucide berupa inline SVG yang dirender dari kode Node.js. Tidak ada package icon tambahan.

## 2. Struktur folder

```text
awwra/
├── .gitignore
├── .pages.yml                 # Konfigurasi Pages CMS
├── pagefind.yml               # Konfigurasi indeks pencarian
├── package.json
├── package-lock.json          # Dibuat saat npm install
├── README.md
├── server.js                  # Local preview
│
├── scripts/
│   ├── build.js               # Markdown → HTML + SEO + RSS + sitemap
│   ├── clean.js               # Membersihkan output hasil build
│   └── optimize.js            # Optimasi gambar dari src/images/original
│
├── src/
│   ├── content/
│   │   ├── posts/             # Artikel blog .md
│   │   └── products/          # Produk .md
│   └── images/
│       └── original/
│           ├── posts/         # Gambar sumber artikel
│           └── products/      # Gambar sumber produk
│
└── public/
    ├── index.html             # Dibuat otomatis
    ├── blog/                  # Dibuat otomatis
    ├── produk/                # Dibuat otomatis
    ├── cari/                  # Halaman pencarian
    ├── css/
    │   ├── font.css
    │   └── main.css
    ├── js/
    │   ├── site.js
    │   └── search.js
    ├── fonts/                 # Font disalin saat build
    ├── media/                 # Hasil optimasi gambar
    ├── pagefind/              # Indeks Pagefind hasil build
    ├── rss.xml
    ├── sitemap.xml
    ├── robots.txt
    ├── favicon.svg
    ├── 404.html
    ├── _headers
    └── _redirects
```

> File HTML, RSS, sitemap, robots, favicon, dan indeks Pagefind dihasilkan otomatis. Jangan mengedit file hasil build secara manual.

## 3. Instalasi

Gunakan Node.js 22 LTS atau versi LTS lebih baru yang kompatibel. Versi proyek dipatok pada Node.js 22.23.5 melalui `.node-version`.

```bash
npm install
```

## 4. Menjalankan lokal

```bash
npm run dev
```

Buka `http://localhost:3000`.

Untuk menjalankan preview dari hasil build yang sudah tersedia:

```bash
npm run preview
```

## 5. Build produksi

```bash
npm run build
```

Urutan proses:

1. `clean` membersihkan output HTML dan indeks lama.
2. `optimize` mengubah gambar sumber ke AVIF, WebP, dan JPEG responsif. Jika folder gambar sumber kosong, proses ini dilewati.
3. `build:html` membuat seluruh halaman, metadata SEO, RSS, sitemap, robots, 404, serta cache headers.
4. `build:search` membuat indeks Pagefind dari folder `public`.

**Penting:** build lengkap menjalankan Pagefind setelah HTML dibuat. Jangan hanya menjalankan `node scripts/build.js` jika ingin fitur pencarian siap dipakai.

## 6. Konfigurasi domain

Default domain pada `scripts/build.js` adalah `https://awwra.id`.

Untuk domain lain, set environment variable `SITE_URL` ketika build:

```bash
SITE_URL=https://domainkamu.com npm run build
```

Opsional:

- `SITE_NAME`: nama website
- `SITE_DESCRIPTION`: deskripsi default website
- `CONTACT_EMAIL`: email pada footer

Sesuaikan juga `--project-name=awwra` pada script deploy jika nama project Cloudflare Pages berbeda.

## 7. Menulis artikel blog

Buat file baru di `src/content/posts/`, misalnya `belajar-html.md`.

```yaml
---
title: "Belajar HTML dengan Benar"
slug: "belajar-html-dengan-benar"
date: 2026-11-20
draft: false
description: "Panduan dasar HTML untuk membuat struktur halaman yang semantik."
excerpt: "Memahami struktur HTML, elemen semantik, dan praktik yang baik."
tags:
  - html
  - frontend
cover: "/media/posts/belajar-html.jpg"
---

Isi artikel ditulis menggunakan Markdown.
```

### Perbedaan field konten

- `title`: judul yang terlihat pada halaman dan hasil pencarian.
- `slug`: URL mandiri. Tidak berubah ketika title diganti.
- `description`: meta description untuk mesin pencari dan social preview.
- `excerpt`: ringkasan yang ditampilkan pada kartu/list blog.
- `date`: tanggal publikasi.
- `draft`: `true` agar tidak dipublikasikan.
- `cover`: gambar artikel.
- `tags`: label topik.
- isi setelah frontmatter: konten artikel.

Nama file boleh berbeda dari slug. Namun, gunakan nama file yang konsisten agar mudah dikelola. Slug harus unik dalam koleksi blog.

## 8. Menambahkan produk

Buat file di `src/content/products/`, misalnya `poster-tenang.md`.

```yaml
---
name: "Poster Tenang"
slug: "poster-tenang"
price: 120000
description: "Poster cetak offset ukuran 50 × 70 cm."
excerpt: "Poster minimalis, dicetak pada kertas matte 250 gsm."
tags:
  - cetak
image: "/media/products/poster-tenang.jpg"
available: true
order: 1
---

Deskripsi detail produk menggunakan Markdown.
```

`available: false` akan menyembunyikan produk dari website. `order` mengatur urutan katalog.

## 9. Gambar

Simpan file sumber gambar di (folder ini juga menjadi lokasi upload Pages CMS):

- `src/images/original/posts/`
- `src/images/original/products/`

Nama gambar yang digunakan di frontmatter harus cocok dengan nama file sumber, tetapi path output-nya menggunakan `/media/...`.

Contoh sumber:

```text
src/images/original/products/poster-tenang.jpg
```

Gunakan pada frontmatter:

```yaml
image: "/media/products/poster-tenang.jpg"
```

Optimasi menghasilkan varian `-400`, `-800`, dan `-1200` dalam AVIF, WebP, dan JPEG. Gambar kecil tidak akan diperbesar hanya untuk memenuhi varian yang lebih besar. Jika gambar belum memiliki varian optimasi, build akan memakai file sumber yang dirujuk. File gambar yang diunggah melalui Pages CMS ke folder sumber akan diproses saat build.

Jangan memasukkan gambar hasil optimasi kembali ke folder `original`, agar tidak terjadi optimasi berulang.

## 10. Pagefind — pencarian hanya isi utama

File konfigurasi `pagefind.yml` memakai:

```yaml
root_selector: "[data-pagefind-body]"
```

Setiap halaman menandai area konten dengan `data-pagefind-body`. Navigasi dan footer berada di luar area tersebut; elemen UI pencarian/share diberi `data-pagefind-ignore`.

Dengan demikian, navbar, footer, tombol, dan teks berulang tidak masuk ke indeks. Pagefind membuat indeks statis di `public/pagefind/`.

Pencarian menggunakan file indeks yang dimuat saat pengunjung membuka halaman pencarian. Tidak ada API server atau database pencarian.

## 11. SEO yang dihasilkan

Build otomatis membuat:

- title dan meta description
- canonical URL
- Open Graph dan Twitter Card
- RSS 2.0 di `/rss.xml`
- sitemap XML di `/sitemap.xml`
- robots.txt
- alternate RSS link
- 404 dengan `noindex`
- halaman pencarian dengan `noindex`

Pastikan `SITE_URL` sudah memakai domain produksi yang benar sebelum deploy. Jangan menambahkan canonical domain produksi ketika sedang menguji domain lain.

## 12. Cache

`public/_headers` mengatur:

| Jenis aset | Cache |
|---|---|
| HTML | `max-age=0, must-revalidate` |
| CSS dan JS | 1 hari |
| Font | 1 tahun, immutable |
| Media | 1 tahun, immutable |
| Pagefind index | 1 tahun, immutable |

HTML tidak diberi cache panjang karena nama file HTML tidak memakai hash. Setelah konten diperbarui, browser perlu memvalidasi HTML terbaru. Untuk CSS/JS/font/media, cache panjang paling aman jika nama file berubah saat konten aset berubah. Jika nama file tetap, lakukan cache purge atau turunkan TTL ketika melakukan perubahan besar.

## 13. Deploy ke Cloudflare Pages

Build command:

```bash
npm install && npm run build
```

Build output directory:

```text
public
```

Versi Node.js disarankan: Node.js 22 LTS atau versi LTS yang lebih baru dan didukung seluruh dependency. Set `SITE_URL` sebagai environment variable produksi. Tambahkan environment variable `NODE_VERSION=22.23.5` pada pengaturan build jika Cloudflare tidak membaca file versi Node dari repository.

Jika menggunakan deploy manual:

```bash
npm run deploy
```

## 14. Catatan keamanan dan pemeliharaan

- Konten Markdown dianggap sebagai konten tepercaya. Jangan izinkan pengguna anonim mengirim HTML mentah ke koleksi ini tanpa sanitasi HTML.
- Jangan menyimpan secret/API key di file frontend.
- Slug harus unik dan stabil. Jika slug artikel yang sudah terindeks diubah, buat redirect 301 dari URL lama.
- Periksa Search Console setelah deploy: sitemap, canonical, status indexing, dan halaman 404.
- Jalankan `npm audit` secara berkala dan update dependency melalui pull request agar perubahan major bisa diuji.
- Simpan Setelah instalasi pertama, simpan `package-lock.json` ke Git. Jika lockfile sudah tersedia dan terbarui, gunakan `npm ci && npm run build` pada Cloudflare agar instalasi reproducible.
