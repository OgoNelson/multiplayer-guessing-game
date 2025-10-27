# Multiplayer Guessing Game

A real-time multiplayer guessing game built with React, Node.js, and Socket.IO. Players can join game rooms, take turns creating questions, and guess answers in real-time.

## Features

- Real-time multiplayer gameplay using Socket.IO
- Create and join game rooms with unique room codes
- Turn-based question and answer gameplay
- Player lobby and game session management
- Responsive design for desktop and mobile devices
- Live player status updates

## Tech Stack

### Frontend
- React 18
- React Router for navigation
- Socket.IO Client for real-time communication
- Vite for development and building
- CSS for styling

### Backend
- Node.js
- Express.js
- Socket.IO for real-time communication
- UUID for generating unique room codes

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/OgoNelson/multiplayer-guessing-game.git
   cd multiplayer-guessing-game
   ```

2. Install dependencies for both client and server:
   ```bash
   npm install
   cd client && npm install
   cd ..
   ```

## Running the Application

### Development Mode (Recommended)

To start both the server and client simultaneously in development mode:
```bash
npm run dev:all
```

This will:
- Start the server with nodemon (auto-restart on changes)
- Start the client with Vite dev server (hot reload)
- Open the application at http://localhost:5173 (client) and http://localhost:3000 (server API)

### Individual Services

To start only the server:
```bash
npm run server:dev
```

To start only the client:
```bash
npm run client:dev
```

### Production Mode

To build the client and start the server in production mode:
```bash
npm run build_start
```

## Project Structure

```
multiplayer-guessing-game/
├── client/                 # React frontend application
│   ├── dist/              # Built client files (generated)
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx        # Main App component
│   │   └── main.jsx       # Application entry point
│   ├── package.json       # Client dependencies
│   └── vite.config.js     # Vite configuration
├── server/                # Node.js backend
│   ├── app.js            # Express server setup
│   ├── gameSession.js    # Game session logic
│   └── socketHandlers.js # Socket.IO event handlers
├── package.json          # Root dependencies and scripts
└── railway.json          # Railway deployment configuration
```

## Game Flow

1. **Home Page**: Players can create a new game room or join an existing one
2. **Game Lobby**: Players wait in the lobby until the game starts
3. **Game Session**: Players take turns creating questions and guessing answers
4. **Real-time Updates**: All game actions are synchronized across all players

## API Endpoints

- `GET /health` - Health check endpoint for monitoring

## Socket.IO Events

### Client to Server
- `createRoom` - Create a new game room
- `joinRoom` - Join an existing room
- `startGame` - Start the game (host only)
- `submitQuestion` - Submit a question for the current round
- `submitGuess` - Submit a guess for the current question
- `nextRound` - Move to the next round (host only)

### Server to Client
- `roomCreated` - Room creation confirmation
- `roomJoined` - Room join confirmation
- `playerJoined` - New player joined notification
- `playerLeft` - Player left notification
- `gameStarted` - Game started notification
- `newRound` - New round started
- `questionSubmitted` - Question submitted notification
- `guessSubmitted` - Guess submitted notification
- `gameEnded` - Game ended notification
- `error` - Error notification

## Deployment

### Railway

The application is configured for Railway deployment:

1. Connect your repository to Railway
2. Railway will automatically detect the Node.js application
3. The application will be built and deployed with the following settings:
   - Build command: `npm run build`
   - Start command: `npm start`
   - Health check path: `/health`

### Environment Variables

The following environment variables can be configured:
- `NODE_ENV` - Set to 'production' for production deployment
- `PORT` - Server port (defaults to 3000)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the package.json file for details.

## Author

Ogo Nelson

## Acknowledgments

- Socket.IO for real-time communication
- React team for the excellent frontend framework
- Vite for the fast development experience