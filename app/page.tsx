import type { Metadata } from "next";
import { CheckoutButton } from "./components/CheckoutButton";
import { LeadForm } from "./components/LeadForm";
import { MarketingFooter } from "./components/MarketingFooter";
import { MarketingHeader } from "./components/MarketingHeader";
import { PlayDemo } from "./components/PlayDemo";
import { ProductScreens } from "./components/ProductScreens";

export const metadata: Metadata = {
  title: "GameDay Huddle | Football Playbook, Game Day & Team Analytics",
  description:
    "Build your football playbook, call plays faster, coordinate staff, and turn every snap into usable team analytics with GameDay Huddle for Android.",
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "GameDay Huddle",
    applicationCategory: "SportsApplication",
    operatingSystem: "Android",
    description:
      "Football coaching software for playbooks, game-day play calling, staff collaboration, and team analytics.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "7-day trial" },
  };

  return (
    <div className="marketing-page">
      <MarketingHeader />
      <main>
        <section className="hero section-shell">
          <div className="hero-copy">
            <p className="eyebrow"><span /> The sideline operating system</p>
            <h1>Build the playbook.<br /><em>Call it on game day.</em></h1>
            <p className="hero-deck">
              GameDay Huddle turns your football plan into a live decision tool—so your staff can call, record, and learn from every snap without losing the game to a spreadsheet.
            </p>
            <div className="hero-actions">
              <a className="button" href="#pricing">Start 7 days free <span>→</span></a>
              <a className="button button-ghost" href="#product-tour">See the game flow</a>
            </div>
            <div className="hero-notes" aria-label="Product highlights">
              <span>Android 8+</span>
              <span>Offline-first</span>
              <span>No card for trial</span>
            </div>
          </div>

          <ProductScreens />
        </section>

        <section className="proof-strip" aria-label="Made for football programs">
          <div className="section-shell proof-inner">
            <p>Made for the way football is actually coached</p>
            <div><span>YOUTH</span><span>MIDDLE SCHOOL</span><span>HIGH SCHOOL</span><span>CLUBS & LEAGUES</span></div>
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

        <section className="org-section" id="organizations">
          <div className="section-shell org-grid">
            <div>
              <p className="section-kicker">For clubs, leagues & school systems</p>
              <h2>One standard.<br />Every team.</h2>
              <p className="org-lead">Give every coach the same game-day foundation without flattening how each team coaches.</p>
              <div className="org-benefits">
                <div><b>Team autonomy</b><span>Each staff owns its playbook, roster, and game data.</span></div>
                <div><b>Organization visibility</b><span>Central billing, team status, onboarding, and support.</span></div>
                <div><b>Player continuity</b><span>Organization-level player IDs can connect seasons and teams.</span></div>
                <div><b>Human rollout</b><span>Built-in staff onboarding and priority account support.</span></div>
              </div>
            </div>
            <div className="org-form-card">
              <span className="form-chip">ORGANIZATION ACCESS</span>
              <h3>Bring GameDay Huddle to your program.</h3>
              <p>Tell us how many teams you support. We’ll map the right rollout and pricing with you.</p>
              <LeadForm organization />
            </div>
          </div>
        </section>

        <section className="pricing-section section-shell" id="pricing">
          <div className="pricing-heading">
            <p className="section-kicker">Simple paths for every program</p>
            <h2>Start with one team.<br />Scale when you are ready.</h2>
          </div>
          <div className="pricing-grid">
            <article className="price-card coach-price">
              <div className="price-top"><span>FOR INDIVIDUAL TEAMS</span><b>Coach</b><p>One head coach and the staff they invite.</p></div>
              <div className="price-value"><strong>7 days</strong><span>full access<br />no card required</span></div>
              <ul><li>Playbook and call sheets</li><li>Game-day calling and recording</li><li>Play Keeper staff connection</li><li>Roster, depth chart, and schedule</li><li>Game and season analytics</li></ul>
              <CheckoutButton plan="coach_monthly">Start free trial</CheckoutButton>
              <small>Launch pricing is finalized before your first charge.</small>
            </article>
            <article className="price-card org-price">
              <div className="price-top"><span>FOR MULTI-TEAM PROGRAMS</span><b>Organization</b><p>A flexible program plan built around your team count.</p></div>
              <div className="org-price-word">Let’s build it <span>together.</span></div>
              <ul><li>Everything in Coach</li><li>Central team and subscription management</li><li>Organization player identity</li><li>Rollout and coach onboarding</li><li>Priority account support</li></ul>
              <a className="button button-wide button-light" href="#organizations">Talk to our team</a>
              <small>Annual and season-based agreements available.</small>
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
