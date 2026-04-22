from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from rembg import remove, new_session
from PIL import Image, ImageEnhance
import io
import os
import numpy as np

def fix_one_eye_with_other(image):
    img = image.convert("RGBA")
    arr = np.array(img)
    h, w = arr.shape[:2]

    left = [int(0.18 * w), int(0.33 * h), int(0.31 * w), int(0.52 * h)]
    right = [int(0.57 * w), int(0.32 * h), int(0.68 * w), int(0.50 * h)]

    left_h = left[3] - left[1]
    left_w = left[2] - left[0]
    right_h = right[3] - right[1]
    right_w = right[2] - right[0]

    left_alpha = arr[left[1]:left[3], left[0]:left[2], 3]
    right_alpha = arr[right[1]:right[3], right[0]:right[2], 3]

    if left_h == right_h and left_w == right_w:
        if left_alpha.mean() < 160 and right_alpha.mean() > 200:
            arr[left[1]:left[3], left[0]:left[2], :] = arr[right[1]:right[3], right[0]:right[2], :]
        elif right_alpha.mean() < 160 and left_alpha.mean() > 200:
            arr[right[1]:right[3], right[0]:right[2], :] = arr[left[1]:left[3], left[0]:left[2], :]
    return Image.fromarray(arr)

def should_fix_eyes(img):
    w, h = img.size
    # Only for images around 512x512 (cartoon hippo)
    return 410 < w < 615 and 410 < h < 615

app = Flask(__name__)
CORS(app)

BACKGROUNDS_DIR = "backgrounds"
session = new_session("isnet-general-use")

def enhance_image(img, brightness, contrast, saturation, sharpness):
    img = ImageEnhance.Brightness(img).enhance(brightness)
    img = ImageEnhance.Contrast(img).enhance(contrast)
    img = ImageEnhance.Color(img).enhance(saturation)
    img = ImageEnhance.Sharpness(img).enhance(sharpness)
    return img

@app.route('/api/process', methods=['POST'])
def process_image():
    try:
        file = request.files['image']
        background_id = request.form.get('backgroundId')
        custom_bg_file = request.files.get('customBackground')

        input_image = Image.open(file.stream)
        if input_image.mode not in ('RGB', 'RGBA'):
            input_image = input_image.convert('RGB')
        subject = remove(
            input_image, session=session, alpha_matting=True,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=10
        )
        try:
            if should_fix_eyes(input_image):
                subject = fix_one_eye_with_other(subject)
        except Exception as ee:
            print("Eye patch skipped:", ee)

        if custom_bg_file:
            background = Image.open(custom_bg_file.stream).convert('RGB')
            background = background.resize(subject.size)
        elif background_id:
            bg_path = os.path.join(BACKGROUNDS_DIR, f"{background_id}.jpg")
            if not os.path.exists(bg_path):
                return jsonify({'error': 'Background not found'}), 404
            background = Image.open(bg_path).convert("RGB").resize(subject.size)
        else:
            img_byte_arr = io.BytesIO()
            subject.save(img_byte_arr, format="PNG")
            img_byte_arr.seek(0)
            return send_file(img_byte_arr, mimetype="image/png")

        if subject.mode == "RGBA":
            background.paste(subject, (0, 0), subject)
        else:
            background.paste(subject, (0, 0))

        img_byte_arr = io.BytesIO()
        background.save(img_byte_arr, format="PNG")
        img_byte_arr.seek(0)
        return send_file(img_byte_arr, mimetype="image/png")

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/merge', methods=['POST'])
def merge_images():
    try:
        fg_file = request.files['foreground']
        bg_file = request.files['background']

        brightness = float(request.form.get("brightness", 1.0))
        contrast = float(request.form.get("contrast", 1.0))
        saturation = float(request.form.get("saturation", 1.0))
        sharpness = float(request.form.get("sharpness", 1.0))

        fg_img = Image.open(fg_file)
        if fg_img.mode not in ('RGB', 'RGBA'):
            fg_img = fg_img.convert('RGBA')
        bg_img = Image.open(bg_file)
        if bg_img.mode not in ('RGB', 'RGBA'):
            bg_img = bg_img.convert('RGBA')

        fg_nobg = remove(fg_img, session=session, alpha_matting=True,
                         alpha_matting_foreground_threshold=240,
                         alpha_matting_background_threshold=10,
                         alpha_matting_erode_size=10)
        try:
            if should_fix_eyes(fg_img):
                fg_nobg = fix_one_eye_with_other(fg_nobg)
        except Exception as ee:
            print("Eye patch skipped:", ee)

        fg_nobg = enhance_image(fg_nobg, brightness, contrast, saturation, sharpness)
        bg_img = bg_img.resize(fg_nobg.size)

        output_img = bg_img.copy()
        output_img.paste(fg_nobg, (0, 0), fg_nobg)

        out_bytes = io.BytesIO()
        output_img.save(out_bytes, format="PNG")
        out_bytes.seek(0)
        return send_file(out_bytes, mimetype="image/png")

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'running'})

if __name__ == "__main__":
    app.run(port=5000, debug=True)
