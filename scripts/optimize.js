const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const WIDTHS = [400, 800, 1200];
const JOBS = [
  { input: './src/images/original/products', output: './public/media/products' },
  { input: './src/images/original/posts', output: './public/media/posts' },
];

async function optimize(inputPath, outputDir) {
  const name = path.basename(inputPath, path.extname(inputPath));
  fs.mkdirSync(outputDir, { recursive: true });

  for (const w of WIDTHS) {
    const resized = sharp(inputPath).resize(w, null, { withoutEnlargement: true });
    await resized.clone().avif({ quality: 70, effort: 6 }).toFile(path.join(outputDir, `${name}-${w}.avif`));
    await resized.clone().webp({ quality: 80 }).toFile(path.join(outputDir, `${name}-${w}.webp`));
    await resized.clone().jpeg({ quality: 80, progressive: true, mozjpeg: true }).toFile(path.join(outputDir, `${name}-${w}.jpg`));
  }
  console.log(`✓ ${name}`);
}

async function run() {
  for (const { input, output } of JOBS) {
    if (!fs.existsSync(input)) continue;
    for (const f of fs.readdirSync(input).filter(f => /\.(jpe?g|png|webp)$/i.test(f))) {
      await optimize(path.join(input, f), output);
    }
  }
}

run().catch(err => { console.error(err); process.exit(1); });
