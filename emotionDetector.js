/**
 * EmotionDetector.js (Refined Edition)
 * ==============================================================================
 * Real-time Emotion Classifier & Sarcastic Malayalam Reverse Roaster
 * 
 * Supports:
 * - SMILE (Wide grin, mouth corners up)
 * - CRY   (Sad pout, mouth corners pulled down, inner brows raised)
 * - LAUGH (Wide mouth + wide open jaw)
 * - ANGRY (Furrowed tight scowl)
 * - FREEZE (Motionless statue mode)
 * 
 * Includes:
 * - `roaster`: Built-in Web Speech API announcer that roasts the player in
 *   the OPPOSITE sarcastic way in Malayalam!
 *   e.g. If you win with a smile -> "Ooo pinne velya oru chiri!"
 * ==============================================================================
 */

class EmotionDetector {
    constructor(options = {}) {
        this.options = Object.assign({
            confidenceThreshold: 0.50,
            voiceEnabled: true
        }, options);

        this.camera = null;
        this.faceMesh = null;
        this.lastNosePos = null;
        this.freezeAccumulator = 0;
        this.activeDialogueAudio = null;

        // Authentic Raw Malayalam Slang Roasts
        this.malayalamRoasts = {
            SMILE: {
                win: [
                    { ml: "ഓ പിന്നെ, വലിയൊരു ഇളി! പല്ല് മൊത്തം താഴെ വീഴുമല്ലോ മോനേ.", audio: "Ooo pinne, velya oru ili! Pallu motham thazhe veezhumallo monuse. Points eduthondu podey!" },
                    { ml: "എന്തൊരു അലവലാതി ഇളിയാടെ ഇത്! കണ്ടാൽ പേടിച്ചു പണ്ടാരമടങ്ങും.", audio: "Enthoru alavalathi iliyaade idhu! Kandal pedichu pandaram adangum." },
                    { ml: "ആഹാ, പല്ല് തേക്കാതെ ഇളിച്ചു കാട്ടുന്നു! അടുത്ത റൗണ്ട്.", audio: "Pallu thekkathe ilichu kaattunno? Adutha round-il poyi ilikk!" }
                ],
                fail: [
                    { ml: "ഇളിക്കാൻ പറഞ്ഞപ്പോൾ കരയുന്നോ? ഔട്ട്!", audio: "Ilikkan paranjappol karayunno? Scene contra! Out aayi mone!" },
                    { ml: "ഇതാണോ നിന്റെ ഇളി? അയ്യേ നാണം കേട്! ഗെയിം ഓവർ!", audio: "Ithano ninte ili? Ayye nanam kedu! Game over!" }
                ]
            },
            CRY: {
                win: [
                    { ml: "ആഹാ, ഏഷ്യാനെറ്റ് സീരിയൽ ലെവൽ കരച്ചിൽ! കണ്ണ് നിറഞ്ഞു പോയി, 10 പോയിന്റ്.", audio: "Aaha, Asianet serial level karachil! Kanneer ozhukkan vayya, oru Oscar tharatte?" },
                    { ml: "കരയാൻ പറഞ്ഞപ്പോൾ കിളി പോയ കോലം! എന്നാലും 10 പോയിന്റ് തന്നു.", audio: "Karayan paranjappol kili poya kolam! Ennalum 10 points tharaam." },
                    { ml: "കണ്ണീരില്ലാത്ത കരച്ചിൽ! ഓസ്കാർ അവാർഡ് ഉടൻ വരും.", audio: "Kanneerillatha karachil! Oscar award udan varum, points edutholu." }
                ],
                fail: [
                    { ml: "ഇതാണോ കരച്ചിൽ? പുല്ല്... ഒരു എക്സ്പ്രഷനും ഇല്ല! ഔട്ട്!", audio: "Ithano karachil? Pullu, oru expression polum mughathu varunnilla! Out!" },
                    { ml: "കണ്ണീരും വന്നില്ല ചിരിയും വന്നില്ല! പണി പാളി, ഗെയിം ഓവർ!", audio: "Pani paali makkale! Kanneerum vannilla chriyum vannilla. Game over!" }
                ]
            },
            LAUGH: {
                win: [
                    { ml: "വാ പൊളിച്ചത് കണ്ടാൽ കൊതുക് മൊത്തം അകത്തു കേറും! എജ്ജാതി അലറൽ.", audio: "Vaa polichathu kandal kothuku motham akathu kerum! Ejjaathi chiri thanne." },
                    { ml: "ചിരിച്ചു ചിരിച്ചു ചത്തു പോവല്ലേ മോനേ! അടുത്ത ഡിമാൻഡ് നോക്ക്.", audio: "Chirichu chirichu chathu povalle monuse! Next round-il kaanam." }
                ],
                fail: [
                    { ml: "വാ പൊളിക്കാൻ പറഞ്ഞപ്പോൾ ഉറങ്ങുകയായിരുന്നോ? ഔട്ട്!", audio: "Vaa polikkan paranjappol urangukayayirunno? Katta scene, out!" },
                    { ml: "ചിരിക്കാൻ പോലും വശമില്ലാത്തവൻ! ടൈം ഔട്ട്!", audio: "Chirikkan polum ariyillatha aal! Time out mone!" }
                ]
            },
            ANGRY: {
                win: [
                    { ml: "അയ്യോ ഞാൻ പേടിച്ചു വിറച്ചു പോയി! വലിയ ഗുണ്ടയാണെന്നാ വിചാരം.", audio: "Ayyoo njan pedichu verachu poyi! Velya gunda aanenna vicharam." },
                    { ml: "ദേഷ്യം കണ്ടാൽ തോന്നും കളക്ടർ ആവാൻ വന്നതാണെന്ന്! പോയിന്റ്സ് തന്നു.", audio: "Dheshyam kandal thonnum collector aavan varunnu ennu! Points thannu podey." }
                ],
                fail: [
                    { ml: "ഇത്രയും പാവമാണോ നീ? മുഖത്ത് ഒരു ദേഷ്യവും ഇല്ല! ഔട്ട്!", audio: "Ithrayum paavam aano nee? Mughathu oru dheshyam polum illa! Game over!" },
                    { ml: "കോപം അഭിനയിക്കാൻ പോലും അറിയില്ല! സീൻ കോൺട്രാ!", audio: "Kovam abhinayikkan polum ariyilla! Scene contra, out!" }
                ]
            }
        };
    }

