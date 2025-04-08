import React, { useState } from 'react';
import axios from 'axios';

const PuzzleBoard = ({ pieceUrls }) => {
  const [matchedUrl, setMatchedUrl] = useState(null);
  const [overlaidUrl, setOverlaidUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePieceClick = async (index) => {
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      const referenceBlob = await fetch('http://127.0.0.1:5000/uploads/reference.jpg').then(r => r.blob());
      formData.append('file', referenceBlob);
      formData.append('piece_index', index);

      const res = await axios.post('http://127.0.0.1:5000/match-piece', formData);
      setMatchedUrl(`http://127.0.0.1:5000${res.data.matched}`);
      setOverlaidUrl(`http://127.0.0.1:5000${res.data.overlaid}`);
    } catch (err) {
      console.error(err);
      setError('Failed to match piece. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const shuffledPieces = Object.entries(pieceUrls).sort(() => 0.5 - Math.random());

  return (
    <div className="w-full max-w-5xl mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Puzzle Interaction</h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Jumbled Pieces</h3>
        <div className="flex flex-wrap gap-4">
          {shuffledPieces.map(([index, url]) => (
            <img
              key={index}
              src={`http://127.0.0.1:5000${url}`}
              alt={`Puzzle piece ${index}`}
              onClick={() => handlePieceClick(index)}
              className="w-36 h-36 object-cover border-2 border-gray-300 rounded hover:scale-105 cursor-pointer transition"
            />
          ))}
        </div>
      </div>

      {loading && <p className="text-blue-500">Matching in progress...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {matchedUrl && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Keypoint Matches</h3>
          <img src={matchedUrl} alt="Keypoint match result" className="w-full max-w-md border rounded" />
        </div>
      )}

      {overlaidUrl && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Piece Placed on Output</h3>
          <img src={overlaidUrl} alt="Piece placement output" className="w-full max-w-md border rounded" />
        </div>
      )}
    </div>
  );
};

export default PuzzleBoard;
