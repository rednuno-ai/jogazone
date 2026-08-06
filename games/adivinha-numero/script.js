const MAX_TRIES = 8;
let secret, tries, wins, over;

function loadWins() {
  wins = Number(localStorage.getItem("jogazone-adivinha-wins") || 0);
  document.getElementById("wins").textContent = wins;
}

function reset() {
  secret = Math.floor(Math.random() * 100) + 1;
  tries = 0;
  over = false;
  document.getElementById("tries").textContent = 0;
  document.getElementById("max-tries").textContent = MAX_TRIES;
  document.getElementById("hint").textContent = "Pensei num número entre 1 e 100. Adivinha!";
  document.getElementById("guess-input").value = "";
  document.getElementById("guess-input").disabled = false;
}

document.getElementById("guess-form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (over) return;
  const input = document.getElementById("guess-input");
  const value = Number(input.value);
  if (!value || value < 1 || value > 100) return;

  tries++;
  document.getElementById("tries").textContent = tries;

  if (value === secret) {
    document.getElementById("hint").textContent = `🎉 Acertaste! Era o ${secret}.`;
    wins++;
    localStorage.setItem("jogazone-adivinha-wins", String(wins));
    document.getElementById("wins").textContent = wins;
    over = true;
    input.disabled = true;
  } else if (tries >= MAX_TRIES) {
    document.getElementById("hint").textContent = `Fim das tentativas! Era o ${secret}.`;
    over = true;
    input.disabled = true;
  } else {
    document.getElementById("hint").textContent = value < secret ? "📈 É maior que isso!" : "📉 É menor que isso!";
  }
  input.value = "";
  input.focus();
});

document.getElementById("restart-btn").addEventListener("click", reset);
loadWins();
reset();
