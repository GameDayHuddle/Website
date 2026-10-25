import { Icon } from "./Icon";

// Small, static pictures of each feature beside its section. Sample data only.

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
    <Mock label="A family's registration checkout for two children" title="Fall 2027 registration">
      <div className="mock-child">
        <span className="avatar tone-blue">AM</span>
        <span><b>Ava M.</b><small>10U Tackle · born 03/14/2017</small></span>
        <span className="mock-amount">$185.00</span>
      </div>
      <div className="mock-child">
        <span className="avatar tone-orange">JM</span>
        <span><b>Jake M.</b><small>8U Flag · born 07/02/2019</small></span>
        <span className="mock-amount">$95.00</span>
      </div>
      <div className="mock-line"><span>Early-bird code</span><span className="is-good">−$20.00</span></div>
      <div className="mock-line mock-total"><span>Total</span><span>$260.00</span></div>
      <div className="mock-line"><span>Card on file</span><span>Visa ···· 4242</span></div>
      <span className="mock-button">Register &amp; pay</span>
    </Mock>
  );
}

const documents = [
  ["Birth certificate", "Verified", "good"],
  ["Parent code of conduct", "Signed", "good"],
  ["Equipment refund authorization", "Signed", "good"],
  ["Medical release", "Due Aug 1", "due"],
  ["School document", "Uploaded", "info"],
] as const;

export function DocumentsMock() {
  return (
    <Mock label="An athlete's document checklist" title="Ava M. · 10U Tackle">
      <p className="mock-label">Documents</p>
      {documents.map(([name, state, tone]) => (
        <div className="mock-doc" key={name}>
          <span className={`doc-icon tone-${tone === "good" ? "green" : tone === "due" ? "orange" : "blue"}`}>
            <Icon name={tone === "good" ? "check" : "documents"} strokeWidth={2.2} />
          </span>
          <b>{name}</b>
          <span className={`state state-${tone}`}>{state}</span>
        </div>
      ))}
    </Mock>
  );
}

export function MessagingMock() {
  return (
    <Mock label="A team chat with a club announcement" title="10U Tackle · Team chat">
      <div className="mock-announce"><Icon name="bell" /> <span><b>Club announcement</b> Picture day is Saturday at 9 AM.</span></div>
      <div className="bubble">
        <small>Coach Miller</small>
        Practice moves to 6:00 tonight — field 2.
      </div>
      <div className="bubble bubble-me">
        Thanks Coach! We&rsquo;ll be there.
      </div>
      <div className="bubble">
        <small>Coach Miller</small>
        Bring water and a mouthguard.
      </div>
      <div className="mock-compose"><span>Message the team</span><Icon name="arrow" strokeWidth={2.2} /></div>
    </Mock>
  );
}

export function FundraisingMock() {
  return (
    <Mock label="A fundraising campaign with an athlete's own page" title="Spring raffle">
      <div className="mock-raised"><b>$8,420</b><span>raised of $12,000</span></div>
      <div className="progress"><span style={{ width: "70%" }} /><em>70%</em></div>
      <p className="mock-label">Ava&rsquo;s page</p>
      <div className="mock-line"><span>Raised by Ava&rsquo;s supporters</span><span className="is-good">$640.00</span></div>
      <div className="mock-line"><span>Tickets sold</span><span>64</span></div>
      <div className="mock-actions">
        <span className="mock-button"><Icon name="share" strokeWidth={2.2} /> Share</span>
        <span className="mock-button mock-button-outline"><Icon name="qr" strokeWidth={2} /> QR code</span>
      </div>
    </Mock>
  );
}

const inventory = [
  ["Helmets", "Youth M", 18, 24],
  ["Shoulder pads", "Youth L", 12, 16],
  ["Game jerseys", "#1–#40", 32, 40],
] as const;

export function EquipmentMock() {
  return (
    <Mock label="An equipment inventory with gear assigned to an athlete" title="Equipment">
      <p className="mock-label">Inventory</p>
      {inventory.map(([item, size, out, total]) => (
        <div className="mock-gear" key={item}>
          <span><b>{item}</b><small>{size}</small></span>
          <span className="gear-count">{out} of {total} out</span>
          <span className="progress progress-thin"><span style={{ width: `${Math.round((out / total) * 100)}%` }} /></span>
        </div>
      ))}
      <p className="mock-label">Assigned</p>
      <div className="mock-child">
        <span className="avatar tone-blue">AM</span>
        <span><b>Ava M.</b><small>Helmet YM #14 · Shoulder pads YL</small></span>
        <span className="state state-due">Due Nov 22</span>
      </div>
    </Mock>
  );
}
