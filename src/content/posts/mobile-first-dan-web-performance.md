---
title: "Mobile First dan Web Performance"
slug: "mobile-first-dan-web-performance"
date: 2026-11-12
draft: false
description: "Memahami pendekatan mobile-first, performa website, optimasi aset, dan pentingnya pengalaman pengguna pada perangkat mobile."
excerpt: "Website yang ringan bukan hanya tentang ukuran file, tetapi juga tentang pengalaman pengguna."
cover: "https://fzhassets.netlify.app/images/mwc5z5el-h0jphhvp/640.avif"
tags:
  - mobile-first
  - performance
  - frontend
---

Membuat website mobile-first bukan sekadar membuat layout yang mengecil ketika dibuka di layar smartphone.

Mobile-first berarti memikirkan keterbatasan perangkat mobile sejak awal.

## Mulai dari kebutuhan utama

Pada layar kecil, ruang sangat terbatas. Karena itu, setiap elemen harus memiliki tujuan.

Beberapa hal yang perlu diperhatikan:

- Navigasi yang mudah digunakan.
- Ukuran teks yang nyaman dibaca.
- Jarak antar elemen yang cukup.
- Tombol dengan area sentuh yang memadai.
- Konten yang tidak membutuhkan terlalu banyak bandwidth.

## Performa tidak hanya tentang ukuran file

Ada dua aspek yang perlu diperhatikan.

### Bandwidth

Berhubungan dengan jumlah data yang harus diunduh pengunjung.

Optimasi yang dapat dilakukan:

- Gunakan WebP atau AVIF.
- Hindari gambar yang terlalu besar.
- Minimalkan CSS dan JavaScript.
- Gunakan font secara selektif.

### Latensi

Berhubungan dengan waktu yang dibutuhkan untuk memulai komunikasi dan menerima respons.

Optimasi yang dapat dilakukan:

- Gunakan CDN.
- Terapkan caching.
- Kurangi request yang tidak diperlukan.
- Hindari dependency eksternal yang berlebihan.

## CSS mobile-first

Contoh pendekatan sederhana:

```css
.container {
  width: min(100% - 2rem, 72rem);
  margin-inline: auto;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
}

@media (min-width: 48rem) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## Kesimpulan

Website yang cepat bukan website yang memiliki fitur paling sedikit, tetapi website yang menggunakan sumber daya secara tepat.
