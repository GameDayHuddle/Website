import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "../components/Brand";
import { DemoLogin } from "../components/DemoLogin";

export const metadata: Metadata = { title: "Sign in | GameDay Huddle", description: "Sign in to manage your GameDay Huddle team, billing, or administrative workspace." };

export default function LoginPage() {
  return (
    <main className="login-page">
      <div className="login-brand"><Brand /><Link href="/">Back to website</Link></div>
      <section className="login-story">
        <div><p className="eyebrow"><span /> YOUR TEAM, READY</p><h2>Everything after the final whistle.</h2><p>Manage billing, invoices, team access, and support without touching the playbook on your tablet.</p></div>
        <div className="login-scorecard"><span>ACCOUNT STATUS</span><div><i /><b>Riverside Football</b><small>Coach plan · Active</small></div><div className="login-mini-metrics"><span><b>4</b> staff</span><span><b>9</b> games</span><span><b>1</b> team</span></div></div>
      </section>
      <section className="login-form-side"><DemoLogin /><p className="login-legal">By continuing, you agree to the <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.</p></section>
    </main>
  );
}
