"use client";

import { useEffect, useState } from "react";
import { STAGES, STAGE_LABEL, type Stage, type SessionRow } from "@/lib/db";

type ApiResponse = {
  sessions: SessionRow[];
  now: string;
};

const REFRESH_MS = 5000;

function isStage(value: string): value is Stage {
  return (STAGES as readonly string[]).includes(value);
}

function secondsAgo(now: number, iso: string): number {
  return Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
}

function shortId(id: string): string {
  return id.slice(0, 6);
}

export default function LiveSessions() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [now, setNow] = useState<number>(() => Date.now());
  const [status, setStatus] = useState<
    "idle" | "loading" | "ok" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function pull() {
      try {
        setStatus((s) => (s === "idle" ? "loading" : s));
        const res = await fetch("/api/track", {
          cache: "no-store",
          credentials: "include",
        });
        if (!alive) return;
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = (await res.json()) as ApiResponse;
        if (!alive) return;
        setSessions(data.sessions);
        setNow(Date.now());
        setStatus("ok");
        setErrorMessage(null);
      } catch (err) {
        if (!alive) return;
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "erro");
      }
    }
    void pull();
    const interval = window.setInterval(pull, REFRESH_MS);
    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, []);

  // Ticker leve pro contador de "há Xs" atualizar entre pulls.
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const counts = new Map<Stage, number>();
  for (const s of STAGES) counts.set(s, 0);
  for (const s of sessions) {
    if (isStage(s.current_stage)) {
      counts.set(s.current_stage, (counts.get(s.current_stage) ?? 0) + 1);
    }
  }

  return (
    <section className="live">
      <header className="live-head">
        <h2>Ao vivo</h2>
        <span className="live-status" data-status={status}>
          {status === "ok" && `${sessions.length} online · atualiza a cada 5s`}
          {status === "loading" && "conectando…"}
          {status === "error" && `erro: ${errorMessage ?? "?"}`}
        </span>
      </header>

      <div className="live-funnel">
        {STAGES.map((s) => (
          <div key={s} className="live-tile" data-empty={counts.get(s) === 0}>
            <div className="live-tile-count">{counts.get(s) ?? 0}</div>
            <div className="live-tile-label">{STAGE_LABEL[s]}</div>
          </div>
        ))}
      </div>

      {sessions.length === 0 ? (
        <div className="empty">
          Ninguém no quiz agora. Quando alguém abrir a página, aparece aqui em
          até 5 segundos.
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Sessão</th>
              <th>Etapa</th>
              <th>Score</th>
              <th>Visto</th>
              <th>Entrou</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => {
              const label = isStage(s.current_stage)
                ? STAGE_LABEL[s.current_stage]
                : s.current_stage;
              return (
                <tr key={s.id} data-lead={s.lead_id !== null}>
                  <td>
                    <code>{shortId(s.id)}</code>
                    {s.lead_id !== null && (
                      <span className="tag">virou lead</span>
                    )}
                  </td>
                  <td>{label}</td>
                  <td>{s.score ?? "—"}</td>
                  <td>{secondsAgo(now, s.last_seen_at)}s atrás</td>
                  <td>{secondsAgo(now, s.started_at)}s atrás</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
