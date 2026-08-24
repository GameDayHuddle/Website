// The sign-up hero's right-hand half. Everything here is decoration: it carries
// no information the copy does not, so the whole block is hidden from assistive
// technology and dropped outright on narrow screens.
//
// It is drawn rather than photographed on purpose. A helmet under stadium light
// is a silhouette and a rim — the two things a photograph of one reduces to —
// so a path and a gradient say it without putting a stock photo of somebody
// else's team on the page that asks a coach to sign up.
export function SignupHeroArt() {
  return (
    <div className="signup-hero-art" aria-hidden="true">
      <span className="signup-hero-lines" />
      <span className="signup-hero-lamp signup-hero-lamp-a" />
      <span className="signup-hero-lamp signup-hero-lamp-b" />
      <svg className="signup-hero-helmet" viewBox="128 112 448 348" preserveAspectRatio="xMidYMid meet" fill="none">
        <defs>
          <linearGradient id="gdh-helmet-face" x1="0.15" y1="0" x2="0.9" y2="1">
            <stop offset="0" stopColor="#1b1f26" />
            <stop offset="0.55" stopColor="#0d0f13" />
            <stop offset="1" stopColor="#07080a" />
          </linearGradient>
          <linearGradient id="gdh-helmet-rim" x1="0.1" y1="1" x2="0.85" y2="0">
            <stop offset="0" stopColor="#c7f04a" stopOpacity="0" />
            <stop offset="0.4" stopColor="#c7f04a" stopOpacity="0.75" />
            <stop offset="0.78" stopColor="#eaf7c0" stopOpacity="0.95" />
            <stop offset="1" stopColor="#c7f04a" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="gdh-helmet-mask" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7d8590" />
            <stop offset="1" stopColor="#31363e" />
          </linearGradient>
        </defs>

        <path
          className="gdh-helmet-shell"
          fill="url(#gdh-helmet-face)"
          d="M470 252C464 186 396 132 306 132C216 132 152 184 146 264C141 328 152 386 178 418C188 431 202 438 218 438H372C400 438 420 417 423 388L426 352C394 348 376 326 376 296C376 268 396 252 424 252Z"
        />
        <circle className="gdh-helmet-ear" cx="252" cy="322" r="31" />
        <circle className="gdh-helmet-ear-ring" cx="252" cy="322" r="31" />

        <g className="gdh-helmet-mask" stroke="url(#gdh-helmet-mask)" strokeWidth="7" strokeLinecap="round">
          <path d="M464 258C506 268 532 284 542 306" />
          <path d="M430 308C480 310 522 328 540 352" />
          <path d="M426 360C466 364 502 376 520 394" />
          <path d="M543 300C553 330 550 366 524 398" />
        </g>

        <path
          className="gdh-helmet-rim"
          stroke="url(#gdh-helmet-rim)"
          strokeWidth="4"
          strokeLinecap="round"
          d="M147 268C155 186 220 132 306 132C396 132 462 188 470 252"
        />
      </svg>
      <span className="signup-hero-fade" />
    </div>
  );
}