    resetMotion() {
        this.freezeAccumulator = 0;
        this.lastNosePos = null;
    }

    dist(p1, p2) {
        return Math.hypot(p1.x - p2.x, p1.y - p2.y);
    }

    /**
     * Speaks opposite Malayalam slang commentary using Web Speech API
     * @param {string} emotion - 'SMILE' | 'CRY' | 'LAUGH' | 'ANGRY'
     * @param {boolean} isWin - true if user matched, false if user failed
     * @returns {Object} { ml: "മലയാളം ടെക്സ്റ്റ്", audio: "spoken slang" }
     */
    speakOppositeRoast(emotion, isWin) {
        const pack = this.malayalamRoasts[emotion] || this.malayalamRoasts.SMILE;
        const choices = isWin ? pack.win : pack.fail;
        const item = choices[Math.floor(Math.random() * choices.length)];

        const cueId = `${emotion.toLowerCase()}_${isWin ? 1 : 2}`;
        const cue = (window.dialogueCues || []).find(item => item.id === cueId);
        if (cue) {
            this.playDialogueCue(cue);
            return { ml: cue.fullText, audio: cue.audioSrc, cue };
        }

        return { ml: item.ml, audio: null };
    }

    speakTimeoutCue() {
        const cues = (window.dialogueCues || []).filter(item => item.emotion === 'TIMEOUT');
        const cue = cues[Math.floor(Math.random() * cues.length)];
        if (!cue) {
            return this.speakOppositeRoast('SMILE', false);
        }

        this.playDialogueCue(cue);
        return { ml: cue.fullText, audio: cue.audioSrc, cue };
    }

