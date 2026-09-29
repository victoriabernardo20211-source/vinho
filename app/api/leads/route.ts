import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { ensureSchema } from "@/lib/db";

export const runtime = "nodejs";

type LeadInput = {
  name?: unknown;
  phone?: unknown;
  score?: unknown;
  total?: unknown;
  sessionId?: unknown;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function stringField(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function integerField(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  return null;
}

export async function POST(request: Request) {
  let body: LeadInput;
  try {
    body = (await request.json()) as LeadInput;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const name = stringField(body.name, 120);
  const phone = stringField(body.phone, 40);
  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Nome obrigatório." }, { status: 422 });
  }
  const phoneDigits = phone ? phone.replace(/\D/g, "") : "";
  if (phoneDigits.length < 10 || phoneDigits.length > 13) {
    return NextResponse.json(
      { error: "WhatsApp inválido." },
      { status: 422 },
    );
  }

  const score = integerField(body.score);
  const total = integerField(body.total);
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = request.headers.get("user-agent")?.slice(0, 300) ?? null;

  const sessionId =
    typeof body.sessionId === "string" && UUID_RE.test(body.sessionId)
      ? body.sessionId
      : null;

  try {
    await ensureSchema();
    const { rows } = await sql<{ id: number }>`
      INSERT INTO leads (name, phone, phone_digits, score, total, ip, user_agent)
      VALUES (${name}, ${phone}, ${phoneDigits}, ${score}, ${total}, ${ip}, ${userAgent})
      RETURNING id
    `;
    const leadId = rows[0]?.id ?? null;
    if (sessionId && leadId) {
      await sql`
        UPDATE sessions
        SET lead_id = ${leadId},
            current_stage = 'thanks',
            last_seen_at = NOW()
        WHERE id = ${sessionId}
      `;
    }
  } catch (err) {
    console.error("[leads] insert failed", err);
    return NextResponse.json(
      { error: "Não foi possível registrar agora. Tente de novo em instantes." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
