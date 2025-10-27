import React, { createContext, useContext, useReducer } from "react";
import { GAME_STATES } from "../utils/socketEvents";

// Initial state
const initialState = {
  // Connection state
  isConnected: false,
  connectionError: null,

  // Player state
  currentPlayer: null,

  // Session state
  sessionId: null,
  isGameMaster: false,
  players: [],

  // Game state
  gameState: GAME_STATES.WAITING,
  question: "",
  timeLimit: 60,
  winner: null,
  answer: "",

  // Player game state
  guessAttempts: 0,
  isExhausted: false,

  // UI state
  loading: false,
  error: null,

  // Notifications
  notifications: [],
};

// Action types
const ACTION_TYPES = {
  // Connection actions
  SET_CONNECTION_STATUS: "SET_CONNECTION_STATUS",
  SET_CONNECTION_ERROR: "SET_CONNECTION_ERROR",

  // Player actions
  SET_CURRENT_PLAYER: "SET_CURRENT_PLAYER",

  // Session actions
  SET_SESSION: "SET_SESSION",
  UPDATE_PLAYERS: "UPDATE_PLAYERS",
  LEAVE_SESSION: "LEAVE_SESSION",

  // Game actions
  SET_GAME_STATE: "SET_GAME_STATE",
  SET_QUESTION: "SET_QUESTION",
  SET_GAME_RESULT: "SET_GAME_RESULT",
  RESET_ROUND: "RESET_ROUND",

  // Player game actions
  SET_GUESS_ATTEMPTS: "SET_GUESS_ATTEMPTS",
  SET_EXHAUSTED: "SET_EXHAUSTED",

  // UI actions
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",

  // Notification actions
  ADD_NOTIFICATION: "ADD_NOTIFICATION",
  REMOVE_NOTIFICATION: "REMOVE_NOTIFICATION",
};

// Reducer function
const gameReducer = (state, action) => {
  switch (action.type) {
    // Connection actions
    case ACTION_TYPES.SET_CONNECTION_STATUS:
      return {
        ...state,
        isConnected: action.payload,
      };

    case ACTION_TYPES.SET_CONNECTION_ERROR:
      return {
        ...state,
        connectionError: action.payload,
      };

    // Player actions
    case ACTION_TYPES.SET_CURRENT_PLAYER:
      return {
        ...state,
        currentPlayer: action.payload,
      };

    // Session actions
    case ACTION_TYPES.SET_SESSION:
      return {
        ...state,
        sessionId: action.payload.sessionId,
        isGameMaster: action.payload.isGameMaster,
        players: action.payload.players,
        currentPlayer: action.payload.currentPlayer,
        gameState: GAME_STATES.WAITING,
        loading: false,
        error: null,
      };

    case ACTION_TYPES.UPDATE_PLAYERS:
      return {
        ...state,
        players: action.payload,
      };

    case ACTION_TYPES.LEAVE_SESSION:
      return {
        ...state,
        sessionId: null,
        isGameMaster: false,
        players: [],
        gameState: GAME_STATES.WAITING,
        question: "",
        winner: null,
        answer: "",
        guessAttempts: 0,
        isExhausted: false,
        error: null,
      };

    // Game actions
    case ACTION_TYPES.SET_GAME_STATE:
      return {
        ...state,
        gameState: action.payload,
      };

    case ACTION_TYPES.SET_QUESTION:
      return {
        ...state,
        question: action.payload.question,
        timeLimit: action.payload.timeLimit || state.timeLimit,
      };

    case ACTION_TYPES.SET_GAME_RESULT:
      return {
        ...state,
        gameState: GAME_STATES.ENDED,
        players: action.payload.scores,
        winner: action.payload.winner,
        answer: action.payload.answer,
        isGameMaster: action.payload.newGameMaster === state.currentPlayer?.id,
      };

    case ACTION_TYPES.RESET_ROUND:
      return {
        ...state,
        gameState: GAME_STATES.WAITING,
        players: action.payload.players,
        isGameMaster: action.payload.gameMaster === state.currentPlayer?.id,
        question: "",
        answer: "",
        winner: null,
        guessAttempts: 0,
        isExhausted: false,
        error: null,
      };

    // Player game actions
    case ACTION_TYPES.SET_GUESS_ATTEMPTS:
      return {
        ...state,
        guessAttempts: action.payload,
      };

    case ACTION_TYPES.SET_EXHAUSTED:
      return {
        ...state,
        isExhausted: action.payload,
      };

    // UI actions
    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    // Notification actions
    case ACTION_TYPES.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };

    case ACTION_TYPES.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.payload
        ),
      };

    default:
      return state;
  }
};

