#!/usr/bin/env python3

# 1984  pip install pyaudio
# 2008  pip install websocket-client


import json
import pyaudio
from vosk import Model, KaldiRecognizer
import websocket
import threading
import pdb

# ────────────────────────────────────────────────
# CONFIG
# ────────────────────────────────────────────────
MODEL_PATH = "models/vosk-model-en-us-0.22"               # ← change to your unzipped model folder
MODEL_PATH = "models/vosk-model-small-en-us-0.15"               # ← change to your unzipped model folder
SAMPLE_RATE = 16000                # Most models use 16kHz
CHUNK_SIZE = 8000                  # Buffer size — 0.5s of audio at 16kHz

# ────────────────────────────────────────────────
print("Loading Vosk model...")
model = Model(MODEL_PATH)
print("Model loaded.")

recognizer = KaldiRecognizer(model, SAMPLE_RATE)
recognizer.SetWords(True)          # Optional: gives word-level timing

# Initialize PyAudio
p = pyaudio.PyAudio()

stream = p.open(format=pyaudio.paInt16,
                channels=1,
                rate=SAMPLE_RATE,
                input=True,
                frames_per_buffer=CHUNK_SIZE)

print("\nSpeak now! (Ctrl+C to stop)\n")

# At the top (after imports)
WS_URL = "ws://localhost:8765"

# Global websocket (connect once)
ws = None

def on_open(ws):
    print("Connected to Node.js WebSocket server")

def on_error(ws, error):
    print("WebSocket error:", error)

def on_close(ws, close_status_code, close_msg):
    print("WebSocket closed")

def send_to_node(text):
    global ws
    if ws: # and ws.connected:
        ws.send(text)
    else:
        print("WebSocket not connected yet")

# In your main script, before the loop:
ws = websocket.WebSocketApp(WS_URL,
                            on_open=on_open,
                            on_error=on_error,
                            on_close=on_close)
threading.Thread(target=ws.run_forever, daemon=True).start()

# Then, inside your loop where you have final text:
'''
text = 'hi greg'
if text:
    print(f"→ {text}")
    send_to_node(text)
'''

if True:
  try:
      while True:
          data = stream.read(CHUNK_SIZE, exception_on_overflow=False)

          if recognizer.AcceptWaveform(data):
              # Final result (utterance ended — usually after ~1–2s silence)
              result = json.loads(recognizer.Result())
              text = result.get("text", "").strip()
              if text:
                  print(f"→ {text}")
                  send_to_node(text)
          else:
              # Partial result (live, as you speak)
              partial = json.loads(recognizer.PartialResult())
              partial_text = partial.get("partial", "").strip()
              if partial_text:
                  print(f"  {partial_text}", end="\r")   # Overwrite line for live feel

  except KeyboardInterrupt:
      print("\nStopped by user.")

  finally:
      stream.stop_stream()
      stream.close()
      p.terminate()
      print("Microphone closed.")
