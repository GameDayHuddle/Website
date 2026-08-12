import { Brand } from "./Brand";

export function PortalShell({
  area,
  children,
}: {
  area: "account" | "admin";
  children: React.ReactNode;
}) {
  const isAdmin = area === "admin";
  return (
    <div className="portal-layout">
      <aside className="portal-sidebar">
        <Brand compact />
        <div className="portal-context">
          <span>{isAdmin ? "ADMIN WORKSPACE" : "TEAM ACCOUNT"}</span>
          <b>{isAdmin ? "GameDay Operations" : "Riverside Football"}</b>
        </div>
        <nav aria-label={`${isAdmin ? "Admin" : "Customer"} navigation`}>
          <a className="active" href={isAdmin ? "/admin" : "/account"}><i>01</i>{isAdmin ? "Overview" : "Account home"}</a>
          <a href={`/${area}#subscriptions`}><i>02</i>{isAdmin ? "Subscriptions" : "Billing"}</a>
          <a href={`/${area}#access`}><i>03</i>{isAdmin ? "Prospects" : "Team access"}</a>
          <a href={`/${area}#support`}><i>04</i>{isAdmin ? "Support" : "Invoices"}</a>
          {isAdmin && <a href="/admin#audit"><i>05</i>Audit log</a>}
        </nav>
        <div className="sidebar-help">
          <span>NEED HELP?</span>
          <p>Questions about your account or a game-day issue?</p>
          <a href="mailto:support@gamedayhuddle.com">Contact support →</a>
        </div>
        <a className="portal-signout" href="/">← Back to website</a>
      </aside>
      <main className="portal-main">
        <div className="portal-mobilebar"><Brand compact /><a href="/">Exit</a></div>
        {children}
      </main>
    </div>
  );
}
