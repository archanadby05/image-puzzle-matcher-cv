import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import PuzzlePieces from './components/PuzzlePieces';

function App() {
  const [pieceUrls, setPieceUrls] = useState(null);

  const resetAll = () => {
    setPieceUrls(null);
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 p-6">
      <ImageUpload setPieceUrls={setPieceUrls} resetAll={resetAll} />
      {pieceUrls && <PuzzlePieces pieceUrls={pieceUrls} />}
    </div>
  );
}

export default App;
