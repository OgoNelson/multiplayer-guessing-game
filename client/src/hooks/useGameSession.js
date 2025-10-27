import { useState, useEffect, useCallback } from "react";
import { useSocket } from "./useSocket";
import { useNavigate } from "react-router-dom";
import { SOCKET_EVENTS, GAME_STATES } from "../utils/socketEvents";

export const useGameSession = () => {
  const socket = useSocket();
  const navigate = useNavigate();

  // Game state
  const [gameState, setGameState] = useState(GAME_STATES.WAITING);
  const [sessionId, setSessionId] = useState(null);
  const [isGameMaster, setIsGameMaster] = useState(false);
  const [players, setPlayers] = useState([]);
  const [question, setQuestion] = useState("");
  const [timeLimit, setTimeLimit] = useState(60);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [winner, setWinner] = useState(null);
  const [answer, setAnswer] = useState("");
  const [guessAttempts, setGuessAttempts] = useState(0);
  const [isExhausted, setIsExhausted] = useState(false);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket.socket) return;

    const cleanupFunctions = [];

    // Registration events
    cleanupFunctions.push(
      socket.on(SOCKET_EVENTS.SERVER.PLAYER_REGISTERED, (data) => {
        setCurrentPlayer(data);
        setError(null);
      })
    );

    cleanupFunctions.push(
      socket.on(SOCKET_EVENTS.SERVER.REGISTRATION_ERROR, (errorMessage) => {
        setError(errorMessage);
      })
    );

    // Session events
    cleanupFunctions.push(
      socket.on(SOCKET_EVENTS.SERVER.SESSION_CREATED, (data) => {
        console.log(
          "useGameSession: Received session-created event with data:",
          data
        );
        setSessionId(data.sessionId);
        setIsGameMaster(data.isGameMaster);
        setPlayers(data.players);
        setCurrentPlayer({ id: socket.socket.id, username: data.username });
        setGameState(GAME_STATES.WAITING);
        setLoading(false);
        setError(null);
        // Navigate to game room after session is created
        navigate("/game");
      })
    );

    cleanupFunctions.push(
      socket.on(SOCKET_EVENTS.SERVER.SESSION_JOINED, (data) => {
        console.log(
          "useGameSession: Received session-joined event with data:",
          data
        );
        setSessionId(data.sessionId);
        setIsGameMaster(data.isGameMaster);
        setPlayers(data.players);
        setCurrentPlayer({ id: socket.socket.id, username: data.username });
        setGameState(GAME_STATES.WAITING);
        setLoading(false);
        setError(null);
        // Navigate to game room after session is joined
        navigate("/game");
      })
    );

    cleanupFunctions.push(
      socket.on(SOCKET_EVENTS.SERVER.SESSION_LEFT, () => {
        resetGameState();
      })
    );

    cleanupFunctions.push(
      socket.on(SOCKET_EVENTS.SERVER.SESSION_ERROR, (errorMessage) => {
        setError(errorMessage);
        setLoading(false);
      })
    );

    cleanupFunctions.push(
      socket.on(SOCKET_EVENTS.SERVER.JOIN_ERROR, (errorMessage) => {
        setError(errorMessage);
        setLoading(false);
      })
    );

    // Player events
    cleanupFunctions.push(
      socket.on(SOCKET_EVENTS.SERVER.PLAYER_JOINED, (data) => {
        setPlayers(data.players);
      })
    );

    cleanupFunctions.push(
      socket.on(SOCKET_EVENTS.SERVER.PLAYER_LEFT, (data) => {
        setPlayers(data.players);
      })
    );

    cleanupFunctions.push(
      socket.on(SOCKET_EVENTS.SERVER.PLAYER_LIST_UPDATE, (updatedPlayers) => {
        setPlayers(updatedPlayers);
      })
    );

    cleanupFunctions.push(
      socket.on(SOCKET_EVENTS.SERVER.GAME_MASTER_CHANGED, (data) => {
        setIsGameMaster(data.newGameMaster === socket.socket.id);
        setPlayers((prev) =>
          prev.map((player) => ({
            ...player,
            isGameMaster: player.id === data.newGameMaster,
          }))
        );
      })
    );

    // Question events
    cleanupFunctions.push(
      socket.on(SOCKET_EVENTS.SERVER.QUESTION_CREATED, (data) => {
        setQuestion(data.question);
        setError(null);
      })
    );

    cleanupFunctions.push(
      socket.on(SOCKET_EVENTS.SERVER.QUESTION_ERROR, (errorMessage) => {
        setError(errorMessage);
      })
    );

    // Game events
    cleanupFunctions.push(
      socket.on(SOCKET_EVENTS.SERVER.GAME_STARTED, (data) => {
        setGameState(GAME_STATES.PLAYING);
        setQuestion(data.question);
        setTimeLimit(data.timeLimit);
        setGuessAttempts(0);
        setIsExhausted(false);
        setWinner(null);
        setAnswer("");
        setError(null);
      })
    );

    cleanupFunctions.push(
      socket.on(SOCKET_EVENTS.SERVER.GAME_ENDED, (data) => {
        setGameState(GAME_STATES.ENDED);
        setPlayers(data.scores);
        if (data.hasWinner && data.winner) {
          setWinner(data.winner);
        }
        setAnswer(data.answer);
        setIsGameMaster(data.newGameMaster === socket.socket.id);
      })
    );

    cleanupFunctions.push(
      socket.on(SOCKET_EVENTS.SERVER.GAME_ERROR, (errorMessage) => {
        setError(errorMessage);
      })
    );

    cleanupFunctions.push(
      socket.on(SOCKET_EVENTS.SERVER.NEXT_ROUND_STARTED, (data) => {
        setGameState(GAME_STATES.WAITING);
        setPlayers(data.players);
        setIsGameMaster(data.gameMaster === socket.socket.id);
        setQuestion("");
        setAnswer("");
        setWinner(null);
        setGuessAttempts(0);
        setIsExhausted(false);
        setError(null);
      })
    );

    cleanupFunctions.push(
      socket.on(SOCKET_EVENTS.SERVER.ROUND_ERROR, (errorMessage) => {
        setError(errorMessage);
      })
    );

    // Guess events
    cleanupFunctions.push(
      socket.on(SOCKET_EVENTS.SERVER.GUESS_RESULT, (data) => {
        setGuessAttempts(data.attempts);
        if (data.exhausted) {
          setIsExhausted(true);
        }
        if (data.correct) {
          // Game will end, wait for GAME_ENDED event
        }
      })
    );

    cleanupFunctions.push(
      socket.on(SOCKET_EVENTS.SERVER.GUESS_ERROR, (errorMessage) => {
        setError(errorMessage);
      })
    );

    cleanupFunctions.push(
      socket.on(SOCKET_EVENTS.SERVER.PLAYER_GUESSED, (data) => {
        // Update player attempts in the list
        setPlayers((prev) =>
          prev.map((player) =>
            player.id === data.playerId
              ? { ...player, attempts: data.attempts }
              : player
          )
        );
      })
    );

    // Cleanup function
    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [socket.socket]);

  // Reset game state
  const resetGameState = useCallback(() => {
    setGameState(GAME_STATES.WAITING);
    setSessionId(null);
    setIsGameMaster(false);
    setPlayers([]);
    setQuestion("");
    setTimeLimit(60);
    setWinner(null);
    setAnswer("");
    setGuessAttempts(0);
    setIsExhausted(false);
    setError(null);
    setLoading(false);
  }, []);

  // Game actions
  const createSession = useCallback(
    (username) => {
      console.log(
        "useGameSession: createSession called with username:",
        username
      );
      console.log("useGameSession: socket.isConnected:", socket.isConnected);
      if (!socket.isConnected) {
        console.log("useGameSession: Socket not connected, setting error");
        setError("Not connected to server");
        return;
      }
      setLoading(true);
      console.log("useGameSession: Calling socket.createSession");
      socket.createSession(username);
    },
    [socket]
  );

  const joinSession = useCallback(
    (sessionId, username) => {
      if (!socket.isConnected) {
        setError("Not connected to server");
        return;
      }
      setLoading(true);
      socket.joinSession(sessionId, username);
    },
    [socket]
  );

  const leaveSession = useCallback(() => {
    socket.leaveSession();
    resetGameState();
  }, [socket, resetGameState]);

  const createQuestion = useCallback(
    (question, answer) => {
      socket.createQuestion(question, answer);
    },
    [socket]
  );

  const startGame = useCallback(() => {
    socket.startGame();
  }, [socket]);

  const submitGuess = useCallback(
    (guess) => {
      socket.submitGuess(guess);
    },
    [socket]
  );

  const nextRound = useCallback(() => {
    socket.nextRound();
  }, [socket]);

  return {
    // State
    gameState,
    sessionId,
    isGameMaster,
    players,
    question,
    timeLimit,
    currentPlayer,
    winner,
    answer,
    guessAttempts,
    isExhausted,
    loading,
    error,
    isConnected: socket.isConnected,

    // Actions
    createSession,
    joinSession,
    leaveSession,
    createQuestion,
    startGame,
    submitGuess,
    nextRound,
    resetGameState,

    // Utilities
    canStartGame: players.length >= 2 && isGameMaster && question,
    canSubmitGuess:
      gameState === GAME_STATES.PLAYING && !isGameMaster && !isExhausted,
    isPlayerInSession: !!sessionId,
  };
};
