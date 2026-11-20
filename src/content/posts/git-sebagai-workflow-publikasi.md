---
title: "Git sebagai Workflow Publikasi Website"
slug: "git-sebagai-workflow-publikasi-website"
date: 2026-11-08
draft: false
description: "Bagaimana Git membantu mengelola konten, melacak perubahan, dan membangun workflow publikasi website statis."
excerpt: "Git bukan hanya alat untuk developer, tetapi juga sistem untuk menjaga riwayat dan konsistensi konten."
tags:
  - git
  - workflow
  - static-site
---

Git merupakan bagian penting dari workflow website statis saya.

Dengan Git, perubahan pada kode maupun konten dapat dilacak dengan lebih terstruktur.

## Mengapa menggunakan Git?

Ada beberapa manfaat utama:

1. Riwayat perubahan dapat diperiksa.
2. Perubahan dapat dibatalkan.
3. Konten dapat disimpan bersama source code.
4. Deployment dapat dilakukan secara otomatis.

## Contoh workflow

```bash
# Periksa perubahan
git status

# Tambahkan file
git add .

# Simpan perubahan
git commit -m "Add new blog post"

# Kirim ke repository
git push origin main
```

Setelah perubahan dikirim ke repository, layanan seperti Netlify dapat menjalankan proses build dan deployment.

## Markdown + Git + Static Site

Ketiganya membentuk workflow yang sederhana:

```text
Markdown
   |
   v
Git Repository
   |
   v
Build Process
   |
   v
Static HTML
   |
   v
CDN / Hosting
```

## Kesimpulan

Saya menyukai workflow yang mudah dipahami, dapat dilacak, dan tidak bergantung pada terlalu banyak layanan.

Git membantu menjaga semuanya tetap terorganisasi.
