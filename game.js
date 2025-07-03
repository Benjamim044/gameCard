let currentPlayer = 1;
let mana1 = 5, mana2 = 5;
let hp1 = 1200, hp2 = 1200;
let cards1 = [], cards2 = [];

const cardPool = [
  { img: "img/sung_jinwoo.png", name: "Sung Jin-Woo", atk: 700, def: 500, mana: 4 },
  { img: "img/beru.png", name: "Beru", atk: 600, def: 400, mana: 3 },
  { img: "img/igrit.png", name: "Igrit", atk: 500, def: 600, mana: 3 },
  { img: "img/tank.png", name: "Tank", atk: 400, def: 700, mana: 3 },
  { img: "img/iron.png", name: "Iron", atk: 450, def: 550, mana: 2 },
  { img: "img/bellion.png", name: "Bellion", atk: 800, def: 600, mana: 5 },
  { img: "img/kaisar.png", name: "Kaisel", atk: 650, def: 500, mana: 4 },
  // adicione mais personagens se desejar
];

function startGame() {
  document.getElementById("intro-screen").classList.add("hidden");
  document.getElementById("game-area").classList.remove("hidden");
  setupBattlefield();
  log("Jogo iniciado! Boa sorte.");
}

function setupBattlefield() {
  const slots1 = document.getElementById("guild1-slots");
  const slots2 = document.getElementById("guild2-slots");
  slots1.innerHTML = '';
  slots2.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    slots1.appendChild(createSlot(`slot1-${i}`));
    slots2.appendChild(createSlot(`slot2-${i}`));
  }
}

function createSlot(id) {
  const slot = document.createElement("div");
  slot.className = "slot";
  slot.id = id;
  slot.ondrop = drop;
  slot.ondragover = allowDrop;
  return slot;
}

function buyCard() {
  if (currentPlayer !== 1) return;
  if (cards1.length >= 4) {
    log("Limite de cartas na mão atingido.");
    return;
  }
  const card = createCardFromPool();
  document.getElementById("hand1").appendChild(card);
  cards1.push(card);
  log("Carta comprada!");
}

function createCardFromPool() {
  const data = cardPool[Math.floor(Math.random() * cardPool.length)];
  const card = document.createElement("div");
  card.className = "card";
  card.draggable = true;
  card.ondragstart = drag;

  const img = document.createElement("img");
  img.src = data.img;
  img.alt = data.name;
  card.appendChild(img);

  const info = document.createElement("div");
  info.className = "info";
  info.innerHTML = `${data.name}<br>ATK: ${data.atk}<br>DEF: ${data.def}<br>MANA: ${data.mana}`;
  card.dataset.atk = data.atk;
  card.dataset.def = data.def;
  card.dataset.mana = data.mana;
  card.appendChild(info);

  return card;
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  const slot = ev.target.closest(".slot");
  if (!slot) return;
  const card = document.querySelector(".dragging");
  if (!card) return;
  const manaCost = parseInt(card.dataset.mana);
  if (mana1 < manaCost) {
    log("Mana insuficiente para posicionar a carta!");
    return;
  }
if (currentPlayer === 1) {
  mana1 -= manaCost;
} else {
  mana2 -= manaCost;
}
updateMana();

  slot.innerHTML = "";
  slot.appendChild(card);
  card.classList.add("card-drop-effect");
setTimeout(() => card.classList.remove("card-drop-effect"), 500);
  log("Carta posicionada!");
}

document.addEventListener("dragstart", (ev) => {
  if (ev.target.classList.contains("card")) {
    ev.target.classList.add("dragging");
  }
});
document.addEventListener("dragend", (ev) => {
  ev.target.classList.remove("dragging");
});

function attackOpponent() {
  if (currentPlayer !== 1) return;
  resolveBattle();
}
function destroyCardWithEffect(card, slot) {
  console.log("Destruindo carta", card, slot);
  card.classList.add("card-destroy-effect");
  setTimeout(() => {
    slot.innerHTML = "";
  }, 500);
}

function resolveBattle() {
  const guild1Slots = document.getElementById("guild1-slots").children;
  const guild2Slots = document.getElementById("guild2-slots").children;
  for (let i = 0; i < 5; i++) {
    const atkCard = guild1Slots[i].querySelector(".card");
    const defCard = guild2Slots[i].querySelector(".card");
    if (atkCard && defCard) {
      const atk = parseInt(atkCard.dataset.atk);
      const def = parseInt(defCard.dataset.atk);
      if (atk > def) {
        destroyCardWithEffect(defCard, guild2Slots[i]); // carta inimiga destruída
        log(`Carta do inimigo no slot ${i + 1} foi destruída!`);
      } else if (atk < def) {
        destroyCardWithEffect(atkCard, guild1Slots[i]); // sua carta destruída
        log(`Sua carta no slot ${i + 1} foi destruída!`);
      } else {
        log(`Empate no slot ${i + 1}, ninguém foi destruído.`);
      }
    } else if (atkCard && !defCard) {
      const directDamage = Math.floor(parseInt(atkCard.dataset.atk) * 0.1);
      hp2 -= directDamage;
      log(`Você causou ${atkCard.dataset.atk} de dano direto!`);
    }
  }
  updateLife();
  endTurn();
}

function endTurn() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  mana1 = 5;
  mana2 = 5;
  updateMana();
  log(`É a vez do jogador ${currentPlayer}.`);
  if (currentPlayer === 2) iaPlay();
}

function iaPlay() {
  setTimeout(() => {
    buyCardIA();
    setTimeout(() => attackOpponentIA(), 2000);
  }, 1000);
}

function buyCardIA() {
  if (cards2.length < 4) {
    const card = createCardFromPool();
    const manaCost = parseInt(card.dataset.mana);
mana2 -= manaCost;
updateMana();

    document.getElementById("hand2").appendChild(card);
    cards2.push(card);
    log("IA comprou uma carta.");
  }
}

function attackOpponentIA() {
  resolveBattle();
}

function resetGame() {
  location.reload();
}

function updateMana() {
  document.getElementById("mana1").textContent = mana1;
  document.getElementById("mana2").textContent = mana2;
}

function updateLife() {
  hp1 = Math.max(0, hp1);
  hp2 = Math.max(0, hp2);
  document.getElementById("hp1").textContent = hp1;
  document.getElementById("hp2").textContent = hp2;
  if (hp1 <= 0) {
    log("Você perdeu! O jogo será reiniciado em 3 segundos.");
    setTimeout(resetGame, 3000);
  } else if (hp2 <= 0) {
    log("Você venceu! O jogo será reiniciado em 3 segundos.");
    setTimeout(resetGame, 3000);
  }
}

function log(message) {
  const chat = document.getElementById("chat-log");
  const p = document.createElement("p");
  p.textContent = message;
  chat.appendChild(p);
  chat.scrollTop = chat.scrollHeight;
}
document.addEventListener("mousemove", (e) => {
  const title = document.querySelector("header h1");
  const x = (e.clientX / window.innerWidth - 0.5) * 20; // -10~10 graus
  const y = (e.clientY / window.innerHeight - 0.5) * 20;
  title.style.transform = `rotateX(${-y}deg) rotateY(${x}deg)`;
});
