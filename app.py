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
        r = requests.get("http://developerexcuses.com/", timeout=5)
        soup = BeautifulSoup(r.text, "html.parser")
        excuse = soup.find("a").get_text(strip=True)
        return jsonify({"excuse": excuse})
    except Exception:
        return jsonify({"excuse": "It works on my machine."})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
