import type { Metadata } from "next";
import { CheckoutButton } from "../components/CheckoutButton";
import { MarketingFooter } from "../components/MarketingFooter";
import { MarketingHeader } from "../components/MarketingHeader";

export const metadata: Metadata = { title: "Pricing | GameDay Huddle", description: "GameDay Huddle plans: $99 for one team for 5 months, $399 for unlimited teams for 12 months." };

export default function PricingPage() {
  return (
    <div className="marketing-page">
      <MarketingHeader />
      <main>
        <section className="subpage-hero pricing-page-hero section-shell">
          <p className="section-kicker">Pricing</p>
          <h1>One team or an entire program. <em>Start where you are.</em></h1>
          <p>Two plans, two prices, no per-player fees. Pick the one that matches how many teams you run.</p>
        </section>

        <section className="pricing-section section-shell pricing-page-cards">
          <div className="pricing-grid">
            <article className="price-card coach-price">
              <div className="price-top"><span>FOR INDIVIDUAL TEAMS</span><b>Coach</b><p>One head coach and the staff they invite.</p></div>
              <div className="price-value"><strong>$99</strong><span>one team<br />5 months</span></div>
              <ul>
                <li>Complete playbook and call sheets</li>
                <li>Live game-day workflow</li>
                <li>Play Keeper staff connection</li>
                <li>Roster, depth chart, and schedule</li>
                <li>Game and season analytics</li>
              </ul>
              <CheckoutButton plan="coach">Get Coach</CheckoutButton>
              <small>Covers a full season on one team.</small>
            </article>

            <article className="price-card org-price">
              <div className="price-top"><span>FOR CLUBS, LEAGUES &amp; SCHOOLS</span><b>Organization</b><p>Every team in your program, under one plan.</p></div>
              <div className="price-value"><strong>$399</strong><span>unlimited teams<br />12 months</span></div>
              <ul>
                <li>Everything in Coach</li>
                <li>Unlimited teams under one plan</li>
                <li>Central team and billing administration</li>
                <li>Organization player identity</li>
                <li>Rollout and coach onboarding</li>
              </ul>
              <CheckoutButton plan="organization">Get Organization</CheckoutButton>
              <small>One price for the whole program, all year.</small>
            </article>
          </div>
        </section>

        <section className="faq-section section-shell">
          <p className="section-kicker">Common questions</p>
          <h2>Before you start</h2>
          <div className="faq-grid">
            <details>
              <summary>What does the Coach plan cover?</summary>
              <p>One team for five months &mdash; a full season for one head coach and the staff they invite, at $99.</p>
            </details>
            <details>
              <summary>How many teams does the Organization plan include?</summary>
              <p>Unlimited teams for twelve months at $399. One price covers the whole club, league, or school system, however many teams you add.</p>
            </details>
            <details>
              <summary>What happens to my playbook when the term ends?</summary>
              <p>Your playbook and existing game logs remain on your tablet. Paid game-day and team features continue through the end of the term you paid for.</p>
            </details>
            <details>
              <summary>How many staff members can I invite?</summary>
              <p>The Coach plan is built for one head coach and the coaches they invite. The product does not sell per-player seats.</p>
            </details>
            <details>
              <summary>Can I update or cancel online?</summary>
              <p>Yes. The customer portal links securely to Stripe for payment method updates, invoices, and cancellation.</p>
            </details>
            <details>
              <summary>Is there an iPhone version?</summary>
              <p>GameDay Huddle is Android-first today. Join the release list to hear when additional platforms are planned.</p>
            </details>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
