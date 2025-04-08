import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload';

function App() {
  const [pieceUrls, setPieceUrls] = useState({});

  return (
    <div className="min-h-screen bg-white text-gray-800 p-6">
      <ImageUpload setPieceUrls={setPieceUrls} resetAll={() => setPieceUrls({})} />

      {Object.keys(pieceUrls).length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-4 justify-center">
          {Object.entries(pieceUrls).map(([index, url]) => (
            <img
              key={index}
              src={`http://127.0.0.1:5000${url}`}
              alt={`Piece ${index}`}
              className="w-32 h-32 object-cover border rounded shadow"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
