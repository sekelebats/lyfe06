const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const WIDTHS = [400, 800, 1200];
const JOBS = [
  { input: 'src/images/original/products', output: 'public/media/products' },
  { input: 'src/images/original/posts', output: 'public/media/posts' }
];

async function optimizeOne(inputPath, outputDir) {
  const name = path.basename(inputPath, path.extname(inputPath));
  fs.mkdirSync(outputDir, { recursive: true });

  for (const width of WIDTHS) {
    const pipeline = sharp(inputPath).rotate().resize({
      width,
      withoutEnlargement: true,
      fit: 'inside'
    });
    await pipeline.clone().avif({ quality: 68, effort: 5 })
      .toFile(path.join(outputDir, `${name}-${width}.avif`));
    await pipeline.clone().webp({ quality: 78, effort: 5 })
      .toFile(path.join(outputDir, `${name}-${width}.webp`));
    await pipeline.clone().jpeg({ quality: 80, progressive: true, mozjpeg: true })
      .toFile(path.join(outputDir, `${name}-${width}.jpg`));
  }
  console.log(`✓ Optimized ${path.basename(inputPath)}`);
}

async function main() {
  let count = 0;
  for (const job of JOBS) {
    if (!fs.existsSync(job.input)) continue;
    const files = fs.readdirSync(job.input)
      .filter(file => /\.(jpe?g|png|webp|tiff?)$/i.test(file));
    for (const file of files) {
      await optimizeOne(path.join(job.input, file), job.output);
      count++;
    }
  }
  console.log(count ? `✓ ${count} image(s) optimized` : 'ℹ No original images found; skipping image optimization.');
}

main().catch(error => {
  console.error('Image optimization failed:', error);
  process.exitCode = 1;
});
