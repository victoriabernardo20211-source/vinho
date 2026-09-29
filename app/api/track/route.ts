import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import {
  ensureSchema,
  STAGES,
  type SessionRow,
  type Stage,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TrackInput = {
  sessionId?: unknown;
  stage?: unknown;
  score?: unknown;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isStage(value: unknown): value is Stage {
  return typeof value === "string" && (STAGES as readonly string[]).includes(value);
}

export async function POST(request: Request) {
  let body: TrackInput;
  try {
    body = (await request.json()) as TrackInput;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const sessionId = body.sessionId;
  if (typeof sessionId !== "string" || !UUID_RE.test(sessionId)) {
    return NextResponse.json({ error: "sessionId inválido." }, { status: 422 });
  }
  if (!isStage(body.stage)) {
    return NextResponse.json({ error: "stage inválido." }, { status: 422 });
  }
  const stage: Stage = body.stage;
  const score =
    typeof body.score === "number" && Number.isFinite(body.score)
      ? Math.trunc(body.score)
      : null;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = request.headers.get("user-agent")?.slice(0, 300) ?? null;

  try {
    await ensureSchema();
    await sql`
      INSERT INTO sessions (id, current_stage, score, ip, user_agent)
      VALUES (${sessionId}, ${stage}, ${score}, ${ip}, ${userAgent})
      ON CONFLICT (id) DO UPDATE
        SET current_stage = EXCLUDED.current_stage,
            score = COALESCE(EXCLUDED.score, sessions.score),
            last_seen_at = NOW()
    `;
  } catch (err) {
    console.error("[track] upsert failed", err);
    return NextResponse.json({ error: "erro interno" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// GET é protegido pelo middleware via Basic Auth.
export async function GET() {
  try {
    await ensureSchema();
    // Sessões vistas nos últimos 60s = "ao vivo"
    const { rows } = await sql<SessionRow>`
      SELECT id, current_stage, score, lead_id,
             started_at, last_seen_at
      FROM sessions
      WHERE last_seen_at > NOW() - INTERVAL '60 seconds'
      ORDER BY last_seen_at DESC
      LIMIT 100
    `;
    return NextResponse.json({
      sessions: rows,
      now: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[track] list failed", err);
    return NextResponse.json({ error: "erro interno" }, { status: 500 });
  }
}
