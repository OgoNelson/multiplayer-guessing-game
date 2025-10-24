const {
  createSession,
  addPlayer,
  getSession,
  addScore,
  getScores,
  endGame,
} = require("../utils/sessions");

//======================
// Create Game session
//======================
const createSessionController = (req, res) => {
  const { masterName } = req.body;
  if (!masterName)
    return res.status(400).json({ error: "Master name required" });

  const session = createSession(masterName);
  return res.status(201).json({ message: "Session created", session });
};

//=====================
// Join game session
//=====================
const joinSessionController = (req, res) => {
  const { sessionId, playerName } = req.body;
  if (!sessionId || !playerName)
    return res
      .status(400)
      .json({ error: "Session ID and player name required" });

  const session = addPlayer(sessionId, playerName);
  if (!session) return res.status(404).json({ error: "Session not found" });

  res.status(200).json({ message: "Player joined", session });
};

//==============
// Start game
//==============
const startGameController = (req, res) => {
  const { sessionId, question, answer } = req.body;
  const session = getSession(sessionId);
  if (!session) return res.status(404).json({ error: "Session not found" });
  if (session.players.length < 2)
    return res.status(400).json({ error: "At least two players required" });

  session.question = question;
  session.answer = answer;
  session.started = true;

  res.status(200).json({ message: "Game started", question });
};

//================
// Make a guess
//================
const makeGuessController = (req, res) => {
  const { sessionId, playerName, guess } = req.body;
  const session = getSession(sessionId);
  if (!session || !session.started)
    return res.status(400).json({ error: "Game not active" });

  if (guess.toLowerCase() === session.answer.toLowerCase()) {
    addScore(sessionId, playerName, 10);
    endGame(sessionId);
    return res.status(200).json({ message: "Correct! You won 10 points" });
  }

  res.status(200).json({ message: "Wrong guess" });
};

//==============
// Get scores
//==============
const getScoresController = (req, res) => {
  const { sessionId } = req.params;
  const scores = getScores(sessionId);
  if (!scores) return res.status(404).json({ error: "Session not found" });

  res.status(200).json({ scores });
};

module.exports = {
  createSessionController,
  joinSessionController,
  startGameController,
  makeGuessController,
  getScoresController,
};
