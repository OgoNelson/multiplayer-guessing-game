// client.js (updated with winner rotation)
const socket = io();

// DOM elements
const usernameInput = document.getElementById("username");
const sessionInput = document.getElementById("sessionId");
const createBtn = document.getElementById("createBtn");
const joinBtn = document.getElementById("joinBtn");
const gameSection = document.getElementById("game");
const sessionDisplay = document.getElementById("sessionDisplay");
const roleDisplay = document.getElementById("roleDisplay");
const messagesDiv = document.getElementById("messages");
const playersList = document.getElementById("players");
const guessesList = document.getElementById("guesses");
const leaderboardList = document.getElementById("leaderboard");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const guessInput = document.getElementById("guessInput");
const guessBtn = document.getElementById("guessBtn");
const answerInput = document.getElementById("answerInput");
const revealBtn = document.getElementById("revealBtn");
const startBtn = document.getElementById("startBtn");
const leaveBtn = document.getElementById("leaveBtn");
const gmControls = document.getElementById("gmControls");

// Additional inputs for game master question and answer
let questionInput = document.createElement("input");
questionInput.placeholder = "Enter your question";
questionInput.id = "questionInput";
questionInput.classList.add(
  "rounded-md",
  "bg-slate-800",
  "border",
  "border-slate-700",
  "px-3",
  "py-2",
  "text-sm",
  "outline-none",
  "flex-1"
);
gmControls.insertBefore(questionInput, answerInput);

// Game state
let masterName, playerName, sessionId;
let players = [];
let guesses = [];
let attemptsLeft = 3;
let isGameMaster = false;
let gameInProgress = false;
let timer = null;
let timeLeft = 60;

// DOM helpers
function addMessage(text, system = false) {
  const div = document.createElement("div");
  div.textContent = system ? `[SYSTEM] ${text}` : text;
  if (system) div.style.color = "#94a3b8";
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function updatePlayersUI() {
  playersList.innerHTML = players
    .map((p) => `<li>${p.name} (${p.score} pts)</li>`)
    .join("");
  leaderboardList.innerHTML = players
    .slice()
    .sort((a, b) => b.score - a.score)
    .map((p) => `<li>${p.name}: ${p.score}</li>`)
    .join("");
}

function updateGuessesUI() {
  guessesList.innerHTML = guesses
    .slice(-5)
    .reverse()
    .map((g) => `<li>${g.name}: ${g.guess} ${g.correct ? "✅" : ""}</li>`)
    .join("");
}

function resetGameRound() {
  guesses = [];
  attemptsLeft = 3;
  guessInput.disabled = false;
  updateGuessesUI();
}

function startTimer() {
  timeLeft = 60;
  timer = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(timer);
      addMessage(
        `Time expired! The correct answer was: ${answerInput.value}`,
        true
      );
      guessInput.disabled = true;
      gameInProgress = false;
      rotateGameMaster();
    }
  }, 1000);
}

function rotateGameMaster() {
  if (!players.length) return;
  const currentIndex = players.findIndex((p) => p.name === username);
  const nextIndex = (currentIndex + 1) % players.length;
  isGameMaster = players[nextIndex].name === username;

  if (isGameMaster) {
    addMessage("You are now the Game Master!", true);
    gmControls.classList.remove("hidden");
    startBtn.classList.remove("hidden");
    answerInput.value = "";
    questionInput.value = "";
  } else {
    addMessage(`${players[nextIndex].name} is now the Game Master!`, true);
    gmControls.classList.add("hidden");
    startBtn.classList.add("hidden");
  }
  guessInput.disabled = true;
  gameInProgress = false;
}

// Socket event handlers
socket.on("updatePlayers", (playerList) => {
  players = playerList;
  updatePlayersUI();
});

socket.on("sessionCreated", ({ sessionId: id, players: playerList }) => {
  sessionId = id;
  players = playerList;
  isGameMaster = true;
  gameInProgress = false;

  sessionDisplay.textContent = sessionId;
  roleDisplay.textContent = "Game Master";
  updatePlayersUI();

  document.querySelector(".connection").classList.add("hidden");
  gameSection.classList.remove("hidden");
  startBtn.classList.remove("hidden");
  leaveBtn.classList.remove("hidden");
  gmControls.classList.remove("hidden");
});

socket.on("joinedSession", ({ sessionId: id, players: playerList }) => {
  sessionId = id;
  players = playerList;
  isGameMaster = false;
  gameInProgress = false;

  sessionDisplay.textContent = sessionId;
  roleDisplay.textContent = "Player";
  updatePlayersUI();

  document.querySelector(".connection").classList.add("hidden");
  gameSection.classList.remove("hidden");
  leaveBtn.classList.remove("hidden");
});

socket.on("gameStarted", ({ question }) => {
  addMessage(`Game started! Question: ${question}`, true);
  gameInProgress = true;
  guessInput.disabled = false;
  resetGameRound();
  startTimer();
});

socket.on("guessResult", ({ name, guess, correct }) => {
  guesses.push({ name, guess, correct });
  if (correct) {
    addMessage(`${name} has guessed correctly!`, true);
    guessInput.disabled = true;
    gameInProgress = false;
    clearInterval(timer);
    if (name === username) {
      players.find((p) => p.name === username).score += 10;
    }
    updatePlayersUI();
    rotateGameMaster();
  }
  updateGuessesUI();
});

// Buttons
createBtn.onclick = () => {
  masterName = usernameInput.value.trim();
  if (!username) return alert("Enter your name");
  socket.emit("createSession", { masterName });
};

joinBtn.onclick = () => {
  username = usernameInput.value.trim();
  sessionId = sessionInput.value.trim().toUpperCase();
  if (!username || !sessionId) return alert("Enter name and session ID");
  socket.emit("joinSession", { username, sessionId });
};

startBtn.onclick = () => {
  if (players.length < 2) return alert("At least 2 players required to start");
  const question = questionInput.value.trim();
  const answer = answerInput.value.trim();
  if (!question || !answer) return alert("Question and answer required");

  socket.emit("startGame", { sessionId, question, answer });
  gameInProgress = true;
  guessInput.disabled = false;
  resetGameRound();
  startTimer();
};

guessBtn.onclick = () => {
  if (!gameInProgress) return;
  if (attemptsLeft <= 0) return alert("No attempts left");
  const guess = guessInput.value.trim();
  if (!guess) return;
  socket.emit("submitGuess", { sessionId, username, guess });
  attemptsLeft--;
  guessInput.value = "";
};

revealBtn.onclick = () => {
  if (!isGameMaster) return;
  addMessage(`Answer revealed: ${answerInput.value}`, true);
  guessInput.disabled = true;
  gameInProgress = false;
  clearInterval(timer);
  rotateGameMaster();
};

leaveBtn.onclick = () => location.reload();
