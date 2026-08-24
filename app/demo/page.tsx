import type { Metadata } from "next";
import { MarketingFooter } from "../components/MarketingFooter";
import { MarketingHeader } from "../components/MarketingHeader";
import { PlayDemo } from "../components/PlayDemo";

export const metadata: Metadata = {
  title: "Live Demo | Run a Game in GameDay Huddle",
  description:
    "The game-day screen itself, running in your browser. Call plays off the sheet, record every snap, read the live analytics, and correct the chains — no install, no account.",
};

export default function DemoPage() {
  return (
    <div className="marketing-page">
      <MarketingHeader />
      <main>
        <section className="subpage-hero section-shell">
          <p className="section-kicker">Live demo</p>
          <h1>
            This is the screen. <em>Run a game on it.</em>
          </h1>
          <p>
            Not a picture of the app and not a walkthrough — the game-day screen rebuilt to run in a
            browser, with the same game bar, the same six tabs, the same two-step call, the same
            result sheet and the same numbers underneath. Nothing to install, no account, no card.
          </p>
        </section>

        <section className="demo-section demo-page-section section-shell" id="demo">
          <PlayDemo />

          <div className="demo-caveats">
            <b>What this demo is not</b>
            <p>
              It is the game-day screen only. The app around it is where a coach builds the playbook
              in Play Maker, sets the depth chart, keeps the roster and the schedule, and reads the
              season the games add up to. On a tablet this screen also runs with no signal at all, and
              a second tablet can record beside it over a direct link. And it never records player
              statistics—team-level only, on purpose.
            </p>
          </div>
        </section>

        <section className="statement section-shell">
          <p className="section-kicker">What you are actually looking at</p>
          <h2>Five things worth noticing.</h2>
          <p className="section-intro">
            The demo is a small game, but it is not a mock-up. It follows the same rules the app
            follows, for the same reasons.
          </p>
          <div className="workflow-grid">
            <article>
              <span>THE LOG IS THE TRUTH</span>
              <b>01</b>
              <h3>Delete something</h3>
              <p>
                Take any entry out of the log on Home and watch the play beneath it re-file itself
                into a different down, a different distance and a different spot. Nothing is counted
                up as it arrives, so a correction is never a second place the numbers can be wrong.
              </p>
            </article>
            <article>
              <span>THE SPOT, NOT THE NUMBER</span>
              <b>02</b>
              <h3>Never type a gain</h3>
              <p>
                You say where the ball ended. The app works out the gain, the loss or the no-gain from
                where it was snapped. Counting yards from a sideline is the entry most likely to be
                wrong; a yard line is the one thing you can read straight off the field.
              </p>
            </article>
            <article>
              <span>THE HOLE IS OURS ALONE</span>
              <b>03</b>
              <h3>Ask only what can be seen</h3>
              <p>
                Our own carry records the hole it hit, drawn across the front between the men who
                block it. Their carry records left, middle or right and nothing finer — nobody can
                call a gap on somebody else&rsquo;s front from a sideline, so the app never asks.
              </p>
            </article>
            <article>
              <span>EVIDENCE, NOT CONFIDENCE</span>
              <b>04</b>
              <h3>Small samples say so</h3>
              <p>
                One carry for twelve yards is labelled <b>Trending</b>, not proof. Every
                &ldquo;best&rdquo; on the analytics tab carries how much is behind it, and Suggest a
                play will tell you plainly when nothing has been called twice yet.
              </p>
            </article>
            <article>
              <span>OVERRIDE BEATS PRECISION</span>
              <b>05</b>
              <h3>Overrule the app</h3>
              <p>
                Tap the down and distance in the bar, or either score. The chains, the scoreboard and
                possession each open a door that overwrites the app&rsquo;s answer with yours — and
                says out loud that it fixes the number, not the plays already recorded.
              </p>
            </article>
          </div>
        </section>

        <section className="about-team section-shell">
          <div className="about-team-card">
            <span className="section-kicker">Ready for a real game</span>
            <h2>The tablet version records the whole game, with or without a signal.</h2>
            <p>
              The same screen, plus the playbook that feeds it, two tablets recording together over a
              direct link, and a season that adds up behind it. Install it straight from this site.
            </p>
            <a className="button" href="/download">
              Get the Android app <span>→</span>
            </a>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
