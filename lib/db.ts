import { sql } from "@vercel/postgres";

// Garante a tabela `leads` na primeira chamada. Idempotente.
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
    })().catch((err) => {
      // Zera a promise para que a próxima chamada tente de novo.
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
