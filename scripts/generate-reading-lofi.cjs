const fs = require('node:fs');
const path = require('node:path');

// An original, deterministic 24-second lo-fi reading loop at 80 BPM.
const rate = 32000;
const bpm = 80;
const beat = 60 / bpm;
const seconds = 32 * beat;
const samples = Math.round(rate * seconds);
const mix = new Float64Array(samples);
let seed = 120926;
const random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const hz = midi => 440 * 2 ** ((midi - 69) / 12);
const add = (start, length, sound) => {
  const first = Math.max(0, Math.floor(start * rate));
  const last = Math.min(samples, Math.ceil((start + length) * rate));
  for (let i = first; i < last; i++) mix[i] += sound((i / rate) - start);
};

// Four warm chords, two bars each: Dm9 / G13 / Cmaj9 / Am9.
const chords = [
  [50, 53, 57, 60, 64],
  [43, 53, 57, 59, 62],
  [48, 52, 55, 59, 62],
  [45, 48, 52, 55, 59],
];
chords.forEach((notes, chordIndex) => {
  const start = chordIndex * 8 * beat;
  notes.forEach((midi, voice) => {
    const f = hz(midi);
    add(start, 8 * beat, t => {
      const envelope = Math.min(1, t / 0.9, (8 * beat - t) / 1.1);
      const tremolo = 0.95 + 0.05 * Math.sin(2 * Math.PI * 0.28 * t + voice);
      return 0.022 * envelope * tremolo * (
        Math.sin(2 * Math.PI * f * t) +
        0.29 * Math.sin(2 * Math.PI * f * 1.005 * t) +
        0.08 * Math.sin(2 * Math.PI * f * 2 * t)
      );
    });
  });
});

const melody = [
  [0, 69], [1.5, 72], [3, 76], [5.5, 72],
  [8, 71], [9.5, 74], [11, 77], [13.5, 74],
  [16, 67], [17.5, 71], [19, 76], [21.5, 71],
  [24, 64], [25.5, 67], [27, 71], [29.5, 67],
];
for (const [beatIndex, midi] of melody) {
  const f = hz(midi);
  for (const [delay, level] of [[0, 1], [0.29, 0.19]]) {
    add(beatIndex * beat + delay, 2.1, t => {
      const envelope = Math.min(1, t / 0.012) * Math.exp(-2.35 * t);
      const tone = Math.sin(2 * Math.PI * f * t) +
        0.21 * Math.sin(2 * Math.PI * f * 2.003 * t) +
        0.07 * Math.sin(2 * Math.PI * f * 3.01 * t);
      return 0.105 * level * envelope * tone;
    });
  }
}

for (let bar = 0; bar < 8; bar++) {
  const root = hz(chords[Math.floor(bar / 2)][0] - 12);
  for (const offset of [0, 2]) {
    const start = (bar * 4 + offset) * beat;
    add(start, 0.85, t => 0.049 * Math.exp(-3.2 * t) * Math.sin(2 * Math.PI * root * t));
    add(start, 0.32, t => {
      const phase = 2 * Math.PI * (46 * t + 32 * (1 - Math.exp(-11 * t)) / 11);
      return 0.08 * Math.exp(-18 * t) * Math.sin(phase);
    });
  }
  for (const offset of [1, 3]) {
    const start = (bar * 4 + offset) * beat;
    let previous = 0;
    add(start, 0.15, t => {
      const noise = random();
      const high = noise - previous * 0.65;
      previous = noise;
      return 0.013 * Math.exp(-26 * t) * high;
    });
  }
}
for (let eighth = 0; eighth < 64; eighth++) {
  let previous = 0;
  add(eighth * beat / 2, 0.07, t => {
    const noise = random();
    const high = noise - previous * 0.8;
    previous = noise;
    return 0.004 * Math.exp(-65 * t) * high;
  });
}

const pcm = Buffer.alloc(samples * 2);
let peak = 0;
let energy = 0;
for (let i = 0; i < samples; i++) {
  const edge = Math.min(1, i / (rate * 0.16), (samples - 1 - i) / (rate * 0.28));
  const value = Math.tanh(mix[i] * Math.max(0, edge) * 1.35);
  peak = Math.max(peak, Math.abs(value));
  energy += value * value;
  pcm.writeInt16LE(Math.round(value * 32767), i * 2);
}
const wav = Buffer.alloc(44 + pcm.length);
wav.write('RIFF', 0);
wav.writeUInt32LE(wav.length - 8, 4);
wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(rate, 24);
wav.writeUInt32LE(rate * 2, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write('data', 36);
wav.writeUInt32LE(pcm.length, 40);
pcm.copy(wav, 44);
const output = path.join(__dirname, '..', 'assets', 'reading-lofi.wav');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, wav);
console.log(`${output}: ${seconds}s, peak ${peak.toFixed(3)}, RMS ${Math.sqrt(energy / samples).toFixed(3)}`);
