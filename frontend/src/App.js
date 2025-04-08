import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import PuzzlePieces from './components/PuzzlePieces';

function App() {
  const [pieceUrls, setPieceUrls] = useState(null);

  const resetAll = () => {
    setPieceUrls(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-white shadow py-4">
        <h1 className="text-center text-2xl font-semibold">🧩 Image Puzzle Matcher</h1>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        <ImageUpload setPieceUrls={setPieceUrls} resetAll={resetAll} />

        {pieceUrls && <PuzzlePieces pieceUrls={pieceUrls} />}
      </main>
    </div>
  );
}

export default App;
