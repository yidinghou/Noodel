// Lightweight SoundManager to encapsulate all sound playback and mute state
export class SoundManager {
  constructor({ toggleButtonId = 'sound-toggle' } = {}) {
    this.isMuted = false;
    this.toggleBtn = typeof document !== 'undefined' ? document.getElementById(toggleButtonId) : null;

    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.toggleMute());
      this._updateButton();
    }

    // Preload important sounds
    this.sounds = {
      drop: new Audio('./src/sounds/tile-drop.mp3'),
      word1: new Audio('./src/sounds/word-made-1.mp3'),
      word2: new Audio('./src/sounds/word-made-2.mp3'),
      word3: new Audio('./src/sounds/word-made-3.mp3'),
      special: new Audio('./src/sounds/word-made-special.mp3')
    };
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this._updateButton();
  }

  _updateButton() {
    if (!this.toggleBtn) return;
    this.toggleBtn.textContent = this.isMuted ? 'Unmute' : 'Mute';
  }

  playDrop() {
    if (this.isMuted) return;
    this._play(this.sounds.drop);
  }

  playMadeWord(length) {
    if (this.isMuted) return;
    // Prefer special sound for longer words
    if (length >= 4 && Math.random() < 0.6) {
      return this._play(this.sounds.special);
    }
    const pool = [this.sounds.word1, this.sounds.word2, this.sounds.word3];
    return this._play(pool[Math.floor(Math.random() * pool.length)]);
  }

  _play(audio) {
    try {
      audio.currentTime = 0;
      audio.play().catch(() => {/* ignore autoplay block errors */});
    } catch (e) {
      // ignore playback errors
    }
  }
}
