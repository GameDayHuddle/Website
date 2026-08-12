"use client";

import { useMemo, useState } from "react";

const customers = [
  { name: "Marcus Reed", org: "Riverside Football", plan: "Coach · Annual", status: "Active", renews: "Sep 18, 2026", value: "$348" },
  { name: "Elena Torres", org: "Eastview Wildcats", plan: "Coach · Monthly", status: "Trial", renews: "Aug 19, 2026", value: "$29" },
  { name: "Brian Cole", org: "North County Youth", plan: "Organization · 8 teams", status: "Active", renews: "Jan 03, 2027", value: "$2,880" },
  { name: "Alicia Grant", org: "Westfield JV", plan: "Coach · Monthly", status: "Past due", renews: "Action needed", value: "$29" },
  { name: "Derek Shaw", org: "Metro Flag League", plan: "Organization · 14 teams", status: "Active", renews: "Nov 12, 2026", value: "$4,620" },
];

export function AdminDashboard() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<(typeof customers)[number] | null>(null);
  const [toast, setToast] = useState("");
  const filtered = useMemo(() => customers.filter((customer) => `${customer.name} ${customer.org} ${customer.plan}`.toLowerCase().includes(query.toLowerCase())), [query]);

  function act(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  }

  return (
    <>
      <header className="portal-header"><div><span>OPERATIONS / OVERVIEW</span><h1>Good evening, Doug.</h1><p>Here’s what needs attention across GameDay Huddle.</p></div><div className="portal-profile"><span>DS</span><div><b>Doug Simmons</b><small>Administrator</small></div></div></header>
      <section className="metric-grid admin-metrics">
        <article><span>ACTIVE SUBSCRIPTIONS</span><b>184</b><small className="up">↗ 12 this month</small></article>
        <article><span>MONTHLY RECURRING</span><b>$8,420</b><small className="up">↗ 8.4%</small></article>
        <article><span>OPEN PROSPECTS</span><b>37</b><small>9 need follow-up</small></article>
        <article className="attention"><span>NEEDS ATTENTION</span><b>6</b><small>4 billing · 2 support</small></article>
      </section>
      <section className="admin-split">
        <article className="portal-card pipeline-card"><div className="card-heading"><div><span>SALES PIPELINE</span><h2>Prospects by stage</h2></div><button type="button" onClick={() => act("New prospect form ready for CRM connection.")}>+ Add prospect</button></div><div className="pipeline"><div><span>NEW</span><b>14</b><i style={{ width: "68%" }} /><small>$18.4K potential</small></div><div><span>CONTACTED</span><b>11</b><i style={{ width: "54%" }} /><small>$12.7K potential</small></div><div><span>DEMO</span><b>7</b><i style={{ width: "36%" }} /><small>$9.2K potential</small></div><div><span>PROPOSAL</span><b>5</b><i style={{ width: "26%" }} /><small>$14.8K potential</small></div></div></article>
        <article className="portal-card support-card"><div className="card-heading"><div><span>SUPPORT QUEUE</span><h2>3 open requests</h2></div><button type="button" onClick={() => act("Support queue refreshed.")}>View all</button></div><div className="support-item"><i className="urgent" /><div><b>Can’t reconnect Play Keeper</b><span>North County Youth · 18m ago</span></div><strong>HIGH</strong></div><div className="support-item"><i /><div><b>Invoice needs district PO</b><span>Lakeview Schools · 2h ago</span></div><strong>NORMAL</strong></div><div className="support-item"><i /><div><b>Move team to organization</b><span>East Metro League · 5h ago</span></div><strong>NORMAL</strong></div></article>
      </section>
      <section className="portal-card subscription-table-card">
        <div className="card-heading"><div><span>CUSTOMER ACCOUNTS</span><h2>Subscriptions</h2></div><div className="table-tools"><input aria-label="Search customers" placeholder="Search customer or team" value={query} onChange={(event) => setQuery(event.target.value)} /><button type="button">Filter</button></div></div>
        <div className="subscription-table" role="table" aria-label="Customer subscriptions">
          <div className="table-row table-head" role="row"><span>CUSTOMER</span><span>PLAN</span><span>STATUS</span><span>RENEWS</span><span>VALUE</span><span /></div>
          {filtered.map((customer) => <div className="table-row" role="row" key={customer.name}><span><b>{customer.name}</b><small>{customer.org}</small></span><span>{customer.plan}</span><span><i className={`status-dot ${customer.status.toLowerCase().replace(" ", "-")}`} />{customer.status}</span><span>{customer.renews}</span><span>{customer.value}</span><span><button type="button" onClick={() => setSelected(customer)}>•••</button></span></div>)}
        </div>
      </section>
      {selected && <div className="drawer-backdrop"><aside className="account-drawer"><button className="drawer-close" type="button" aria-label="Close account support drawer" onClick={() => setSelected(null)}>×</button><span className="drawer-kicker">ACCOUNT SUPPORT</span><h2>{selected.name}</h2><p>{selected.org}</p><dl><div><dt>Plan</dt><dd>{selected.plan}</dd></div><div><dt>Status</dt><dd>{selected.status}</dd></div><div><dt>Renewal</dt><dd>{selected.renews}</dd></div></dl><button className="button button-wide" type="button" onClick={() => act(`Password reset sent to ${selected.name}.`)}>Send password reset</button><button className="button button-wide button-danger-ghost" type="button" onClick={() => act(`Cancellation review opened for ${selected.org}.`)}>Cancel subscription</button><button className="text-button" type="button" onClick={() => act("Support note added.")}>+ Add support note</button><small>Preview actions do not change live customer data.</small></aside></div>}
      {toast && <div className="portal-toast" role="status">✓ {toast}</div>}
    </>
  );
}
