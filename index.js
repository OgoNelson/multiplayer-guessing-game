const http = require("http");
const { Server } = require("socket.io");
const app = require("./main");
const gameSocket = require("./socket/game.socket");

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server);

gameSocket(io);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
