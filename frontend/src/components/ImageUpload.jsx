import React, { useState } from 'react';
import axios from 'axios';
import PuzzleBoard from './PuzzleBoard';

const ImageUpload = () => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pieceUrls, setPieceUrls] = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file) => {
    setPreviewUrl(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://127.0.0.1:5000/upload', formData);
      const res = await axios.get('http://127.0.0.1:5000/get-pieces');
      setPieceUrls(res.data.pieces);
    } catch (err) {
      console.error('Upload or crop failed:', err);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleChange = (e) => {
    if (e.target.files.length) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-4">
      <div
        className={`border-4 border-dashed p-6 rounded-lg text-center transition ${
          dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <p className="mb-2 font-medium">Drag & drop an image here</p>
        <p>or</p>
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="mt-2"
        />
      </div>

      {previewUrl && (
        <div className="mt-4">
          <h3 className="font-semibold">Uploaded Reference Image</h3>
          <img src={previewUrl} alt="" className="w-full mt-2 rounded border" />
        </div>
      )}

      {pieceUrls && <PuzzleBoard pieceUrls={pieceUrls} />}
    </div>
  );
};

export default ImageUpload;
