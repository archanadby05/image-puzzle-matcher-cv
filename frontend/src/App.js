import React, { useState } from 'react';
import axios from 'axios';

function ImageUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [pieceIndex, setPieceIndex] = useState('');
  const [matchedUrl, setMatchedUrl] = useState(null);
  const [overlaidUrl, setOverlaidUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setMatchedUrl(null);
    setOverlaidUrl(null);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !pieceIndex) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('piece_index', pieceIndex);

    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:5000/match-piece', formData);
      const { matched, overlaid } = res.data;

      setMatchedUrl(`http://127.0.0.1:5000${matched}`);
      setOverlaidUrl(`http://127.0.0.1:5000${overlaid}`);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <br /><br />

      {preview && <img src={preview} alt="Puzzle preview" width="300" />}
      <br /><br />

      <label>Select puzzle piece (1–4): </label>
      <select value={pieceIndex} onChange={(e) => setPieceIndex(e.target.value)}>
        <option value="">--Choose--</option>
        <option value="1">Top-left</option>
        <option value="2">Top-right</option>
        <option value="3">Bottom-left</option>
        <option value="4">Bottom-right</option>
      </select>
      <br /><br />

      <button onClick={handleUpload}>Match Puzzle Piece</button>

      {loading && <p>Matching in progress...</p>}

      {matchedUrl && (
      <div>
        <h3>Keypoint Matches</h3>
        <img src={matchedUrl} alt="Keypoint matches" width="400" />
      </div>
    )}

      {overlaidUrl && (
        <div>
          <h3>Overlaid Puzzle Piece</h3>
          <img src={overlaidUrl} alt="Overlaid result" width="400" />
        </div>
      )}

    </div>
  );
}

export default ImageUpload;
