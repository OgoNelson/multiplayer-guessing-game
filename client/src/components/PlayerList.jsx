import React from 'react';
import PropTypes from 'prop-types';
import './PlayerList.css';

const PlayerList = ({ 
  players, 
  currentPlayer, 
  showScores = false, 
  showAttempts = false, 
  showGameMasterBadge = true 
}) => {
  if (!players || players.length === 0) {
    return (
      <div className="player-list empty">
        <p>No players in the session yet</p>
      </div>
    );
  }

  return (
    <div className="player-list">
      <h3 className="player-list-title">
        Players ({players.length})
      </h3>
      
      <div className="player-list-container">
        {players.map((player) => {
          const isCurrentPlayer = currentPlayer?.id === player.id;
          const isGameMaster = player.isGameMaster;
          
          return (
            <div 
              key={player.id} 
              className={`player-item ${isCurrentPlayer ? 'current-player' : ''}`}
            >
              <div className="player-info">
                <span className="player-name">
                  {player.username}
                  {isCurrentPlayer && <span className="you-badge"> (You)</span>}
                  {showGameMasterBadge && isGameMaster && (
                    <span className="game-master-badge">👑 Game Master</span>
                  )}
                </span>
              </div>
              
              <div className="player-stats">
                {showScores && (
                  <span className="player-score">
                    Score: {player.score || 0}
                  </span>
                )}
                
                {showAttempts && !isGameMaster && (
                  <span className={`player-attempts ${player.attempts >= 3 ? 'exhausted' : ''}`}>
                    Attempts: {player.attempts || 0}/3
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

PlayerList.propTypes = {
  players: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      score: PropTypes.number,
      attempts: PropTypes.number,
      isGameMaster: PropTypes.bool,
    })
  ),
  currentPlayer: PropTypes.shape({
    id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }),
  showScores: PropTypes.bool,
  showAttempts: PropTypes.bool,
  showGameMasterBadge: PropTypes.bool,
};

export default PlayerList;