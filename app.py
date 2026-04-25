import requests
from flask import Flask, jsonify, send_file

app = Flask(__name__)

@app.route("/")
def index():
    return send_file("index.html")

@app.route("/api/excuse")
def get_excuse():
    try:
        r = requests.get("https://excuser-three.vercel.app/v1/excuse/developer/", timeout=5)
        excuse = r.json()[0]["excuse"]
        return jsonify({"excuse": excuse})
    except Exception:
        return jsonify({"excuse": "It works on my machine."})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
