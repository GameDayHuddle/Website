import type { Metadata } from "next";
import { DemoForm } from "../components/DemoForm";
import { MarketingFooter } from "../components/MarketingFooter";
import { MarketingHeader } from "../components/MarketingHeader";

export const metadata: Metadata = {
  // The layout's template adds " | GameDay Huddle".
  title: "Book a Demo",
  description: "Tell us about your team and we’ll show you GameDay Huddle.",
};

export default function BookADemo() {
  return (
    <div className="marketing-page">
      <MarketingHeader />
      <main>
        <section className="demo section-shell" aria-labelledby="demo-title">
          <div className="demo-copy">
            <p className="kicker">Book a demo</p>
            <h1 id="demo-title">Tell us about your team.</h1>
          </div>
          <DemoForm />
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
