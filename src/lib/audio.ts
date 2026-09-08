export class AudioEngine {
  private ctx: AudioContext | null = null;
  private backgroundOscillator: OscillatorNode | null = null;
  private backgroundGain: GainNode | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playDing(frequency: number = 880, type: OscillatorType = 'sine') {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 1);
  }

  playTopDing() {
    this.playDing(880, 'sine'); // High pitch, A5
  }

  playBottomDing() {
    this.playDing(440, 'sine'); // Low pitch, A4
  }

  startBackgroundLayer() {
    if (!this.ctx) return;
    if (this.backgroundOscillator) return;

    this.backgroundOscillator = this.ctx.createOscillator();
    this.backgroundGain = this.ctx.createGain();

    this.backgroundOscillator.type = 'triangle';
    this.backgroundOscillator.frequency.setValueAtTime(100, this.ctx.currentTime); // Low hum

    this.backgroundGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.backgroundGain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 2); // Fade in

    this.backgroundOscillator.connect(this.backgroundGain);
    this.backgroundGain.connect(this.ctx.destination);

    this.backgroundOscillator.start();
  }

  stopBackgroundLayer() {
    if (!this.backgroundGain || !this.backgroundOscillator || !this.ctx) return;
    
    this.backgroundGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1);
    
    setTimeout(() => {
      this.backgroundOscillator?.stop();
      this.backgroundOscillator?.disconnect();
      this.backgroundGain?.disconnect();
      this.backgroundOscillator = null;
      this.backgroundGain = null;
    }, 1000);
  }
}

export const audio = new AudioEngine();
