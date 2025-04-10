# Image Puzzle Matcher

A web-based interactive puzzle matcher using computer vision. Users can upload a reference image, automatically crop it into four pieces, and interactively click on each to see how it's matched back to the original using SIFT + Homography.

---

## Features

- Upload a reference image using drag-and-drop
- Image is divided into 4 puzzle pieces
- Click on any piece to visualize keypoint-based matching
- Overlay each piece back into the full image
- Clean match output showing feature correspondences
- Responsive UI with Bootstrap styling

---

## Tech Stack

- **Frontend**: React, Bootstrap, Axios
- **Backend**: Flask, OpenCV, NumPy
- **Matching Algorithm**: SIFT (Scale-Invariant Feature Transform), RANSAC

---

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/image-puzzle-matcher.git
cd image-puzzle-matcher
```

### 2. Backend Setup (Flask)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
Runs at: http://127.0.0.1:5000

### 3. Frontend Setup (React)
```bash
cd frontend
npm install
npm start
```
Runs at: http://localhost:3000

---

## How It Works (Computer Vision Overview)

### Puzzle Piece Cropping
The uploaded reference image is divided into four quadrants:
- Top-left
- Top-right
- Bottom-left
- Bottom-right

These are saved and displayed as draggable puzzle pieces.

### Feature Detection & Matching
- Convert reference image and piece to **grayscale**.
- Use **SIFT** to extract keypoints and descriptors.
- Match using **BFMatcher** and filter with **Lowe's ratio test**.

### Homography & Warping
- Use good matches to estimate a **homography matrix** with RANSAC.
- Warp the piece to align with the reference image.
- Blend it back using binary masks.

### Visualization
- Create a large canvas to show:
  - The puzzle piece on the right
  - The full reference on the left
  - Colorful lines between matching keypoints
  - A red box over the estimated piece location

---

## Project Structure
```
image-puzzle-matcher/
├── backend/
│   ├── app.py
│   ├── uploads/
│   └── results/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageUpload.jsx
│   │   │   ├── PuzzlePieces.jsx
│   │   │   └── MatchedResult.jsx
│   │   └── App.js
│   └── public/
└── README.md
```

---

## Future Improvements
- Drag-and-drop puzzle placement manually
- Animated matching overlays
- Support more than 4-piece puzzles

---

## License
This project is for educational and experimental purposes.