    playDialogueCue(cue) {
        if (!this.options.voiceEnabled) return;

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('dialoguecue', { detail: cue }));
        }

        if (this.activeDialogueAudio) {
            this.activeDialogueAudio.pause();
            this.activeDialogueAudio.currentTime = 0;
        }

        const audio = new Audio(cue.audioSrc);
        this.activeDialogueAudio = audio;
        audio.volume = 1;
        audio.addEventListener('error', () => {
            console.warn(`Dialogue audio unavailable: ${cue.audioSrc}`);
        }, { once: true });
        audio.play().catch(() => {
            console.warn(`Dialogue audio could not play: ${cue.audioSrc}`);
        });
    }

    /**
     * Evaluates face landmarks and returns classified emotion + scores
     */
    classify(landmarks) {
        if (!landmarks || landmarks.length === 0) {
            return { emotion: 'NO_FACE', confidence: 0, scores: {} };
        }

        // Face Height reference (Forehead 10 to Chin 152)
        const faceHeight = this.dist(landmarks[10], landmarks[152]) || 0.001;

        // 1. Mouth geometry
        const mouthWidth = this.dist(landmarks[61], landmarks[291]) / faceHeight;
        const mouthOpenGap = this.dist(landmarks[13], landmarks[14]) / faceHeight;
        const lipCenterY = (landmarks[13].y + landmarks[14].y) / 2;
        const cornersAverageY = (landmarks[61].y + landmarks[291].y) / 2;
        // Positive = corners up (smile), Negative = corners down (cry/frown)
        const cornerElevation = (lipCenterY - cornersAverageY) / faceHeight;

        // 2. Eyebrows
        const innerBrowsDist = this.dist(landmarks[55], landmarks[285]) / faceHeight;
        const browLiftL = this.dist(landmarks[105], landmarks[159]) / faceHeight;
        const browLiftR = this.dist(landmarks[334], landmarks[386]) / faceHeight;
        const avgBrowLift = (browLiftL + browLiftR) / 2;

        // Calculate emotion scores from normalized facial geometry.
        // SMILE: width, elevated corners, and a small open-mouth component.
        const smileWidthScore = Math.max(0, Math.min(1, (mouthWidth - 0.30) / 0.16));
        const smileElevationScore = Math.max(0, Math.min(1, (cornerElevation - 0.008) / 0.035));
        const smileOpenScore = Math.max(0, Math.min(1, (mouthOpenGap - 0.025) / 0.10));
        const smileScore = Math.min(1.0, Math.max(0, smileWidthScore * 0.55 + smileElevationScore * 0.35 + smileOpenScore * 0.10));

        // CRY: corners pulled DOWN (negative elevation) + slightly open lip or inner brow raised
        const cryScore = Math.min(1.0, Math.max(0, (-cornerElevation - 0.005) / 0.03 + (avgBrowLift > 0.14 ? 0.25 : 0)));

        // LAUGH / SHOCK: mouth aperture is the primary signal, with width as support.
        const apertureScore = Math.max(0, Math.min(1, (mouthOpenGap - 0.105) / 0.12));
        const apertureWidthSupport = Math.max(0, Math.min(1, (mouthWidth - 0.30) / 0.16));
        const laughScore = apertureScore * 0.80 + apertureWidthSupport * 0.20;

        // ANGRY: combine brow compression, brow lowering, and eye squint.
        const browCompressionScore = Math.max(0, Math.min(1, (0.18 - innerBrowsDist) / 0.08));
        const browLoweringScore = Math.max(0, Math.min(1, (0.16 - avgBrowLift) / 0.08));
        const eyeSquintScore = Math.max(0, Math.min(1, (0.075 - ((this.dist(landmarks[159], landmarks[145]) + this.dist(landmarks[386], landmarks[374])) / 2 / (this.dist(landmarks[33], landmarks[263]) || 0.25))) / 0.035));
        const angryScore = browCompressionScore * 0.55 + browLoweringScore * 0.25 + eyeSquintScore * 0.20;

        const scores = {
            SMILE: Math.round(smileScore * 100) / 100,
            CRY: Math.round(cryScore * 100) / 100,
            LAUGH: Math.round(laughScore * 100) / 100,
            ANGRY: Math.round(angryScore * 100) / 100
        };

        // Determine dominant active emotion
        let dominantEmotion = 'NEUTRAL';
        let highestScore = this.options.confidenceThreshold;

        for (const [emo, score] of Object.entries(scores)) {
            if (score > highestScore) {
                highestScore = score;
                dominantEmotion = emo;
            }
        }

        const blendshapes = {
            smileIntensity: Math.round(smileScore * 100),
            mouthAperture: Math.round(Math.min(1.0, mouthOpenGap / 0.225) * 100),
            mouthOpen: Math.round(Math.min(1.0, mouthOpenGap / 0.225) * 100),
            browRaise: Math.round(Math.min(1.0, avgBrowLift / 0.18) * 100),
            fierceIntensity: Math.round(angryScore * 100)
        };

        return {
            emotion: dominantEmotion,
            confidence: highestScore,
            scores: scores,
            blendshapes: blendshapes,
            landmarks: landmarks
        };
    }

    /**
     * Connects to video feed and starts continuous detection
     */
    async start(videoElement, onResultCallback) {
        return new Promise((resolve, reject) => {
            if (typeof FaceMesh === 'undefined') {
                reject(new Error("MediaPipe FaceMesh not loaded in window."));
                return;
            }

            this.faceMesh = new FaceMesh({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
            });

            this.faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.faceMesh.onResults((results) => {
                let classification = { emotion: 'NO_FACE', confidence: 0, scores: {} };
                if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                    classification = this.classify(results.multiFaceLandmarks[0]);
                }
                if (onResultCallback) onResultCallback(classification, results);
            });

            this.camera = new Camera(videoElement, {
                onFrame: async () => {
                    await this.faceMesh.send({ image: videoElement });
                },
                width: 640,
                height: 480
            });

            this.camera.start().then(() => resolve()).catch(reject);
        });
    }

    stop() {
        if (this.camera) this.camera.stop();
        if (this.faceMesh) this.faceMesh.close();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmotionDetector;
} else {
    window.EmotionDetector = EmotionDetector;
}