// Create context
const GameContext = createContext();

// Context provider component
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Action creators
  const actions = {
    // Connection actions
    setConnectionStatus: (isConnected) => {
      dispatch({
        type: ACTION_TYPES.SET_CONNECTION_STATUS,
        payload: isConnected,
      });
    },

    setConnectionError: (error) => {
      dispatch({ type: ACTION_TYPES.SET_CONNECTION_ERROR, payload: error });
    },

    // Player actions
    setCurrentPlayer: (player) => {
      dispatch({ type: ACTION_TYPES.SET_CURRENT_PLAYER, payload: player });
    },

    // Session actions
    setSession: (sessionData) => {
      dispatch({ type: ACTION_TYPES.SET_SESSION, payload: sessionData });
    },

    updatePlayers: (players) => {
      dispatch({ type: ACTION_TYPES.UPDATE_PLAYERS, payload: players });
    },

    leaveSession: () => {
      dispatch({ type: ACTION_TYPES.LEAVE_SESSION });
    },

    // Game actions
    setGameState: (gameState) => {
      dispatch({ type: ACTION_TYPES.SET_GAME_STATE, payload: gameState });
    },

    setQuestion: (questionData) => {
      dispatch({ type: ACTION_TYPES.SET_QUESTION, payload: questionData });
    },

    setGameResult: (resultData) => {
      dispatch({ type: ACTION_TYPES.SET_GAME_RESULT, payload: resultData });
    },

    resetRound: (roundData) => {
      dispatch({ type: ACTION_TYPES.RESET_ROUND, payload: roundData });
    },

    // Player game actions
    setGuessAttempts: (attempts) => {
      dispatch({ type: ACTION_TYPES.SET_GUESS_ATTEMPTS, payload: attempts });
    },

    setExhausted: (isExhausted) => {
      dispatch({ type: ACTION_TYPES.SET_EXHAUSTED, payload: isExhausted });
    },

    // UI actions
    setLoading: (loading) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: loading });
    },

    setError: (error) => {
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error });
    },

    clearError: () => {
      dispatch({ type: ACTION_TYPES.CLEAR_ERROR });
    },

    // Notification actions
    addNotification: (notification) => {
      const id = Date.now().toString();
      dispatch({
        type: ACTION_TYPES.ADD_NOTIFICATION,
        payload: { ...notification, id },
      });

      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        dispatch({
          type: ACTION_TYPES.REMOVE_NOTIFICATION,
          payload: id,
        });
      }, 5000);
    },

    removeNotification: (id) => {
      dispatch({ type: ACTION_TYPES.REMOVE_NOTIFICATION, payload: id });
    },
  };

  // Computed values
  const computedValues = {
    canStartGame:
      state.players.length >= 2 && state.isGameMaster && state.question,
    canSubmitGuess:
      state.gameState === GAME_STATES.PLAYING &&
      !state.isGameMaster &&
      !state.isExhausted,
    isPlayerInSession: !!state.sessionId,
  };

  const value = {
    ...state,
    ...actions,
    ...computedValues,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Custom hook to use the game context
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};

export default GameContext;
