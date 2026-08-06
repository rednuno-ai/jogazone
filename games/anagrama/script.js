const WORDS = [
  { word: "GUITARRA", cat: "Música" },
  { word: "COMPUTADOR", cat: "Tecnologia" },
  { word: "MONTANHA", cat: "Natureza" },
  { word: "FUTEBOL", cat: "Desporto" },
  { word: "BIBLIOTECA", cat: "Lugares" },
  { word: "ELEFANTE", cat: "Animais" },
  { word: "CHOCOLATE", cat: "Comida" },
  { word: "FOGUETE", cat: "Ciência" },
  { word: "JARDIM", cat: "Natureza" },
  { word: "PINTURA", cat: "Arte" },
  { word: "OCEANO", cat: "Natureza" },
  { word: "VIOLINO", cat: "Música" },
  { word: "CASTELO", cat: "Lugares" },
  { word: "BICICLETA", cat: "Transporte" },
  { word: "TESOURO", cat: "Aventura" },
  { word: "ESTRELA", cat: "Espaço" },
  { word: "CAMINHO", cat: "Lugares" },
  { word: "JANELA", cat: "Casa" }
];

let current, score;

function shuffleWord(word) {
  let letters;
  do {
    letters = word.split("");
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
  } while (letters.join("") === word);
  return letters.join(" ");
}

function nextWord() {
  current = WORDS[Math.floor(Math.random() * WORDS.length)];
  document.getElementById("scrambled").textContent = shuffleWord(current.word);
  document.getElementById("category").textContent = current.cat;
  document.getElementById("feedback").textContent = "";
  document.getElementById("guess-input").value = "";
}

document.getElementById("guess-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("guess-input");
  const guess = input.value.trim().toUpperCase();
  if (guess === current.word) {
    score += 10;
    document.getElementById("score").textContent = score;
    document.getElementById("feedback").textContent = "✅ Certo! " + current.word;
    document.getElementById("feedback").style.color = "var(--accent-3)";
    setTimeout(nextWord, 900);
  } else {
    document.getElementById("feedback").textContent = "❌ Tenta outra vez";
    document.getElementById("feedback").style.color = "var(--accent)";
  }
});

document.getElementById("skip-btn").addEventListener("click", nextWord);

score = 0;
document.getElementById("score").textContent = 0;
nextWord();
