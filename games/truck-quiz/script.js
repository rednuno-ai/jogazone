const QUESTIONS = [
  { q: "Qual é o veículo mais indicado para transportar cargas muito longas, como vigas de aço?", opts: ["Camião-plataforma extensível", "Furgoneta", "Camião-cisterna", "Camião frigorífico"], a: 0 },
  { q: "O que indica um triângulo de sinalização colocado atrás de um camião imobilizado?", opts: ["Zona de lavagem", "Perigo / veículo parado à frente", "Limite de velocidade", "Posto de combustível"], a: 1 },
  { q: "Para que serve um camião-cisterna?", opts: ["Transportar líquidos ou gases", "Transportar animais", "Transportar contentores", "Rebocar outros veículos"], a: 0 },
  { q: "O que é o tacógrafo usado em camiões?", opts: ["Um sistema de travagem", "Um aparelho que regista tempos de condução e descanso", "Um tipo de pneu", "Um sistema de ar condicionado"], a: 1 },
  { q: "Qual destes NÃO é um tipo comum de reboque?", opts: ["Reboque frigorífico", "Reboque porta-contentores", "Reboque de piscina", "Reboque basculante"], a: 2 },
  { q: "Porque é que os camiões têm ângulos mortos maiores do que os carros?", opts: ["Por causa do tamanho e altura da cabine", "Porque têm menos espelhos", "Porque são mais lentos", "Porque não têm para-brisas"], a: 0 },
  { q: "O que significa 'carga paletizada'?", opts: ["Carga líquida", "Carga organizada em paletes de madeira ou plástico", "Carga viva (animais)", "Carga perigosa"], a: 1 },
  { q: "Qual é a função de um camião basculante?", opts: ['Transportar passageiros', "Descarregar material a granel inclinando a caixa", "Transportar veículos", "Rebocar outros camiões"], a: 1 },
  { q: "O que é uma 'zona de carga e descarga'?", opts: ["Uma bomba de gasolina", "Um espaço reservado para carregar ou descarregar mercadorias", "Uma oficina de pneus", "Um parque de campismo"], a: 1 },
  { q: "Porque é importante distribuir bem o peso da carga num camião?", opts: ["Para ficar mais bonito", "Para evitar perda de estabilidade e acidentes", "Para gastar mais combustível", "Não tem importância"], a: 1 }
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
    btn.addEventListener("click", () => onAnswer(idx, item.a, btn, optsDiv));
    optsDiv.appendChild(btn);
  });
}

function onAnswer(idx, correctIdx, btn, optsDiv) {
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
