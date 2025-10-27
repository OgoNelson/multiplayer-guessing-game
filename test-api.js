const io = require('socket.io-client');

console.log('Starting Game API Test...');

// Connect to the server
const socket = io('http://localhost:3000');

let testSessionId = null;
let testPlayerId = null;

socket.on('connect', () => {
    console.log('✓ Connected to server with ID:', socket.id);
    testPlayerId = socket.id;
    
    // Test 1: Create a game session with username
    console.log('\n--- Test 1: Creating Game Session with Username ---');
    socket.emit('create-session', 'TestPlayer');
});

socket.on('session-created', (data) => {
    console.log('✓ Session created:', data);
    testSessionId = data.sessionId;
    
    // Test 2: Create a question
    console.log('\n--- Test 2: Creating Question ---');
    socket.emit('create-question', {
        question: 'What is the capital of France?',
        answer: 'Paris'
    });
});

socket.on('question-created', (data) => {
    console.log('✓ Question created:', data);
    
    // We need at least 2 players to start the game, so let's create a second player
    createSecondPlayer();
});

socket.on('game-started', (data) => {
    console.log('✓ Game started:', data);
    
    // Test 4: Submit a guess (as second player)
    console.log('\n--- Test 4: Submitting Guess ---');
    setTimeout(() => {
        secondPlayer.emit('submit-guess', 'Paris');
    }, 1000);
});

socket.on('guess-result', (data) => {
    console.log('✓ Guess result:', data);
    
    // Test 5: Start next round
    console.log('\n--- Test 5: Starting Next Round ---');
    setTimeout(() => {
        socket.emit('next-round');
    }, 1000);
});

socket.on('next-round-started', (data) => {
    console.log('✓ Next round started:', data);
    
    // Test completed
    console.log('\n--- All Tests Completed Successfully! ---');
    setTimeout(() => {
        process.exit(0);
    }, 1000);
});

// Also handle the game-ended event on the main socket
socket.on('game-ended', (data) => {
    console.log('✓ Game ended on main socket:', data);
    
    // Test 5: Start next round (using the new game master)
    console.log('\n--- Test 5: Starting Next Round ---');
    setTimeout(() => {
        // After game ends, the winner becomes the new game master
        // So we need to use the second player (who won) to start the next round
        if (data.newGameMaster === secondPlayer.id) {
            console.log('Using second player (new game master) to start next round');
            secondPlayer.emit('next-round');
        } else {
            console.log('Using first player to start next round');
            socket.emit('next-round');
        }
    }, 1000);
});

socket.on('registration-error', (error) => {
    console.log('✗ Registration error:', error);
});

socket.on('session-error', (error) => {
    console.log('✗ Session error:', error);
});

socket.on('question-error', (error) => {
    console.log('✗ Question error:', error);
});

socket.on('game-error', (error) => {
    console.log('✗ Game error:', error);
});

socket.on('guess-error', (error) => {
    console.log('✗ Guess error:', error);
});

socket.on('round-error', (error) => {
    console.log('✗ Round error:', error);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

// Create a second player to test multiplayer functionality
let secondPlayer = null;

function createSecondPlayer() {
    console.log('\n--- Creating Second Player ---');
    secondPlayer = io('http://localhost:3000');
    
    secondPlayer.on('connect', () => {
        console.log('✓ Second player connected with ID:', secondPlayer.id);
        
        // Join the session created by first player with username
        setTimeout(() => {
            console.log('Second player joining session:', testSessionId);
            secondPlayer.emit('join-session', {
                sessionId: testSessionId,
                username: 'SecondPlayer'
            });
        }, 500);
    });
    
    secondPlayer.on('session-joined', (data) => {
        console.log('✓ Second player joined session:', data);
        
        // Now we can start the game
        console.log('\n--- Starting Game ---');
        socket.emit('start-game');
    });
    
    secondPlayer.on('player-joined', (data) => {
        console.log('✓ Player joined event received:', data);
    });
    
    secondPlayer.on('game-ended', (data) => {
        console.log('✓ Game ended:', data);
    });
}

// Handle connection errors
socket.on('connect_error', (error) => {
    console.log('✗ Connection error:', error.message);
    process.exit(1);
});

// Set a timeout for the entire test
setTimeout(() => {
    console.log('✗ Test timed out');
    process.exit(1);
}, 10000);