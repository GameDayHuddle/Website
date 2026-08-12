import type { Metadata } from "next";
import { AdminDashboard } from "../components/AdminDashboard";
import { PortalShell } from "../components/PortalShell";
import { requireChatGPTUser } from "../chatgpt-auth";

export const metadata: Metadata = { title: "Admin workspace | GameDay Huddle" };

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const params = await searchParams;
  if (params.preview !== "1") {
    const user = await requireChatGPTUser("/admin");
    const allowed = String(process.env.ADMIN_EMAILS ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
    if (!allowed.includes(user.email.toLowerCase())) return <main className="access-denied"><h1>Admin access required</h1><p>This account is signed in but is not on the GameDay Huddle administrator allowlist.</p><a href="/account">Go to customer account</a></main>;
  }
  return <PortalShell area="admin"><AdminDashboard /></PortalShell>;
}
