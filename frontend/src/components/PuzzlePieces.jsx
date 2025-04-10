// src/components/PuzzlePieces.jsx
import React, { useState } from 'react';
import MatchedResult from './MatchedResult';

function PuzzlePieces({ pieceUrls }) {
  const [matchResult, setMatchResult] = useState(null);
  const [error, setError] = useState('');
  const [loadingIndex, setLoadingIndex] = useState(null);

  const handleClick = async (index) => {
    setError('');
    setMatchResult(null);
    setLoadingIndex(index);

    const formData = new FormData();
    formData.append('piece_index', index);

    try {
      const response = await fetch('http://127.0.0.1:5000/match-piece', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Matching failed');

      const data = await response.json();
      setMatchResult({
        matched: `http://127.0.0.1:5000${data.matched}`,
        overlaid: `http://127.0.0.1:5000${data.overlaid}`,
      });
    } catch (err) {
      console.error(err);
      setError('Failed to match puzzle piece. Please try again.');
    } finally {
      setLoadingIndex(null);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-semibold mb-4">Click a Puzzle Piece to Match</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(pieceUrls).map(([index, url]) => (
            <button
              key={index}
              onClick={() => handleClick(index)}
              className="relative group"
              disabled={loadingIndex !== null}
            >
              <img
                src={`http://127.0.0.1:5000${url}`}
                alt={`Piece ${index}`}
                className={`rounded shadow-lg border-2 border-transparent group-hover:border-blue-400 transition-transform duration-200 transform hover:scale-105 ${
                  loadingIndex === parseInt(index) ? 'opacity-50' : ''
                }`}
              />
              {loadingIndex === parseInt(index) && (
                <span className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded">
                  <span className="text-sm text-gray-700 font-medium">Matching...</span>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-red-500 font-medium text-center">{error}</p>
      )}

      {matchResult && (
        <MatchedResult matched={matchResult.matched} overlaid={matchResult.overlaid} />
      )}
    </div>
  );
}

export default PuzzlePieces;
