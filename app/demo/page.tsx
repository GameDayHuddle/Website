import type { Metadata } from "next";
import { MarketingFooter } from "../components/MarketingFooter";
import { MarketingHeader } from "../components/MarketingHeader";
import { PlayDemo } from "../components/PlayDemo";

export const metadata: Metadata = {
  title: "Live Demo | Record a Drive in GameDay Huddle",
  description:
    "Call a play, record where the ball ended, and watch GameDay Huddle derive the down, the distance and every number on the panel. No install, no account.",
};

export default function DemoPage() {
  return (
    <div className="marketing-page">
      <MarketingHeader />
      <main>
        <section className="subpage-hero section-shell">
          <p className="section-kicker">Live demo</p>
          <h1>
            Call a play. <em>See what the app does with it.</em>
          </h1>
          <p>
            This is the game-day screen, running in your browser. Nothing to install, no account, no
            card. Call a play off the sample playbook, say where the ball ended, and every number
            beside it works itself out from the entries you made.
          </p>
        </section>

        <section className="demo-section demo-page-section section-shell" id="demo">
          <PlayDemo />

          <div className="demo-caveats">
            <b>What this demo is not</b>
            <p>
              It records our own offense against a sample opponent, on a sample playbook. The real app
              also records the defensive series, special teams, penalties and the try after a
              touchdown, and it corrects the chains, the score and possession behind confirm-first
              doors. It runs a game with no signal, on a tablet, with a second tablet recording beside
              it. And it never records player statistics—team-level only, on purpose.
            </p>
          </div>
        </section>

        <section className="statement section-shell">
          <p className="section-kicker">What you are actually looking at</p>
          <h2>Three things worth noticing.</h2>
          <p className="section-intro">
            The demo is small, but it is not a mock-up. It follows the same rules the app follows, for
            the same reasons.
          </p>
          <div className="workflow-grid">
            <article>
              <span>THE LOG IS THE TRUTH</span>
              <b>01</b>
              <h3>Delete something</h3>
              <p>
                Take any entry out of the log and watch the play beneath it re-file itself into a
                different down and distance. Nothing is counted up as it arrives, so a correction is
                never a second place the numbers can be wrong.
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
              <span>EVIDENCE, NOT CONFIDENCE</span>
              <b>03</b>
              <h3>Small samples say so</h3>
              <p>
                One carry for twelve yards is labelled Trending, not proof. Every &ldquo;best&rdquo;
                the app shows carries how much is behind it, because a number that hides its sample
                size is a number that will get somebody beaten on Friday.
              </p>
            </article>
          </div>
        </section>

        <section className="about-team section-shell">
          <div className="about-team-card">
            <span className="section-kicker">Ready for a real game</span>
            <h2>The tablet version records the whole game, with or without a signal.</h2>
            <p>
              Offense and defense, special teams, penalties, two tablets recording together over a
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
