const QUESTIONS = [
  { q: "Qual é o maior oceano do mundo?", opts: ["Atlântico", "Índico", "Pacífico", "Ártico"], a: 2 },
  { q: "Quantos continentes existem?", opts: ["5", "6", "7", "8"], a: 2 },
  { q: "Qual é o planeta mais próximo do Sol?", opts: ["Vénus", "Mercúrio", "Terra", "Marte"], a: 1 },
  { q: "Qual destes é um número primo?", opts: ["9", "15", "17", "21"], a: 2 },
  { q: "Em que órgão do corpo humano se produz a insulina?", opts: ["Fígado", "Pâncreas", "Rim", "Coração"], a: 1 },
  { q: "Qual é a capital de Portugal?", opts: ["Porto", "Coimbra", "Lisboa", "Faro"], a: 2 },
  { q: "Quantos lados tem um hexágono?", opts: ["5", "6", "7", "8"], a: 1 },
  { q: "Qual destes animais é um mamífero marinho?", opts: ["Tubarão", "Golfinho", "Polvo", "Medusa"], a: 1 },
  { q: "Qual é o metal líquido à temperatura ambiente?", opts: ["Ferro", "Ouro", "Mercúrio", "Alumínio"], a: 2 },
  { q: "Quantas cordas tem um violino clássico?", opts: ["3", "4", "5", "6"], a: 1 },
  { q: "Qual é o rio mais comprido do mundo?", opts: ["Nilo", "Amazonas", "Mississípi", "Danúbio"], a: 1 },
  { q: "Que gás os humanos expiram em maior quantidade?", opts: ["Oxigénio", "Hidrogénio", "Dióxido de carbono", "Azoto"], a: 2 },
  { q: "Qual é o osso mais longo do corpo humano?", opts: ["Fémur", "Úmero", "Tíbia", "Rádio"], a: 0 },
  { q: "Quantos minutos tem um dia completo?", opts: ["1200", "1440", "1000", "1600"], a: 1 },
  { q: "Qual destas cores não está no arco-íris?", opts: ["Violeta", "Anil", "Rosa", "Laranja"], a: 2 }
];

let order, current, correct;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function start() {
  order = shuffle(QUESTIONS).slice(0, 10);
  current = 0;
  correct = 0;
  document.getElementById("qtotal").textContent = order.length;
  document.getElementById("correct").textContent = 0;
  showQuestion();
}

function showQuestion() {
  const item = order[current];
  document.getElementById("qnum").textContent = current + 1;
  document.getElementById("question").textContent = item.q;
  const optsDiv = document.getElementById("options");
  optsDiv.innerHTML = "";
  document.getElementById("next-btn").style.display = "none";

  item.opts.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => onAnswer(idx, item.a, optsDiv));
    optsDiv.appendChild(btn);
  });
}

function onAnswer(idx, correctIdx, optsDiv) {
  [...optsDiv.children].forEach((b, i) => {
    b.disabled = true;
    if (i === correctIdx) b.classList.add("correct");
    else if (i === idx) b.classList.add("wrong");
  });
  if (idx === correctIdx) {
    correct++;
    document.getElementById("correct").textContent = correct;
  }
  document.getElementById("next-btn").style.display = "inline-block";
}

document.getElementById("next-btn").addEventListener("click", () => {
  current++;
  if (current >= order.length) {
    document.getElementById("question").textContent = `Fim do quiz! Acertaste ${correct} de ${order.length} perguntas.`;
    document.getElementById("options").innerHTML = "";
    document.getElementById("next-btn").textContent = "Jogar novamente";
    document.getElementById("next-btn").onclick = start;
  } else {
    showQuestion();
  }
});

start();
