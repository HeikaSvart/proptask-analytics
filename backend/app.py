import os
import json
import base64
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


def create_app():
    load_dotenv()

    app = Flask(__name__)
    CORS(app)  # Allow all origins for local dev; restrict for production.

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set. Create a .env with GEMINI_API_KEY.")

    genai.configure(api_key=api_key)
    model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    # Add models/ prefix if not present (required for newer models like Gemini 3)
    if not model_name.startswith("models/"):
        full_model_name = f"models/{model_name}"
    else:
        full_model_name = model_name
    logger.info(f"Using Gemini model: {full_model_name}")
    model = genai.GenerativeModel(full_model_name)

    @app.post("/api/analyze-image")
    def analyze_image():
        # Accept either multipart file upload or base64 string in JSON
        image_bytes = None
        mime = "image/jpeg"

        if request.files and "file" in request.files:
            f = request.files["file"]
            image_bytes = f.read()
            mime = f.mimetype or mime
        elif request.is_json:
            data = request.get_json(silent=True) or {}
            b64 = data.get("base64")
            if b64:
                try:
                    clean = b64.split(",", 1)[-1]
                    image_bytes = base64.b64decode(clean)
                    mime = data.get("mimeType", mime)
                except Exception:
                    return jsonify({"error": "Invalid base64"}), 400

        if not image_bytes:
            return jsonify({"error": "No image provided. Upload as multipart 'file' or JSON {base64}"}), 400

        try:
            result = model.generate_content(
                [
                    {"mime_type": mime, "data": image_bytes},
                    "Du er en ekspert vaktmester-assistent. Analyser bildet, foreslå tittel, beskrivelse og prioritet (LOW, MEDIUM, HIGH, CRITICAL). Returner KUN JSON på norsk uten forklaring.",
                ],
                generation_config={
                    "response_mime_type": "application/json",
                },
            )
            text = result.text or ""
            if not text:
                return jsonify({"error": "Empty response from model"}), 502
            data = json.loads(text)
            return jsonify(data)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", "5001"))
    app.run(host="0.0.0.0", port=port, debug=True)
