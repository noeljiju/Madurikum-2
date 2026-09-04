import http.server
import os
from pathlib import Path
import socketserver
import webbrowser
import threading
import time

PORT = 8000

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and caching headers
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def open_browser():
    time.sleep(1.0)
    url = f"http://localhost:{PORT}/index.html"
    print(f"\n[+] Opening game in your browser: {url}")
    webbrowser.open(url)


def create_server():
    global PORT

    for candidate_port in range(PORT, PORT + 20):
        try:
            server = ReusableTCPServer(("", candidate_port), Handler)
            PORT = candidate_port
            return server
        except OSError as error:
            if getattr(error, "winerror", None) not in (10013, 10048):
                raise

    raise OSError("No available port found between 8000 and 8019.")

if __name__ == "__main__":
    os.chdir(Path(__file__).resolve().parent)
    print(f"==================================================")
    print(f"  AADYAM KAIKKUM PINNE MADHURIKKUM - SERVER")
    print(f"  TinkerHub Useless Project Edition")
    print(f"==================================================")
    with create_server() as httpd:
        print(f"[*] Starting local server at http://localhost:{PORT}")
        print(f"[*] Press Ctrl+C in terminal to stop server.\n")
        threading.Thread(target=open_browser, daemon=True).start()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[!] Server stopped.")
