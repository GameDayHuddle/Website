import type { Metadata } from "next";
import Image from "next/image";
import { LeadForm } from "../components/LeadForm";
import { MarketingFooter } from "../components/MarketingFooter";
import { MarketingHeader } from "../components/MarketingHeader";
import manifest from "./manifest.json";

export const metadata: Metadata = { title: "Download GameDay Huddle for Android", description: "Download the GameDay Huddle Android app for youth football playbooks, game-day play calling, live stat keeping, and analytics." };

const { huddle } = manifest;
// Present only once a release has published notes into the manifest; older manifests
// simply have no block to show.
const releaseNotes = (huddle as { notes?: string }).notes;

export default function DownloadPage() {
  return <div className="marketing-page"><MarketingHeader /><main>
    <section className="download-hero section-shell"><div><p className="section-kicker">Android · Version {huddle.version}</p><h1>Take your game plan <em>to the sideline.</em></h1><p>Install GameDay Huddle on an Android phone or tablet running Android 8.0 or newer. Your playbook and games stay stored on the device.</p><div className="download-actions"><a className="button" href={`/downloads/${huddle.file}`} download>Download GameDay Huddle <span>↓</span></a><span>{huddle.sizeMb} MB · APK</span></div>{releaseNotes ? <div className="beta-warning"><b>What&apos;s new in {huddle.version}</b><p>{releaseNotes}</p></div> : null}<div className="beta-warning"><b>Direct install</b><p>These installers come straight from this page rather than Google Play, so Android may ask you to allow installs from your browser. Only install files downloaded from this official page.</p></div></div><div className="download-phone"><div className="phone-speaker" /><Image src="/app-icon.png" alt="GameDay Huddle app icon" width={128} height={128} priority unoptimized /><h2>GameDay Huddle</h2><p>Build the playbook.<br />Call it on game day.</p><div className="phone-load"><i /></div><small>OFFLINE READY</small></div></section>
    <section className="install-section"><div className="section-shell"><p className="section-kicker">Three steps</p><h2>Install the app</h2><div className="install-grid"><article><b>1</b><h3>Download</h3><p>Tap the download button — every device on the staff installs this same app. Coaches sign in; the Play Keeper joins with the coach&apos;s code.</p></article><article><b>2</b><h3>Allow this source</h3><p>If Android asks, allow your browser to install this one app package.</p></article><article><b>3</b><h3>Open & build</h3><p>Launch GameDay Huddle and start with your playbook, roster, or first game. The app tells you when a newer version is on this page.</p></article></div></div></section>
    <section className="beta-form-section section-shell"><div><p className="section-kicker">Stay current</p><h2>Hear about updates.</h2><p>Leave your details and we&apos;ll tell you when a new version lands — and you can tell us what the app needs before your next sideline.</p></div><LeadForm /></section>
  </main><MarketingFooter /></div>;
}
