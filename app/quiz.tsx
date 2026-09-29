"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TrackStage = "q1" | "q2" | "q3" | "q4" | "finish" | "lead" | "thanks";

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback improvável mas seguro para runtimes antigos.
  return "00000000-0000-4000-8000-000000000000".replace(/[08]/g, (c) =>
    (
      (Number(c) ^ (Math.random() * 16)) & (c === "0" ? 15 : 3) | (c === "0" ? 0 : 8)
    ).toString(16),
  );
}

function trackStage(sessionId: string, stage: TrackStage, score: number) {
  const body = JSON.stringify({ sessionId, stage, score });
  const url = "/api/track";
  // Prefer beacon quando disponível — não bloqueia navegação.
  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    try {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(url, blob)) return;
    } catch {
      // ignora e cai no fetch abaixo
    }
  }
  fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    /* tracking best-effort */
  });
}

type Question = {
  text: string;
  options: string[];
  correct: number;
};

const QUESTIONS: Question[] = [
  {
    text: "O vinho tinto deve ser servido em temperatura ambiente? (Verdadeiro ou Falso)",
    options: ["Verdadeiro", "Falso"],
    correct: 1,
  },
  {
    text: "A nossa loja é conhecida por oferecer promoções especiais de vinhos?",
    options: ["Verdadeiro", "Falso"],
    correct: 0,
  },
  {
    text: "Qual destes é um tipo de uva usada para vinho branco?",
    options: ["Chardonnay", "Cabernet Sauvignon", "Merlot"],
    correct: 0,
  },
  {
    text: "Qual país é um dos maiores produtores de vinho do mundo?",
    options: ["Alemanha", "França", "Austrália"],
    correct: 1,
  },
];

const REWARD = {
  title:
    "Kit DV Catena Malbec Cx 6 Und + 2 Taças de Cristal + 10 Vinhos com Bolsa Térmica Grátis",
  image: "/kit-evino.webp",
  alt: "Kit com 10 vinhos tintos e bolsa térmica exclusiva",
  ctaLabel: "Resgatar agora",
};

type Stage =
  | { kind: "question"; index: number; picked: number | null }
  | { kind: "finish" }
  | { kind: "lead" }
  | { kind: "thanks"; firstName: string };

export default function Quiz() {
  const [stage, setStage] = useState<Stage>({
    kind: "question",
    index: 0,
    picked: null,
  });
  const [score, setScore] = useState(0);
  const sessionId = useMemo(() => generateSessionId(), []);

  const totalSteps = QUESTIONS.length;
  const progressStep =
    stage.kind === "question" ? stage.index : totalSteps;
  const progressPct = Math.min(
    100,
    Math.round((progressStep / totalSteps) * 100),
  );

  const currentStage: TrackStage =
    stage.kind === "question"
      ? (["q1", "q2", "q3", "q4"] as const)[stage.index] ?? "q1"
      : stage.kind === "finish"
        ? "finish"
        : stage.kind === "lead"
          ? "lead"
          : "thanks";

  // Registra cada mudança de tela.
  useEffect(() => {
    trackStage(sessionId, currentStage, score);
  }, [sessionId, currentStage, score]);

  // Heartbeat a cada 15s para manter a sessão marcada como "ao vivo".
  const stageRef = useRef({ stage: currentStage, score });
  stageRef.current = { stage: currentStage, score };
  useEffect(() => {
    const interval = window.setInterval(() => {
      trackStage(sessionId, stageRef.current.stage, stageRef.current.score);
    }, 15000);
    return () => window.clearInterval(interval);
  }, [sessionId]);

  function handleAnswer(index: number) {
    if (stage.kind !== "question" || stage.picked !== null) return;
    const q = QUESTIONS[stage.index];
    const nextScore = score + (index === q.correct ? 1 : 0);
    setScore(nextScore);
    setStage({ ...stage, picked: index });
    window.setTimeout(() => {
      if (stage.index + 1 >= QUESTIONS.length) {
        setStage({ kind: "finish" });
      } else {
        setStage({
          kind: "question",
          index: stage.index + 1,
          picked: null,
        });
      }
    }, 650);
  }

  function reset() {
    setScore(0);
    setStage({ kind: "question", index: 0, picked: null });
  }

  return (
    <>
      <div className="progress" role="progressbar" aria-label="Progresso do quiz">
        <div className="progress-bar" style={{ width: `${progressPct}%` }} />
      </div>
      <section className="card">
        {stage.kind === "question" && (
          <QuestionCard
            question={QUESTIONS[stage.index]}
            index={stage.index}
            picked={stage.picked}
            onAnswer={handleAnswer}
          />
        )}
        {stage.kind === "finish" && (
          <FinishCard
            score={score}
            total={QUESTIONS.length}
            onContinue={() => setStage({ kind: "lead" })}
          />
        )}
        {stage.kind === "lead" && (
          <LeadCard
            score={score}
            sessionId={sessionId}
            onDone={(firstName) => setStage({ kind: "thanks", firstName })}
          />
        )}
        {stage.kind === "thanks" && (
          <ThanksCard firstName={stage.firstName} onRestart={reset} />
        )}
      </section>
    </>
  );
}

