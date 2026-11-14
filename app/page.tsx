import type { Metadata } from "next";
import { ClubMock, FundraisingMock, LeagueMock, MessagingMock, RegistrationMock } from "./components/FeatureMocks";
import { HeroDevices } from "./components/HeroDevices";
import { Icon, type IconName } from "./components/Icon";
import { APP_URL, DEMO_HREF } from "./components/links";
import { MarketingFooter } from "./components/MarketingFooter";
import { MarketingHeader } from "./components/MarketingHeader";
import { sportNames } from "./components/sports";

export const metadata: Metadata = {
  // The layout's template adds " | GameDay Huddle".
  title: "Registration, Messaging & Fundraising for Youth Sports Clubs",
  description:
    "Run your youth sports club from your phone: online registration, team messaging, fundraising and in-house leagues, for any sport. No subscription, no setup fee and no fee on fundraising.",
};

const features: { id: string; icon: IconName; title: string; text: string }[] = [
  { id: "registration", icon: "registration", title: "Registration", text: "Build it on your phone and share a link, QR code or flyer. Families register and pay on theirs." },
  { id: "messaging", icon: "messaging", title: "Team Messaging", text: "A group chat for every team, and messages to the whole club or to one child’s parents." },
  { id: "fundraising", icon: "fundraising", title: "Fundraising", text: "Donation drives and item sales, with a page and QR code for every player. No fee from us." },
  { id: "leagues", icon: "trophy", title: "In-house Leagues", text: "Teams by hand, by auto-balance or by a live draft. Then games, scores and standings." },
  { id: "club", icon: "club", title: "Running the Club", text: "Staff roles, a setup checklist, season admin and reports, all on the phone." },
];

const sports: { icon: IconName; title: string; text: string }[] = [
  { icon: "ball", title: "Any sport", text: "Pick yours from the list. If it is not there, choose Other and name it." },
  { icon: "registration", title: "The club places every child", text: "Families sign up for the program, never an age group or a team. Each child is placed by age, or by the club." },
  { icon: "team", title: "Teams your way", text: "Each program forms its teams by hand, by auto-balance or by a live draft." },
];

const spotlights = [
  {
    id: "registration",
    kicker: "Online registration",
    title: "Registration you build on your phone",
    text: "Set up your programs, age groups, questions, add-ons and promo codes on your phone. Share them with a link, a QR code or a printable flyer. Families register on their phone, and the money goes to your club’s own Stripe account.",
    points: [
      "Pay by card, Apple Pay or Google Pay",
      "No card is stored for next time",
      "Invite a second guardian",
      "Balances and refunds worked out for each registration",
    ],
    mock: <RegistrationMock />,
  },
  {
    id: "messaging",
    kicker: "Team messaging",
    title: "Every family hears it the first time",
    text: "Every team has a group chat. Club staff can post to every team’s chat at once, or pick a child and message one or both parents. Chat is only for your club’s registered families and staff, and notifications come through the app.",
    points: [
      "A group chat for every team",
      "Entire Org Message: every team’s chat at once",
      "Parent Message: pick a child, then one or both parents",
      "The schedule, with RSVPs and a calendar you can subscribe to",
      "Coaches reach families without sharing phone numbers",
    ],
    mock: <MessagingMock />,
  },
  {
    id: "fundraising",
    kicker: "Fundraising",
    title: "Raise more, with no fee from us",
    text: "Run a donation drive or sell items. Every player gets a page and a QR code. Supporters pay on a web page, and the family sees each payment land in the app.",
    points: [
      "Donation drives and item sales",
      "A page and a QR code for every player",
      "Supporters pay on the web, with no app to install",
      "Families see each payment land in the app",
    ],
    mock: <FundraisingMock />,
  },
  {
    id: "leagues",
    kicker: "In-house leagues",
    title: "Teams, games and standings in one place",
    text: "Form your teams by hand, by auto-balance or by a live draft on your coaches’ phones. Play games between your own teams, enter the scores, and families see the standings.",
    points: [
      "Auto-balance spreads ages, keeps siblings together and puts a coach’s child on that coach’s team",
      "The draft shows a child’s name, age, age group, last season’s team and siblings. No ratings or evaluations, ever",
      "Games between your club’s own teams, on every family’s schedule",
      "Make an age group’s season schedule in one go: the first day, how many games each team plays, the days each field is used, its time slots and the days to skip. Home and away kept even. Preview it, then publish",
      "Scores and standings are team results, never statistics about a child",
    ],
    mock: <LeagueMock />,
  },
  {
    id: "club",
    kicker: "Running the club",
    title: "The whole club, run from the phone",
    text: "Every volunteer gets a role. A setup checklist walks a new club through its first season, and the board runs the rest from their phones.",
    points: [
      "Roles for the President, Treasurer, Commissioner, coaches and more",
      "A setup checklist for a new club",
      "Season admin on the phone",
      "Reports start on the phone and arrive by email as a sign-in link",
      "No ads, no analytics, and your data is never sold. Your club owns its records",
    ],
    mock: <ClubMock />,
  },
];

