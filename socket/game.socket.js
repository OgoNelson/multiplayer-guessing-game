const {
  getSession,
  addPlayer,
  addScore,
  getScores,
  endGame,
  rotateMaster,
} = require("../utils/sessions");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("⚡ User connected:", socket.id);

    socket.on("joinSession", ({ sessionId, playerName }) => {
      const session = addPlayer(sessionId, playerName);
      if (!session) return socket.emit("error", "Session not found");

      socket.join(sessionId);

      io.to(sessionId).emit("playerJoined", {
        message: `${playerName} joined the session`,
        totalPlayers: session.players.length,
      });

      io.to(sessionId).emit("updateScores", getScores(sessionId));
    });

    socket.on("questionSet", ({ sessionId, question }) => {
      io.to(sessionId).emit("questionBroadcast", { question });
    });

    socket.on("gameStarted", ({ sessionId, question }) => {
      const session = getSession(sessionId);
      if (!session) return;
      session.started = true;

      io.to(sessionId).emit("questionBroadcast", { question });
      io.to(sessionId).emit("timerStarted", { duration: 60 });

      session.timer = setTimeout(() => {
        if (session.started) {
          io.to(sessionId).emit("timeUp", {
            message: "⏰ Time’s up! No winner this round.",
            answer: session.answer || "N/A",
          });

          endGame(sessionId);
          const newMaster = rotateMaster(sessionId);
          io.to(sessionId).emit("newMaster", {
            master: newMaster,
            message: `🎮 New Game Master is ${newMaster}`,
          });
        }
      }, 60000);
    });

    socket.on("playerGuess", ({ sessionId, playerName, guess }) => {
      const session = getSession(sessionId);
      if (!session || !session.started) return;

      io.to(sessionId).emit("guessMade", { playerName, guess });

      if (
        session.answer &&
        guess.toLowerCase() === session.answer.toLowerCase()
      ) {
        addScore(sessionId, playerName, 10);
        io.to(sessionId).emit("winnerAnnounced", { winner: playerName });
        io.to(sessionId).emit("updateScores", getScores(sessionId));

        endGame(sessionId);
        const newMaster = rotateMaster(sessionId);
        io.to(sessionId).emit("newMaster", {
          master: newMaster,
          message: `🎮 Next Game Master: ${newMaster}`,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });
};
