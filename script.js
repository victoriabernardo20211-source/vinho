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
  ctaLabel: "Resgatar agora",
};

// Consultor que recebe o lead pelo WhatsApp.
// Coloque o número no formato internacional, só dígitos: 55 + DDD + número.
const CONSULTANT = {
  phone: "5511999999999",
  greeting:
    "Olá! Acabei de fazer o quiz e quero resgatar o desconto do combo especial.",
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

  const intro = document.createElement("p");
  intro.className = "lead-intro";
  intro.textContent =
    "Preencha seus dados e um consultor entra em contato pelo WhatsApp para liberar o desconto.";
  wrap.appendChild(intro);

  const form = document.createElement("form");
  form.className = "lead-form";
  form.noValidate = true;
  form.innerHTML = `
    <label class="field">
      <span class="field-label">Nome</span>
      <input class="field-input" type="text" name="name" autocomplete="name"
             required minlength="2" placeholder="Seu nome" />
      <span class="field-error" data-for="name" hidden></span>
    </label>
    <label class="field">
      <span class="field-label">WhatsApp (com DDD)</span>
      <input class="field-input" type="tel" name="phone" autocomplete="tel-national"
             required inputmode="numeric" placeholder="(11) 99999-9999" />
      <span class="field-error" data-for="phone" hidden></span>
    </label>
    <button type="submit" class="cta cta-buy">${REWARD.ctaLabel}</button>
  `;
  form.addEventListener("submit", onLeadSubmit);
  wrap.appendChild(form);

  const disclaimer = document.createElement("p");
  disclaimer.className = "lead-disclaimer";
  disclaimer.textContent =
    "Ao enviar, seus dados são usados apenas para o consultor entrar em contato sobre este combo.";
  wrap.appendChild(disclaimer);

  const back = document.createElement("button");
  back.type = "button";
  back.className = "retry";
  back.textContent = "Refazer o quiz";
  back.addEventListener("click", reset);
  wrap.appendChild(back);

  card.appendChild(wrap);
  wrap.querySelector('input[name="name"]').focus();
}

function onLeadSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const name = form.name.value.trim();
  const phoneRaw = form.phone.value.trim();
  const phoneDigits = phoneRaw.replace(/\D/g, "");

  const errors = {
    name: name.length < 2 ? "Digite seu nome." : "",
    phone:
      phoneDigits.length < 10 || phoneDigits.length > 13
        ? "Digite um WhatsApp válido com DDD."
        : "",
  };

  let ok = true;
  form.querySelectorAll(".field-error").forEach((el) => {
    const key = el.dataset.for;
    if (errors[key]) {
      el.textContent = errors[key];
      el.hidden = false;
      ok = false;
    } else {
      el.hidden = true;
    }
  });
  if (!ok) return;

  const text = `${CONSULTANT.greeting}\n\nNome: ${name}\nTelefone: ${phoneRaw}`;
  const url = `https://wa.me/${CONSULTANT.phone}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener");
  renderLeadThanks(name);
}

function renderLeadThanks(name) {
  card.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "reward";

  const badge = document.createElement("span");
  badge.className = "reward-badge";
  badge.textContent = "Contato registrado";
  wrap.appendChild(badge);

  const h = document.createElement("h2");
  h.className = "reward-title";
  h.textContent = `Obrigado${name ? ", " + name.split(" ")[0] : ""}!`;
  wrap.appendChild(h);

  const p = document.createElement("p");
  p.className = "lead-intro";
  p.textContent =
    "Se o WhatsApp não abriu automaticamente, toque no botão abaixo para falar com o consultor.";
  wrap.appendChild(p);

  const url = `https://wa.me/${CONSULTANT.phone}?text=${encodeURIComponent(CONSULTANT.greeting)}`;
  const cta = document.createElement("a");
  cta.className = "cta cta-buy";
  cta.href = url;
  cta.target = "_blank";
  cta.rel = "noopener";
  cta.textContent = "Abrir WhatsApp";
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
