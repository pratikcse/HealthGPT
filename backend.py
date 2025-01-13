from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai
import os
import pathlib

app = Flask(__name__, static_folder="static")
CORS(app) 

GOOGLE_API_KEY = "AIzaSyC9VzwY8Z0nG4_7f3HnDdyVrfi0W3yL7t0"

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-1.5-pro-latest')

@app.route('/gemini-api', methods=['POST'])
def gemini_api():
    data = request.get_json()
    prompt = data.get('prompt')

    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400

    try:
        response = model.generate_content(prompt)
        return jsonify({'response': response.text})
    except Exception as e:
        return jsonify({'error': f'Error generating response: {str(e)}'}), 500

@app.route("/")
def index():
    return send_from_directory(pathlib.Path(__file__).parent.absolute(), "index.html")

@app.route("/backend.js")
def serve_backend_js():
    return send_from_directory(pathlib.Path(__file__).parent.absolute(), "backend.js")

@app.route("/static/<path:filename>")
def serve_static_files(filename):
    static_dir = os.path.join(pathlib.Path(__file__).parent.absolute(), "static")
    return send_from_directory(static_dir, filename)

if __name__ == '__main__':
    app.run(debug=True)