function QuestionCard({
  question,
  index,
  picked,
  onAnswer,
}: {
  question: Question;
  index: number;
  picked: number | null;
  onAnswer: (choice: number) => void;
}) {
  return (
    <>
      <p className="question">
        {index + 1}. {question.text}
      </p>
      <div className="answers">
        {question.options.map((opt, i) => {
          const cls =
            picked === null
              ? "answer"
              : i === question.correct
                ? "answer correct"
                : i === picked
                  ? "answer wrong"
                  : "answer";
          return (
            <button
              key={i}
              type="button"
              className={cls}
              disabled={picked !== null}
              onClick={() => onAnswer(i)}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </>
  );
}

function FinishCard({
  score,
  total,
  onContinue,
}: {
  score: number;
  total: number;
  onContinue: () => void;
}) {
  return (
    <div className="finish">
      <span className="score">
        Você acertou {score} de {total}
      </span>
      <h2>Obrigado por responder!</h2>
      <p>
        Aproveite nosso Combo com 16 Vinhos + 2 brindes com desconto especial!
      </p>
      <button type="button" className="cta" onClick={onContinue}>
        Resgatar Desconto
      </button>
    </div>
  );
}

function LeadCard({
  score,
  sessionId,
  onDone,
}: {
  score: number;
  sessionId: string;
  onDone: (firstName: string) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [status, setStatus] = useState<
    { kind: "idle" } | { kind: "sending" } | { kind: "error"; message: string }
  >({ kind: "idle" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    const phoneDigits = phone.replace(/\D/g, "");
    const nextErrors: typeof errors = {};
    if (cleanName.length < 2) nextErrors.name = "Digite seu nome.";
    if (phoneDigits.length < 10 || phoneDigits.length > 13)
      nextErrors.phone = "Digite um WhatsApp válido com DDD.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          phone,
          score,
          total: QUESTIONS.length,
          sessionId,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? "Falha ao enviar. Tente de novo.");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha ao enviar. Tente de novo.";
      setStatus({ kind: "error", message });
      return;
    }

    onDone(cleanName);
  }

  const sending = status.kind === "sending";

  return (
    <div className="reward">
      <span className="reward-badge">Desconto liberado</span>
      <h2 className="reward-title">{REWARD.title}</h2>
      <figure className="reward-figure">
        <img src={REWARD.image} alt={REWARD.alt} />
      </figure>
      <p className="lead-intro">
        Preencha seus dados e um consultor entra em contato pelo WhatsApp para
        liberar o desconto.
      </p>
      <form className="lead-form" noValidate onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">Nome</span>
          <input
            className="field-input"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </label>
        <label className="field">
          <span className="field-label">WhatsApp (com DDD)</span>
          <input
            className="field-input"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="(11) 99999-9999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          {errors.phone && <span className="field-error">{errors.phone}</span>}
        </label>
        <button
          type="submit"
          className="cta cta-buy"
          disabled={sending}
        >
          {sending ? "Enviando…" : REWARD.ctaLabel}
        </button>
        {status.kind === "error" && (
          <p className="form-status error">{status.message}</p>
        )}
      </form>
      <p className="lead-disclaimer">
        Ao enviar, seus dados são usados apenas para o consultor entrar em
        contato sobre este combo.
      </p>
    </div>
  );
}

function ThanksCard({
  firstName,
  onRestart,
}: {
  firstName: string;
  onRestart: () => void;
}) {
  const first = firstName.split(" ")[0];
  return (
    <div className="reward">
      <span className="reward-badge">Contato registrado</span>
      <h2 className="reward-title">Obrigado, {first}!</h2>
      <p className="lead-intro">
        Recebemos seus dados. Em breve entramos em contato pelo WhatsApp para
        liberar o desconto.
      </p>
      <button type="button" className="retry" onClick={onRestart}>
        Refazer o quiz
      </button>
    </div>
  );
}
