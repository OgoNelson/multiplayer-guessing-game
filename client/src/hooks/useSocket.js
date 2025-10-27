import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from '../utils/socketEvents';

const SERVER_URL = 'http://localhost:3000';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SERVER_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError(err.message);
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Emit events wrapper
  const emit = (event, data) => {
    console.log('useSocket: emit called with event:', event, 'data:', data);
    console.log('useSocket: socketRef.current:', socketRef.current);
    console.log('useSocket: isConnected:', isConnected);
    if (socketRef.current && isConnected) {
      console.log('useSocket: Emitting event:', event);
      socketRef.current.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  };

  // Listen to events wrapper
  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
      
      // Return cleanup function
      return () => {
        if (socketRef.current) {
          socketRef.current.off(event, callback);
        }
      };
    }
  };

  // Stop listening to events
  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  // Game-specific methods
  const registerPlayer = (username) => {
    emit(SOCKET_EVENTS.CLIENT.REGISTER_PLAYER, username);
  };

  const createSession = (username) => {
    console.log('useSocket: createSession called with username:', username);
    console.log('useSocket: isConnected:', isConnected);
    emit(SOCKET_EVENTS.CLIENT.CREATE_SESSION, username);
  };

  const joinSession = (sessionId, username) => {
    emit(SOCKET_EVENTS.CLIENT.JOIN_SESSION, { sessionId, username });
  };

  const leaveSession = () => {
    emit(SOCKET_EVENTS.CLIENT.LEAVE_SESSION);
  };

  const createQuestion = (question, answer) => {
    emit(SOCKET_EVENTS.CLIENT.CREATE_QUESTION, { question, answer });
  };

  const startGame = () => {
    emit(SOCKET_EVENTS.CLIENT.START_GAME);
  };

  const submitGuess = (guess) => {
    emit(SOCKET_EVENTS.CLIENT.SUBMIT_GUESS, guess);
  };

  const nextRound = () => {
    emit(SOCKET_EVENTS.CLIENT.NEXT_ROUND);
  };

  const requestPlayerList = () => {
    emit(SOCKET_EVENTS.CLIENT.REQUEST_PLAYER_LIST);
  };

  return {
    socket: socketRef.current,
    isConnected,
    error,
    emit,
    on,
    off,
    // Game-specific methods
    registerPlayer,
    createSession,
    joinSession,
    leaveSession,
    createQuestion,
    startGame,
    submitGuess,
    nextRound,
    requestPlayerList,
  };
};