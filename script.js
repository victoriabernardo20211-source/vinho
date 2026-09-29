// Perguntas do quiz — edite à vontade.
// `correct` é o índice (0-based) da resposta certa dentro de `options`.
const QUESTIONS = [
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

// Configuração do kit que aparece depois de "Resgatar Desconto".
const REWARD = {
  title:
    "Kit DV Catena Malbec Cx 6 Und + 2 Taças de Cristal + 10 Vinhos com Bolsa Térmica Grátis",
  image: "kit-evino.webp",
  alt: "Kit com 10 vinhos tintos e bolsa térmica exclusiva",
  ctaLabel: "Comprar agora",
  ctaUrl: "#", // troque pelo link do produto
};

// ─── daqui pra baixo é só a lógica da tela ─────────────────────────

const card = document.getElementById("card");
const progressBar = document.getElementById("progress-bar");

const state = {
  index: 0,
  score: 0,
  locked: false,
};

function updateProgress(step) {
  const pct = Math.min(100, Math.round((step / QUESTIONS.length) * 100));
  progressBar.style.width = pct + "%";
}

function renderQuestion() {
  const q = QUESTIONS[state.index];
  state.locked = false;
  updateProgress(state.index);

  card.innerHTML = "";

  const p = document.createElement("p");
  p.className = "question";
  p.textContent = `${state.index + 1}. ${q.text}`;
  card.appendChild(p);

  const list = document.createElement("div");
  list.className = "answers";
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "answer";
    btn.textContent = opt;
    btn.addEventListener("click", () => onAnswer(i));
    list.appendChild(btn);
  });
  card.appendChild(list);
}

function onAnswer(chosen) {
  if (state.locked) return;
  state.locked = true;

  const q = QUESTIONS[state.index];
  const buttons = card.querySelectorAll(".answer");
  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === q.correct) b.classList.add("correct");
    else if (i === chosen) b.classList.add("wrong");
  });

  if (chosen === q.correct) state.score += 1;

  setTimeout(() => {
    state.index += 1;
    if (state.index >= QUESTIONS.length) {
      renderFinish();
    } else {
      renderQuestion();
    }
  }, 650);
}

function renderFinish() {
  updateProgress(QUESTIONS.length);
  card.innerHTML = "";

  const wrap = document.createElement("div");
  wrap.className = "finish";

  const score = document.createElement("span");
  score.className = "score";
  score.textContent = `Você acertou ${state.score} de ${QUESTIONS.length}`;
  wrap.appendChild(score);

  const h = document.createElement("h2");
  h.textContent = "Obrigado por responder!";
  wrap.appendChild(h);

  const p = document.createElement("p");
  p.textContent =
    "Aproveite nosso Combo com 16 Vinhos + 2 brindes com desconto especial!";
  wrap.appendChild(p);

  const cta = document.createElement("button");
  cta.type = "button";
  cta.className = "cta";
  cta.textContent = "Resgatar Desconto";
  cta.addEventListener("click", renderReward);
  wrap.appendChild(cta);

  card.appendChild(wrap);
}

function renderReward() {
  card.innerHTML = "";

  const wrap = document.createElement("div");
  wrap.className = "reward";

  const badge = document.createElement("span");
  badge.className = "reward-badge";
  badge.textContent = "Desconto liberado";
  wrap.appendChild(badge);

  const h = document.createElement("h2");
  h.className = "reward-title";
  h.textContent = REWARD.title;
  wrap.appendChild(h);

  const figure = document.createElement("figure");
  figure.className = "reward-figure";
  const img = document.createElement("img");
  img.src = REWARD.image;
  img.alt = REWARD.alt;
  img.loading = "eager";
  figure.appendChild(img);
  wrap.appendChild(figure);

  const cta = document.createElement("a");
  cta.className = "cta cta-buy";
  cta.href = REWARD.ctaUrl;
  cta.textContent = REWARD.ctaLabel;
  if (REWARD.ctaUrl.startsWith("http")) {
    cta.target = "_blank";
    cta.rel = "noopener";
  }
  wrap.appendChild(cta);

  const back = document.createElement("button");
  back.type = "button";
  back.className = "retry";
  back.textContent = "Refazer o quiz";
  back.addEventListener("click", reset);
  wrap.appendChild(back);

  card.appendChild(wrap);
}

function reset() {
  state.index = 0;
  state.score = 0;
  renderQuestion();
}

renderQuestion();
