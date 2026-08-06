// Catálogo de jogos originais do portal.
const GAMES = [
  {
    id: "memoria",
    title: "Memória Mágica",
    category: "Puzzle",
    desc: "Encontra todos os pares antes que o tempo acabe.",
    path: "games/memoria/index.html",
    colors: ["#ff5d73", "#ffb199"],
    icon: "diamond"
  },
  {
    id: "cobra",
    title: "Cobra Elétrica",
    category: "Arcade",
    desc: "Guia a cobra, come energia e não batas nas paredes.",
    path: "games/cobra/index.html",
    colors: ["#5da9ff", "#7ee8b5"],
    icon: "bolt"
  },
  {
    id: "2048",
    title: "Fusão 2048",
    category: "Puzzle",
    desc: "Junta os números iguais até chegares ao 2048.",
    path: "games/2048/index.html",
    colors: ["#ffd166", "#ff9a5a"],
    icon: "grid"
  },
  {
    id: "galo",
    title: "Jogo do Galo",
    category: "Tabuleiro",
    desc: "O clássico X e O, agora contra o computador.",
    path: "games/galo/index.html",
    colors: ["#7ee8b5", "#5da9ff"],
    icon: "cross"
  },
  {
    id: "puzzle15",
    title: "Puzzle Deslizante",
    category: "Puzzle",
    desc: "Reordena as peças de 1 a 15 deslizando os blocos.",
    path: "games/puzzle15/index.html",
    colors: ["#c58bff", "#5da9ff"],
    icon: "squares"
  },
  {
    id: "reflexo",
    title: "Reflexo Rápido",
    category: "Ação",
    desc: "Clica nos alvos assim que aparecem. Testa a tua rapidez.",
    path: "games/reflexo/index.html",
    colors: ["#ff5d73", "#ffd166"],
    icon: "target"
  },
  {
    id: "quebra-blocos",
    title: "Quebra-Blocos",
    category: "Arcade",
    desc: "Destrói todos os blocos com a bola sem a deixares cair.",
    path: "games/quebra-blocos/index.html",
    colors: ["#5da9ff", "#c58bff"],
    icon: "brick"
  },
  {
    id: "forca",
    title: "Forca de Palavras",
    category: "Palavras",
    desc: "Adivinha a palavra secreta letra a letra.",
    path: "games/forca/index.html",
    colors: ["#7ee8b5", "#ffd166"],
    icon: "letter"
  },
  {
    id: "pong-classico",
    title: "Pong Clássico",
    category: "Arcade",
    desc: "O duelo de raquetes mais icónico. Sozinho ou a dois.",
    path: "games/pong-classico/index.html",
    colors: ["#eef0fb", "#5da9ff"],
    icon: "pong",
    credit: "Código aberto (MIT) de Jake Gordon"
  },
  {
    id: "blocos",
    title: "Blocos em Queda",
    category: "Puzzle",
    desc: "Encaixa as peças e completa linhas antes que a torre chegue ao topo.",
    path: "games/blocos/index.html",
    colors: ["#c58bff", "#ff5d73"],
    icon: "blocks",
    credit: "Código aberto (MIT) de Jake Gordon"
  },
  {
    id: "meteoros",
    title: "Meteoros",
    category: "Ação",
    desc: "Pilota a nave, dispara e destrói os meteoros antes que te atinjam.",
    path: "games/meteoros/index.html",
    colors: ["#10131f", "#5da9ff"],
    icon: "ship",
    credit: "Código aberto (BSD) de James Socol"
  },
  {
    id: "corrida",
    title: "Corrida a Dois",
    category: "Arcade",
    desc: "Corre contra um amigo no mesmo teclado até à linha de chegada.",
    path: "games/corrida/index.html",
    colors: ["#1c2138", "#ff5d73"],
    icon: "car",
    credit: "Física adaptada (MIT) de Gaëtan Blaise-Cazalet"
  },
  {
    id: "impossivel",
    title: "O Jogo Impossível",
    category: "Ação",
    desc: "Atravessa a sala evitando as bolas em movimento. Um só toque e recomeças.",
    path: "games/impossivel/index.html",
    colors: ["#ff5d73", "#10131f"],
    icon: "dot"
  },
  {
    id: "simon",
    title: "Sequência de Cores",
    category: "Puzzle",
    desc: "Repete a sequência de cores que se acende. Cresce a cada ronda.",
    path: "games/simon/index.html",
    colors: ["#ff5d73", "#7ee8b5"],
    icon: "grid"
  },
  {
    id: "truck-parking",
    title: "Truck Parking Pro",
    category: "Camiões",
    desc: "Manobra o camião e estaciona na zona marcada sem tocar nos cones.",
    path: "games/truck-parking/index.html",
    colors: ["#2a2f45", "#7ee8b5"],
    icon: "car"
  },
  {
    id: "highway-escape",
    title: "Highway Escape",
    category: "Camiões",
    desc: "Foge da polícia desviando-te do trânsito nas três faixas.",
    path: "games/highway-escape/index.html",
    colors: ["#1c2138", "#ffd166"],
    icon: "car"
  },
  {
    id: "fuel-rush",
    title: "Fuel Rush",
    category: "Camiões",
    desc: "Gere o combustível e chega ao destino sem ficares parado na estrada.",
    path: "games/fuel-rush/index.html",
    colors: ["#1c2138", "#5da9ff"],
    icon: "bolt"
  },
  {
    id: "truck-jump",
    title: "Truck Jump",
    category: "Camiões",
    desc: "Acerta na potência certa e salta o mais longe possível na rampa.",
    path: "games/truck-jump/index.html",
    colors: ["#2a2f6a", "#ffd166"],
    icon: "target"
  },
  {
    id: "truck-memoria",
    title: "Truck Memory",
    category: "Camiões",
    desc: "Encontra os pares de veículos de transporte no menor número de jogadas.",
    path: "games/truck-memoria/index.html",
    colors: ["#ff9a5a", "#ffb199"],
    icon: "diamond"
  },
  {
    id: "truck-quiz",
    title: "Truck Quiz",
    category: "Camiões",
    desc: "Perguntas sobre camiões, estrada e transporte de mercadorias.",
    path: "games/truck-quiz/index.html",
    colors: ["#5da9ff", "#c58bff"],
    icon: "letter"
  },
  {
    id: "parking-jam",
    title: "Parking Jam",
    category: "Camiões",
    desc: "Desliza os veículos para abrires caminho ao camião vermelho.",
    path: "games/parking-jam/index.html",
    colors: ["#7ee8b5", "#5da9ff"],
    icon: "squares"
  },
  {
    id: "container-stack",
    title: "Container Stack",
    category: "Camiões",
    desc: "Larga os contentores no momento certo e constrói a torre mais alta.",
    path: "games/container-stack/index.html",
    colors: ["#2a2f6a", "#c58bff"],
    icon: "blocks"
  },
  {
    id: "wheel-change",
    title: "Wheel Change",
    category: "Camiões",
    desc: "Aperta os 5 parafusos no tempo certo e troca o pneu o mais rápido possível.",
    path: "games/wheel-change/index.html",
    colors: ["#1c2138", "#ff5d73"],
    icon: "target"
  },
  {
    id: "road-repair",
    title: "Road Repair",
    category: "Camiões",
    desc: "Repara os buracos na estrada antes que se multipliquem.",
    path: "games/road-repair/index.html",
    colors: ["#2a2f45", "#ffd166"],
    icon: "brick"
  },
  {
    id: "truck-wash",
    title: "Truck Wash Tycoon",
    category: "Camiões",
    desc: "Lava camiões, ganha dinheiro e investe em melhorias.",
    path: "games/truck-wash/index.html",
    colors: ["#5da9ff", "#7ee8b5"],
    icon: "bolt"
  },
  {
    id: "convoy",
    title: "Convoy Commander",
    category: "Camiões",
    desc: "Guia um comboio de 3 camiões em fila, evitando os obstáculos.",
    path: "games/convoy/index.html",
    colors: ["#1c2138", "#ff9a5a"],
    icon: "car"
  },
  {
    id: "nebulosa",
    title: "Nebulosa",
    category: "Ação",
    desc: "Clica nas esferas brilhantes antes que se desvaneçam no espaço.",
    path: "games/nebulosa/index.html",
    colors: ["#1a1440", "#c58bff"],
    icon: "orb"
  }
];

