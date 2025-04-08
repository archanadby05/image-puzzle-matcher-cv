import React, { useState } from 'react';
import axios from 'axios';

function ImageUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [pieceUrls, setPieceUrls] = useState({});
  const [matchResult, setMatchResult] = useState(null);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError('');
    setMatchResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://127.0.0.1:5000/get-pieces', formData);
      setPieceUrls(response.data);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed. Please try a different image.');
    }
  };

  const handlePieceClick = async (index) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('piece_index', index);
    formData.append('file', file);

    try {
      const response = await axios.post('http://127.0.0.1:5000/match-piece', formData);
      setMatchResult({
        matched: `http://127.0.0.1:5000${response.data.matched}`,
        overlaid: `http://127.0.0.1:5000${response.data.overlaid}`,
      });
    } catch (err) {
      console.error('Matching error:', err);
      setError('Matching failed. Try again.');
    }
  };

  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setPieceUrls({});
    setMatchResult(null);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-semibold mb-6">Upload Reference Image</h1>
  
      {/* Upload Box */}
      <label className="block border-2 border-dashed border-gray-400 rounded p-6 cursor-pointer bg-gray-50 hover:bg-gray-100 mb-6">
        <input type="file" onChange={handleFile} accept="image/*" className="hidden" />
        {preview ? (
          <img src={preview} alt="Reference" className="mx-auto max-h-64" />
        ) : (
          <p className="text-gray-500">Drag and drop your image here<br />or click to upload</p>
        )}
      </label>
  
      {error && <p className="text-red-600 mb-4">{error}</p>}
  
      {/* Puzzle Pieces */}
      {Object.keys(pieceUrls).length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-medium mb-3">Click a Puzzle Piece:</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {Object.entries(pieceUrls).map(([index, url]) => (
              <img
                key={index}
                src={`http://127.0.0.1:5000${url}`}
                alt={`Piece ${index}`}
                className="w-32 h-32 object-cover border rounded shadow cursor-pointer hover:scale-105 transition"
                onClick={() => handlePieceClick(index)}
              />
            ))}
          </div>
        </div>
      )}
  
      {/* Match Results */}
      {matchResult && (
        <div className="mt-12">
          <h2 className="text-xl font-medium mb-4">Match Results:</h2>
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <img src={matchResult.matched} alt="Matched Keypoints" className="w-[300px] border rounded shadow" />
            <img src={matchResult.overlaid} alt="Overlaid Result" className="w-[300px] border rounded shadow" />
          </div>
        </div>
      )}
  
      {/* Reset Button */}
      {file && (
        <button
          onClick={resetUpload}
          className="mt-10 bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded"
        >
          Reset and Upload New Image
        </button>
      )}
    </div>
  );  
}

export default ImageUpload;
