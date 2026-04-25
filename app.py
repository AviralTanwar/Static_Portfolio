import requests
from bs4 import BeautifulSoup
from flask import Flask, jsonify, send_file

app = Flask(__name__)

@app.route("/")
def index():
    return send_file("index.html")

@app.route("/api/excuse")
def get_excuse():
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        r = requests.get("http://developerexcuses.com/", timeout=5, headers=headers)
        soup = BeautifulSoup(r.text, "html.parser")
        tag = soup.find("a")
        excuse = tag.get_text(strip=True) if tag else None
        if not excuse:
            raise ValueError("no excuse found")
        return jsonify({"excuse": excuse})
    except Exception:
        return jsonify({"excuse": "It works on my machine."})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
