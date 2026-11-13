import { Icon } from "./Icon";

// Small, static pictures of each feature beside its section. Sample data only — no real club,
// child or parent. No amounts of money: the page names no figure of any kind.

function Mock({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mock" role="img" aria-label={label}>
      <div className="mock-inner" aria-hidden="true">
        <div className="mock-bar">{title}</div>
        <div className="mock-body">{children}</div>
      </div>
    </div>
  );
}

export function RegistrationMock() {
  return (
    <Mock label="A family registering two children on a phone, paying by card, Apple Pay or Google Pay" title="Spring 2027 registration">
      <div className="mock-child">
        <span className="avatar tone-blue">AM</span>
        <span><b>Ava M.</b><small>Soccer · U10 Girls</small></span>
        <span className="state state-good">Picked</span>
      </div>
      <div className="mock-announce">
        <Icon name="info" />
        <span>Ava is older than this age group. You can still pick it.</span>
      </div>
      <div className="mock-child">
        <span className="avatar tone-orange">JM</span>
        <span><b>Jake M.</b><small>Baseball · 8U</small></span>
        <span className="state state-good">Picked</span>
      </div>
      <p className="mock-label">Pay with</p>
      <div className="mock-pay">
        <span>Card</span>
        <span>Apple Pay</span>
        <span>Google Pay</span>
      </div>
      <div className="mock-line"><span>Paid to</span><span>Riverside Sports Club</span></div>
      <span className="mock-button">Register &amp; pay</span>
    </Mock>
  );
}

export function MessagingMock() {
  return (
    <Mock label="A team's group chat with a message to the whole club" title="U10 Comets · Team chat">
      <div className="mock-announce"><Icon name="messaging" /> <span><b>Entire Org Message</b> Picture day is Saturday at 9 AM.</span></div>
      <div className="bubble">
        <small>Coach Miller</small>
        Practice moves to 6:00 tonight — field 2.
      </div>
      <div className="bubble bubble-me">
        Thanks Coach! We&rsquo;ll be there.
      </div>
      <div className="bubble">
        <small>Coach Miller</small>
        Bring water and shin guards.
      </div>
      <div className="mock-compose"><span>Message the team</span><Icon name="arrow" strokeWidth={2.2} /></div>
    </Mock>
  );
}

export function FundraisingMock() {
  return (
    <Mock label="A donation drive with a player's own page and QR code" title="Spring donation drive">
      <div className="mock-raised"><b>184</b><span>gifts so far</span></div>
      <div className="progress"><span style={{ width: "70%" }} /><em>70%</em></div>
      <p className="mock-label">Ava&rsquo;s page</p>
      <div className="mock-line"><span>Gifts to Ava&rsquo;s page</span><span>14</span></div>
      <div className="mock-line"><span>Latest</span><span className="is-good">Donation · just now</span></div>
      <div className="mock-actions">
        <span className="mock-button"><Icon name="share" strokeWidth={2.2} /> Share</span>
        <span className="mock-button mock-button-outline"><Icon name="qr" strokeWidth={2} /> QR code</span>
      </div>
    </Mock>
  );
}

// Team results only: wins, losses and ties. Nothing about a child.
const standings = [
  ["Comets", 6, 1, 0],
  ["Rockets", 5, 2, 0],
  ["Sparks", 3, 3, 1],
  ["Flames", 1, 6, 1],
] as const;

export function LeagueMock() {
  return (
    <Mock label="An in-house league's standings and its next game" title="U10 Girls · Standings">
      <div className="mock-standing mock-standing-head">
        <span />
        <b>Team</b>
        <span>W</span>
        <span>L</span>
        <span>T</span>
      </div>
      {standings.map(([team, won, lost, tied], index) => (
        <div className="mock-standing" key={team}>
          <span className="standing-rank">{index + 1}</span>
          <b>{team}</b>
          <span>{won}</span>
          <span>{lost}</span>
          <span>{tied}</span>
        </div>
      ))}
      <p className="mock-label">Next game</p>
      <div className="mock-line"><span>Comets v Rockets</span><span>Sat 9:00 AM · Field 2</span></div>
    </Mock>
  );
}

const setup = [
  ["What you run", "Done", "good"],
  ["Connect Stripe", "Done", "good"],
  ["Programs", "Done", "good"],
  ["Your fields", "Done", "good"],
  ["Board members", "2 invited", "info"],
  ["Coaches", "To do", "due"],
] as const;

export function ClubMock() {
  return (
    <Mock label="A new club's setup checklist on the phone" title="Club setup">
      <p className="mock-label">4 of 6 done</p>
      {setup.map(([task, state, tone]) => (
        <div className="mock-task" key={task}>
          <span className={`task-icon tone-${tone === "good" ? "green" : tone === "due" ? "orange" : "blue"}`}>
            <Icon name={tone === "good" ? "check" : tone === "due" ? "arrow" : "team"} strokeWidth={2.2} />
          </span>
          <b>{task}</b>
          <span className={`state state-${tone}`}>{state}</span>
        </div>
      ))}
    </Mock>
  );
}
