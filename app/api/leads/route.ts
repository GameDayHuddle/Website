import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { crmLeads } from "../../../db/schema";

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function GET() {
  try {
    const rows = await getDb().select().from(crmLeads).orderBy(desc(crmLeads.createdAt)).limit(100);
    return Response.json({ leads: rows });
  } catch {
    return Response.json({ error: "CRM storage is not available." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const name = String(payload.name ?? "").trim().slice(0, 120);
    const email = String(payload.email ?? "").trim().toLowerCase().slice(0, 180);
    const organization = String(payload.organization ?? "").trim().slice(0, 180);
    const source = String(payload.source ?? "website").trim().slice(0, 60);
    const teamCount = Math.max(1, Math.min(500, Number(payload.teamCount) || 1));

    if (!name || !validEmail(email)) {
      return Response.json({ error: "A valid name and email are required." }, { status: 400 });
    }

    const [lead] = await getDb().insert(crmLeads).values({
      name,
      email,
      organization,
      teamCount,
      source,
      role: organization ? "organization" : "coach",
    }).returning();

    return Response.json({ lead }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "CRM storage is not available.";
    return Response.json({ error: message.includes("no such table") ? "CRM setup is finishing. Please email hello@gamedayhuddle.com." : "We could not save your request." }, { status: 503 });
  }
}
