import ssl
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.ssl_ import create_urllib3_context
from bs4 import BeautifulSoup
from flask import Flask, jsonify, send_file

app = Flask(__name__)

_CIPHERS = ':'.join([
    'TLS_AES_128_GCM_SHA256',
    'TLS_AES_256_GCM_SHA384',
    'ECDHE-ECDSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES128-GCM-SHA256',
])

class LegacySSLAdapter(HTTPAdapter):
    def init_poolmanager(self, *args, **kwargs):
        ctx = create_urllib3_context(ciphers=_CIPHERS)
        ctx.minimum_version = ssl.TLSVersion.TLSv1_2
        ctx.options |= getattr(ssl, 'OP_LEGACY_SERVER_CONNECT', 0)
        kwargs['ssl_context'] = ctx
        super().init_poolmanager(*args, **kwargs)

_session = requests.Session()
_session.mount('https://', LegacySSLAdapter())

@app.route("/")
def index():
    return send_file("index.html")

@app.route("/api/excuse")
def get_excuse():
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        r = _session.get("https://developerexcuses.com/", timeout=5, headers=headers)
        soup = BeautifulSoup(r.text, "html.parser")
        excuse = soup.find("a").get_text(strip=True)
        return jsonify({"excuse": excuse})
    except Exception:
        return jsonify({"excuse": "It works on my machine."})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
