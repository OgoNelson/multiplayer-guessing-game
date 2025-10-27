class GameSession {
  constructor(sessionId, gameMasterId) {
    this.id = sessionId;
    this.gameMaster = gameMasterId;
    this.players = [];
    this.state = "waiting"; // waiting, playing, ended
    this.question = "";
    this.answer = "";
    this.startTime = null;
    this.winner = null;
    this.timeLimit = 60; // seconds
    this.timer = null;
  }

  addPlayer(playerId, username) {
    if (this.state !== "waiting") return false;

    // Check if player already exists
    if (this.players.find((p) => p.id === playerId)) return false;

    this.players.push({
      id: playerId,
      username: username,
      score: 0,
      attempts: 0,
    });
    return true;
  }

  removePlayer(playerId) {
    this.players = this.players.filter((p) => p.id !== playerId);

    // If game master leaves, assign new one
    if (this.gameMaster === playerId && this.players.length > 0) {
      this.gameMaster = this.players[0].id;
      return this.gameMaster;
    }

    // Delete session if no players left
    if (this.players.length === 0) {
      return "delete-session";
    }

    return null;
  }

  canStart() {
    return this.players.length >= 2 && this.state === "waiting";
  }

  startGame(question, answer) {
    if (!this.canStart()) return false;

    this.question = question;
    this.answer = answer.toLowerCase().trim();
    this.state = "playing";
    this.startTime = Date.now();
    this.winner = null;

    // Reset attempts for all players except game master
    this.players.forEach((player) => {
      if (player.id !== this.gameMaster) {
        player.attempts = 0;
      }
    });

    // Set game timer
    this.timer = setTimeout(() => {
      this.endGame(false); // Time expired
    }, this.timeLimit * 1000);

    return true;
  }

  submitGuess(playerId, guess) {
    if (this.state !== "playing") return { valid: false };

    const player = this.players.find((p) => p.id === playerId);
    if (!player || player.id === this.gameMaster) return { valid: false };

    player.attempts++;

    const isCorrect = guess.toLowerCase().trim() === this.answer;

    if (isCorrect) {
      this.endGame(true, playerId);
      return { correct: true, attempts: player.attempts };
    }

    if (player.attempts >= 3) {
      return { correct: false, attempts: player.attempts, exhausted: true };
    }

    return { correct: false, attempts: player.attempts };
  }

  endGame(hasWinner, winnerId = null) {
    this.state = "ended";

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (hasWinner && winnerId) {
      this.winner = winnerId;
      const winner = this.players.find((p) => p.id === winnerId);
      if (winner) {
        winner.score += 10;
      }
    }

    // Rotate game master for next round among all joined players
    // Get the current game master index and rotate to next player
    const currentIndex = this.players.findIndex(
      (p) => p.id === this.gameMaster
    );
    const nextIndex = (currentIndex + 1) % this.players.length;
    this.gameMaster = this.players[nextIndex].id;

    return { hasWinner, winnerId, gameMaster: this.gameMaster };
  }

  resetForNextRound() {
    this.state = "waiting";
    this.question = "";
    this.answer = "";
    this.startTime = null;
    this.winner = null;
    this.timer = null;

    this.players.forEach((player) => {
      player.attempts = 0;
    });
  }

  getPlayerCount() {
    return this.players.length;
  }

  getPlayers() {
    return this.players.map((player) => ({
      id: player.id,
      username: player.username,
      score: player.score,
      isGameMaster: player.id === this.gameMaster,
    }));
  }
}

module.exports = GameSession;
