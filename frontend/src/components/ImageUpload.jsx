import React, { useState } from 'react';
import axios from 'axios';

const ImageUpload = ({ setPieceUrls, resetAll }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://127.0.0.1:5000/upload', formData);
      const res = await axios.get('http://127.0.0.1:5000/get-pieces');
      setPieceUrls(res.data);
      setError('');
    } catch (err) {
      setError('Upload failed. Please try a different image.');
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="w-full max-w-3xl mx-auto text-center mt-8">
      <h2 className="text-2xl font-bold mb-4">Upload Reference Image</h2>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        className={`p-10 border-4 border-dashed rounded-xl transition-all ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <p className="mb-2 text-gray-600">Drag and drop your image here</p>
        <input
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          id="upload"
        />
        <label
          htmlFor="upload"
          className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Or click to upload
        </label>
      </div>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      <button
        onClick={resetAll}
        className="mt-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
      >
        Reset and Upload New Image
      </button>
    </div>
  );
};

export default ImageUpload;
