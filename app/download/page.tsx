import type { Metadata } from "next";
import Image from "next/image";
import { LeadForm } from "../components/LeadForm";
import { MarketingFooter } from "../components/MarketingFooter";
import { MarketingHeader } from "../components/MarketingHeader";

export const metadata: Metadata = { title: "Download GameDay Huddle for Android", description: "Download the GameDay Huddle Android beta for football playbooks, game-day play calling, staff collaboration, and analytics." };

export default function DownloadPage() {
  return <div className="marketing-page"><MarketingHeader /><main>
    <section className="download-hero section-shell"><div><p className="section-kicker">Android beta · Version 0.1.0</p><h1>Take your game plan <em>to the sideline.</em></h1><p>Install the current testing build on an Android phone or tablet running Android 8.0 or newer. Your playbook and games stay stored on the device.</p><div className="download-actions"><a className="button" href="/downloads/GameDay-Huddle-0.1.0-beta.apk" download>Download Android beta <span>↓</span></a><span>16.2 MB · APK</span></div><div className="beta-warning"><b>Beta note</b><p>This is a testing build, not a Google Play release. Android may ask you to allow installs from your browser. Only install files downloaded from this official page.</p></div></div><div className="download-phone"><div className="phone-speaker" /><Image src="/app-icon.png" alt="GameDay Huddle app icon" width={128} height={128} priority /><h2>GameDay Huddle</h2><p>Build the playbook.<br />Call it on game day.</p><div className="phone-load"><i /></div><small>OFFLINE READY</small></div></section>
    <section className="install-section"><div className="section-shell"><p className="section-kicker">Three steps</p><h2>Install the beta</h2><div className="install-grid"><article><b>1</b><h3>Download</h3><p>Tap the APK button above from the Android device you want to use.</p></article><article><b>2</b><h3>Allow this source</h3><p>If Android asks, allow your browser to install this one app package.</p></article><article><b>3</b><h3>Open & build</h3><p>Launch GameDay Huddle and start with your playbook, roster, or first game.</p></article></div></div></section>
    <section className="beta-form-section section-shell"><div><p className="section-kicker">Shape the release</p><h2>Join the beta group.</h2><p>Get build updates and tell us what the app needs before it reaches your next sideline.</p></div><LeadForm /></section>
  </main><MarketingFooter /></div>;
}
