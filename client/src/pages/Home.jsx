import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GAME_SETTINGS } from "../utils/socketEvents";
import "./Home.css";

const Home = ({ onCreateGame, onJoinGame, loading, error }) => {
  const [username, setUsername] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const navigate = useNavigate();

  const handleCreateGame = (e) => {
    e.preventDefault();
    console.log("handleCreateGame called with username:", username);
    if (username.trim()) {
      console.log("Calling onCreateGame with username:", username.trim());
      onCreateGame(username.trim());
    } else {
      console.log("Username is empty, not creating game");
    }
  };

  const handleJoinGame = (e) => {
    e.preventDefault();
    if (username.trim()) {
      navigate("/join", { state: { username: username.trim() } });
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    if (value.length <= GAME_SETTINGS.MAX_USERNAME_LENGTH) {
      setUsername(value);
    }
  };

  return (
    <div className="home">
      <div className="home-container">
        <header className="home-header">
          <h1 className="game-title">🎮 Multiplayer Guessing Game</h1>
          <p className="game-subtitle">
            Create questions, guess answers, and have fun with friends!
          </p>
        </header>

        {error && <div className="error-message">{error}</div>}

        <main className="home-main">
          <div className="username-section">
            <label htmlFor="username" className="username-label">
              Enter Your Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Your username..."
              className="username-input"
              maxLength={GAME_SETTINGS.MAX_USERNAME_LENGTH}
              disabled={loading}
            />
            <div className="username-hint">
              {username.length}/{GAME_SETTINGS.MAX_USERNAME_LENGTH} characters
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="create-game-button"
              onClick={() => setShowCreateForm(true)}
              disabled={!username.trim() || loading}
            >
              🎯 Create New Game
            </button>

            <button
              className="join-game-button"
              onClick={() => setShowJoinForm(true)}
              disabled={!username.trim() || loading}
            >
              🚪 Join Existing Game
            </button>
          </div>

          <div className="game-features">
            <h2>How to Play</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">👑</div>
                <h3>Be the Game Master</h3>
                <p>
                  Create challenging questions with secret answers for other
                  players to guess.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🤔</div>
                <h3>Test Your Knowledge</h3>
                <p>
                  Try to guess the correct answer with only 3 attempts
                  available.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⏱️</div>
                <h3>Race Against Time</h3>
                <p>
                  Answer quickly before time runs out and claim your victory.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🏆</div>
                <h3>Win and Lead</h3>
                <p>
                  The Game Master role rotates randomly among the players, they
                  create the next round question and starts the round.
                </p>
              </div>
            </div>
          </div>
        </main>

        {showCreateForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Create New Game</h2>
                <button
                  className="close-button"
                  onClick={() => setShowCreateForm(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateGame} className="modal-form">
                <div className="form-group">
                  <p>
                    Ready to create a new game as Game Master,{" "}
                    <strong>{username}</strong>?
                  </p>
                  <p className="form-hint">
                    You'll be able to create a question and start the game when
                    players join.
                  </p>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowCreateForm(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="confirm-button"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Game"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showJoinForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Join Game</h2>
                <button
                  className="close-button"
                  onClick={() => setShowJoinForm(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleJoinGame} className="modal-form">
                <div className="form-group">
                  <p>
                    Ready to join a game as <strong>{username}</strong>?
                  </p>
                  <p className="form-hint">
                    You'll need a session code from the Game Master to join.
                  </p>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowJoinForm(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="confirm-button"
                    disabled={loading}
                  >
                    Continue to Join
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
