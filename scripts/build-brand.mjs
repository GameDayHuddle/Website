// Rebuilds the site's brand files from the platform's: the all-sports logo of 30 Oct 2026, a
// cheering child on the navy-and-orange shield.
//
// badge.png (237 × 192), icon.png (256 × 256) and apple-icon.png (180 × 180) are copied as they
// are from the Platform repository, which renders them from its master
// (docs/brand/logo-all-sports-2026-10-30.png). og.png, the 1200 × 630 share card, is drawn here:
// the site's navy, the transparent master on the right, and the hero's headline on the left.
//
// It replaced the 23 Aug 2026 script, which drew the Android tablet app's mark.
//
// Run by hand after the logo or the headline changes — it is not part of build, test or CI, and
// it needs sharp, which arrives transitively rather than as a declared dependency:
//
//   node scripts/build-brand.mjs [path to the Platform repository]
//
// The Platform repository defaults to ../GameDayHuddle beside this one. The card's words are set
// in Inter, from the copy the Platform's node_modules carries (expo-dev-menu); without it they
// fall back to Arial.
import { access, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const platform = path.resolve(process.argv[2] ?? path.join(root, "..", "GameDayHuddle"));

const NAVY_990 = "#031129";
const NAVY_975 = "#06193d";
const NAVY_900 = "#0a2150";
const ORANGE = "#f45d0a";
const ON_NAVY = "#c9d3e3";
const WIDTH = 1200;
const HEIGHT = 630;

const exists = (file) => access(file).then(() => true, () => false);

for (const [from, to] of [
  ["apps/web/public/brand/badge.png", "badge.png"],
  ["apps/web/app/icon.png", "icon.png"],
  ["apps/web/app/apple-icon.png", "apple-icon.png"],
]) {
  await copyFile(path.join(platform, from), path.join(publicDir, to));
  console.log(`copied ${to}`);
}

const fontDir = path.join(platform, "node_modules/expo-dev-menu/android/src/debug/res/font");
const bold = path.join(fontDir, "inter_bold.ttf");
const regular = path.join(fontDir, "inter_regular.ttf");
const hasInter = (await exists(bold)) && (await exists(regular));
if (!hasInter) console.warn("Inter not found in the Platform's node_modules; the card falls back to Arial.");

const text = (markup, fontfile, font, spacing) =>
  sharp({
    text: { text: markup, ...(hasInter ? { fontfile } : {}), font: hasInter ? font : font.replace("Inter", "Arial"), rgba: true, dpi: 72, spacing },
  })
    .png()
    .toBuffer({ resolveWithObject: true });

// The hero's background: navy deepening downward, the orange glow top right, faint field lines.
const lines = [];
for (let x = -120; x <= WIDTH + 120; x += 142) {
  lines.push(`<path d="M ${x} 0 L ${x - 78} ${HEIGHT}" stroke="#ffffff" stroke-opacity=".035" stroke-width="2"/>`);
}
const background = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="navy" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${NAVY_990}"/>
      <stop offset=".6" stop-color="${NAVY_975}"/>
      <stop offset="1" stop-color="${NAVY_900}"/>
    </linearGradient>
    <radialGradient id="glow" cx="1000" cy="20" r="560" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ff8030" stop-opacity=".32"/>
      <stop offset="1" stop-color="#ff8030" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="blue" cx="80" cy="640" r="520" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0a56e0" stop-opacity=".24"/>
      <stop offset="1" stop-color="#0a56e0" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#navy)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#blue)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
  ${lines.join("\n  ")}
</svg>`;

const logoHeight = 372;
const logo = await sharp(path.join(platform, "docs/brand/logo-all-sports-transparent.png"))
  .resize({ height: logoHeight })
  .png()
  .toBuffer({ resolveWithObject: true });

const headline = await text(
  `<span foreground="#ffffff">Run your youth\nsports team.</span>\n<span foreground="${ORANGE}">From your phone.</span>`,
  bold,
  "Inter Bold 66",
  -6,
);
const deck = await text(
  `<span foreground="${ON_NAVY}">Registration, messaging, fundraising and\nin-house leagues for every youth sport.</span>`,
  regular,
  "Inter 27",
  6,
);

const left = 72;
const gap = 34;
const blockHeight = headline.info.height + gap + deck.info.height;
const top = Math.round((HEIGHT - blockHeight) / 2);

await sharp(Buffer.from(background))
  .composite([
    { input: logo.data, left: WIDTH - logo.info.width - 58, top: Math.round((HEIGHT - logo.info.height) / 2) },
    { input: headline.data, left, top },
    { input: deck.data, left, top: top + headline.info.height + gap },
  ])
  .png({ compressionLevel: 9 })
  .toFile(path.join(publicDir, "og.png"));
console.log("wrote og.png");
