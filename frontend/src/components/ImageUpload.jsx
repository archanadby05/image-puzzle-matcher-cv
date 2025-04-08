import React, { useState } from 'react';
import axios from 'axios';
import PuzzleBoard from './PuzzleBoard';

const ImageUpload = () => {
  const [referenceImage, setReferenceImage] = useState(null);
  const [pieceUrls, setPieceUrls] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleReferenceUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setReferenceImage(file);
    setPreviewUrl(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://127.0.0.1:5000/get-pieces', formData);
      setPieceUrls(res.data);
    } catch (err) {
      console.error('Piece cropping failed:', err);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <input type="file" accept="image/*" onChange={handleReferenceUpload} />
      {previewUrl && <img src={previewUrl} className="w-80 border rounded" alt="Reference preview" />
    }
      {Object.keys(pieceUrls).length > 0 && (
        <PuzzleBoard pieceUrls={pieceUrls} />
      )}
    </div>
  );
};

export default ImageUpload;
