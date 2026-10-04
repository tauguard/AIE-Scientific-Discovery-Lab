/**
 * Web Audio API Synesthetic Sound Engine
 * Converts AIE synesthetic parameters into real acoustic harmonics
 */

import { SynestheticAudioConfig } from '../types/aie';

class SynestheticSoundSystem {
  private ctx: AudioContext | null = null;
  private activeNodes: {
    oscillators: OscillatorNode[];
    gainNode: GainNode;
    filterNode: BiquadFilterNode;
  } | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play(config: SynestheticAudioConfig, durationSec: number = 3.5) {
    try {
      this.initContext();
      if (!this.ctx) return;

      this.stop(); // Stop any currently playing drone

      const now = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(0.2, now + 0.3);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(config.filterCutoff || 2500, now);
      filter.Q.setValueAtTime(4.0, now);

      let panner: StereoPannerNode | null = null;
      if (this.ctx.createStereoPanner) {
        panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(Math.max(-1, Math.min(1, config.spatialStereoPan || 0)), now);
      }

      const oscillators: OscillatorNode[] = [];

      // Fundamental frequency
      const osc1 = this.ctx.createOscillator();
      osc1.type = config.timbre || 'sine';
      osc1.frequency.setValueAtTime(config.rootFrequency || 320, now);
      osc1.connect(filter);
      osc1.start(now);
      osc1.stop(now + durationSec);
      oscillators.push(osc1);

      // Harmonics
      const harmonics = (config.chordHarmonics && config.chordHarmonics.length > 0)
        ? config.chordHarmonics
        : [config.rootFrequency * 1.5, config.rootFrequency * 2];

      harmonics.slice(0, 3).forEach((freq, idx) => {
        if (!this.ctx) return;
        const harmOsc = this.ctx.createOscillator();
        harmOsc.type = config.timbre === 'sawtooth' ? 'triangle' : 'sine';
        harmOsc.frequency.setValueAtTime(freq, now);
        
        const harmGain = this.ctx.createGain();
        harmGain.gain.setValueAtTime(0.12 / (idx + 1), now);

        harmOsc.connect(harmGain);
        harmGain.connect(filter);
        harmOsc.start(now);
        harmOsc.stop(now + durationSec);
        oscillators.push(harmOsc);
      });

      if (panner) {
        filter.connect(panner);
        panner.connect(masterGain);
      } else {
        filter.connect(masterGain);
      }

      masterGain.connect(this.ctx.destination);

      this.activeNodes = {
        oscillators,
        gainNode: masterGain,
        filterNode: filter,
      };

      setTimeout(() => {
        this.activeNodes = null;
      }, durationSec * 1000);
    } catch (err) {
      console.warn('Audio synthesis initialized with error or blocked by autoplay policy:', err);
    }
  }

  public stop() {
    if (this.activeNodes && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.activeNodes.gainNode.gain.cancelScheduledValues(now);
        this.activeNodes.gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.1);
        setTimeout(() => {
          this.activeNodes?.oscillators.forEach(osc => {
            try { osc.stop(); } catch {}
          });
          this.activeNodes = null;
        }, 120);
      } catch {}
    }
  }
}

export const synestheticAudio = new SynestheticSoundSystem();
