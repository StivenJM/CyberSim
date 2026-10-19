"""A single preloaded Piper worker, supervised independently of HTTP cancellation."""
import hashlib
import io
import json
import multiprocessing as mp
import os
from pathlib import Path
import threading
import time
import urllib.request
import wave
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

REVISION = "c10ece1aade47bb51c153c893d14e5bf8e5b7117"
VOICE = "es_ES-davefx-medium"
FILES = {
    VOICE + ".onnx": (63201294, "dc515cd4ecc5f6f72fe14a941188fc9c"),
    VOICE + ".onnx.json": (4817, "dd157b5eaf6930bf949cf416d9a9307a"),
    "MODEL_CARD": (276, "980f3ebe5987b10488da3a7f4a462970"),
}
ROOT = Path(os.environ.get("PIPER_VOICE_DIR", "/voices"))
CTX = mp.get_context("spawn")


def digest(filename):
    md5 = hashlib.md5(usedforsecurity=False)
    with filename.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            md5.update(chunk)
    return md5.hexdigest()


def prepare():
    ROOT.mkdir(parents=True, exist_ok=True)
    for name, (size, checksum) in FILES.items():
        target = ROOT / name
        if target.exists() and target.stat().st_size == size and digest(target) == checksum:
            continue
        url = f"https://huggingface.co/rhasspy/piper-voices/resolve/{REVISION}/es/es_ES/davefx/medium/{name}"
        partial = target.with_suffix(target.suffix + ".partial")
        with urllib.request.urlopen(url, timeout=300) as source, partial.open("wb") as out:
            while chunk := source.read(1024 * 1024):
                out.write(chunk)
        if partial.stat().st_size != size or digest(partial) != checksum:
            partial.unlink(missing_ok=True)
            raise RuntimeError("Piper voice integrity check failed")
        partial.replace(target)


def worker(pipe):
    from piper import PiperVoice
    voice = PiperVoice.load(str(ROOT / (VOICE + ".onnx")))
    pipe.send(("ready", None))
    while True:
        text = pipe.recv()
        if text is None:
            return
        try:
            output = io.BytesIO()
            with wave.open(output, "wb") as wav:
                voice.synthesize_wav(text, wav)
            pipe.send(("wav", output.getvalue()))
        except Exception:
            pipe.send(("error", None))


class Supervisor:
    def __init__(self):
        self.lock = threading.Lock()
        self.process = None
        self.pipe = None
        self.ready = False

    def start(self):
        self.ready = False
        self.pipe, child = CTX.Pipe()
        self.process = CTX.Process(target=worker, args=(child,), daemon=True)
        self.process.start()
        if self.pipe.poll(120):
            self.ready = self.pipe.recv()[0] == "ready"
        if not self.ready:
            self.stop()

    def stop(self):
        self.ready = False
        if self.process is not None:
            self.process.terminate()
            self.process.join(0.5)
            if self.process.is_alive():
                self.process.kill()
                self.process.join(0.5)
            if self.process.is_alive():
                raise RuntimeError("Piper worker termination not confirmed")
        if self.pipe:
            self.pipe.close()

    def synthesize(self, text, budget_ms):
        if not self.lock.acquire(blocking=False):
            raise BlockingIOError()
        try:
            if not self.ready:
                raise RuntimeError("Piper loading")
            self.pipe.send(text)
            # Reserve one second of the budget for TERM/KILL and HTTP delivery.
            if not self.pipe.poll(max(0, budget_ms / 1000 - 1)):
                self.stop()
                threading.Thread(target=self.start, daemon=True).start()
                raise TimeoutError()
            status, result = self.pipe.recv()
            if status != "wav" or len(result) > 10 * 1024 * 1024:
                raise RuntimeError("Piper synthesis failed")
            return result
        finally:
            self.lock.release()


SUPERVISOR = Supervisor()


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass  # Never log text, headers or request bodies.

    def do_GET(self):
        if self.path != "/health":
            self.send_error(404)
            return
        self.send_response(200 if SUPERVISOR.ready else 503)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"ready": SUPERVISOR.ready, "voice": VOICE}).encode())

    def do_POST(self):
        if self.path != "/synthesize":
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 < length <= 32768:
                self.send_error(413)
                return
            payload = json.loads(self.rfile.read(length))
            text = payload.get("text")
            budget = min(15000, float(payload.get("budgetMs", 15000)))
            if not isinstance(text, str) or not text.strip() or len(text) > 4000 or budget <= 1000:
                self.send_error(422)
                return
            if payload.get("voice", VOICE) != VOICE:
                self.send_error(422)
                return
            started = time.monotonic()
            audio = SUPERVISOR.synthesize(text, budget)
            if (time.monotonic() - started) * 1000 >= budget:
                raise TimeoutError()
            self.send_response(200)
            self.send_header("Content-Type", "audio/wav")
            self.send_header("Content-Length", str(len(audio)))
            self.end_headers()
            self.wfile.write(audio)
        except BlockingIOError:
            self.send_error(429)
        except TimeoutError:
            self.send_error(504)
        except (BrokenPipeError, ConnectionResetError):
            pass  # The worker has already finished or was terminated by its own deadline.
        except Exception:
            self.send_error(503)


if __name__ == "__main__":
    prepare()
    threading.Thread(target=SUPERVISOR.start, daemon=True).start()
    ThreadingHTTPServer(("0.0.0.0", 5000), Handler).serve_forever()

