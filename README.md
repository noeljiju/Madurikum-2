# Aadyam Kaikkum Pinne Madhurikkum (ആദ്യം കൈക്കും പിന്നെ മധുരിക്കും)
### *The Reverse Emotion "Simon Says" Game for TinkerHub Useless Projects*

---

## 🎮 What Is This?
An aggressively useless, real-time AI computer-vision game where the AI demands extreme, bizarre facial expressions from you through your webcam. 

- **The Reverse Twist:** When you succeed, it insults your face. When you fail, it ruthlessly eliminates you.
- **The Simon Trap:** If Simon demands it (`SIMON SAYS:`), you must perform within the countdown. If Simon **DID NOT** say it (`SUDDEN ORDER:`), any facial movement will instantly disqualify you!
- **Sarcastic Commentator:** Recorded Malayalam roast clips from the local `audio/` folder, synchronized with the displayed dialogue.

---

## 🚀 How to Run the Game

1. Open your terminal in this project folder and run:
   ```bash
   py run_game.py
   ```
   If your terminal is one directory above the project, use `py MADURAM\run_game.py` instead.
2. Your default web browser will automatically launch:
   ```
   http://localhost:8000/index.html
   ```
3. Click **"ENGAGE CAMERA"**, grant webcam permissions, and prepare to embarrass yourself!

*(Note: Running via `py run_game.py` is recommended because browsers require a local HTTP server like `localhost` to allow camera and local audio access.)*

---

## 🧠 How Emotion Detection & "Training" Works

Instead of training a heavy, brittle CNN from scratch, this game uses **Normalized Geometric Mesh Kinematics** via Google MediaPipe Face Mesh (468 3D facial landmarks):

| Emotion | Landmarks Used | Geometric Condition |
| :--- | :--- | :--- |
| **Wide Smile** | 61 (Left mouth corner), 291 (Right mouth corner), 10 & 152 (Face height) | Mouth width normalized by face height > 0.38 and corners pulled upward |
| **Absolute Shock** | 13 & 14 (Inner lips), 105 & 334 (Eyebrows), 159 & 386 (Eyes) | Jaw opening gap > 0.15 + eyebrow lift ratio > 0.45 |
| **Wink (Left/Right)** | Left eye (159, 145, 33, 133), Right eye (386, 374, 362, 263) | Eye Aspect Ratio (EAR) < 0.15 for one eye while other eye EAR > 0.22 |
| **Anger / KTU Scowl** | 55 & 285 (Inner brows) | Distance between inner eyebrow heads compresses below threshold |
| **Statue / Freeze** | Landmark 1 (Nose Tip) | Coordinate delta $\Delta (x, y) < 0.0035$ maintained for 1.8 seconds |

### Want to add your own custom face?
In [index.html](file:///c:/Users/user/Desktop/useless%20project/index.html), inspect the `evaluateFace(landmarks)` function. You can calculate distances between any of MediaPipe's 468 landmarks and set thresholds!

---

## 🏆 Pitching to TinkerHub Judges

- **The Hook:** *"Everyone builds AI to solve problems. We built AI to evaluate whether your face is capable of basic human dignity."*
- **The Tech Flex:** Real-time face mesh triangulation, aspect ratio calculation, Web Audio API game effects, and local recorded Malayalam roast clips—zero cloud latency, runs 100% locally.
- **The Comedy:** Let judges come up to the webcam and watch them get caught by the fake Simon Says prompt!
