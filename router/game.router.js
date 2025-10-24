const express = require("express");
const {
  createSessionController,
  joinSessionController,
  startGameController,
  makeGuessController,
  getScoresController,
} = require("../controller/game.controller");

const router = express.Router();

router.post("/create", createSessionController);
router.post("/join", joinSessionController);
router.post("/start", startGameController);
router.post("/guess", makeGuessController);
router.get("/:sessionId/scores", getScoresController);

module.exports = router;
