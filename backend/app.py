import base64
from flask import Flask, request, jsonify, send_from_directory
import cv2
import numpy as np
import os
from flask_cors import CORS

app = Flask(__name__, static_url_path='', static_folder='results')
CORS(app, origins=['http://localhost:3000'])

UPLOAD_FOLDER = 'uploads'
RESULT_FOLDER = 'results'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

@app.route('/')
def home():
    return 'Flask backend is running!'

@app.route('/match-piece', methods=['POST'])
def match_piece():
    piece_index = int(request.form['piece_index'])
    file = request.files['file']

    # Save the uploaded image
    ref_path = os.path.join(UPLOAD_FOLDER, 'reference.jpg')
    file.save(ref_path)

    # --- CROP PIECE ---
    reference = cv2.imread(ref_path)
    h, w, _ = reference.shape
    mid_h, mid_w = h // 2, w // 2
    crop_coords = {
        1: (0, mid_h, 0, mid_w),      # top-left
        2: (0, mid_h, mid_w, w),      # top-right
        3: (mid_h, h, 0, mid_w),      # bottom-left
        4: (mid_h, h, mid_w, w),      # bottom-right
    }
    y1, y2, x1, x2 = crop_coords[piece_index]
    piece = reference[y1:y2, x1:x2]

    # --- MATCHING + HOMOGRAPHY ---
    ref_gray = cv2.cvtColor(reference, cv2.COLOR_BGR2GRAY)
    piece_gray = cv2.cvtColor(piece, cv2.COLOR_BGR2GRAY)

    sift = cv2.SIFT_create()
    kp1, des1 = sift.detectAndCompute(ref_gray, None)
    kp2, des2 = sift.detectAndCompute(piece_gray, None)

    bf = cv2.BFMatcher()
    matches = bf.knnMatch(des2, des1, k=2)
    good = [m for m, n in matches if m.distance < 0.75 * n.distance]

    if len(good) >= 4:
        src_pts = np.float32([kp2[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
        dst_pts = np.float32([kp1[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
        H, _ = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)

        warped = cv2.warpPerspective(piece, H, (w, h))

        # Overlaid blend
        warped_gray = cv2.cvtColor(warped, cv2.COLOR_BGR2GRAY)
        _, mask = cv2.threshold(warped_gray, 1, 255, cv2.THRESH_BINARY)
        mask_3ch = cv2.merge([mask, mask, mask])
        overlaid = cv2.add(cv2.bitwise_and(reference, cv2.bitwise_not(mask_3ch)),
                           cv2.bitwise_and(warped, mask_3ch))

        # Matches image
        match_img = cv2.drawMatches(piece, kp2, reference, kp1, good, None,
                                    flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)

        # Save results
        cv2.imwrite(f'{RESULT_FOLDER}/matched.jpg', match_img)
        cv2.imwrite(f'{RESULT_FOLDER}/overlaid.jpg', overlaid)

        return jsonify({
            'matched': '/results/matched.jpg',
            'overlaid': '/results/overlaid.jpg'
        })

    else:
        return jsonify({'error': 'Not enough good matches'}), 400
    
@app.route('/get-pieces', methods=['POST'])
def get_pieces():
    file = request.files['file']
    ref_path = os.path.join(UPLOAD_FOLDER, 'reference.jpg')
    file.save(ref_path)

    reference = cv2.imread(ref_path)
    h, w, _ = reference.shape
    mid_h, mid_w = h // 2, w // 2

    crop_coords = {
        1: (0, mid_h, 0, mid_w),      # top-left
        2: (0, mid_h, mid_w, w),      # top-right
        3: (mid_h, h, 0, mid_w),      # bottom-left
        4: (mid_h, h, mid_w, w),      # bottom-right
    }

    urls = {}

    for index, (y1, y2, x1, x2) in crop_coords.items():
        piece = reference[y1:y2, x1:x2]
        filename = f'piece_{index}.jpg'
        cv2.imwrite(os.path.join(RESULT_FOLDER, filename), piece)
        urls[index] = f'/results/{filename}'

    return jsonify(urls)

# To serve result images
@app.route('/results/<filename>')
def get_result(filename):
    return send_from_directory(RESULT_FOLDER, filename)

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    ref_path = os.path.join(UPLOAD_FOLDER, 'reference.jpg')
    file.save(ref_path)

    return jsonify({'message': 'Image uploaded successfully', 'path': ref_path}), 200

if __name__ == '__main__':
    app.run(debug=True)