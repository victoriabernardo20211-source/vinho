import { sql } from "@vercel/postgres";

// Garante as tabelas na primeira chamada. Idempotente.
let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS leads (
          id           BIGSERIAL PRIMARY KEY,
          name         TEXT        NOT NULL,
          phone        TEXT        NOT NULL,
          phone_digits TEXT        NOT NULL,
          score        INTEGER,
          total        INTEGER,
          ip           TEXT,
          user_agent   TEXT,
          created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS sessions (
          id            TEXT        PRIMARY KEY,
          current_stage TEXT        NOT NULL,
          score         INTEGER,
          lead_id       BIGINT      REFERENCES leads(id) ON DELETE SET NULL,
          ip            TEXT,
          user_agent    TEXT,
          started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS sessions_last_seen_idx ON sessions (last_seen_at DESC)`;
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

export type Lead = {
  id: number;
  name: string;
  phone: string;
  phone_digits: string;
  score: number | null;
  total: number | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
};

export type SessionRow = {
  id: string;
  current_stage: string;
  score: number | null;
  lead_id: number | null;
  started_at: string;
  last_seen_at: string;
};

// Estágios possíveis. Client e API validam contra essa lista.
export const STAGES = [
  "q1",
  "q2",
  "q3",
  "q4",
  "finish",
  "lead",
  "thanks",
] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_LABEL: Record<Stage, string> = {
  q1: "Pergunta 1",
  q2: "Pergunta 2",
  q3: "Pergunta 3",
  q4: "Pergunta 4",
  finish: "Resgatar desconto",
  lead: "Preenchendo dados",
  thanks: "Concluído",
};
