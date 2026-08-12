import Link from "next/link";
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
          <Link className="active" href={isAdmin ? "/admin" : "/account"}><i>01</i>{isAdmin ? "Overview" : "Account home"}</Link>
          <Link href={`/${area}#subscriptions`}><i>02</i>{isAdmin ? "Subscriptions" : "Billing"}</Link>
          <Link href={`/${area}#access`}><i>03</i>{isAdmin ? "Prospects" : "Team access"}</Link>
          <Link href={`/${area}#support`}><i>04</i>{isAdmin ? "Support" : "Invoices"}</Link>
          {isAdmin && <Link href="/admin#audit"><i>05</i>Audit log</Link>}
        </nav>
        <div className="sidebar-help">
          <span>NEED HELP?</span>
          <p>Questions about your account or a game-day issue?</p>
          <a href="mailto:support@gamedayhuddle.com">Contact support →</a>
        </div>
        <Link className="portal-signout" href="/">← Back to website</Link>
      </aside>
      <main className="portal-main">
        <div className="portal-mobilebar"><Brand compact /><Link href="/">Exit</Link></div>
        {children}
      </main>
    </div>
  );
}
