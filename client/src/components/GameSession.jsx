import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { GAME_STATES, GAME_SETTINGS } from '../utils/socketEvents';
import PlayerList from './PlayerList';
import './GameSession.css';

const GameSession = ({
  gameState,
  question,
  timeLimit,
  players,
  currentPlayer,
  isGameMaster,
  winner,
  answer,
  guessAttempts,
  isExhausted,
  onSubmitGuess,
  onNextRound,
  onLeaveSession,
  loading,
  error,
}) => {
  const [guess, setGuess] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [showAnswer, setShowAnswer] = useState(false);

  // Timer effect
  useEffect(() => {
    let timer;
    
    if (gameState === GAME_STATES.PLAYING && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (gameState !== GAME_STATES.PLAYING) {
      setTimeRemaining(timeLimit);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState, timeLimit, timeRemaining]);

  // Show answer when game ends
  useEffect(() => {
    if (gameState === GAME_STATES.ENDED) {
      setShowAnswer(true);
    } else {
      setShowAnswer(false);
    }
  }, [gameState]);

  const handleSubmitGuess = (e) => {
    e.preventDefault();
    if (guess.trim() && !isExhausted && gameState === GAME_STATES.PLAYING) {
      onSubmitGuess(guess.trim());
      setGuess('');
    }
  };

  const handleNextRound = () => {
    onNextRound();
    setTimeRemaining(timeLimit);
    setGuess('');
  };

  const canSubmitGuess = !isGameMaster && !isExhausted && gameState === GAME_STATES.PLAYING;
  const isWaiting = gameState === GAME_STATES.WAITING;
  const isPlaying = gameState === GAME_STATES.PLAYING;
  const isEnded = gameState === GAME_STATES.ENDED;

  return (
    <div className="game-session">
      <div className="game-header">
        <div className="game-title">
          <h2>Guessing Game</h2>
          <div className="game-status">
            {isWaiting && <span className="status-waiting">Waiting to Start</span>}
            {isPlaying && <span className="status-playing">In Progress</span>}
            {isEnded && <span className="status-ended">Game Over</span>}
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="game-content">
        <div className="left-panel">
          <div className="question-section">
            <h3>Question</h3>
            <div className="question-display">
              {question || 'No question yet...'}
            </div>
            
            {isPlaying && !isGameMaster && (
              <div className="timer">
                Time Remaining: <span className={timeRemaining <= 10 ? 'warning' : ''}>
                  {timeRemaining}s
                </span>
              </div>
            )}
          </div>

          {isGameMaster && (
            <div className="game-master-view">
              <h3>Game Master View</h3>
              <div className="answer-display">
                <strong>Answer:</strong> {answer || 'Not set'}
              </div>
              
              {isPlaying && (
                <div className="waiting-message">
                  Waiting for players to guess...
                </div>
              )}
              
              {isEnded && winner && (
                <div className="winner-announcement">
                  <h4>🎉 Winner: {winner.username}! 🎉</h4>
                  <button
                    className="next-round-button"
                    onClick={handleNextRound}
                    disabled={loading}
                  >
                    {loading ? 'Starting...' : 'Next Round'}
                  </button>
                </div>
              )}
              
              {isEnded && !winner && (
                <div className="no-winner">
                  <h4>⏰ Time's Up! No Winner</h4>
                  <p>The correct answer was: <strong>{answer}</strong></p>
                  <button
                    className="next-round-button"
                    onClick={handleNextRound}
                    disabled={loading}
                  >
                    {loading ? 'Starting...' : 'Next Round'}
                  </button>
                </div>
              )}
            </div>
          )}

          {!isGameMaster && (
            <div className="player-view">
              {isPlaying && (
                <form onSubmit={handleSubmitGuess} className="guess-form">
                  <h3>Your Guess</h3>
                  <div className="guess-input-group">
                    <input
                      type="text"
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      placeholder="Enter your guess..."
                      disabled={!canSubmitGuess}
                      maxLength={GAME_SETTINGS.MAX_GUESS_LENGTH}
                      className="guess-input"
                    />
                    <button
                      type="submit"
                      disabled={!canSubmitGuess || !guess.trim()}
                      className="submit-guess-button"
                    >
                      Submit
                    </button>
                  </div>
                  
                  <div className="attempts-info">
                    Attempts: {guessAttempts}/{GAME_SETTINGS.MAX_ATTEMPTS}
                    {isExhausted && (
                      <span className="exhausted-message">
                        No more attempts!
                      </span>
                    )}
                  </div>
                </form>
              )}
              
              {isEnded && showAnswer && (
                <div className="game-result">
                  <h3>Game Over</h3>
                  {winner ? (
                    <div className="winner-info">
                      <h4>🎉 Winner: {winner.username}! 🎉</h4>
                      <p>The correct answer was: <strong>{answer}</strong></p>
                    </div>
                  ) : (
                    <div className="no-winner-info">
                      <h4>⏰ Time's Up! No Winner</h4>
                      <p>The correct answer was: <strong>{answer}</strong></p>
                    </div>
                  )}
                  
                  {currentPlayer?.id === players.find(p => p.isGameMaster)?.id && (
                    <button
                      className="next-round-button"
                      onClick={handleNextRound}
                      disabled={loading}
                    >
                      {loading ? 'Starting...' : 'Next Round'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="right-panel">
          <PlayerList 
            players={players}
            currentPlayer={currentPlayer}
            showScores={true}
            showAttempts={isPlaying}
            showGameMasterBadge={true}
          />
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

GameSession.propTypes = {
  gameState: PropTypes.string.isRequired,
  question: PropTypes.string,
  timeLimit: PropTypes.number,
  players: PropTypes.array.isRequired,
  currentPlayer: PropTypes.object,
  isGameMaster: PropTypes.bool.isRequired,
  winner: PropTypes.object,
  answer: PropTypes.string,
  guessAttempts: PropTypes.number,
  isExhausted: PropTypes.bool,
  onSubmitGuess: PropTypes.func.isRequired,
  onNextRound: PropTypes.func.isRequired,
  onLeaveSession: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
};

export default GameSession;