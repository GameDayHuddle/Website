// Regenerates every brand asset in public/ from the geometry below.
//
// The geometry is a straight port of the Android app's launcher icon
// (app/src/main/res/drawable/ic_launcher_foreground.xml in the GameDayHuddle
// Android repo), on its 108dp grid and in its navy and grass green, so the mark
// a coach taps on a home screen and the mark at the top of this site are the
// same drawing. Port any change to the mark in both places.
//
// It replaced the website's old artwork on 23 Aug 2026. That one still carried
// the "SS" monogram of Sideline Sense, the app's first name; the app had
// already dropped it. See PROJECT-NOTES.md, "The name, and the logo it came
// from".
//
// Run by hand after changing the artwork -- it is not part of build, test, or
// CI, and it needs sharp, which arrives transitively rather than as a declared
// dependency:  node scripts/build-brand.mjs
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public");

const NAVY = "#12284b";
const GREEN = "#3aa935";
const WHITE = "#ffffff";

// The mark on the 108-unit icon grid: the football's upper-left crescent with
// its laces, a route breaking upfield to an arrow, and the numbers going up.
// Its ink runs x 25-83, y 37.9-69.2.
const mark = `  <path fill="${WHITE}" d="M27.9,64 C28.4,48.8 39.8,37.9 54,37.9 C65.4,37.9 73.5,41.5 78.7,48.8 C73.5,44.5 64.5,40.5 54,40.5 C41.2,40.5 32.5,49.3 32.2,64 Z"/>
  <g stroke="${WHITE}" stroke-width="1.8" stroke-linecap="round">
    <path d="M48.8,38 L48.8,44.7"/>
    <path d="M53,38 L53,44.7"/>
    <path d="M57.3,38 L57.3,44.7"/>
    <path d="M61.6,38 L61.6,44.7"/>
  </g>
  <path fill="${GREEN}" fill-rule="evenodd" d="M29.3,62.5 a4.3,4.3 0 1,0 0,8.6 a4.3,4.3 0 1,0 0,-8.6 Z M29.3,64.7 a2.1,2.1 0 1,0 0,4.2 a2.1,2.1 0 1,0 0,-4.2 Z"/>
  <path fill="none" stroke="${GREEN}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" d="M33.6,66.4 L54,66.4 L63,58.3"/>
  <path fill="${GREEN}" d="M66.4,56 L65.3,60 L61.4,56.1 Z"/>
  <g fill="${GREEN}">
    <path d="M68.2,61.6 h3.8 v7.6 h-3.8 z"/>
    <path d="M74,56.4 h3.8 v12.8 h-3.8 z"/>
    <path d="M79.2,49.3 h3.8 v19.9 h-3.8 z"/>
  </g>`;

// Cropped to the 72dp an adaptive icon's mask actually shows, so the tile here
// frames the mark the way a launcher does rather than including its safe zone.
const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="18 18 72 72" width="512" height="512" role="img" aria-label="GameDay Huddle">
  <rect x="18" y="18" width="72" height="72" rx="16" fill="${NAVY}"/>
${mark}
</svg>
`;

// Places the mark's ink at (x, y) scaled so it spans `width`.
const placeMark = (x, y, width) => {
  const scale = width / 58;
  return `  <g transform="translate(${(x - 25 * scale).toFixed(2)} ${(y - 37.9 * scale).toFixed(2)}) scale(${scale.toFixed(4)})">
${mark}
  </g>`;
};

// The wordmark is set in the platform grotesque rather than traced to outlines,
// so the lockup stays a text file anyone can edit. Rasterised assets bake it in.
// Arial Bold sets "GameDay Huddle" 7.95em wide at this tracking.
const wordmark = (size, x, y) =>
  `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="700" letter-spacing="-2" fill="${WHITE}">GameDay <tspan fill="${GREEN}">Huddle</tspan></text>`;

const lockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1560 480" width="1560" height="480" role="img" aria-label="GameDay Huddle">
  <rect width="1560" height="480" rx="56" fill="${NAVY}"/>
${placeMark(90, 132, 400)}
  ${wordmark(118, 550, 290)}
</svg>
`;

// Social card. The yard lines are the field the app is used on.
const yardLines = () => {
  const parts = [];
  for (let x = 100; x <= 1100; x += 100) {
    parts.push(`<path d="M ${x} 0 V 630" stroke="${WHITE}" stroke-opacity=".05" stroke-width="2"/>`);
  }
  return parts.join("\n    ");
};

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <rect width="1200" height="630" fill="${NAVY}"/>
  <g>
    ${yardLines()}
  </g>
  <rect width="1200" height="8" fill="${GREEN}"/>
${placeMark(102, 197, 267)}
  ${wordmark(88, 424, 300)}
  <path d="M 428 342 H 598" stroke="${GREEN}" stroke-width="9" stroke-linecap="round"/>
  <text x="424" y="424" font-family="Arial, Helvetica, sans-serif" font-size="44" fill="#c8d6ea">Build the playbook.</text>
  <text x="424" y="484" font-family="Arial, Helvetica, sans-serif" font-size="44" fill="#c8d6ea">Call it on game day.</text>
  <text x="96" y="566" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" letter-spacing="4" fill="#8298bb">ANDROID &#183; OFFLINE ON GAME DAY &#183; GAMEDAYHUDDLE.COM</text>
</svg>
`;

for (const [name, contents] of [["logo-mark.svg", markSvg], ["favicon.svg", markSvg], ["logo-lockup.svg", lockupSvg]]) {
  await writeFile(path.join(publicDir, name), contents, "utf8");
  console.log(`wrote ${name}`);
}

await sharp(Buffer.from(markSvg)).resize(512, 512).png({ compressionLevel: 9 }).toFile(path.join(publicDir, "app-icon.png"));
console.log("wrote app-icon.png");

await sharp(Buffer.from(ogSvg)).png({ compressionLevel: 9 }).toFile(path.join(publicDir, "og.png"));
console.log("wrote og.png");
