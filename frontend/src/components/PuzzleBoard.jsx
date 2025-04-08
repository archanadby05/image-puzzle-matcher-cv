import React, { useState } from 'react';
import axios from 'axios';

const PuzzleBoard = ({ pieceUrls }) => {
  const [matchedUrl, setMatchedUrl] = useState(null);
  const [overlaidUrl, setOverlaidUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePieceClick = async (index) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', await fetch('http://127.0.0.1:5000/uploads/reference.jpg').then(r => r.blob()));
    formData.append('piece_index', index);

    try {
      const res = await axios.post('http://127.0.0.1:5000/match-piece', formData);
      setMatchedUrl(`http://127.0.0.1:5000${res.data.matched}`);
      setOverlaidUrl(`http://127.0.0.1:5000${res.data.overlaid}`);
    } catch (err) {
      console.error('Matching failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const shuffledPieces = Object.entries(pieceUrls).sort(() => 0.5 - Math.random());

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold">Jumbled Pieces</h3>
      <div className="flex gap-4 flex-wrap">
        {shuffledPieces.map(([index, url]) => (
          <img
            key={index}
            src={`http://127.0.0.1:5000${url}`}
            alt={`Puzzle piece ${index}`}
            onClick={() => handlePieceClick(index)}
            className="w-36 h-36 object-cover border cursor-pointer hover:scale-105 transition"
          />
        ))}
      </div>

      {loading && <p className="mt-4 text-blue-600">Matching in progress...</p>}

      {matchedUrl && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Keypoint Matches</h3>
          <img src={matchedUrl} className="w-96 border" alt="Keypoint match result" />
        </div>
      )}

      {overlaidUrl && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Piece Placed on Output</h3>
          <img src={overlaidUrl} className="w-96 border" alt="Piece placement output" />
        </div>
      )}
    </div>
  );
};

export default PuzzleBoard;
