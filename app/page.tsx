import type { Metadata } from "next";
import { CheckoutButton } from "./components/CheckoutButton";
import { MarketingFooter } from "./components/MarketingFooter";
import { MarketingHeader } from "./components/MarketingHeader";
import { PlayDemo } from "./components/PlayDemo";
import { ProductScreens } from "./components/ProductScreens";

export const metadata: Metadata = {
  title: "GameDay Huddle | Youth Football Playbook, Game Day & Team Analytics",
  description:
    "Built for youth football. Create your playbook, call plays faster, coordinate staff, and turn every snap into usable team analytics with GameDay Huddle for Android.",
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "GameDay Huddle",
    applicationCategory: "SportsApplication",
    operatingSystem: "Android",
    description:
      "Youth football coaching software for playbooks, game-day play calling, staff collaboration, and team analytics.",
    offers: [
      { "@type": "Offer", name: "Coach", price: "99", priceCurrency: "USD", description: "One team, 5 months" },
      { "@type": "Offer", name: "Organization", price: "399", priceCurrency: "USD", description: "Unlimited teams, 12 months" },
    ],
  };

  return (
    <div className="marketing-page">
      <MarketingHeader />
      <main>
        <section className="hero section-shell">
          <div className="hero-copy">
            <p className="eyebrow"><span /> The sideline operating system for youth football</p>
            <h1>Build the playbook.<br /><em>Call it on game day.</em></h1>
            <p className="hero-deck">
              GameDay Huddle is built for youth football and nothing else—so a volunteer staff can call, record, and learn from every snap without losing the game to a spreadsheet.
            </p>
            <div className="hero-actions">
              <a className="button" href="#pricing">See pricing <span>→</span></a>
              <a className="button button-ghost" href="#product-tour">See the game flow</a>
            </div>
            <div className="hero-notes" aria-label="Product highlights">
              <span>Android 8+</span>
              <span>Offline-first</span>
              <span>One flat price</span>
            </div>
          </div>

          <ProductScreens />
        </section>

        <section className="proof-strip" aria-label="Made for youth football">
          <div className="section-shell proof-inner">
            <p>Made for the way youth football is actually coached</p>
            <div><span>YOUTH TEAMS</span><span>YOUTH LEAGUES</span><span>CLUBS</span><span>VOLUNTEER STAFFS</span></div>
          </div>
        </section>

        <section className="product-tour section-shell" id="product-tour" aria-labelledby="product-tour-title">
          <div className="product-tour-copy">
            <p className="section-kicker">45-second product tour</p>
            <h2 id="product-tour-title">See the whole week in one huddle.</h2>
            <p id="product-tour-summary">
              Watch how coaches move from building a playbook to calling the game, keeping staff connected, and learning from every snap. The tour uses real GameDay Huddle screens and works with the sound off.
            </p>
            <div className="product-tour-points" aria-label="Product tour topics">
              <span>Plan</span><span>Call</span><span>Coordinate</span><span>Learn</span>
            </div>
          </div>
          <div className="product-tour-media">
            <video
              controls
              playsInline
              preload="metadata"
              poster="/media/gameday-huddle-product-overview-poster.jpg"
              aria-describedby="product-tour-summary"
            >
              <source src="/media/gameday-huddle-product-overview.mp4" type="video/mp4" />
              <track kind="captions" src="/media/gameday-huddle-product-overview-en.vtt" srcLang="en" label="English" />
              Your browser does not support embedded video. <a href="/media/gameday-huddle-product-overview.mp4">Download the GameDay Huddle product tour</a>.
            </video>
            <div className="product-tour-meta"><span>45 SEC</span><span>REAL APP SCREENS</span><span>WORKS MUTED</span></div>
          </div>
        </section>

        <section className="statement section-shell" id="workflow">
          <p className="section-kicker">From install to insight</p>
          <h2>Your week is one connected system.</h2>
          <p className="section-intro">Build on Tuesday. Call on Friday. Review on Saturday. GameDay Huddle keeps the plan and the proof in the same place.</p>
          <div className="workflow-grid">
            <article><span>PLAN</span><b>01</b><h3>Build what you coach</h3><p>Create formations, draw routes, set designed gaps, organize call sheets, and build the roster around your system.</p></article>
            <article><span>CALL</span><b>02</b><h3>Move at game speed</h3><p>Go from situation to formation to play in taps—not menus. Record the ending spot and let the app do the math.</p></article>
            <article><span>LEARN</span><b>03</b><h3>Know what travels</h3><p>Every correction recalculates the numbers. See the plays, gaps, situations, and tendencies that deserve the next rep.</p></article>
          </div>
        </section>

        <section className="demo-section section-shell" id="demo">
          <div className="demo-lede">
            <div>
              <p className="section-kicker">Try it right here</p>
              <h2>Record a drive.<br /><em>Watch the numbers move.</em></h2>
            </div>
            <div>
              <p>
                This is the game-day screen, playable in your browser. Call a play, say where the ball
                ended, and the app derives the rest—gain, down, distance, and every number on the panel.
                Nothing is counted up as it arrives. Delete an entry and the whole game re-derives around
                the hole it leaves.
              </p>
            </div>
          </div>

          <PlayDemo />

          <div className="demo-caveats">
            <b>What this demo is not</b>
            <p>
              It records our own offense against a sample opponent, on a sample playbook. The real app
              also records the defensive series, special teams, penalties and the try after a touchdown,
              and it corrects the chains, the score and possession behind confirm-first doors. It runs
              a game with no signal, on a tablet, with a second tablet recording beside it. And it never
              records player statistics—team-level only, on purpose.
            </p>
          </div>
        </section>

        <section className="offline-section section-shell">
          <div className="offline-copy">
            <p className="section-kicker">Built for the worst signal of the week</p>
            <h2>Your signal can drop.<br />Your game cannot.</h2>
            <p>GameDay Huddle keeps the playbook and game log on the tablet. Calls and results continue locally, and connected staff devices recover without making your sideline wait.</p>
            <ul>
              <li><span>✓</span> Complete playbook stays available offline</li>
              <li><span>✓</span> Game results save on the device immediately</li>
              <li><span>✓</span> Clear connection state—never silent stale data</li>
            </ul>
          </div>
          <div className="offline-visual" aria-hidden="true">
            <div className="tablet tablet-back"><span>PLAY KEEPER</span><b>Result saved</b><i>OFFLINE QUEUE · 1</i></div>
            <div className="tablet tablet-front"><span>HEAD COACH</span><b>Ready for the next call</b><div className="sync-line"><i /><i /><i /></div></div>
            <div className="offline-badge">LOCAL FIRST <small>Your football stays yours.</small></div>
          </div>
        </section>

        <section className="pricing-section section-shell" id="pricing">
          <div className="pricing-heading">
            <p className="section-kicker">Simple paths for every program</p>
            <h2>One team or<br />the whole organization.</h2>
          </div>
          <div className="pricing-grid">
            <article className="price-card coach-price">
              <div className="price-top"><span>FOR INDIVIDUAL TEAMS</span><b>Coach</b><p>One head coach and the staff they invite.</p></div>
              <div className="price-value"><strong>$99</strong><span>one team<br />5 months</span></div>
              <ul><li>Playbook and call sheets</li><li>Game-day calling and recording</li><li>Play Keeper staff connection</li><li>Roster, depth chart, and schedule</li><li>Game and season analytics</li></ul>
              <CheckoutButton plan="coach">Get Coach</CheckoutButton>
              <small>Covers a full season on one team.</small>
            </article>
            <article className="price-card org-price">
              <div className="price-top"><span>FOR MULTI-TEAM PROGRAMS</span><b>Organization</b><p>Every team in your youth club or league.</p></div>
              <div className="price-value"><strong>$399</strong><span>unlimited teams<br />12 months</span></div>
              <ul><li>Everything in Coach</li><li>Unlimited teams under one plan</li><li>Central team and billing administration</li><li>Organization player identity</li><li>Rollout and coach onboarding</li></ul>
              <a className="button button-wide button-light" href="/contact?topic=organization">Contact us</a>
              <small>Organization plans are set up directly with us.</small>
            </article>
          </div>
        </section>

        <section className="about-callout section-shell">
          <div className="about-mark"><span>SS</span><i /></div>
          <div><p className="section-kicker">Why GameDay Huddle exists</p><h2>Built around the decision, not the database.</h2></div>
          <div><p>The app started with a simple belief: analytics only help a coach when collecting them doesn’t get in the way of coaching. Every workflow—from spotting the ball to handing results to a Play Keeper—follows that rule.</p><a href="/about">Read our approach <span>→</span></a></div>
        </section>

        <section className="final-cta" id="contact">
          <div className="section-shell final-cta-inner">
            <p className="section-kicker">Your next game plan starts here</p>
            <h2>Bring more signal<br />to the sideline.</h2>
            <div><a className="button" href="/download">Get the Android app <span>→</span></a><a className="text-link" href="/signup">Create your account</a></div>
          </div>
        </section>
      </main>
      <MarketingFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
