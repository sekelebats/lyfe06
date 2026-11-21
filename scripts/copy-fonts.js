import { cp, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const root = dirname(require.resolve("@fontsource-variable/inter"));
const monoRoot = dirname(require.resolve("@fontsource-variable/jetbrains-mono"));
const output = join(process.cwd(), "src/assets/fonts");

await mkdir(output, { recursive: true });

const fonts = [
  [join(root, "files/inter-latin-wght-normal.woff2"), join(output, "inter-latin-wght-normal.woff2")],
  [join(monoRoot, "files/jetbrains-mono-latin-wght-normal.woff2"), join(output, "jetbrains-mono-latin-wght-normal.woff2")]
];

for (const [source, destination] of fonts) {
  await cp(source, destination);
  console.log(`Copied ${destination}`);
}