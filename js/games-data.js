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
    id: "estrada3d",
    title: "Estrada 3D",
    category: "3D",
    desc: "Conduz numa estrada com perspetiva real e desvia-te do trânsito.",
    path: "games/estrada3d/index.html",
    colors: ["#0b0e1a", "#ff5d73"],
    icon: "car"
  },
  {
    id: "labirinto3d",
    title: "Labirinto 3D",
    category: "3D",
    desc: "Explora um labirinto em primeira pessoa e encontra a saída dourada.",
    path: "games/labirinto3d/index.html",
    colors: ["#141830", "#ffd166"],
    icon: "squares"
  },
  {
    id: "tunel-neon",
    title: "Túnel Neon",
    category: "3D",
    desc: "Voa por um túnel neon e atravessa a abertura de cada anel.",
    path: "games/tunel-neon/index.html",
    colors: ["#05010a", "#c58bff"],
    icon: "target"
  },
  {
    id: "torre3d",
    title: "Torre 3D",
    category: "3D",
    desc: "Empilha blocos em 3D e constrói a torre mais alta possível.",
    path: "games/torre3d/index.html",
    colors: ["#141830", "#7ee8b5"],
    icon: "blocks"
  },
  {
    id: "nebulosa",
    title: "Nebulosa",
    category: "Ação",
    desc: "Clica nas esferas brilhantes antes que se desvaneçam no espaço.",
    path: "games/nebulosa/index.html",
    colors: ["#1a1440", "#c58bff"],
    icon: "orb"
  },
  {
    id: "conecta4",
    title: "Conecta 4",
    category: "Tabuleiro",
    desc: "Alinha 4 peças na horizontal, vertical ou diagonal contra o computador.",
    path: "games/conecta4/index.html",
    colors: ["#ff5d73", "#ffd166"],
    icon: "grid"
  },
  {
    id: "adivinha-numero",
    title: "Adivinha o Número",
    category: "Puzzle",
    desc: "Descobre o número secreto entre 1 e 100 com pistas de maior ou menor.",
    path: "games/adivinha-numero/index.html",
    colors: ["#5da9ff", "#7ee8b5"],
    icon: "target"
  },
  {
    id: "anagrama",
    title: "Anagrama",
    category: "Palavras",
    desc: "Desordena as letras à tua frente e descobre a palavra escondida.",
    path: "games/anagrama/index.html",
    colors: ["#ffd166", "#ff9a5a"],
    icon: "letter"
  },
  {
    id: "batalha-naval",
    title: "Batalha Naval",
    category: "Tabuleiro",
    desc: "Afunda a frota escondida com o menor número de tiros possível.",
    path: "games/batalha-naval/index.html",
    colors: ["#1c3a5e", "#5da9ff"],
    icon: "ship"
  },
  {
    id: "caca-palavras",
    title: "Caça-Palavras",
    category: "Palavras",
    desc: "Encontra as palavras escondidas na grelha de letras.",
    path: "games/caca-palavras/index.html",
    colors: ["#7ee8b5", "#5da9ff"],
    icon: "squares"
  },
  {
    id: "toupeira",
    title: "Toca-a-Toupeira",
    category: "Ação",
    desc: "Clica nas toupeiras assim que espreitarem do buraco.",
    path: "games/toupeira/index.html",
    colors: ["#8a5a2a", "#ff9a5a"],
    icon: "mole"
  },
  {
    id: "hanoi",
    title: "Torres de Hanói",
    category: "Puzzle",
    desc: "Move a torre de discos de uma coluna para outra sem erros.",
    path: "games/hanoi/index.html",
    colors: ["#c58bff", "#ff5d73"],
    icon: "tower"
  },
  {
    id: "bolhas",
    title: "Bolhas",
    category: "Puzzle",
    desc: "Rebenta grupos de bolhas da mesma cor para somares pontos.",
    path: "games/bolhas/index.html",
    colors: ["#5da9ff", "#c58bff"],
    icon: "bubbles"
  },
  {
    id: "quiz",
    title: "Quiz Rápido",
    category: "Palavras",
    desc: "10 perguntas de cultura geral: geografia, ciência e curiosidades.",
    path: "games/quiz/index.html",
    colors: ["#ffd166", "#7ee8b5"],
    icon: "letter"
  },
  {
    id: "dardos",
    title: "Dardos",
    category: "Desporto",
    desc: "Acerta no alvo em movimento com 6 dardos.",
    path: "games/dardos/index.html",
    colors: ["#ff5d73", "#ffd166"],
    icon: "target"
  },
  {
    id: "basquetebol",
    title: "Cesto Livre",
    category: "Desporto",
    desc: "Arrasta e larga para acertares o máximo de cestos em 40 segundos.",
    path: "games/basquetebol/index.html",
    colors: ["#ff9a5a", "#1a1e33"],
    icon: "ball"
  },
  {
    id: "penalti",
    title: "Grande Penalidade",
    category: "Desporto",
    desc: "Escolhe o canto e tenta enganar o guarda-redes em 5 pontapés.",
    path: "games/penalti/index.html",
    colors: ["#2a5a2a", "#eef0fb"],
    icon: "goal"
  },
  {
    id: "golfe",
    title: "Golfe de Um Buraco",
    category: "Desporto",
    desc: "Estilingue a bola até ao buraco com o menor número de pancadas.",
    path: "games/golfe/index.html",
    colors: ["#163a24", "#7ee8b5"],
    icon: "golfflag"
  },
  {
    id: "labirinto",
    title: "Labirinto",
    category: "Puzzle",
    desc: "Percorre o labirinto do canto verde até ao canto dourado.",
    path: "games/labirinto/index.html",
    colors: ["#10131f", "#5da9ff"],
    icon: "squares"
  },
  {
    id: "corredor",
    title: "Corredor Sem Fim",
    category: "Arcade",
    desc: "Salta os obstáculos e sobrevive o máximo de tempo possível.",
    path: "games/corredor/index.html",
    colors: ["#1a2440", "#ff5d73"],
    icon: "bolt"
  },
  {
    id: "roda-sorte3d",
    title: "Roda da Sorte 3D",
    category: "3D",
    desc: "Gira a roda, avança no tabuleiro circular e cai na casa Curinga para duplicares pontos.",
    path: "games/roda-sorte3d/index.html",
    colors: ["#141830", "#ffd166"],
    icon: "target"
  },
  {
    id: "aventura-vila3d",
    title: "Aventura na Vila 3D",
    category: "3D",
    desc: "Explora uma vila original em 3D, recolhe moedas e foge dos guardas em patrulha.",
    path: "games/aventura-vila3d/index.html",
    colors: ["#7bb8e8", "#2f9a8f"],
    icon: "orb"
  },
  {
    id: "imperio3d",
    title: "Império Imobiliário 3D",
    category: "3D",
    desc: "Compra terrenos, cobra rendas e tenta não ficar sem dinheiro contra o rival.",
    path: "games/imperio3d/index.html",
    colors: ["#141830", "#7ee8b5"],
    icon: "grid"
  },
  {
    id: "quinta3d",
    title: "Quinta Feliz 3D",
    category: "3D",
    desc: "Planta, cuida e colhe em 3D. Gere a tua pequena quinta e enche os bolsos de moedas.",
    path: "games/quinta3d/index.html",
    colors: ["#8fd0f0", "#5fae52"],
    icon: "orb"
  },
  {
    id: "sudoku",
    title: "Sudoku 6x6",
    category: "Puzzle",
    desc: "Preenche a grelha 6x6 sem repetir números na linha, coluna ou caixa.",
    path: "games/sudoku/index.html",
    colors: ["#5da9ff", "#7ee8b5"],
    icon: "grid"
  },
  {
    id: "damas",
    title: "Damas",
    category: "Tabuleiro",
    desc: "O clássico jogo de damas contra o computador, com captura e promoção a dama.",
    path: "games/damas/index.html",
    colors: ["#6b4a2a", "#d8c7a1"],
    icon: "grid"
  },
  {
    id: "ar-hoquei",
    title: "Ar Hóquei",
    category: "Desporto",
    desc: "Defende a baliza e marca golos contra o computador com o rato.",
    path: "games/ar-hoquei/index.html",
    colors: ["#0f2a3a", "#5da9ff"],
    icon: "target"
  },
  {
    id: "dados-sorte",
    title: "Dados da Sorte",
    category: "Tabuleiro",
    desc: "Lança os dados e marca pontos nas categorias certas ao longo de 9 rondas.",
    path: "games/dados-sorte/index.html",
    colors: ["#ffd166", "#ff9a5a"],
    icon: "squares"
  },
  {
    id: "digitacao",
    title: "Teste de Digitação",
    category: "Palavras",
    desc: "Escreve o texto o mais rápido e certo possível e descobre as tuas palavras por minuto.",
    path: "games/digitacao/index.html",
    colors: ["#5da9ff", "#c58bff"],
    icon: "letter"
  },
  {
    id: "sequencia-numerica",
    title: "Sequência Numérica",
    category: "Puzzle",
    desc: "Memoriza e repete sequências de números cada vez mais longas.",
    path: "games/sequencia-numerica/index.html",
    colors: ["#5da9ff", "#ff5d73"],
    icon: "grid"
  },
  {
    id: "tyre-dodge",
    title: "Tyre Dodge",
    category: "Camiões",
    desc: "Desvia-te dos pneus soltos na estrada nas três faixas.",
    path: "games/tyre-dodge/index.html",
    colors: ["#1c2138", "#3a3a3a"],
    icon: "car"
  },
  {
    id: "forklift",
    title: "Forklift Master",
    category: "Camiões",
    desc: "Larga as paletes no momento certo e encadeia combos para multiplicar pontos.",
    path: "games/forklift/index.html",
    colors: ["#3a3f5c", "#ffd166"],
    icon: "blocks"
  },
  {
    id: "sinuca",
    title: "Sinuca",
    category: "Desporto",
    desc: "Estilingue a bola branca e mete todas as bolas coloridas nas caçapas.",
    path: "games/sinuca/index.html",
    colors: ["#0b3d24", "#eef0fb"],
    icon: "ball"
  },
  {
    id: "boliche",
    title: "Boliche",
    category: "Desporto",
    desc: "Mira, lança e derruba o máximo de pinos possível em 10 frames.",
    path: "games/boliche/index.html",
    colors: ["#3a2c1a", "#eef0fb"],
    icon: "ball"
  },
  {
    id: "snow-plow",
    title: "Snow Plow Challenge",
    category: "Camiões",
    desc: "Limpa a neve da estrada antes que a tempestade te apanhe.",
    path: "games/snow-plow/index.html",
    colors: ["#c7d7e0", "#5da9ff"],
    icon: "car"
  },
  {
    id: "heptatlo",
    title: "Heptatlo",
    category: "Desporto",
    desc: "Sete provas de atletismo: corre, salta e lança para somares a maior pontuação.",
    path: "games/heptatlo/index.html",
    colors: ["#1c2138", "#ffd166"],
    icon: "target"
  },
  {
    id: "cacador-labirinto",
    title: "Caçador do Labirinto",
    category: "Ação",
    desc: "Come todos os pontos do labirinto e foge dos perseguidores. Apanha a esfera para os comeres a eles.",
    path: "games/cacador-labirinto/index.html",
    colors: ["#0a0a1a", "#7ee8b5"],
    icon: "dot"
  },
  {
    id: "esqui",
    title: "Esqui Alpino",
    category: "Desporto",
    desc: "Desvia-te das árvores e passa pelas portas de slalom o mais rápido possível.",
    path: "games/esqui/index.html",
    colors: ["#eaf4fb", "#5da9ff"],
    icon: "target"
  },
  {
    id: "artilharia",
    title: "Artilharia",
    category: "Ação",
    desc: "Ajusta ângulo e potência, dispara e destrói o terreno num duelo por turnos.",
    path: "games/artilharia/index.html",
    colors: ["#4a7fc7", "#ff5d73"],
    icon: "target"
  },
  {
    id: "campo-minado",
    title: "Campo Minado",
    category: "Puzzle",
    desc: "Revela as células sem tocar nas minas escondidas, usando os números como pistas.",
    path: "games/campo-minado/index.html",
    colors: ["#0a0d18", "#ff5d73"],
    icon: "grid"
  },
  {
    id: "sokoban",
    title: "Sokoban",
    category: "Puzzle",
    desc: "Empurra as caixas até às marcas douradas sem as encravares.",
    path: "games/sokoban/index.html",
    colors: ["#1c2138", "#ffd166"],
    icon: "squares"
  },
  {
    id: "arco-flecha",
    title: "Arco e Flecha",
    category: "Desporto",
    desc: "Ajusta ângulo e força, e tem cuidado com o vento para acertares no alvo.",
    path: "games/arco-flecha/index.html",
    colors: ["#7bb8e8", "#ffd166"],
    icon: "target"
  },
  {
    id: "voleibol",
    title: "Voleibol de Praia",
    category: "Desporto",
    desc: "Rebate a bola por cima da rede e chega primeiro aos 5 pontos.",
    path: "games/voleibol/index.html",
    colors: ["#7bb8e8", "#f0d896"],
    icon: "ball"
  },
  {
    id: "pinball",
    title: "Pinball",
    category: "Arcade",
    desc: "Lança a bola, usa os flippers e acerta nos para-choques para somares pontos.",
    path: "games/pinball/index.html",
    colors: ["#10131f", "#ffd166"],
    icon: "orb"
  },
  {
    id: "paciencia",
    title: "Paciência",
    category: "Tabuleiro",
    desc: "O clássico jogo de cartas Klondike. Organiza as fundações por naipe do Ás ao Rei.",
    path: "games/paciencia/index.html",
    colors: ["#1c2138", "#eef0fb"],
    icon: "letter"
  },
  {
    id: "mahjong",
    title: "Mahjong Solitário",
    category: "Puzzle",
    desc: "Remove pares de peças livres até limpares o tabuleiro por completo.",
    path: "games/mahjong/index.html",
    colors: ["#f4f0e6", "#cfc6ac"],
    icon: "squares"
  },
  {
    id: "fusao-frutas",
    title: "Fusão de Frutas",
    category: "Puzzle",
    desc: "Larga frutas iguais para as fundires em frutas maiores sem passares da linha.",
    path: "games/fusao-frutas/index.html",
    colors: ["#fdf6e3", "#ff9a5a"],
    icon: "orb"
  },
  {
    id: "ciclismo",
    title: "Corrida de Bicicleta",
    category: "Desporto",
    desc: "Pedala pelas colinas e salta obstáculos o mais longe possível.",
    path: "games/ciclismo/index.html",
    colors: ["#7bb8e8", "#a8d888"],
    icon: "target"
  },
  {
    id: "corrida-gp",
    title: "Corrida GP",
    category: "Camiões",
    desc: "Acelera, trava e faz a curva certa para venceres o rival em 3 voltas de circuito.",
    path: "games/corrida-gp/index.html",
    colors: ["#3a7a3a", "#ffd166"],
    icon: "car"
  },
  {
    id: "motocross",
    title: "Motocross",
    category: "Desporto",
    desc: "Acelera, salta rampas e equilibra a mota no ar para fazeres combos.",
    path: "games/motocross/index.html",
    colors: ["#e8b878", "#a86a3a"],
    icon: "target"
  },
  {
    id: "ritmo-magico",
    title: "Ritmo Mágico",
    category: "Ação",
    desc: "Acerta nas notas certas ao ritmo certo em 4 colunas — encadeia combos sem perderes vidas.",
    path: "games/ritmo-magico/index.html",
    colors: ["#5da9ff", "#ff5d73"],
    icon: "note"
  },
  {
    id: "cores-secretas",
    title: "Cores Secretas",
    category: "Puzzle",
    desc: "Descobre a combinação secreta de 4 cores em 10 tentativas usando as pistas de acertos.",
    path: "games/cores-secretas/index.html",
    colors: ["#2d2d3a", "#ff5d73"],
    icon: "dot"
  },
  {
    id: "reversi",
    title: "Reversi",
    category: "Tabuleiro",
    desc: "Vira as peças do adversário e domina o tabuleiro. O clássico jogo de estratégia.",
    path: "games/reversi/index.html",
    colors: ["#0d3d1f", "#f0f0f0"],
    icon: "ball"
  },
  {
    id: "gemas-magicas",
    title: "Gemas Mágicas",
    category: "Puzzle",
    desc: "Troca gemas adjacentes para alinhares 3 ou mais da mesma cor e soma pontos contra o tempo.",
    path: "games/gemas-magicas/index.html",
    colors: ["#c792ea", "#ff9a5a"],
    icon: "diamond"
  },
  {
    id: "palavra-secreta",
    title: "Palavra Secreta",
    category: "Palavras",
    desc: "Descobre a palavra de 5 letras em 6 tentativas com pistas de cor a cada tentativa.",
    path: "games/palavra-secreta/index.html",
    colors: ["#4caf6d", "#d9b23c"],
    icon: "letter"
  },
  {
    id: "vinte-e-um",
    title: "Vinte e Um",
    category: "Tabuleiro",
    desc: "Chega o mais perto possível de 21 sem passares e vence a banca.",
    path: "games/vinte-e-um/index.html",
    colors: ["#0d3d1f", "#d9364a"],
    icon: "squares"
  },
  {
    id: "defensor-espacial",
    title: "Defensor Espacial",
    category: "Ação",
    desc: "Destrói as vagas de invasores antes que cheguem até ti e desvia-te dos disparos.",
    path: "games/defensor-espacial/index.html",
    colors: ["#05070f", "#7ee8b5"],
    icon: "ship"
  },
  {
    id: "traversia",
    title: "Traversia",
    category: "Arcade",
    desc: "Atravessa a estrada e o rio, desvia-te do trânsito e salta de tronco em tronco até à margem.",
    path: "games/traversia/index.html",
    colors: ["#2d5a3a", "#1a4a7a"],
    icon: "cross"
  },
  {
    id: "tenis-mesa",
    title: "Ténis de Mesa",
    category: "Desporto",
    desc: "Rebate a bola por cima da rede com o rato e vence o computador até 11 pontos.",
    path: "games/tenis-mesa/index.html",
    colors: ["#0d3d5c", "#ffd166"],
    icon: "pong"
  },
  {
    id: "boxe",
    title: "Boxe",
    category: "Desporto",
    desc: "Reage aos comandos de soco e defesa mais rápido que o adversário para venceres o combate.",
    path: "games/boxe/index.html",
    colors: ["#5da9ff", "#ff5d73"],
    icon: "cross"
  },
  {
    id: "torres-coloridas",
    title: "Torres Coloridas",
    category: "Puzzle",
    desc: "Larga o bloco no momento certo para alinhares com a torre e a manteres o mais larga possível.",
    path: "games/torres-coloridas/index.html",
    colors: ["#5da9ff", "#ffd166"],
    icon: "tower"
  },
  {
    id: "basquete3d",
    title: "Basquete 3D",
    category: "3D",
    desc: "Carrega para ajustares a potência e acerta no cesto em 3D antes que o tempo acabe.",
    path: "games/basquete3d/index.html",
    colors: ["#0d1a2f", "#ff9a5a"],
    icon: "ball"
  }
];

