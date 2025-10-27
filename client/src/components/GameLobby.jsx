import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { GAME_STATES } from '../utils/socketEvents';
import PlayerList from './PlayerList';
import QuestionForm from './QuestionForm';
import './GameLobby.css';

const GameLobby = ({
  sessionId,
  isGameMaster,
  players,
  currentPlayer,
  question,
  gameState,
  onStartGame,
  onCreateQuestion,
  onLeaveSession,
  loading,
  error,
}) => {
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  const handleCreateQuestion = (questionText, answer) => {
    onCreateQuestion(questionText, answer);
    setShowQuestionForm(false);
  };

  const handleStartGame = () => {
    if (question && players.length >= 2) {
      onStartGame();
    }
  };

  const canStartGame = isGameMaster && question && players.length >= 2 && gameState === GAME_STATES.WAITING;
  const needsQuestion = isGameMaster && !question && gameState === GAME_STATES.WAITING;
  const canCreateQuestion = isGameMaster && !question && gameState === GAME_STATES.WAITING;

  return (
    <div className="game-lobby">
      <div className="lobby-header">
        <div className="session-info">
          <h2>Game Lobby</h2>
          <div className="session-code">
            Session Code: <span className="code">{sessionId}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="lobby-content">
        <div className="left-panel">
          <PlayerList 
            players={players}
            currentPlayer={currentPlayer}
            showGameMasterBadge={true}
          />
          
          {isGameMaster && (
            <div className="game-master-controls">
              <h3>Game Master Controls</h3>
              
              {needsQuestion && (
                <div className="question-needed">
                  <p>You need to create a question before starting the game.</p>
                  <button
                    className="create-question-button"
                    onClick={() => setShowQuestionForm(true)}
                    disabled={loading}
                  >
                    Create Question
                  </button>
                </div>
              )}

              {question && (
                <div className="question-preview">
                  <h4>Current Question:</h4>
                  <p className="question-text">{question}</p>
                  {canStartGame && (
                    <button
                      className="start-game-button"
                      onClick={handleStartGame}
                      disabled={loading || players.length < 2}
                    >
                      {loading ? 'Starting...' : 'Start Game'}
                    </button>
                  )}
                  {!canStartGame && players.length < 2 && (
                    <p className="waiting-message">
                      Need at least 2 players to start the game
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          
          {!isGameMaster && (
            <div className="player-waiting">
              <h3>Waiting for Game Master</h3>
              <p>The game master will create a question and start the game.</p>
              {question && (
                <div className="question-preview">
                  <h4>Question Ready:</h4>
                  <p className="question-text">{question}</p>
                  <p className="waiting-message">Waiting for game to start...</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="right-panel">
          {showQuestionForm && (
            <div className="question-form-modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Create Question</h3>
                  <button
                    className="close-button"
                    onClick={() => setShowQuestionForm(false)}
                  >
                    ×
                  </button>
                </div>
                <QuestionForm
                  onSubmit={handleCreateQuestion}
                  disabled={loading}
                />
              </div>
            </div>
          )}
          
          <div className="game-info">
            <h3>How to Play</h3>
            <div className="rules">
              <p>🎯 The Game Master creates a question with a secret answer</p>
              <p>🤔 Other players try to guess the answer</p>
              <p>🎲 Each player has 3 attempts to guess correctly</p>
              <p>🏆 First player to guess correctly wins 10 points</p>
              <p>👑 The winner becomes the next Game Master</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Leave button positioned at bottom right */}
      <button
        className="leave-button bottom-right"
        onClick={onLeaveSession}
        disabled={loading}
      >
        Leave Game
      </button>
    </div>
  );
};

GameLobby.propTypes = {
  sessionId: PropTypes.string.isRequired,
  isGameMaster: PropTypes.bool.isRequired,
  players: PropTypes.array.isRequired,
  currentPlayer: PropTypes.object,
  question: PropTypes.string,
  gameState: PropTypes.string.isRequired,
  onStartGame: PropTypes.func.isRequired,
  onCreateQuestion: PropTypes.func.isRequired,
  onLeaveSession: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
};

export default GameLobby;