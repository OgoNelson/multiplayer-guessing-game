import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { useGameSession } from './hooks/useGameSession';
import Home from './pages/Home';
import JoinGame from './pages/JoinGame';
import GameRoom from './pages/GameRoom';
import './App.css';

// App content component that uses the game session hook
const AppContent = () => {
  const {
    gameState,
    sessionId,
    isGameMaster,
    players,
    currentPlayer,
    question,
    timeLimit,
    winner,
    answer,
    guessAttempts,
    isExhausted,
    createSession,
    joinSession,
    leaveSession,
    createQuestion,
    startGame,
    submitGuess,
    nextRound,
    loading,
    error,
    isConnected,
  } = useGameSession();

  // Connection status effect
  useEffect(() => {
    if (!isConnected) {
      console.log('Connection lost, attempting to reconnect...');
    }
  }, [isConnected]);

  const handleCreateGame = (username) => {
    console.log('App: handleCreateGame called with username:', username);
    createSession(username);
  };

  const handleJoinGame = (sessionId, username) => {
    joinSession(sessionId, username);
  };

  const handleLeaveSession = () => {
    leaveSession();
  };

  const handleCreateQuestion = (questionText, answerText) => {
    createQuestion(questionText, answerText);
  };

  const handleStartGame = () => {
    startGame();
  };

  const handleSubmitGuess = (guess) => {
    submitGuess(guess);
  };

  const handleNextRound = () => {
    nextRound();
  };

  return (
    <div className="app">
      <Routes>
        <Route 
          path="/" 
          element={
            <Home 
              onCreateGame={handleCreateGame}
              onJoinGame={() => {}}
              loading={loading}
              error={error}
            />
          } 
        />
        <Route 
          path="/join" 
          element={
            <JoinGame 
              onJoinGame={handleJoinGame}
              loading={loading}
              error={error}
            />
          } 
        />
        <Route
          path="/game"
          element={
            sessionId ? (
              <>
                {console.log('App: Rendering GameRoom with sessionId:', sessionId)}
                <GameRoom
                  gameState={gameState}
                  sessionId={sessionId}
                  isGameMaster={isGameMaster}
                  players={players}
                  currentPlayer={currentPlayer}
                  question={question}
                  timeLimit={timeLimit}
                  winner={winner}
                  answer={answer}
                  guessAttempts={guessAttempts}
                  isExhausted={isExhausted}
                  onCreateQuestion={handleCreateQuestion}
                  onStartGame={handleStartGame}
                  onSubmitGuess={handleSubmitGuess}
                  onNextRound={handleNextRound}
                  onLeaveSession={handleLeaveSession}
                  loading={loading}
                  error={error}
                />
              </>
            ) : (
              <>
                {console.log('App: Redirecting to home, sessionId is null')}
                <Navigate to="/" replace />
              </>
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Connection status indicator */}
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
    </div>
  );
};

// Main App component
const App = () => {
  return (
    <GameProvider>
      <Router>
        <AppContent />
      </Router>
    </GameProvider>
  );
};

export default App;