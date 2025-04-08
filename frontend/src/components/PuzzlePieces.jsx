import React, { useState } from 'react';
import axios from 'axios';

const PuzzlePieces = ({ pieceUrls }) => {
  const [matchedUrl, setMatchedUrl] = useState('');
  const [overlaidUrl, setOverlaidUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async (index) => {
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('piece_index', index);
    formData.append('file', new File([], 'reference.jpg')); // Dummy, backend already saved it

    try {
      const res = await axios.post('http://127.0.0.1:5000/match-piece', formData);
      setMatchedUrl(`http://127.0.0.1:5000${res.data.matched}`);
      setOverlaidUrl(`http://127.0.0.1:5000${res.data.overlaid}`);
    } catch (err) {
      setError('Matching failed. Try another piece.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 max-w-4xl mx-auto text-center">
      <h3 className="text-xl font-semibold mb-4">Puzzle Pieces</h3>

      <div className="flex flex-wrap justify-center gap-4">
        {Object.entries(pieceUrls).map(([index, url]) => (
          <img
            key={index}
            src={`http://127.0.0.1:5000${url}`}
            alt={`Piece ${index}`}
            className="w-24 h-24 object-cover border rounded shadow cursor-pointer hover:scale-105 transition"
            onClick={() => handleClick(index)}
          />
        ))}
      </div>

      {loading && <p className="mt-4 text-blue-600">Matching piece...</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}

      {(matchedUrl || overlaidUrl) && (
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4">Match Results</h3>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            {matchedUrl && (
              <img
                src={matchedUrl}
                alt="Matched"
                className="w-64 border rounded shadow"
              />
            )}
            {overlaidUrl && (
              <img
                src={overlaidUrl}
                alt="Overlaid"
                className="w-64 border rounded shadow"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PuzzlePieces;
