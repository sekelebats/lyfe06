---
title: "Membangun Static Website untuk Jangka Panjang"
slug: "static-website-untuk-jangka-panjang"
date: 2026-11-18
draft: false
description: "Mengapa website statis, HTML sederhana, dan sedikit dependency menjadi pilihan menarik untuk website jangka panjang."
excerpt: "Website tidak harus kompleks untuk menjadi cepat, mudah dirawat, dan dapat bertahan lama."
cover: "https://fzhassets.netlify.app/images/mwc5z5el-h0jphhvp/640.avif"
tags:
  - static-site
  - web-development
  - performance
---

Website yang baik tidak selalu membutuhkan banyak teknologi. Terkadang, semakin sedikit komponen yang digunakan, semakin mudah sebuah website dipahami dan dirawat.

Saya menyukai pendekatan static website karena sebagian besar pekerjaan dilakukan saat build time. Ketika pengunjung membuka halaman, server cukup mengirimkan HTML, CSS, JavaScript, dan aset yang sudah disiapkan.

## Mengapa memilih static website?

Ada beberapa alasan mengapa pendekatan ini menarik.

### 1. Lebih sedikit runtime

Halaman HTML statis tidak membutuhkan proses rendering server untuk setiap permintaan halaman.

### 2. Lebih mudah di-cache

File statis dapat disajikan melalui CDN dan disimpan dalam cache dengan strategi yang tepat.

### 3. Lebih mudah dipindahkan

HTML, CSS, JavaScript, dan Markdown tidak terikat pada satu platform hosting tertentu.

## Tidak semua hal membutuhkan JavaScript

JavaScript memang berguna, tetapi tidak semua interaksi harus menggunakan JavaScript.

Gunakan HTML untuk struktur, CSS untuk presentasi, dan JavaScript hanya ketika memang dibutuhkan.

```html
<main>
  <article>
    <h1>Simple by design</h1>
    <p>Less complexity, more clarity.</p>
  </article>
</main>
```

## Kesimpulan

Teknologi seharusnya membantu pekerjaan, bukan menambah beban pemeliharaan.

Saya lebih memilih sistem sederhana yang dapat dipahami dan dirawat selama bertahun-tahun daripada sistem kompleks yang sulit dipertahankan.
