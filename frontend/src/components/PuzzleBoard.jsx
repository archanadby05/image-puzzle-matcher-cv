import React, { useState } from 'react';
import axios from 'axios';

const PuzzleBoard = ({ pieceUrls }) => {
  const [matchedUrl, setMatchedUrl] = useState(null);
  const [overlaidUrl, setOverlaidUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePieceClick = async (index) => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    try {
      const refImage = await fetch('http://127.0.0.1:5000/uploads/reference.jpg');
      const blob = await refImage.blob();
      formData.append('file', blob);
      formData.append('piece_index', index);

      const res = await axios.post('http://127.0.0.1:5000/match-piece', formData);
      setMatchedUrl(`http://127.0.0.1:5000${res.data.matched}`);
      setOverlaidUrl(`http://127.0.0.1:5000${res.data.overlaid}`);
    } catch (err) {
      console.error('Matching failed:', err);
      setError('Failed to match piece. Please try again.');
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
            alt=""
            onClick={() => handlePieceClick(index)}
            className="w-36 h-36 object-cover border cursor-pointer hover:scale-105 transition"
          />
        ))}
      </div>

      {loading && <p className="mt-4 text-blue-600">Matching in progress...</p>}

      {error && (
        <div className="mt-4 text-red-600 font-medium border border-red-300 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}

      {matchedUrl && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Keypoint Matches</h3>
          <img src={matchedUrl} className="w-96 border" alt="" />
        </div>
      )}

      {overlaidUrl && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Piece Placed on Output</h3>
          <img src={overlaidUrl} className="w-96 border" alt="" />
        </div>
      )}
    </div>
  );
};

export default PuzzleBoard;
