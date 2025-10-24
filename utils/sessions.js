const sessions = new Map();

const createSession = (masterName) => {
  const sessionId = Math.random().toString(36).substring(2, 8);
  sessions.set(sessionId, {
    id: sessionId,
    master: masterName,
    players: [{ name: masterName, score: 0 }],
    question: null,
    answer: null,
    started: false,
    timer: null,
    round: 1,
  });
  return sessions.get(sessionId);
}

const addPlayer = (sessionId, playerName) => {
  const session = sessions.get(sessionId);
  if (!session) return null;
  const exists = session.players.some((p) => p.name === playerName);
  if (!exists) session.players.push({ name: playerName, score: 0 });
  return session;
}

const getSession = (sessionId) => {
  return sessions.get(sessionId);
}

const addScore = (sessionId, playerName, points) => {
  const session = sessions.get(sessionId);
  if (!session) return;
  const player = session.players.find((p) => p.name === playerName);
  if (player) player.score += points;
}

const getScores = (sessionId) => {
  const session = sessions.get(sessionId);
  return session ? session.players : [];
}

const endGame = (sessionId) => {
  const session = sessions.get(sessionId);
  if (!session) return;
  if (session.timer) clearTimeout(session.timer);
  session.started = false;
  session.timer = null;
}

const rotateMaster = (sessionId) => {
  const session = sessions.get(sessionId);
  if (!session) return null;
  const players = session.players;
  if (players.length < 2) return session.master;

  const currentIndex = players.findIndex((p) => p.name === session.master);
  const nextIndex = (currentIndex + 1) % players.length;
  session.master = players[nextIndex].name;
  session.round += 1;
  session.question = null;
  session.answer = null;
  session.started = false;
  return session.master;
}

const deleteSession = (sessionId) => {
  const session = sessions.get(sessionId);
  if (session && session.timer) clearTimeout(session.timer);
  sessions.delete(sessionId);
}

module.exports = {
  createSession,
  addPlayer,
  getSession,
  addScore,
  getScores,
  endGame,
  rotateMaster,
  deleteSession,
};
