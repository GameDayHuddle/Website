"use client";

import { useState } from "react";

type Preview = "home" | "offense";

const destinations = [
  ["home", "Home"],
  ["playbook", "Offense Playbook"],
  ["analytics", "Offensive Analytics"],
  ["defense", "Defense Playbook"],
  ["defense-analytics", "Defense Analytics"],
] as const;

function GameBar() {
  return (
    <div className="app-game-bar">
      <span className="app-leave">‹&nbsp; Leave game</span>
      <div className="app-scoreline"><b>Riverside&nbsp; 7</b><span>Q2</span><b>10&nbsp; Northgate</b></div>
      <div className="app-situation"><b>3rd &amp; 11</b><span>Own 48</span></div>
      <span className="app-record">Record result</span>
    </div>
  );
}

function Metric({ label, value, note, emphasis = false }: { label: string; value: string; note?: string; emphasis?: boolean }) {
  return (
    <div className={`app-metric${emphasis ? " is-emphasis" : ""}`}>
      <span>{label}</span><b>{value}</b>{note && <small>{note}</small>}
    </div>
  );
}

function QuickStats() {
  return (
    <aside className="app-quick-stats">
      <h3>Quick Stats</h3>
      <div className="app-sync"><i /> Synced with staff</div>
      <section><b>Total Plays</b><p><span>Offensive plays</span><strong>27 <small>(132 yds)</small></strong></p><p><span>Defensive plays</span><strong>30 <small>(250 yds)</small></strong></p><p><span>Penalties</span><strong>4</strong></p></section>
      <section><b>Offense</b><small>Our team</small><p><span>Run plays</span><strong>17 <small>(69 yds)</small></strong></p><p><span>Pass plays</span><strong>10 <small>(63 yds)</small></strong></p></section>
      <section><b>Defense</b><small>Opponent · yards allowed</small><p><span>Run plays</span><strong>18 <small>(150 yds)</small></strong></p><p><span>Pass plays</span><strong>12 <small>(100 yds)</small></strong></p></section>
    </aside>
  );
}

function DestinationMark({ type }: { type: string }) {
  if (type.includes("analytics")) return <span className="app-mark bars"><i /><i /><i /></span>;
  if (type === "home") return <span className="app-mark home"><i /></span>;
  return <span className={`app-mark chevrons${type === "defense" ? " reverse" : ""}`}><i /><i /></span>;
}

function HomePreview() {
  return (
    <div className="app-screen" role="img" aria-label="GameDay Huddle Game Day Home screen based on the Android application">
      <div aria-hidden="true">
        <GameBar />
        <div className="app-home-layout">
          <QuickStats />
          <div className="app-home-main">
            <nav className="app-destinations">
              {destinations.map(([type, label]) => <div className={type === "home" ? "is-current" : ""} key={type}><DestinationMark type={type} /><span>{label}</span></div>)}
            </nav>
            <div className="app-home-content">
              <h3>Riverside vs Northgate</h3>
              <p className="app-game-meta">Regular season · Home · Head coach only</p>
              <h4>Right now</h4>
              <p className="app-status-copy">Drive 4 is under way. Tap a formation on a playbook to call the next play.</p>
              <h4>This drive</h4>
              <div className="app-metric-row drive-metrics"><Metric label="Drive" value="#4" note="from Own 35" /><Metric label="Plays" value="5" /><Metric label="Yards" value="13" /><Metric label="First downs" value="1" /></div>
              <h4>Today</h4>
              <div className="app-metric-row"><Metric label="Offensive plays" value="27" note="132 yds" /><Metric label="Yards / play" value="4.9" emphasis /><Metric label="First downs" value="9" /><Metric label="Turnovers" value="1" /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const holes = [
  ["7", "−2.5", "2 car", "low"],
  ["5", "−2.0", "1 car", "low"],
  ["3", "6.0", "1 car", "hot"],
  ["1", "3.3", "3 car", "mid"],
  ["2", "1.5", "2 car", "low"],
  ["4", "7.0", "6 car", "best"],
  ["6", "11.0", "1 car", "hot"],
  ["8", "4.0", "1 car", "mid"],
] as const;

function OffensePreview() {
  return (
    <div className="app-screen" role="img" aria-label="GameDay Huddle Offensive Analytics screen based on the Android application">
      <div aria-hidden="true">
        <GameBar />
        <div className="app-focused-head">
          <span>‹&nbsp; Back</span><b>Offensive Analytics</b>
          <div className="app-call-split"><span>Run <b>63%</b></span><i><em style={{ width: "63%" }} /></i><span>Pass <b>37%</b></span></div>
          <small>27 off · 30 def · 4 pen&nbsp;&nbsp; <b>Quick Stats</b></small>
        </div>
        <div className="app-analytics-content">
          <div className="app-observations">
            <article><span>BEST PLAY</span><b>Power Right</b><strong>7.0 yds/play</strong><small>6 attempts · 67% success</small><i>ESTABLISHED</i></article>
            <article><span>BEST FORMATION</span><b>Trips Right</b><strong>14 calls</strong><small>The offense’s most-used look</small><i>ESTABLISHED</i></article>
            <article><span>BEST ATTACK AREA</span><b>Right side</b><strong>8 carries</strong><small>Most productive run area</small><i>ESTABLISHED</i></article>
            <article className="is-warning"><span>DRIVE CHECK</span><b>Drive 4</b><strong>2 negative plays</strong><small>1 penalty on this possession</small></article>
          </div>
          <div className="app-run-heading"><div><span>RUN PLACEMENT</span><b>Where our carries are going</b></div><div><span className="is-active">By hole</span><span>By side</span></div></div>
          <div className="app-front-labels"><span>LT</span><span>LG</span><span>C</span><span>RG</span><span>RT</span><span>TE</span><span>WB</span></div>
          <div className="app-hole-grid">
            {holes.map(([hole, average, carries, heat]) => <div className={`app-hole ${heat}`} key={hole}><span>{hole} hole</span><b>{average}</b><small>avg</small><strong>{carries}</strong></div>)}
          </div>
          <p className="app-diagram-note">17 carries · 69 yards · 4.1 average · numbers follow the team’s hole convention</p>
          <div className="app-total-strip"><Metric label="Plays" value="27" /><Metric label="Total yards" value="132" /><Metric label="Yards / play" value="4.9" emphasis /><Metric label="Success rate" value="44%" note="27 plays judged" /><Metric label="First downs" value="9" /></div>
        </div>
      </div>
    </div>
  );
}

export function ProductScreens() {
  const [preview, setPreview] = useState<Preview>("home");

  return (
    <div className="hero-visual product-screens">
      <div className="screen-switcher" role="tablist" aria-label="GameDay Huddle product screens">
        <button type="button" role="tab" aria-selected={preview === "home"} onClick={() => setPreview("home")}>Game Day home</button>
        <button type="button" role="tab" aria-selected={preview === "offense"} onClick={() => setPreview("offense")}>Offensive analytics</button>
      </div>
      <div className="gdh-device">
        <div className="gdh-camera" />
        {preview === "home" ? <HomePreview /> : <OffensePreview />}
      </div>
      <div className="screen-caption"><span><i /> ANDROID TABLET VIEW</span><b>{preview === "home" ? "The game-day hub opens first." : "Evidence for the next series."}</b></div>
    </div>
  );
}
