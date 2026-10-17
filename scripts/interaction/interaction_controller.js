
export class AudioManager {
  constructor() {
    this.sounds = new Map();
    this.enabled = true;
    this.volume = 0.6;
  }

  addSound(name, path, options = {}) {
    const audio = new Audio(path);

    audio.loop = options.loop ?? false;
    audio.volume = Math.max(
      0,
      Math.min(1, options.volume ?? this.volume)
    );

    this.sounds.set(name, audio);
  }

  play(name) {
    if (!this.enabled) return;

    const audio = this.sounds.get(name);
    if (!audio) return;

    audio.currentTime = 0;

    audio.play().catch((error) => {
      console.warn("Suara tidak dapat diputar:", error);
    });
  }

  stop(name) {
    const audio = this.sounds.get(name);
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
  }

  setEnabled(value) {
    this.enabled = value;

    if (!value) {
      this.sounds.forEach((audio) => {
        audio.pause();
      });
    }
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));

    this.sounds.forEach((audio) => {
      audio.volume = this.volume;
    });
  }
}
