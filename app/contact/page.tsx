import type { Metadata } from "next";
import { ContactForm } from "../components/ContactForm";
import { MarketingFooter } from "../components/MarketingFooter";
import { MarketingHeader } from "../components/MarketingHeader";

export const metadata: Metadata = { title: "Contact | GameDay Huddle", description: "Talk to us about setting up an organization for a youth football club or league, or ask anything about GameDay Huddle." };

export default function ContactPage() {
  return <div className="marketing-page"><MarketingHeader /><main>
    <section className="subpage-hero section-shell"><p className="section-kicker">Contact</p><h1>Organizations start <em>with a conversation.</em></h1><p>Tell us how many teams you run and we will set your organization up with you. Coaching one team? You do not need us for that &mdash; sign yourself up and start building.</p></section>
    <section className="contact-section section-shell">
      <div className="contact-aside">
        <h2>Running a program</h2>
        <p>An organization covers every team in a youth club or league. We set those up directly with you, so the teams and the coaches are arranged before your season starts.</p>
        <h2>Coaching one team</h2>
        <p>Nothing here has to happen first. <a href="/signup">Create your account</a>, <a href="/download">download the app</a>, and start building your playbook.</p>
        <h2>Rather use your own email?</h2>
        <p>Write to <a href="mailto:Doug@GameDayHuddle.com">Doug@GameDayHuddle.com</a>. Everything sent from this page reaches the same place.</p>
      </div>
      <ContactForm />
    </section>
  </main><MarketingFooter /></div>;
}
