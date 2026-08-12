import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutButton } from "./components/CheckoutButton";
import { LeadForm } from "./components/LeadForm";
import { MarketingFooter } from "./components/MarketingFooter";
import { MarketingHeader } from "./components/MarketingHeader";

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
              <Link className="button" href="#pricing">Start 7 days free <span>→</span></Link>
              <Link className="button button-ghost" href="#workflow">See the game flow</Link>
            </div>
            <div className="hero-notes" aria-label="Product highlights">
              <span>Android 8+</span>
              <span>Offline-first</span>
              <span>No card for trial</span>
            </div>
          </div>

          <div className="hero-visual" aria-label="GameDay Huddle game day dashboard preview">
            <div className="signal-tag"><i /> GAME LIVE</div>
            <div className="device-frame">
              <div className="device-topbar">
                <div className="mini-brand">GD<span>H</span></div>
                <div className="game-title"><b>Riverside vs Northgate</b><small>Week 6 · Home</small></div>
                <div className="score"><b>14</b><span>–</span><b>10</b></div>
              </div>
              <div className="game-grid">
                <div className="situation-card">
                  <span>2ND & 4</span>
                  <strong>OWN 42</strong>
                  <small>Q3 · 08:16</small>
                </div>
                <div className="field-card">
                  <div className="yard-lines" />
                  <div className="play-line route-one" />
                  <div className="play-line route-two" />
                  <div className="play-line route-three" />
                  <div className="line-scrimmage" />
                  <div className="player p1">X</div><div className="player p2">H</div><div className="player p3">Y</div>
                  <div className="player p4">Z</div><div className="player p5 quarterback">Q</div>
                  <div className="field-caption"><small>FORMATION</small><b>Trips Right</b></div>
                </div>
                <div className="decision-card">
                  <div className="decision-label"><span>CALL NEXT</span><span className="sample-pill">ESTABLISHED</span></div>
                  <strong>Power 26</strong>
                  <p>Winning the right side on 2nd & medium.</p>
                  <div className="decision-stats"><span><b>6.8</b> YPP</span><span><b>71%</b> success</span><span><b>7</b> calls</span></div>
                  <button type="button">Call play <span>→</span></button>
                </div>
                <div className="mix-card">
                  <span>PLAY MIX</span>
                  <div><i style={{ width: "62%" }} /><b>62% Run</b></div>
                  <div><i style={{ width: "38%" }} /><b>38% Pass</b></div>
                </div>
              </div>
            </div>
            <div className="float-stat"><small>THIS DRIVE</small><b>8 plays · 54 yards</b><span>4 first downs</span></div>
          </div>
        </section>

        <section className="proof-strip" aria-label="Made for football programs">
          <div className="section-shell proof-inner">
            <p>Made for the way football is actually coached</p>
            <div><span>YOUTH</span><span>MIDDLE SCHOOL</span><span>HIGH SCHOOL</span><span>CLUBS & LEAGUES</span></div>
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
              <Link className="button button-wide button-light" href="#organizations">Talk to our team</Link>
              <small>Annual and season-based agreements available.</small>
            </article>
          </div>
        </section>

        <section className="about-callout section-shell">
          <div className="about-mark"><span>SS</span><i /></div>
          <div><p className="section-kicker">Why GameDay Huddle exists</p><h2>Built around the decision, not the database.</h2></div>
          <div><p>The app started with a simple belief: analytics only help a coach when collecting them doesn’t get in the way of coaching. Every workflow—from spotting the ball to handing results to a Play Keeper—follows that rule.</p><Link href="/about">Read our approach <span>→</span></Link></div>
        </section>

        <section className="final-cta" id="contact">
          <div className="section-shell final-cta-inner">
            <p className="section-kicker">Your next game plan starts here</p>
            <h2>Bring more signal<br />to the sideline.</h2>
            <div><Link className="button" href="/download">Get the Android beta <span>→</span></Link><Link className="text-link" href="/login">Already have an account? Sign in</Link></div>
          </div>
        </section>
      </main>
      <MarketingFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
