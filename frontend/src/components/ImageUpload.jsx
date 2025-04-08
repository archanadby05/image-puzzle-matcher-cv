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
    <div className="container py-5">
  
      {/* Title */}
      <h1 className="text-center mb-4 fw-bold display-6 text-dark">
        Upload Reference Image
      </h1>
  
      {/* Upload Box */}
      <label className="d-block border border-2 border-secondary border-dashed rounded p-5 bg-light text-center mb-3" style={{ cursor: 'pointer' }}>
        <input type="file" onChange={handleFile} accept="image/*" className="d-none" />
        {preview ? (
          <img src={preview} alt="Reference" className="img-fluid rounded shadow" style={{ maxHeight: '300px' }} />
        ) : (
          <p className="text-secondary fs-5">
            Drag and drop your image here<br />or click to upload
          </p>
        )}
      </label>
  
      {/* Error Message */}
      {error && <p className="text-danger text-center mt-3">{error}</p>}
  
      {/* Puzzle Pieces */}
      {Object.keys(pieceUrls).length > 0 && (
        <div className="mt-5 p-4 bg-white rounded shadow">
          <h2 className="text-center fs-4 fw-semibold mb-4">Click a Puzzle Piece</h2>
          <div className="row row-cols-2 row-cols-md-4 g-4 justify-content-center">
            {Object.entries(pieceUrls).map(([index, url]) => (
              <div key={index} className="col text-center">
                <img
                  src={`http://127.0.0.1:5000${url}`}
                  alt={`Piece ${index}`}
                  className="img-thumbnail"
                  style={{ width: '120px', height: '120px', objectFit: 'cover', cursor: 'pointer', transition: 'transform 0.2s' }}
                  onClick={() => handlePieceClick(index)}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>
            ))}
          </div>
        </div>
      )}
  
      {/* Match Results */}
      {matchResult && (
        <div className="mt-5 p-4 bg-white rounded shadow">
          <h2 className="text-center fs-4 fw-semibold mb-4">Match Results</h2>
          <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-4">
            <img src={matchResult.matched} alt="Matched Keypoints" className="img-fluid rounded border shadow" style={{ maxWidth: '300px' }} />
            <img src={matchResult.overlaid} alt="Overlaid Result" className="img-fluid rounded border shadow" style={{ maxWidth: '300px' }} />
          </div>
        </div>
      )}
  
      {/* Reset Button */}
      {file && (
        <div className="text-center mt-4">
          <button
            onClick={resetUpload}
            className="btn btn-danger px-4 py-2 shadow-sm"
          >
            Reset and Upload New Image
          </button>
        </div>
      )}
    </div>
  );
}
export default ImageUpload;