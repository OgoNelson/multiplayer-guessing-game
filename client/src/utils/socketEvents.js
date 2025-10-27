// Socket event constants for the multiplayer guessing game
export const SOCKET_EVENTS = {
  // Client to Server events
  CLIENT: {
    REGISTER_PLAYER: 'register-player',
    CREATE_SESSION: 'create-session',
    JOIN_SESSION: 'join-session',
    LEAVE_SESSION: 'leave-session',
    CREATE_QUESTION: 'create-question',
    START_GAME: 'start-game',
    SUBMIT_GUESS: 'submit-guess',
    NEXT_ROUND: 'next-round',
    REQUEST_PLAYER_LIST: 'request-player-list',
  },

  // Server to Client events
  SERVER: {
    // Registration events
    PLAYER_REGISTERED: 'player-registered',
    REGISTRATION_ERROR: 'registration-error',

    // Session events
    SESSION_CREATED: 'session-created',
    SESSION_JOINED: 'session-joined',
    SESSION_LEFT: 'session-left',
    SESSION_ERROR: 'session-error',
    JOIN_ERROR: 'join-error',

    // Player events
    PLAYER_JOINED: 'player-joined',
    PLAYER_LEFT: 'player-left',
    PLAYER_LIST_UPDATE: 'player-list-update',
    GAME_MASTER_CHANGED: 'game-master-changed',

    // Question events
    QUESTION_CREATED: 'question-created',
    QUESTION_ERROR: 'question-error',

    // Game events
    GAME_STARTED: 'game-started',
    GAME_ENDED: 'game-ended',
    GAME_ERROR: 'game-error',
    NEXT_ROUND_STARTED: 'next-round-started',
    ROUND_ERROR: 'round-error',

    // Guess events
    GUESS_RESULT: 'guess-result',
    GUESS_ERROR: 'guess-error',
    PLAYER_GUESSED: 'player-guessed',
  },
};

// Game states
export const GAME_STATES = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  ENDED: 'ended',
};

// Default game settings
export const GAME_SETTINGS = {
  TIME_LIMIT: 60, // seconds
  MAX_ATTEMPTS: 3,
  MAX_USERNAME_LENGTH: 20,
  MAX_QUESTION_LENGTH: 200,
  MAX_ANSWER_LENGTH: 100,
  MAX_GUESS_LENGTH: 100,
  MIN_PLAYERS: 2,
};