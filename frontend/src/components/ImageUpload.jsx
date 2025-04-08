import React, { useState } from 'react';
import axios from 'axios';

const ImageUploader = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    setPreview(URL.createObjectURL(uploadedFile));
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://127.0.0.1:5000/upload', formData);
      alert('Uploaded successfully!');
    } catch (err) {
      console.error(err);
      alert('Upload failed!');
    }
  };

  return (
    <div className="p-4">
      <input type="file" onChange={handleChange} />
      {preview && <img src={preview} alt="preview" className="mt-4 max-w-xs rounded shadow" />}
      <button onClick={handleUpload} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        Upload
      </button>
    </div>
  );
};

export default ImageUploader;