const CATEGORIES = ["Todos", "Puzzle", "Arcade", "Ação", "Tabuleiro", "Palavras", "Camiões", "3D", "Desporto"];

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
  orb: '<circle cx="50" cy="50" r="22" fill="rgba(255,255,255,.85)"/><circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="3"/><circle cx="42" cy="42" r="5" fill="rgba(255,255,255,.95)"/>',
  mole: '<ellipse cx="50" cy="58" rx="26" ry="20" fill="rgba(255,255,255,.9)"/><circle cx="30" cy="34" r="9" fill="rgba(255,255,255,.9)"/><circle cx="70" cy="34" r="9" fill="rgba(255,255,255,.9)"/><circle cx="42" cy="55" r="3" fill="rgba(0,0,0,.4)"/><circle cx="58" cy="55" r="3" fill="rgba(0,0,0,.4)"/>',
  tower: '<g fill="rgba(255,255,255,.9)"><rect x="30" y="20" width="40" height="10" rx="3"/><rect x="24" y="34" width="52" height="10" rx="3" fill="rgba(255,255,255,.7)"/><rect x="18" y="48" width="64" height="10" rx="3" fill="rgba(255,255,255,.55)"/><rect x="14" y="64" width="72" height="10" rx="3" fill="rgba(255,255,255,.4)"/></g>',
  bubbles: '<circle cx="35" cy="45" r="16" fill="rgba(255,255,255,.85)"/><circle cx="62" cy="35" r="12" fill="rgba(255,255,255,.65)"/><circle cx="60" cy="62" r="10" fill="rgba(255,255,255,.55)"/>',
  ball: '<circle cx="50" cy="50" r="26" fill="rgba(255,255,255,.9)"/><path d="M50 24 V76 M24 50 H76 M30 32 Q50 50 30 68 M70 32 Q50 50 70 68" stroke="rgba(0,0,0,.3)" stroke-width="2" fill="none"/>',
  goal: '<g stroke="rgba(255,255,255,.9)" stroke-width="4" fill="none"><rect x="22" y="24" width="56" height="38"/><path d="M22 24 L30 34 M78 24 L70 34 M22 62 L30 52 M78 62 L70 52 M22 24 L22 62 M78 24 L78 62"/></g><circle cx="50" cy="72" r="6" fill="rgba(255,255,255,.9)"/>',
  golfflag: '<line x1="35" y1="20" x2="35" y2="82" stroke="rgba(255,255,255,.9)" stroke-width="4"/><path d="M35 22 L68 32 L35 42 Z" fill="rgba(255,255,255,.9)"/><ellipse cx="35" cy="82" rx="20" ry="6" fill="rgba(255,255,255,.25)"/>',
  note: '<g fill="rgba(255,255,255,.9)"><circle cx="30" cy="68" r="11"/><circle cx="66" cy="60" r="11"/><rect x="39" y="24" width="6" height="46"/><rect x="75" y="18" width="6" height="44"/><path d="M39 24 L81 18 V30 L39 42 Z"/></g>'
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
