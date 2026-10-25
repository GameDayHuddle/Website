import type { Metadata } from "next";
import { DocumentsMock, EquipmentMock, FundraisingMock, MessagingMock, RegistrationMock } from "./components/FeatureMocks";
import { HeroDevices } from "./components/HeroDevices";
import { Icon, type IconName } from "./components/Icon";
import { APP_URL, DEMO_HREF, PRICING_HREF } from "./components/links";
import { MarketingFooter } from "./components/MarketingFooter";
import { MarketingHeader } from "./components/MarketingHeader";

export const metadata: Metadata = {
  title: "GameDay Huddle | Registration, Messaging & Fundraising for Youth Football and Cheer",
  description:
    "Run your youth football and cheer organization in one place: online registration, document management, team messaging, fundraising and equipment. Free for families, with no subscription and no fee on fundraising.",
};

const features: { id: string; icon: IconName; title: string; text: string }[] = [
  { id: "registration", icon: "registration", title: "Registration", text: "Custom forms, age groups by birth date, one family checkout and a card on file — from the parent’s phone." },
  { id: "documents", icon: "documents", title: "Documents", text: "Birth certificates, the parent code of conduct, equipment refund authorizations and more — collected and checked." },
  { id: "messaging", icon: "messaging", title: "Team Messaging", text: "Team chats and club announcements that reach every family, with report, block and moderation built in." },
  { id: "fundraising", icon: "fundraising", title: "Fundraising", text: "Raffles, donations, sponsors and events, with a page for every child to share. No fee from us." },
  { id: "equipment", icon: "equipment", title: "Equipment", text: "Track gear, sizes, assignments and returns — no more spreadsheets." },
];

const sports: { icon: IconName; title: string; text: string }[] = [
  { icon: "football", title: "Tackle football", text: "Age groups set by your league’s birth-date cutoff, divisions and full team rosters." },
  { icon: "flag", title: "Flag football", text: "Flag teams for every age, with their own fees, schedule and team chat." },
  { icon: "cheer", title: "Cheer", text: "Cheer squads with their own age groups, registration, documents and messages." },
];

const spotlights = [
  {
    id: "registration",
    kicker: "Online registration",
    title: "Registration that does the paperwork for you",
    text: "Open your season, set your fees and share one link or QR code. Families register every child in minutes on their phone, and the money lands in your club’s own Stripe account.",
    points: [
      "Children placed in the right age group by birth date",
      "One checkout for brothers and sisters",
      "Promo codes, agreements and a card on file in the same flow",
      "Balances and refunds worked out for each registration",
    ],
    mock: <RegistrationMock />,
  },
  {
    id: "documents",
    kicker: "Document management",
    title: "Every form, in one place",
    text: "Tell families what each program needs and GameDay Huddle collects it — photographed on the phone, signed in the app, checked off by your registrar. Files stay private and open only through short-lived links.",
    points: [
      "Birth certificates, photographed and verified",
      "Parent code of conduct and other club agreements, signed in the app",
      "Equipment refund authorizations, medical releases and more",
      "See at a glance who is still missing what",
    ],
    mock: <DocumentsMock />,
  },
  {
    id: "messaging",
    kicker: "Team messaging",
    title: "Every family hears it the first time",
    text: "Team chats, club announcements and push notifications on every family’s phone — no group texts, no missed parents and no personal numbers handed around.",
    points: [
      "A chat for every team",
      "Announcements to the whole club, one program or one team",
      "Report, block and moderation built in",
      "Coaches reach families without sharing phone numbers",
    ],
    mock: <MessagingMock />,
  },
  {
    id: "fundraising",
    kicker: "Fundraising",
    title: "Raise more, with no fee from us",
    text: "Run raffles, donation drives, sponsorships and ticketed events. Every child gets a page, a QR code and a share link, and GameDay Huddle takes nothing from what your club raises.",
    points: [
      "Raffles and donations paid online",
      "Sponsors shown on your club’s Team page",
      "Tickets for banquets, car washes and other events",
      "A page, QR code and share link for every child",
    ],
    mock: <FundraisingMock />,
  },
  {
    id: "equipment",
    kicker: "Equipment management",
    title: "Know where every helmet is",
    text: "Keep your inventory by item and size, hand gear out to players, and see what is due back when the season ends.",
    points: [
      "Inventory by item, size and quantity",
      "Every player’s sizes on file",
      "Gear assigned to a player in a tap",
      "Returns tracked at the end of the season",
    ],
    mock: <EquipmentMock />,
  },
];

