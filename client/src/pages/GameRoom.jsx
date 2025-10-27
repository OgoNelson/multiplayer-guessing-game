import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GAME_STATES } from '../utils/socketEvents';
import GameLobby from '../components/GameLobby';
import GameSession from '../components/GameSession';
import './GameRoom.css';

const GameRoom = ({
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
  onCreateQuestion,
  onStartGame,
  onSubmitGuess,
  onNextRound,
  onLeaveSession,
  loading,
  error,
}) => {
  const navigate = useNavigate();

  const handleLeaveSession = () => {
    onLeaveSession();
    navigate('/');
  };

  // Show lobby when waiting for game to start
  if (gameState === GAME_STATES.WAITING) {
    return (
      <div className="game-room">
        <GameLobby
          sessionId={sessionId}
          isGameMaster={isGameMaster}
          players={players}
          currentPlayer={currentPlayer}
          question={question}
          gameState={gameState}
          onStartGame={onStartGame}
          onCreateQuestion={onCreateQuestion}
          onLeaveSession={handleLeaveSession}
          loading={loading}
          error={error}
        />
      </div>
    );
  }

  // Show game session when game is playing or ended
  return (
    <div className="game-room">
      <GameSession
        gameState={gameState}
        question={question}
        timeLimit={timeLimit}
        players={players}
        currentPlayer={currentPlayer}
        isGameMaster={isGameMaster}
        winner={winner}
        answer={answer}
        guessAttempts={guessAttempts}
        isExhausted={isExhausted}
        onSubmitGuess={onSubmitGuess}
        onNextRound={onNextRound}
        onLeaveSession={handleLeaveSession}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default GameRoom;