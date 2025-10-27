import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './JoinGame.css';

const JoinGame = ({ onJoinGame, loading, error }) => {
  const [sessionCode, setSessionCode] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get username from location state if coming from Home page
    if (location.state?.username) {
      setUsername(location.state.username);
    }
  }, [location.state]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (sessionCode.trim() && username.trim()) {
      onJoinGame(sessionCode.trim().toUpperCase(), username.trim());
    }
  };

  const handleSessionCodeChange = (e) => {
    const value = e.target.value.toUpperCase();
    // Only allow alphanumeric characters and limit to 8 characters
    if (/^[A-Z0-9]*$/.test(value) && value.length <= 8) {
      setSessionCode(value);
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    if (value.length <= 20) {
      setUsername(value);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="join-game">
      <div className="join-container">
        <header className="join-header">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
          <h1 className="join-title">🚪 Join Game</h1>
          <p className="join-subtitle">Enter the session code to join an existing game</p>
        </header>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <main className="join-main">
          <form onSubmit={handleSubmit} className="join-form">
            <div className="form-group">
              <label htmlFor="sessionCode" className="form-label">
                Session Code
              </label>
              <input
                id="sessionCode"
                type="text"
                value={sessionCode}
                onChange={handleSessionCodeChange}
                placeholder="Enter 8-character code"
                className="form-input session-code-input"
                maxLength={8}
                disabled={loading}
                autoComplete="off"
                autoFocus
              />
              <div className="form-hint">
                Ask the Game Master for the session code
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Your Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Enter your username"
                className="form-input"
                maxLength={20}
                disabled={loading}
                autoComplete="off"
              />
              <div className="form-hint">
                {username.length}/20 characters
              </div>
            </div>

            <button
              type="submit"
              className="join-button"
              disabled={!sessionCode.trim() || !username.trim() || loading}
            >
              {loading ? 'Joining...' : 'Join Game'}
            </button>
          </form>

          <div className="join-info">
            <h2>How to Join</h2>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Get Session Code</h3>
                  <p>Ask the Game Master for the 8-character session code</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Enter Code & Username</h3>
                  <p>Type the session code and choose your username</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Join & Wait</h3>
                  <p>Wait in the lobby for the Game Master to start the game</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default JoinGame;