const CATEGORIES = ["Todos", "Puzzle", "Arcade", "Ação", "Tabuleiro", "Palavras", "Camiões"];

// Ícones simples desenhados em SVG (originais, sem dependências externas).
const ICON_PATHS = {
  diamond: '<path d="M50 20 L75 45 L50 80 L25 45 Z" fill="rgba(255,255,255,.9)"/>',
  bolt: '<path d="M55 15 L30 55 H47 L42 85 L70 42 H53 Z" fill="rgba(255,255,255,.9)"/>',
  grid: '<g fill="rgba(255,255,255,.9)"><rect x="22" y="22" width="24" height="24" rx="4"/><rect x="54" y="22" width="24" height="24" rx="4"/><rect x="22" y="54" width="24" height="24" rx="4"/><rect x="54" y="54" width="24" height="24" rx="4" fill="rgba(255,255,255,.55)"/></g>',
  cross: '<g stroke="rgba(255,255,255,.9)" stroke-width="7" stroke-linecap="round"><line x1="28" y1="28" x2="52" y2="52"/><line x1="52" y1="28" x2="28" y2="52"/></g><circle cx="65" cy="65" r="13" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="6"/>',
  squares: '<g fill="rgba(255,255,255,.9)"><rect x="18" y="18" width="28" height="28" rx="5"/><rect x="54" y="18" width="28" height="28" rx="5" fill="rgba(255,255,255,.55)"/><rect x="18" y="54" width="28" height="28" rx="5" fill="rgba(255,255,255,.55)"/><rect x="54" y="54" width="28" height="28" rx="5"/></g>',
  target: '<circle cx="50" cy="50" r="28" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="6"/><circle cx="50" cy="50" r="14" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="6"/><circle cx="50" cy="50" r="5" fill="rgba(255,255,255,.95)"/>',
  brick: '<g fill="rgba(255,255,255,.9)"><rect x="16" y="30" width="20" height="12" rx="2"/><rect x="40" y="30" width="20" height="12" rx="2" fill="rgba(255,255,255,.55)"/><rect x="64" y="30" width="20" height="12" rx="2"/><rect x="28" y="46" width="20" height="12" rx="2" fill="rgba(255,255,255,.55)"/><rect x="52" y="46" width="20" height="12" rx="2"/><circle cx="50" cy="74" r="6" fill="rgba(255,255,255,.95)"/></g>',
  letter: '<text x="50" y="65" font-size="46" font-weight="800" text-anchor="middle" fill="rgba(255,255,255,.9)" font-family="Segoe UI, sans-serif">A?</text>',
  pong: '<g fill="rgba(255,255,255,.9)"><rect x="18" y="25" width="8" height="24" rx="3"/><rect x="74" y="50" width="8" height="24" rx="3"/><circle cx="50" cy="50" r="7"/></g>',
  blocks: '<g fill="rgba(255,255,255,.9)"><rect x="20" y="20" width="18" height="18"/><rect x="38" y="20" width="18" height="18" fill="rgba(255,255,255,.55)"/><rect x="38" y="38" width="18" height="18"/><rect x="56" y="38" width="18" height="18" fill="rgba(255,255,255,.55)"/></g>',
  ship: '<g fill="none" stroke="rgba(255,255,255,.9)" stroke-width="4" stroke-linejoin="round"><path d="M50 25 L65 70 L50 60 L35 70 Z"/></g><circle cx="25" cy="30" r="2.5" fill="rgba(255,255,255,.7)"/><circle cx="72" cy="45" r="2" fill="rgba(255,255,255,.5)"/><circle cx="60" cy="20" r="1.5" fill="rgba(255,255,255,.6)"/>',
  car: '<g fill="rgba(255,255,255,.92)"><rect x="20" y="45" width="60" height="18" rx="6"/><rect x="30" y="32" width="40" height="18" rx="6"/><circle cx="32" cy="65" r="7" fill="rgba(0,0,0,.35)"/><circle cx="68" cy="65" r="7" fill="rgba(0,0,0,.35)"/></g>',
  dot: '<circle cx="35" cy="50" r="9" fill="rgba(255,255,255,.9)"/><circle cx="65" cy="35" r="9" fill="rgba(255,255,255,.6)"/><rect x="45" y="60" width="14" height="14" fill="rgba(255,255,255,.95)"/>',
  orb: '<circle cx="50" cy="50" r="22" fill="rgba(255,255,255,.85)"/><circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="3"/><circle cx="42" cy="42" r="5" fill="rgba(255,255,255,.95)"/>'
};

function gameCoverSVG(game) {
  const [c1, c2] = game.colors;
  const gid = "g-" + game.id;
  return `
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${c1}"/>
          <stop offset="100%" stop-color="${c2}"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#${gid})"/>
      <circle cx="85" cy="12" r="26" fill="rgba(255,255,255,.08)"/>
      <circle cx="10" cy="92" r="20" fill="rgba(0,0,0,.10)"/>
      ${ICON_PATHS[game.icon] || ""}
    </svg>
  `;
}