// Doug, 14 Nov 2026: "list all the features they get and end with and more. It should say $5
// per registration. Don't mention anything about the families this is just for the orgs." It
// replaces his ruling of 4 Oct 2026 that kept every price figure off the public site.
const included = [
  "Online registration, built on your phone",
  "Card, Apple Pay and Google Pay",
  "Age groups, add-ons and promo codes",
  "Team chats and club-wide messages",
  "Schedules, RSVPs and calendars",
  "Fundraising, with no fee from us",
  "In-house leagues, drafts and standings",
  "Season schedules made in one go",
  "Staff roles and a setup checklist",
  "Reports by email",
  "And more",
];

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "GameDay Huddle",
    applicationCategory: "SportsApplication",
    operatingSystem: "iOS, Android, Web",
    description:
      "Registration, team messaging, fundraising and in-house leagues for youth sports clubs of any sport, run from the phone.",
  };

  return (
    <div className="marketing-page">
      <MarketingHeader />
      <main>
        <section className="hero">
          <div className="hero-inner section-shell">
            <h1>
              Run your youth sports club. <em>From your phone.</em>
            </h1>
            <div className="hero-copy">
              <p className="hero-deck">
                Registration, team messaging, fundraising and in-house leagues for any youth sport. One app for
                families, coaches and club staff.
              </p>
              <div className="hero-actions">
                <a className="button" href={DEMO_HREF}>Book a Demo <Icon name="arrow" strokeWidth={2.2} /></a>
                <a className="button button-outline" href="#platform">Explore the Platform</a>
              </div>
              <p className="hero-note"><Icon name="team" /> Built for every youth sport</p>
            </div>
            <HeroDevices />
          </div>
        </section>

        <section className="features section-shell" id="platform" aria-labelledby="platform-title">
          <p className="kicker">One app for the whole club</p>
          <h2 id="platform-title">Everything your club needs to run the season</h2>
          <p className="section-intro">
            Staff run the club from their phones. Families register, pay and keep up from theirs. A web console is
            there when you want a bigger screen.
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
            <p className="kicker">Every youth sport</p>
            <h2 id="sports-title">One club. Every sport it runs.</h2>
            <ul className="sport-list" aria-label="Sports">
              {sportNames.map((sport) => (
                <li key={sport}>{sport}</li>
              ))}
              <li className="is-other">Other — you name it</li>
            </ul>
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

        <section className="pricing section-shell" id="pricing" aria-labelledby="pricing-title">
          <div className="pricing-copy">
            <p className="kicker">Pricing</p>
            <h2 id="pricing-title">One simple price. Everything included.</h2>
            <p>No subscription, no setup fee, no contract and no paid add-ons.</p>
          </div>
          <div className="price-card">
            <p className="price"><b>$5</b><span>per registration</span></p>
            <ul className="check-list">
              {included.map((line) => (
                <li key={line}><Icon name="check" strokeWidth={2.4} />{line}</li>
              ))}
            </ul>
            <p className="price-note">
              Charged only on paid registrations. Payments go to your club&rsquo;s own Stripe account; Stripe&rsquo;s
              standard card processing fees apply.
            </p>
            <a className="button button-wide" href={DEMO_HREF}>Book a Demo <Icon name="arrow" strokeWidth={2.2} /></a>
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
