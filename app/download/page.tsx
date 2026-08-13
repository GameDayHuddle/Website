import type { Metadata } from "next";
import Image from "next/image";
import { LeadForm } from "../components/LeadForm";
import { MarketingFooter } from "../components/MarketingFooter";
import { MarketingHeader } from "../components/MarketingHeader";
import manifest from "./manifest.json";

export const metadata: Metadata = { title: "Download GameDay Huddle for Android", description: "Download the GameDay Huddle and Play Keeper Android apps for football playbooks, game-day play calling, live stat keeping, and analytics." };

const { huddle, playKeeper } = manifest;

export default function DownloadPage() {
  return <div className="marketing-page"><MarketingHeader /><main>
    <section className="download-hero section-shell"><div><p className="section-kicker">Android · Version {huddle.version}</p><h1>Take your game plan <em>to the sideline.</em></h1><p>Install GameDay Huddle on an Android phone or tablet running Android 8.0 or newer. Your playbook and games stay stored on the device.</p><div className="download-actions"><a className="button" href={`/downloads/${huddle.file}`} download>Download GameDay Huddle <span>↓</span></a><span>{huddle.sizeMb} MB · APK</span></div><div className="beta-warning"><b>Direct install</b><p>These installers come straight from this page rather than Google Play, so Android may ask you to allow installs from your browser. Only install files downloaded from this official page.</p></div></div><div className="download-phone"><div className="phone-speaker" /><Image src="/app-icon.png" alt="GameDay Huddle app icon" width={128} height={128} priority unoptimized /><h2>GameDay Huddle</h2><p>Build the playbook.<br />Call it on game day.</p><div className="phone-load"><i /></div><small>OFFLINE READY</small></div></section>
    <section className="download-hero keeper-hero section-shell"><div><p className="section-kicker">Staff companion · Version {playKeeper.version}</p><h2 className="keeper-title">Every play goes <em>in the book.</em></h2><p>Play Keeper runs on the Play Analyst&apos;s tablet. While the head coach calls the game in GameDay Huddle, the keeper logs the result of every play — yards, penalties, turnovers — and the coach&apos;s live stats and analytics update from those entries.</p><div className="download-actions"><a className="button" href={`/downloads/${playKeeper.file}`} download>Download Play Keeper <span>↓</span></a><span>{playKeeper.sizeMb} MB · APK</span></div></div><div className="download-phone"><div className="phone-speaker" /><Image src="/playkeeper-icon.svg" alt="GameDay Huddle Play Keeper app icon" width={128} height={128} unoptimized /><h2>Play Keeper</h2><p>Log the result.<br />Feed the sideline.</p><div className="phone-load"><i /></div><small>OFFLINE READY</small></div></section>
    <section className="install-section"><div className="section-shell"><p className="section-kicker">Three steps</p><h2>Install the app</h2><div className="install-grid"><article><b>1</b><h3>Download</h3><p>Tap the download button for the app each device needs — GameDay Huddle for coaches, Play Keeper for the Play Analyst.</p></article><article><b>2</b><h3>Allow this source</h3><p>If Android asks, allow your browser to install this one app package.</p></article><article><b>3</b><h3>Open & build</h3><p>Launch GameDay Huddle and start with your playbook, roster, or first game.</p></article></div></div></section>
    <section className="beta-form-section section-shell"><div><p className="section-kicker">Stay current</p><h2>Hear about updates.</h2><p>Leave your details and we&apos;ll tell you when a new version lands — and you can tell us what the app needs before your next sideline.</p></div><LeadForm /></section>
  </main><MarketingFooter /></div>;
}
