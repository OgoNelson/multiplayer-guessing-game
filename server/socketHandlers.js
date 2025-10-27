const GameSession = require('./gameSession');
const { v4: uuidv4 } = require('uuid');

module.exports = function(io) {
    const sessions = new Map();
    const players = new Map();

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id} from ${socket.handshake.address}`);

        // Handle player joining with username
        socket.on('register-player', (username) => {
            console.log(`Received register-player event from ${socket.id} with username: ${username}`);
            
            // Validate username
            if (!username || typeof username !== 'string' || username.trim().length === 0) {
                console.log('Invalid username provided');
                socket.emit('registration-error', 'Please enter a valid username');
                return;
            }
            
            if (username.trim().length > 20) {
                console.log('Username too long');
                socket.emit('registration-error', 'Username must be 20 characters or less');
                return;
            }

            const cleanUsername = username.trim();
            
            players.set(socket.id, {
                id: socket.id,
                username: cleanUsername,
                currentSession: null,
                score: 0
            });
            
            console.log(`Player registered: ${cleanUsername} with ID: ${socket.id}`);
            socket.emit('player-registered', { id: socket.id, username: cleanUsername });
            console.log('Emitted player-registered event');
        });

        // Create new game session with username
        socket.on('create-session', (username) => {
            console.log('Server: Received create-session event from', socket.id, 'with username:', username);
            // Validate username
            if (!username || typeof username !== 'string' || username.trim().length === 0) {
                socket.emit('session-error', 'Please enter a valid username');
                return;
            }
            
            if (username.trim().length > 20) {
                socket.emit('session-error', 'Username must be 20 characters or less');
                return;
            }

            const cleanUsername = username.trim();
            
            // Register or update player
            const player = {
                id: socket.id,
                username: cleanUsername,
                currentSession: null,
                score: 0
            };
            players.set(socket.id, player);
            
            // Leave current session if in one
            if (player.currentSession) {
                socket.leave(player.currentSession);
                const oldSession = sessions.get(player.currentSession);
                if (oldSession) {
                    oldSession.removePlayer(socket.id);
                }
            }
            
            const sessionId = uuidv4().substring(0, 8).toUpperCase();
            const session = new GameSession(sessionId, socket.id);
            
            session.addPlayer(socket.id, cleanUsername);
            sessions.set(sessionId, session);
            
            player.currentSession = sessionId;
            socket.join(sessionId);
            
            console.log('Server: Emitting session-created event to', socket.id, 'with sessionId:', sessionId);
            socket.emit('session-created', {
                sessionId,
                isGameMaster: true,
                players: session.getPlayers(),
                username: cleanUsername
            });
        });

        // Join existing game session with username
        socket.on('join-session', ({ sessionId, username }) => {
            // Validate inputs
            if (!sessionId || typeof sessionId !== 'string') {
                socket.emit('join-error', 'Invalid session code');
                return;
            }
            
            if (!username || typeof username !== 'string' || username.trim().length === 0) {
                socket.emit('join-error', 'Please enter a valid username');
                return;
            }
            
            if (username.trim().length > 20) {
                socket.emit('join-error', 'Username must be 20 characters or less');
                return;
            }

            const cleanUsername = username.trim();
            const upperSessionId = sessionId.toUpperCase();
            
            // Register or update player
            players.set(socket.id, {
                id: socket.id,
                username: cleanUsername,
                currentSession: null,
                score: 0
            });
            
            const player = players.get(socket.id);
            
            const session = sessions.get(upperSessionId);
            if (!session) {
                socket.emit('join-error', 'Session not found');
                return;
            }
            
            if (session.state !== 'waiting') {
                socket.emit('join-error', 'Cannot join game in progress');
                return;
            }
            
            // Leave current session if in one
            if (player.currentSession) {
                socket.leave(player.currentSession);
                const oldSession = sessions.get(player.currentSession);
                if (oldSession) {
                    oldSession.removePlayer(socket.id);
                }
            }
            
            if (session.addPlayer(socket.id, cleanUsername)) {
                player.currentSession = upperSessionId;
                socket.join(upperSessionId);
                
                const updatedPlayers = session.getPlayers();
                
                socket.emit('session-joined', {
                    sessionId: upperSessionId,
                    isGameMaster: false,
                    players: updatedPlayers,
                    username: cleanUsername
                });
                
                // Notify other players with updated player list
                console.log(`Broadcasting player join to session ${upperSessionId} with players:`, updatedPlayers);
                console.log(`Session room members:`, io.sockets.adapter.rooms.get(upperSessionId));
                
                // Broadcast to all players in the room (including the new player)
                io.to(upperSessionId).emit('player-joined', {
                    id: socket.id,
                    username: cleanUsername,
                    players: updatedPlayers
                });
                
                console.log(`Player-joined event emitted to room ${upperSessionId}`);
            } else {
                socket.emit('join-error', 'Failed to join session');
            }
        });

        // Leave current session
        socket.on('leave-session', () => {
            const player = players.get(socket.id);
            if (!player || !player.currentSession) return;
            
            const session = sessions.get(player.currentSession);
            if (session) {
                const result = session.removePlayer(socket.id);
                
                if (result === 'delete-session') {
                    sessions.delete(player.currentSession);
                } else if (result) {
                    // New game master assigned
                    io.to(player.currentSession).emit('game-master-changed', {
                        newGameMaster: result
                    });
                }
                
                // Notify other players with updated player list
                io.to(player.currentSession).emit('player-left', {
                    playerId: socket.id,
                    username: player.username,
                    players: session.getPlayers()
                });
            }
            
            socket.leave(player.currentSession);
            player.currentSession = null;
            
            socket.emit('session-left');
        });

        // Create question and start game
        socket.on('create-question', ({ question, answer }) => {
            const player = players.get(socket.id);
            if (!player || !player.currentSession) {
                socket.emit('question-error', 'Not in a session');
                return;
            }
            
            // Validate inputs
            if (!question || !answer || typeof question !== 'string' || typeof answer !== 'string') {
                socket.emit('question-error', 'Please provide both question and answer');
                return;
            }
            
            if (question.trim().length === 0 || answer.trim().length === 0) {
                socket.emit('question-error', 'Question and answer cannot be empty');
                return;
            }
            
            if (question.trim().length > 200) {
                socket.emit('question-error', 'Question is too long (max 200 characters)');
                return;
            }
            
            if (answer.trim().length > 100) {
                socket.emit('question-error', 'Answer is too long (max 100 characters)');
                return;
            }
            
            const session = sessions.get(player.currentSession);
            if (!session || session.gameMaster !== socket.id) {
                socket.emit('question-error', 'Only game master can create questions');
                return;
            }
            
            session.question = question.trim();
            session.answer = answer.trim();
            
            io.to(player.currentSession).emit('question-created', { question: session.question });
        });

        // Start game
        socket.on('start-game', () => {
            const player = players.get(socket.id);
            if (!player || !player.currentSession) {
                socket.emit('game-error', 'Not in a session');
                return;
            }
            
            const session = sessions.get(player.currentSession);
            if (!session || session.gameMaster !== socket.id) {
                socket.emit('game-error', 'Only game master can start the game');
                return;
            }
            
            if (!session.question || !session.answer) {
                socket.emit('game-error', 'Please create a question first');
                return;
            }
            
            if (!session.canStart()) {
                socket.emit('game-error', 'Need at least 2 players to start');
                return;
            }
            
            if (session.startGame(session.question, session.answer)) {
                io.to(player.currentSession).emit('game-started', {
                    question: session.question,
                    timeLimit: session.timeLimit
                });
                
                // Set up a timer to check for game end due to time expiration
                // This is a backup to ensure game-ended event is emitted
                setTimeout(() => {
                    if (session.state === 'ended') {
                        const endResult = {
                            hasWinner: session.winner !== null,
                            winner: session.winner ? players.get(session.winner) : null,
                            answer: session.answer,
                            newGameMaster: session.gameMaster,
                            scores: session.getPlayers()
                        };
                        
                        io.to(player.currentSession).emit('game-ended', endResult);
                    }
                }, session.timeLimit * 1000 + 1000); // Add 1 second buffer
            } else {
                socket.emit('game-error', 'Failed to start game');
            }
        });

        // Submit guess
        socket.on('submit-guess', (guess) => {
            const player = players.get(socket.id);
            if (!player || !player.currentSession) return;
            
            // Validate guess
            if (!guess || typeof guess !== 'string') {
                socket.emit('guess-error', 'Invalid guess');
                return;
            }
            
            if (guess.trim().length === 0) {
                socket.emit('guess-error', 'Guess cannot be empty');
                return;
            }
            
            if (guess.trim().length > 100) {
                socket.emit('guess-error', 'Guess is too long (max 100 characters)');
                return;
            }
            
            const session = sessions.get(player.currentSession);
            if (!session || session.state !== 'playing') {
                socket.emit('guess-error', 'Game is not in progress');
                return;
            }
            
            const result = session.submitGuess(socket.id, guess.trim());
            
            if (result.valid === false) {
                socket.emit('guess-error', 'Cannot submit guess at this time');
                return;
            }
            
            // Send result to guessing player
            socket.emit('guess-result', result);
            
            // Notify other players of attempt
            socket.to(player.currentSession).emit('player-guessed', {
                playerId: socket.id,
                username: player.username,
                attempts: result.attempts,
                exhausted: result.exhausted || false
            });
            
            // If game ended, notify all players
            if (session.state === 'ended') {
                const endResult = {
                    hasWinner: session.winner !== null,
                    winner: session.winner ? players.get(session.winner) : null,
                    answer: session.answer,
                    newGameMaster: session.gameMaster,
                    scores: session.getPlayers()
                };
                
                io.to(player.currentSession).emit('game-ended', endResult);
            }
        });

        // Start next round
        socket.on('next-round', () => {
            const player = players.get(socket.id);
            if (!player || !player.currentSession) {
                socket.emit('round-error', 'Not in a session');
                return;
            }
            
            const session = sessions.get(player.currentSession);
            if (!session || session.gameMaster !== socket.id) {
                socket.emit('round-error', 'Only game master can start next round');
                return;
            }
            
            if (session.state !== 'ended') {
                socket.emit('round-error', 'Current game has not ended');
                return;
            }
            
            session.resetForNextRound();
            
            io.to(player.currentSession).emit('next-round-started', {
                gameMaster: session.gameMaster,
                players: session.getPlayers()
            });
        });

        // Handle player list request
        socket.on('request-player-list', () => {
            const player = players.get(socket.id);
            if (!player || !player.currentSession) return;
            
            const session = sessions.get(player.currentSession);
            if (session) {
                socket.emit('player-list-update', session.getPlayers());
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
            
            const player = players.get(socket.id);
            if (!player) return;
            
            if (player.currentSession) {
                const session = sessions.get(player.currentSession);
                if (session) {
                    const result = session.removePlayer(socket.id);
                    
                    if (result === 'delete-session') {
                        sessions.delete(player.currentSession);
                    } else if (result) {
                        // New game master assigned
                        io.to(player.currentSession).emit('game-master-changed', {
                            newGameMaster: result
                        });
                    }
                    
                    // Notify other players with updated player list
                    socket.to(player.currentSession).emit('player-left', {
                        playerId: socket.id,
                        username: player.username,
                        players: session.getPlayers()
                    });
                }
            }
            
            players.delete(socket.id);
        });
    });
};