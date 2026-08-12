"use client";

import { FormEvent, useState } from "react";

export function DemoLogin() {
  const [role, setRole] = useState<"customer" | "admin">("customer");
  const [showPassword, setShowPassword] = useState(false);
  const livePortalUrl = process.env.NEXT_PUBLIC_LIVE_PORTAL_URL;

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.location.assign(role === "admin" ? "/admin?preview=1" : "/account?preview=1");
  }

  return (
    <div className="login-panel">
      <div className="login-tabs" role="tablist" aria-label="Account type">
        <button className={role === "customer" ? "active" : ""} type="button" onClick={() => setRole("customer")}>Customer</button>
        <button className={role === "admin" ? "active" : ""} type="button" onClick={() => setRole("admin")}>Administrator</button>
      </div>
      <h1>{role === "customer" ? "Welcome back, Coach." : "Operations sign in."}</h1>
      <p>{role === "customer" ? "Manage your team plan, billing, and account access." : "Support customers, subscriptions, and sales from one place."}</p>
      <form onSubmit={signIn}>
        <label><span>Email address</span><input type="email" autoComplete="email" defaultValue={role === "admin" ? "admin@gamedayhuddle.com" : "coach@riversidefootball.org"} required /></label>
        <label><span>Password</span><div className="password-field"><input type={showPassword ? "text" : "password"} autoComplete="current-password" defaultValue="gamedaydemo" required /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Hide" : "Show"}</button></div></label>
        <div className="login-options"><label><input type="checkbox" /> Keep me signed in</label><a href="mailto:support@gamedayhuddle.com?subject=Password%20reset">Forgot password?</a></div>
        <button className="button button-wide" type="submit">Preview {role} portal <span>→</span></button>
      </form>
      {livePortalUrl && <a className="secure-signin" href={`${livePortalUrl.replace(/\/$/, "")}/signin-with-chatgpt?return_to=${encodeURIComponent(role === "admin" ? "/admin" : "/account")}`}>Sign in to a live account</a>}
      <div className="login-preview-note"><i /> <span><b>Product preview</b>The preview button opens seeded data. Live sign-in uses the secure hosted identity flow and never sends this sample password.</span></div>
    </div>
  );
}
