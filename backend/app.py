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

    ref_path = os.path.join(UPLOAD_FOLDER, 'reference.jpg')
    file.save(ref_path)
    reference = cv2.imread(ref_path)
    h, w, _ = reference.shape
    mid_h, mid_w = h // 2, w // 2

    crop_coords = {
        1: (0, mid_h, 0, mid_w),
        2: (0, mid_h, mid_w, w),
        3: (mid_h, h, 0, mid_w),
        4: (mid_h, h, mid_w, w),
    }
    y1, y2, x1, x2 = crop_coords[piece_index]
    piece = reference[y1:y2, x1:x2]

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

        warped_gray = cv2.cvtColor(warped, cv2.COLOR_BGR2GRAY)
        _, mask = cv2.threshold(warped_gray, 1, 255, cv2.THRESH_BINARY)
        mask_3ch = cv2.merge([mask, mask, mask])
        overlaid = cv2.add(cv2.bitwise_and(reference, cv2.bitwise_not(mask_3ch)),
                           cv2.bitwise_and(warped, mask_3ch))

        # Increase target size for output
        target_height = 700
        scale_ref = target_height / h

        reference_resized = cv2.resize(reference, (int(w * scale_ref), target_height))
        piece_scaled = cv2.resize(piece, (
            int(piece.shape[1] * scale_ref),
            int(piece.shape[0] * scale_ref)
        ))

        gap = 50
        canvas_h = target_height
        canvas_w = reference_resized.shape[1] + gap + piece_scaled.shape[1]
        match_img = np.ones((canvas_h, canvas_w, 3), dtype=np.uint8) * 255

        # Place reference image
        match_img[:target_height, :reference_resized.shape[1]] = reference_resized

        # Vertically center piece
        offset_y = (canvas_h - piece_scaled.shape[0]) // 2
        offset_x = reference_resized.shape[1] + gap
        match_img[offset_y:offset_y + piece_scaled.shape[0], offset_x:offset_x + piece_scaled.shape[1]] = piece_scaled

        # Draw keypoints and lines
        for m in good:
            pt1 = tuple(np.round(np.array(kp1[m.trainIdx].pt) * scale_ref).astype(int))
            pt2 = tuple(np.round(np.array(kp2[m.queryIdx].pt) * scale_ref +
                                 [offset_x, offset_y]).astype(int))
            color = tuple(np.random.randint(0, 255, 3).tolist())
            cv2.circle(match_img, pt1, 4, color, -1)
            cv2.circle(match_img, pt2, 4, color, -1)
            cv2.line(match_img, pt1, pt2, color, 1)

        # Draw matched region box
        if H is not None:
            h_piece, w_piece = piece.shape[:2]
            corners = np.float32([[0, 0], [w_piece, 0], [w_piece, h_piece], [0, h_piece]]).reshape(-1, 1, 2)
            projected = cv2.perspectiveTransform(corners, H) * scale_ref
            cv2.polylines(match_img, [np.int32(projected)], isClosed=True, color=(0, 0, 255), thickness=3)

        # Save and return
        cv2.imwrite(os.path.join(RESULT_FOLDER, 'matched.jpg'), match_img)
        cv2.imwrite(os.path.join(RESULT_FOLDER, 'overlaid.jpg'), overlaid)

        return jsonify({
            'matched': '/results/matched.jpg',
            'overlaid': '/results/overlaid.jpg'
        })

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