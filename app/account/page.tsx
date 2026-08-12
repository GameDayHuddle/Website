import type { Metadata } from "next";
import { AccountActions } from "../components/AccountActions";
import { PortalShell } from "../components/PortalShell";
import { requireChatGPTUser } from "../chatgpt-auth";

export const metadata: Metadata = { title: "Team account | GameDay Huddle" };

export const dynamic = "force-dynamic";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const params = await searchParams;
  if (params.preview !== "1") await requireChatGPTUser("/account");
  return (
    <PortalShell area="account">
      <header className="portal-header"><div><span>TEAM ACCOUNT / OVERVIEW</span><h1>Riverside Football</h1><p>Your plan, billing, and team access in one place.</p></div><div className="portal-profile"><span>MR</span><div><b>Marcus Reed</b><small>Head coach</small></div></div></header>
      <div className="preview-banner"><i>i</i><div><b>Account preview</b><span>This seeded view demonstrates the complete customer workflow. Live identity and Stripe data replace it at launch.</span></div></div>
      <section className="account-hero portal-card"><div><span className="status-pill"><i /> ACTIVE</span><p>YOUR PLAN</p><h2>Coach · Annual</h2><small>One head coach + invited staff</small></div><div className="renewal-block"><span>NEXT RENEWAL</span><b>September 18, 2026</b><small>$348.00 / year</small></div></section>
      <section className="account-grid">
        <article className="portal-card billing-card"><div className="card-heading"><div><span>BILLING</span><h2>Payment method</h2></div><span className="stripe-label">Powered by stripe</span></div><div className="card-visual"><i>VISA</i><span>•••• •••• ••••</span><b>4242</b></div><dl><div><dt>Cardholder</dt><dd>Marcus Reed</dd></div><div><dt>Expires</dt><dd>08 / 29</dd></div><div><dt>Billing email</dt><dd>coach@riversidefootball.org</dd></div></dl><AccountActions /></article>
        <article className="portal-card usage-card"><div className="card-heading"><div><span>TEAM ACCESS</span><h2>People on your plan</h2></div><button type="button">Manage</button></div><div className="member-row"><span>MR</span><div><b>Marcus Reed</b><small>Head coach · Owner</small></div><strong>ACTIVE</strong></div><div className="member-row"><span>JT</span><div><b>James Taylor</b><small>Offensive coordinator</small></div><strong>ACTIVE</strong></div><div className="member-row"><span>AC</span><div><b>Alex Carter</b><small>Play Keeper</small></div><strong>ACTIVE</strong></div><div className="member-row"><span>+</span><div><b>Invite a staff member</b><small>Included with your plan</small></div><button type="button">Invite</button></div></article>
      </section>
      <section className="portal-card invoice-card"><div className="card-heading"><div><span>BILLING HISTORY</span><h2>Recent invoices</h2></div><button type="button">View all</button></div><div className="invoice-row"><span><b>September 18, 2025</b><small>Coach · Annual</small></span><span>$348.00</span><strong>PAID</strong><button type="button">Download PDF</button></div><div className="invoice-row"><span><b>September 18, 2024</b><small>Coach · Annual</small></span><span>$348.00</span><strong>PAID</strong><button type="button">Download PDF</button></div></section>
    </PortalShell>
  );
}
