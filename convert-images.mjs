import sharp from "sharp";
import { readdirSync, statSync, existsSync } from "fs";
import { join, extname, basename } from "path";

const ASSETS = "./public/assets";

async function convert(src, dest, options = {}) {
  const quality = options.quality ?? 82;
  await sharp(src)
    .webp({ quality, effort: 6 })
    .toFile(dest);
  const before = statSync(src).size;
  const after = statSync(dest).size;
  console.log(`${basename(src)} → ${basename(dest)} | ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB (-${Math.round((1-after/before)*100)}%)`);
}

const files = [
  { src: `${ASSETS}/giovanne-portrait.png`,        dest: `${ASSETS}/giovanne-portrait.webp`,        q: 80 },
  { src: `${ASSETS}/giovanne-portrait-mobile.png`, dest: `${ASSETS}/giovanne-portrait-mobile.webp`, q: 78 },
  { src: `${ASSETS}/logo.png`,                     dest: `${ASSETS}/logo.webp`,                     q: 90 },
  { src: "./uploads/proposta-hero.png",            dest: `${ASSETS}/proposta-hero.webp`,            q: 86 },
  { src: `${ASSETS}/portfolio/bettina-rudolph.png`,  dest: `${ASSETS}/portfolio/bettina-rudolph.webp`,  q: 82 },
  { src: `${ASSETS}/portfolio/eduarda-costa.png`,    dest: `${ASSETS}/portfolio/eduarda-costa.webp`,    q: 82 },
  { src: `${ASSETS}/portfolio/juliane-marrone.png`,  dest: `${ASSETS}/portfolio/juliane-marrone.webp`,  q: 82 },
];

// Client images
const clients = readdirSync(`${ASSETS}/clients`);
for (const f of clients) {
  const ext = extname(f).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg" || ext === ".png") {
    const src = `${ASSETS}/clients/${f}`;
    const dest = `${ASSETS}/clients/${basename(f, ext)}.webp`;
    if (!existsSync(dest)) {
      files.push({ src, dest, q: 80 });
    }
  }
}

for (const { src, dest, q } of files) {
  if (!existsSync(src)) { console.log("SKIP (not found):", src); continue; }
  await convert(src, dest, { quality: q });
}
console.log("Done.");
