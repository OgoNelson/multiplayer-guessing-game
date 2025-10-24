const express = require("express");
const path = require("path");
const gameRouter = require("./router/game.router");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
//app.use("/api/v1/games", gameRouter);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

module.exports = app;
