import Image from "next/image";
import { Icon, type IconName } from "./Icon";

// The club console and the phone, drawn in HTML so they scale with the hero and never go
// stale as a screenshot would. Sample data only — no real club, child or parent.
const sidebar: [IconName, string][] = [
  ["dashboard", "Dashboard"],
  ["team", "Teams"],
  ["registration", "Registration"],
  ["payments", "Payments"],
  ["calendar", "Schedule"],
  ["messaging", "Messaging"],
  ["documents", "Documents"],
  ["fundraising", "Fundraising"],
  ["equipment", "Equipment"],
  ["reports", "Reports"],
];

const stats = [
  { label: "Registrations", value: "248", note: "↑ 12% vs last year", tone: "blue", icon: "registration", good: true },
  { label: "Teams", value: "12", note: "Tackle, flag, cheer", tone: "green", icon: "team" },
  { label: "Games", value: "18", note: "Next: Sat, Apr 12", tone: "blue", icon: "calendar" },
  { label: "Raised", value: "$8.4K", note: "Spring raffle · 70%", tone: "orange", icon: "fundraising" },
] as const;

const games = [
  { month: "APR", day: "12", team: "Riverside Panthers", group: "10U Tackle", time: "9:00 AM · Memorial Field", where: "Home" },
  { month: "APR", day: "19", team: "Lakeside Knights", group: "12U Tackle", time: "11:00 AM · Westview High", where: "Away" },
  { month: "APR", day: "26", team: "Central Wildcats", group: "8U Flag", time: "10:00 AM · Memorial Field", where: "Home" },
];

const messages = [
  { initials: "CM", tone: "blue", from: "Coach Miller", text: "Practice time change", when: "10:24 AM", unread: true },
  { initials: "TP", tone: "orange", from: "Team Parents", text: "Snack schedule for this weekend", when: "Yesterday", unread: true },
  { initials: "GH", tone: "navy", from: "GameDay Huddle", text: "Your registration is complete", when: "Apr 9" },
  { initials: "EQ", tone: "green", from: "Equipment Manager", text: "Helmet fittings Thursday", when: "Apr 8" },
];

const tiles: [IconName, string, string][] = [
  ["messaging", "Messages", "blue"],
  ["calendar", "Schedule", "orange"],
  ["team", "Roster", "blue"],
  ["documents", "Documents", "green"],
  ["fundraising", "Fundraise", "orange"],
  ["equipment", "Equipment", "blue"],
];

export function HeroDevices() {
  return (
    <div className="hero-visual" role="img" aria-label="The GameDay Huddle club console on a laptop, and the team hub on a phone">
      <div className="devices" aria-hidden="true">
        <div className="laptop">
          <div className="laptop-screen">
            <aside className="console-side">
              <div className="console-brand">
                <Image src="/badge.png" alt="" width={45} height={48} unoptimized />
                <span>GameDay <b>Huddle</b></span>
              </div>
              <ul>
                {sidebar.map(([icon, label], index) => (
                  <li key={label} className={index === 0 ? "is-active" : undefined}>
                    <Icon name={icon} />
                    {label}
                  </li>
                ))}
              </ul>
            </aside>
            <div className="console-main">
              <div className="console-top">
                <div>
                  <b>Welcome back, Coach!</b>
                  <small>Here&rsquo;s what&rsquo;s happening with your organization.</small>
                </div>
                <div className="console-tools">
                  <span className="console-select">Spring 2027 <Icon name="chevron" /></span>
                  <Icon name="bell" />
                  <span className="console-avatar">DS</span>
                </div>
              </div>
              <div className="console-stats">
                {stats.map((stat) => (
                  <div className="console-card stat" key={stat.label}>
                    <span className="stat-label">{stat.label}</span>
                    <span className={`stat-icon tone-${stat.tone}`}><Icon name={stat.icon} /></span>
                    <b>{stat.value}</b>
                    <small className={"good" in stat ? "is-good" : undefined}>{stat.note}</small>
                  </div>
                ))}
              </div>
              <div className="console-panels">
                <div className="console-card">
                  <div className="panel-head"><b>Upcoming Games</b><span>View all</span></div>
                  {games.map((game) => (
                    <div className="game-row" key={game.team}>
                      <span className="game-date"><small>{game.month}</small>{game.day}</span>
                      <span className="game-copy"><b>{game.team}</b><small>{game.group}</small><small>{game.time}</small></span>
                      <span className={game.where === "Home" ? "pill pill-home" : "pill pill-away"}>{game.where}</span>
                    </div>
                  ))}
                </div>
                <div className="console-card">
                  <div className="panel-head"><b>Message Center</b><span>View all</span></div>
                  {messages.map((message) => (
                    <div className="message-row" key={message.from}>
                      <span className={`avatar tone-${message.tone}`}>{message.initials}</span>
                      <span className="message-copy"><b>{message.from}</b><small>{message.text}</small></span>
                      <span className="message-when">{message.when}{message.unread && <i />}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="laptop-base" />
        </div>

        <div className="phone">
          <div className="phone-status"><span>9:41</span><span className="phone-signal" /></div>
          <div className="phone-bar"><Icon name="back" /><b>Team Hub</b><Icon name="share" /></div>
          <div className="phone-body">
            <div className="phone-team">
              <span className="phone-team-mark"><Icon name="football" /></span>
              <span><b>10U Tackle</b><small>14 players · 4 coaches</small></span>
            </div>
            <div className="phone-tiles">
              {tiles.map(([icon, label, tone]) => (
                <div className="phone-tile" key={label}>
                  <span className={`tile-icon tone-${tone}`}><Icon name={icon} /></span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
