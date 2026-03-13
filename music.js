// ============================
//  music.js - מוסיקת רקע רטרו
// ============================

const Music = (() => {
    let ctx = null;
    let masterGain = null;
    let currentTrack = null;
    let currentName = '';
    let volume = 0.3;
    let muted = false;
    let timers = [];

    function init() {
        if (ctx) return;
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = ctx.createGain();
        masterGain.gain.value = volume;
        masterGain.connect(ctx.destination);
    }

    function setVolume(v) {
        volume = v;
        if (masterGain && !muted) masterGain.gain.value = volume;
    }

    function toggleMute() {
        muted = !muted;
        if (masterGain) masterGain.gain.value = muted ? 0 : volume;
        return muted;
    }

    function isMuted() { return muted; }
    function getVolume() { return volume; }

    function stop() {
        timers.forEach(t => clearTimeout(t));
        timers = [];
        if (currentTrack) {
            currentTrack.forEach(o => { try { o.stop(); } catch(e) {} });
            currentTrack = null;
        }
        currentName = '';
    }

    // Play a note using a simple square/triangle wave
    function playNote(freq, start, dur, type = 'square', vol = 0.15) {
        if (!ctx) return null;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur + 0.05);
        return osc;
    }

    // Note frequencies (octave 4 & 5)
    const N = {
        C4: 262, D4: 294, E4: 330, F4: 349, G4: 392, A4: 440, B4: 494,
        C5: 523, D5: 587, E5: 659, F5: 698, G5: 784, A5: 880,
        C3: 131, E3: 165, G3: 196, A3: 220, B3: 247, D3: 147, F3: 175,
    };

    // Each track is a function that plays notes and schedules a loop
    const tracks = {

        // --- מסך כותרת: מנגינה עליזה ---
        title() {
            const oscs = [];
            const bpm = 140;
            const s = 60 / bpm; // beat duration
            const melody = [
                [N.E4,1],[N.G4,1],[N.A4,1],[N.B4,1],
                [N.A4,1],[N.G4,1],[N.E4,2],
                [N.D4,1],[N.E4,1],[N.G4,1],[N.A4,1],
                [N.G4,2],[N.E4,2],
            ];
            const bass = [
                [N.C3,2],[N.G3,2],[N.A3,2],[N.E3,2],
                [N.C3,2],[N.G3,2],[N.C3,4],
            ];
            let t = 0;
            melody.forEach(([f,d]) => {
                oscs.push(playNote(f, t * s, d * s * 0.9, 'square', 0.12));
                t += d;
            });
            let tb = 0;
            bass.forEach(([f,d]) => {
                oscs.push(playNote(f, tb * s, d * s * 0.85, 'triangle', 0.1));
                tb += d;
            });
            const loopTime = t * s * 1000;
            const timer = setTimeout(() => { if (currentName === 'title') tracks.title(); }, loopTime);
            timers.push(timer);
            return oscs.filter(Boolean);
        },

        // --- מסך הליכה: צעידה קצבית ---
        walk() {
            const oscs = [];
            const bpm = 120;
            const s = 60 / bpm;
            const melody = [
                [N.C4,1],[N.E4,1],[N.G4,1],[N.C5,1],
                [N.B4,1],[N.G4,1],[N.E4,1],[N.D4,1],
                [N.C4,1],[N.D4,1],[N.E4,1],[N.G4,1],
                [N.A4,2],[N.G4,2],
            ];
            const bass = [
                [N.C3,2],[N.E3,2],[N.G3,2],[N.C3,2],
                [N.A3,2],[N.G3,2],[N.C3,4],
            ];
            let t = 0;
            melody.forEach(([f,d]) => {
                oscs.push(playNote(f, t * s, d * s * 0.85, 'square', 0.1));
                t += d;
            });
            let tb = 0;
            bass.forEach(([f,d]) => {
                oscs.push(playNote(f, tb * s, d * s * 0.8, 'triangle', 0.08));
                tb += d;
            });
            const loopTime = t * s * 1000;
            const timer = setTimeout(() => { if (currentName === 'walk') tracks.walk(); }, loopTime);
            timers.push(timer);
            return oscs.filter(Boolean);
        },

        // --- מסך עסקה: רגוע וחושבני ---
        trade() {
            const oscs = [];
            const bpm = 90;
            const s = 60 / bpm;
            const melody = [
                [N.E4,2],[N.G4,2],[N.A4,2],[N.G4,2],
                [N.E4,2],[N.D4,2],[N.C4,4],
                [N.D4,2],[N.E4,2],[N.G4,4],
                [N.A4,2],[N.G4,2],[N.E4,4],
            ];
            const bass = [
                [N.C3,4],[N.A3,4],[N.F3,4],[N.C3,4],
                [N.G3,4],[N.E3,4],[N.C3,8],
            ];
            let t = 0;
            melody.forEach(([f,d]) => {
                oscs.push(playNote(f, t * s, d * s * 0.9, 'triangle', 0.1));
                t += d;
            });
            let tb = 0;
            bass.forEach(([f,d]) => {
                oscs.push(playNote(f, tb * s, d * s * 0.85, 'triangle', 0.06));
                tb += d;
            });
            const loopTime = t * s * 1000;
            const timer = setTimeout(() => { if (currentName === 'trade') tracks.trade(); }, loopTime);
            timers.push(timer);
            return oscs.filter(Boolean);
        },

        // --- מסך ניצחון: פנפרה ---
        win() {
            const oscs = [];
            const bpm = 160;
            const s = 60 / bpm;
            const melody = [
                [N.C5,1],[N.E5,1],[N.G5,2],
                [N.E5,1],[N.G5,1],[N.A5,2],
                [N.G5,1],[N.A5,1],[N.G5,1],[N.E5,1],
                [N.C5,4],
            ];
            let t = 0;
            melody.forEach(([f,d]) => {
                oscs.push(playNote(f, t * s, d * s * 0.9, 'square', 0.12));
                t += d;
            });
            const loopTime = (t + 4) * s * 1000; // pause before repeat
            const timer = setTimeout(() => { if (currentName === 'win') tracks.win(); }, loopTime);
            timers.push(timer);
            return oscs.filter(Boolean);
        },

        // --- מסך הפסד: עצוב ---
        gameover() {
            const oscs = [];
            const bpm = 70;
            const s = 60 / bpm;
            const melody = [
                [N.E4,2],[N.D4,2],[N.C4,4],
                [N.D4,2],[N.C4,2],[N.B3,4],
                [N.C4,8],
            ];
            let t = 0;
            melody.forEach(([f,d]) => {
                oscs.push(playNote(f, t * s, d * s * 0.9, 'triangle', 0.1));
                t += d;
            });
            const loopTime = (t + 6) * s * 1000;
            const timer = setTimeout(() => { if (currentName === 'gameover') tracks.gameover(); }, loopTime);
            timers.push(timer);
            return oscs.filter(Boolean);
        },
    };

    function play(name) {
        if (name === currentName) return;
        init();
        stop();
        currentName = name;
        if (tracks[name]) {
            currentTrack = tracks[name]();
        }
    }

    return { play, stop, setVolume, toggleMute, isMuted, getVolume, init };
})();

window.Music = Music;