const coaching: { icon: IconName; title: string; text: string }[] = [
  { icon: "playbook", title: "Playbook creation", text: "Draw formations and plays, build call sheets, and share the playbook with your staff." },
  { icon: "analytics", title: "In-game analytics", text: "Call plays from the sideline and watch your team’s tendencies build — run and pass, yards per play, down and distance. Team numbers only, never player statistics." },
  { icon: "calendar", title: "Jamboree scheduling", text: "Host a jamboree with divisions, fields and time slots, invite outside teams, and alert everyone when the schedule changes." },
];

// No price figure and no fee mechanics on a public page — Doug's ruling of 4 Oct 2026, because
// the price could change. The same lines the store listings use.
const pricing = [
  "Nothing is ever added to a family’s bill",
  "No subscription, no setup fee, no contract",
  "No paid add-ons — every feature is included",
  "No fee on fundraising",
  "Coaching tools included free when they arrive",
];

const steps = [
  { title: "Set up your club", text: "Add your programs, age groups, fees and documents, and connect your club’s Stripe account." },
  { title: "Open registration", text: "Share your registration link or QR code. Families sign up and pay on their phones." },
  { title: "Run the season", text: "Message teams, collect forms, hand out equipment and launch fundraisers — all from one place." },
];

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "GameDay Huddle",
    applicationCategory: "SportsApplication",
    operatingSystem: "iOS, Android, Web",
    description:
      "Registration, document management, team messaging, fundraising and equipment management for youth football and cheer organizations.",
  };

  return (
    <div className="marketing-page">
      <MarketingHeader />
      <main>
        <section className="hero">
          <div className="hero-inner section-shell">
            <h1>
              Run your football organization. <em>Not ten different apps.</em>
            </h1>
            <div className="hero-copy">
              <p className="hero-deck">
                Registration, documents, team messaging, fundraising and equipment — all in one place for youth
                football and cheer.
              </p>
              <div className="hero-actions">
                <a className="button" href={DEMO_HREF}>Book a Demo <Icon name="arrow" strokeWidth={2.2} /></a>
                <a className="button button-outline" href="#platform">Explore the Platform</a>
              </div>
              <p className="hero-note"><Icon name="team" /> Built for youth tackle, flag and cheer</p>
            </div>
            <HeroDevices />
          </div>
        </section>

        <section className="features section-shell" id="platform" aria-labelledby="platform-title">
          <p className="kicker">All-in-one organization management</p>
          <h2 id="platform-title">Everything your program needs to run smoothly</h2>
          <p className="section-intro">
            GameDay Huddle takes care of the season&rsquo;s paperwork, payments and messages, so your volunteers can
            spend their time on the kids.
          </p>
          <div className="feature-grid">
            {features.map((feature) => (
              <a className="feature-card" href={`#${feature.id}`} key={feature.id}>
                <Icon name={feature.icon} className="feature-icon" strokeWidth={1.6} />
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
                <Icon name="arrow" className="feature-arrow" strokeWidth={2.2} />
              </a>
            ))}
          </div>
        </section>

        <section className="sports" id="sports" aria-labelledby="sports-title">
          <div className="section-shell">
            <p className="kicker">Football and cheer</p>
            <h2 id="sports-title">One club. Tackle, flag and cheer.</h2>
            <p className="section-intro">
              Run every program your club offers under one roof, and let families register each child for the right
              team in a single checkout.
            </p>
            <div className="sport-grid">
              {sports.map((sport) => (
                <article className="sport-card" key={sport.title}>
                  <span className="icon-circle"><Icon name={sport.icon} strokeWidth={2} /></span>
                  <h3>{sport.title}</h3>
                  <p>{sport.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {spotlights.map((spotlight, index) => (
          <section
            className={index % 2 ? "spotlight section-shell is-flipped" : "spotlight section-shell"}
            id={spotlight.id}
            key={spotlight.id}
            aria-labelledby={`${spotlight.id}-title`}
          >
            <div className="spotlight-copy">
              <p className="kicker">{spotlight.kicker}</p>
              <h2 id={`${spotlight.id}-title`}>{spotlight.title}</h2>
              <p>{spotlight.text}</p>
              <ul className="check-list">
                {spotlight.points.map((point) => (
                  <li key={point}><Icon name="check" strokeWidth={2.4} />{point}</li>
                ))}
              </ul>
            </div>
            {spotlight.mock}
          </section>
        ))}

        <section className="coaching" id="coaching" aria-labelledby="coaching-title">
          <div className="section-shell">
            <p className="kicker kicker-light">Coaching tools</p>
            <h2 id="coaching-title">And for the coaches — <em>free, and coming soon</em></h2>
            <p className="section-intro">
              The football layer is on its way inside the same app at no extra cost: build the playbook, call the game
              and plan the jamboree.
            </p>
            <div className="coaching-grid">
              {coaching.map((item) => (
                <article className="coaching-card" key={item.title}>
                  <span className="soon">Coming soon · free</span>
                  <span className="icon-circle"><Icon name={item.icon} strokeWidth={2} /></span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pricing section-shell" id="pricing" aria-labelledby="pricing-title">
          <div className="pricing-copy">
            <p className="kicker">Pricing</p>
            <h2 id="pricing-title">One simple price. Everything included.</h2>
            <p>
              No tiers, no add-ons and no surprises. Tell us about your club and we&rsquo;ll give you your price.
            </p>
          </div>
          <div className="price-card">
            <p className="price"><b>Free</b><span>for families</span></p>
            <ul className="check-list">
              {pricing.map((line) => (
                <li key={line}><Icon name="check" strokeWidth={2.4} />{line}</li>
              ))}
            </ul>
            <p className="price-note">
              Payments run through your club&rsquo;s own Stripe account; Stripe&rsquo;s standard card processing fees
              apply.
            </p>
            <a className="button button-wide" href={PRICING_HREF}>Get your club&rsquo;s price <Icon name="arrow" strokeWidth={2.2} /></a>
          </div>
        </section>

        <section className="steps-section" id="how-it-works" aria-labelledby="steps-title">
          <div className="section-shell">
            <p className="kicker">For organizations</p>
            <h2 id="steps-title">Set up once. Run the whole season.</h2>
            <ol className="steps">
              {steps.map((step, index) => (
                <li key={step.title}>
                  <span className="step-number">{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
            <p className="steps-note">
              <Icon name="shield" /> Everyone sees only what their role needs — from the club president to the coaches,
              on the web and on their phone.
            </p>
          </div>
        </section>

        <section className="cta section-shell" aria-labelledby="cta-title">
          <div>
            <h2 id="cta-title">Bring your whole club into one huddle.</h2>
            <p>Tell us about your club and we&rsquo;ll walk you through it.</p>
          </div>
          <div className="cta-actions">
            <a className="button" href={DEMO_HREF}>Book a Demo <Icon name="arrow" strokeWidth={2.2} /></a>
            <a className="button button-outline" href={APP_URL}>Sign In</a>
          </div>
        </section>
      </main>
      <MarketingFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
