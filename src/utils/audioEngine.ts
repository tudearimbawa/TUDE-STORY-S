/**
 * Comprehensive Audio & Ambient Soundscape Engine
 * Supports:
 * 1. Web Audio Procedural synthesis (Rain, Fireplace, Vinyl crackle, Night crickets, Cafe murmur)
 * 2. Infinite Procedural Lo-Fi Electric Piano Chords (calm, warm, never buffering)
 * 3. HTML5 Audio stream player for curated / custom audio files
 * 4. Realistic Mechanical Typewriter Sound ASMR
 */

export type AmbientSoundId = 'rain' | 'fireplace' | 'vinyl' | 'night' | 'cafe';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGainNode: GainNode | null = null;
  
  // Ambient Sound Nodes
  private ambientGains: Map<AmbientSoundId, GainNode> = new Map();
  private ambientSources: Map<AmbientSoundId, { stop: () => void }> = new Map();
  private ambientVolumes: Record<AmbientSoundId, number> = {
    rain: 0,
    fireplace: 0,
    vinyl: 0,
    night: 0,
    cafe: 0,
  };

  // Music Stream / Procedural
  private audioElement: HTMLAudioElement | null = null;
  private proceduralInterval: any = null;
  private isProceduralPlaying: boolean = false;
  private currentTrackPlaying: boolean = false;
  private musicVolume: number = 0.7;

  // Sleep Timer
  private sleepTimerId: any = null;
  private sleepTimerRemainingSec: number = 0;
  private onSleepTimerTick?: (remainingSec: number) => void;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGainNode = this.ctx.createGain();
      this.masterGainNode.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
      this.masterGainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public resume() {
    this.initContext();
  }

  // ----------------------------------------------------
  // Master Controls
  // ----------------------------------------------------
  public setMasterMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGainNode && this.ctx) {
      this.masterGainNode.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
    if (this.audioElement) {
      this.audioElement.muted = muted;
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // ----------------------------------------------------
  // Typewriter Keystroke Sound (ASMR)
  // ----------------------------------------------------
  public playTypewriterKeystroke() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const t = ctx.currentTime;
      
      // Keystroke transient click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Pitch variation for natural typing feel
      const baseFreq = 300 + Math.random() * 250;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.05);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, t);

      gain.gain.setValueAtTime(0.09 + Math.random() * 0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGainNode!);

      osc.start(t);
      osc.stop(t + 0.06);

      // Add soft typewriter mechanical tap noise
      const bufferSize = ctx.sampleRate * 0.02;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.05, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
      noiseNode.connect(noiseGain);
      noiseGain.connect(this.masterGainNode!);
      noiseNode.start(t);
    } catch {
      // Ignored if user hasn't interacted yet
    }
  }

  // ----------------------------------------------------
  // Ambient Sound Synthesizers (100% Procedural & Reliable)
  // ----------------------------------------------------
  public setAmbientVolume(id: AmbientSoundId, volume: number) {
    this.ambientVolumes[id] = Math.max(0, Math.min(1, volume));
    if (volume > 0) {
      this.ensureAmbientPlaying(id);
    } else {
      this.stopAmbient(id);
    }
  }

  public getAmbientVolume(id: AmbientSoundId): number {
    return this.ambientVolumes[id] || 0;
  }

  private ensureAmbientPlaying(id: AmbientSoundId) {
    const ctx = this.initContext();
    let gainNode = this.ambientGains.get(id);

    if (!gainNode) {
      gainNode = ctx.createGain();
      gainNode.connect(this.masterGainNode!);
      this.ambientGains.set(id, gainNode);
    }

    gainNode.gain.setValueAtTime(this.ambientVolumes[id], ctx.currentTime);

    if (this.ambientSources.has(id)) {
      return; // Already playing
    }

    // Launch synthesizer depending on id
    switch (id) {
      case 'rain':
        this.startRainSynth(ctx, gainNode, id);
        break;
      case 'fireplace':
        this.startFireplaceSynth(ctx, gainNode, id);
        break;
      case 'vinyl':
        this.startVinylSynth(ctx, gainNode, id);
        break;
      case 'night':
        this.startNightSynth(ctx, gainNode, id);
        break;
      case 'cafe':
        this.startCafeSynth(ctx, gainNode, id);
        break;
    }
  }

  private stopAmbient(id: AmbientSoundId) {
    const source = this.ambientSources.get(id);
    if (source) {
      source.stop();
      this.ambientSources.delete(id);
    }
    const gain = this.ambientGains.get(id);
    if (gain && this.ctx) {
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  // 1. RAIN SYNTHESIZER (Pink Noise + Lowpass Filters + Droplet Burst)
  private startRainSynth(ctx: AudioContext, output: GainNode, id: AmbientSoundId) {
    const bufferSize = ctx.sampleRate * 3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const outputData = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      outputData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.12;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1100, ctx.currentTime);

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(250, ctx.currentTime);

    whiteNoise.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(output);
    whiteNoise.start();

    // Subtle random rain droplet timer
    const dropTimer = setInterval(() => {
      if (!this.ambientSources.has(id)) return;
      if (Math.random() > 0.4) {
        const dropOsc = ctx.createOscillator();
        const dropGain = ctx.createGain();
        dropOsc.type = 'sine';
        const startFreq = 1800 + Math.random() * 1200;
        dropOsc.frequency.setValueAtTime(startFreq, ctx.currentTime);
        dropOsc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);
        dropGain.gain.setValueAtTime(0.015 * this.ambientVolumes.rain, ctx.currentTime);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
        dropOsc.connect(dropGain);
        dropGain.connect(output);
        dropOsc.start();
        dropOsc.stop(ctx.currentTime + 0.045);
      }
    }, 180);

    this.ambientSources.set(id, {
      stop: () => {
        clearInterval(dropTimer);
        whiteNoise.stop();
        whiteNoise.disconnect();
      },
    });
  }

  // 2. FIREPLACE SYNTHESIZER (Deep warm rumble + sharp crackle pops)
  private startFireplaceSynth(ctx: AudioContext, output: GainNode, id: AmbientSoundId) {
    // Warm low rumble
    const rumbleSize = ctx.sampleRate * 2;
    const rumbleBuffer = ctx.createBuffer(1, rumbleSize, ctx.sampleRate);
    const d = rumbleBuffer.getChannelData(0);
    for (let i = 0; i < rumbleSize; i++) {
      d[i] = (Math.random() * 2 - 1) * 0.2;
    }
    const rumbleSource = ctx.createBufferSource();
    rumbleSource.buffer = rumbleBuffer;
    rumbleSource.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(160, ctx.currentTime);

    const rumbleGain = ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.8, ctx.currentTime);

    rumbleSource.connect(lowpass);
    lowpass.connect(rumbleGain);
    rumbleGain.connect(output);
    rumbleSource.start();

    // Crackle burst generator
    const crackleInterval = setInterval(() => {
      if (!this.ambientSources.has(id)) return;
      const count = Math.random() > 0.6 ? 2 : 1;
      for (let j = 0; j < count; j++) {
        setTimeout(() => {
          if (!this.ambientSources.has(id)) return;
          const crackleBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.03, ctx.sampleRate);
          const cd = crackleBuffer.getChannelData(0);
          for (let i = 0; i < cd.length; i++) {
            cd[i] = (Math.random() * 2 - 1) * Math.exp(-i / (cd.length * 0.15));
          }
          const cSource = ctx.createBufferSource();
          cSource.buffer = crackleBuffer;
          const cFilter = ctx.createBiquadFilter();
          cFilter.type = 'highpass';
          cFilter.frequency.setValueAtTime(1800 + Math.random() * 2000, ctx.currentTime);
          const cGain = ctx.createGain();
          cGain.gain.setValueAtTime((0.15 + Math.random() * 0.2) * this.ambientVolumes.fireplace, ctx.currentTime);
          cSource.connect(cFilter);
          cFilter.connect(cGain);
          cGain.connect(output);
          cSource.start();
        }, j * 60 + Math.random() * 40);
      }
    }, 280);

    this.ambientSources.set(id, {
      stop: () => {
        clearInterval(crackleInterval);
        rumbleSource.stop();
        rumbleSource.disconnect();
      },
    });
  }

  // 3. VINYL CRACKLE SYNTHESIZER
  private startVinylSynth(ctx: AudioContext, output: GainNode, id: AmbientSoundId) {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.05;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, ctx.currentTime);
    filter.Q.setValueAtTime(0.7, ctx.currentTime);

    const hissGain = ctx.createGain();
    hissGain.gain.setValueAtTime(0.25, ctx.currentTime);

    noise.connect(filter);
    filter.connect(hissGain);
    hissGain.connect(output);
    noise.start();

    // Periodic vinyl dust ticks
    const popInterval = setInterval(() => {
      if (!this.ambientSources.has(id)) return;
      if (Math.random() > 0.4) {
        const tickBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.01, ctx.sampleRate);
        const td = tickBuffer.getChannelData(0);
        for (let i = 0; i < td.length; i++) {
          td[i] = (Math.random() * 2 - 1) * (1 - i / td.length);
        }
        const tickSource = ctx.createBufferSource();
        tickSource.buffer = tickBuffer;
        const tickGain = ctx.createGain();
        tickGain.gain.setValueAtTime((0.1 + Math.random() * 0.15) * this.ambientVolumes.vinyl, ctx.currentTime);
        tickSource.connect(tickGain);
        tickGain.connect(output);
        tickSource.start();
      }
    }, 320);

    this.ambientSources.set(id, {
      stop: () => {
        clearInterval(popInterval);
        noise.stop();
        noise.disconnect();
      },
    });
  }

  // 4. NIGHT WIND & CRICKETS
  private startNightSynth(ctx: AudioContext, output: GainNode, id: AmbientSoundId) {
    // Gentle wind drone
    const windBuffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const wd = windBuffer.getChannelData(0);
    for (let i = 0; i < wd.length; i++) {
      wd[i] = (Math.random() * 2 - 1) * 0.1;
    }
    const windSource = ctx.createBufferSource();
    windSource.buffer = windBuffer;
    windSource.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.setValueAtTime(320, ctx.currentTime);

    windSource.connect(windFilter);
    windFilter.connect(output);
    windSource.start();

    // Crickets chirp rhythm
    const cricketInterval = setInterval(() => {
      if (!this.ambientSources.has(id)) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const baseFreq = 4600 + (Math.random() * 300);
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.02 * this.ambientVolumes.night, ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(output);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    }, 550);

    this.ambientSources.set(id, {
      stop: () => {
        clearInterval(cricketInterval);
        windSource.stop();
        windSource.disconnect();
      },
    });
  }

  // 5. CAFE MURMUR (Muffled cozy room warmth)
  private startCafeSynth(ctx: AudioContext, output: GainNode, id: AmbientSoundId) {
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const cd = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      cd[i] = (Math.random() * 2 - 1) * 0.15;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(450, ctx.currentTime);
    bandpass.Q.setValueAtTime(1.4, ctx.currentTime);

    const cafeGain = ctx.createGain();
    cafeGain.gain.setValueAtTime(0.6, ctx.currentTime);

    source.connect(bandpass);
    bandpass.connect(cafeGain);
    cafeGain.connect(output);
    source.start();

    this.ambientSources.set(id, {
      stop: () => {
        source.stop();
        source.disconnect();
      },
    });
  }

  // ----------------------------------------------------
  // PROCEDURAL LO-FI RHODES / PIANO CHORDS GENERATOR
  // (Provides infinite, copyright-safe, unbuffered cozy music)
  // ----------------------------------------------------
  public startProceduralMusic() {
    this.stopAudioStream();
    this.isProceduralPlaying = true;
    this.currentTrackPlaying = true;
    const ctx = this.initContext();

    // Pentatonic & Neo-Soul Lofi Chord Progressions in key of Db major / Bb minor
    // Frequencies for soothing electric piano chords:
    const chordProgressions = [
      [277.18, 349.23, 415.30, 523.25], // Dbmaj7 (Db, F, Ab, C)
      [233.08, 277.18, 349.23, 415.30], // Bbm7 (Bb, Db, F, Ab)
      [185.00, 233.08, 277.18, 349.23], // Gbmaj7 (Gb, Bb, Db, F)
      [207.65, 261.63, 311.13, 392.00], // Ab7sus4 -> Ab
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 392.00], // G
    ];

    let chordIndex = 0;

    const playChord = () => {
      if (!this.isProceduralPlaying) return;
      const chord = chordProgressions[chordIndex % chordProgressions.length];
      chordIndex++;

      const now = ctx.currentTime;
      const chordDuration = 5.5;

      chord.forEach((freq, i) => {
        // Slight arpeggio stagger for organic human touch
        const noteStart = now + (i * 0.04);
        
        // Main warm Rhodes oscillator
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const noteGain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, noteStart);

        // Soft harmonic overtone
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 2, noteStart);

        // Lowpass filter with mellow resonance
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, noteStart);
        filter.frequency.exponentialRampToValueAtTime(350, noteStart + chordDuration);

        // Soft ADSR envelope
        const vol = (0.045 * this.musicVolume);
        noteGain.gain.setValueAtTime(0.0001, noteStart);
        noteGain.gain.linearRampToValueAtTime(vol, noteStart + 0.12);
        noteGain.gain.exponentialRampToValueAtTime(vol * 0.4, noteStart + 1.2);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + chordDuration);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.masterGainNode!);

        osc1.start(noteStart);
        osc2.start(noteStart);
        osc1.stop(noteStart + chordDuration + 0.1);
        osc2.stop(noteStart + chordDuration + 0.1);
      });
    };

    // Play first chord immediately
    playChord();
    if (this.proceduralInterval) clearInterval(this.proceduralInterval);
    this.proceduralInterval = setInterval(playChord, 5200);
  }

  public stopProceduralMusic() {
    this.isProceduralPlaying = false;
    if (this.proceduralInterval) {
      clearInterval(this.proceduralInterval);
      this.proceduralInterval = null;
    }
  }

  // ----------------------------------------------------
  // HTML5 AUDIO STREAM / CUSTOM TRACK
  // ----------------------------------------------------
  public playAudioStream(url: string, onEnded?: () => void) {
    this.stopProceduralMusic();
    this.initContext();

    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';
    }

    this.audioElement.src = url;
    this.audioElement.volume = this.musicVolume;
    this.audioElement.muted = this.isMuted;
    this.audioElement.loop = false;

    if (onEnded) {
      this.audioElement.onended = onEnded;
    }

    this.audioElement.play().then(() => {
      this.currentTrackPlaying = true;
    }).catch((err) => {
      console.warn('Audio stream playback failed, falling back to procedural music:', err);
      // Fallback gracefully so sound is guaranteed to play!
      this.startProceduralMusic();
    });
  }

  public stopAudioStream() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
  }

  public pauseMusic() {
    this.currentTrackPlaying = false;
    if (this.isProceduralPlaying) {
      this.stopProceduralMusic();
    }
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
    }
  }

  public resumeMusic(preferredUrl?: string) {
    this.initContext();
    this.currentTrackPlaying = true;
    if (this.audioElement && this.audioElement.src && !preferredUrl) {
      this.audioElement.play().catch(() => {
        this.startProceduralMusic();
      });
    } else if (preferredUrl) {
      this.playAudioStream(preferredUrl);
    } else {
      this.startProceduralMusic();
    }
  }

  public setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.audioElement) {
      this.audioElement.volume = this.musicVolume;
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public isMusicPlaying(): boolean {
    if (this.isProceduralPlaying) return true;
    if (this.audioElement && !this.audioElement.paused) return true;
    return this.currentTrackPlaying;
  }

  public getAudioElement(): HTMLAudioElement | null {
    return this.audioElement;
  }

  // ----------------------------------------------------
  // SLEEP TIMER WITH GRADUAL FADE-OUT
  // ----------------------------------------------------
  public setSleepTimer(minutes: number, onTick?: (sec: number) => void) {
    this.clearSleepTimer();
    if (minutes <= 0) return;

    this.sleepTimerRemainingSec = minutes * 60;
    this.onSleepTimerTick = onTick;

    if (this.onSleepTimerTick) {
      this.onSleepTimerTick(this.sleepTimerRemainingSec);
    }

    this.sleepTimerId = setInterval(() => {
      this.sleepTimerRemainingSec--;
      if (this.onSleepTimerTick) {
        this.onSleepTimerTick(this.sleepTimerRemainingSec);
      }

      // Gentle fade out in last 30 seconds
      if (this.sleepTimerRemainingSec <= 30 && this.sleepTimerRemainingSec > 0) {
        const factor = this.sleepTimerRemainingSec / 30;
        if (this.masterGainNode && this.ctx) {
          this.masterGainNode.gain.setValueAtTime(factor, this.ctx.currentTime);
        }
      }

      if (this.sleepTimerRemainingSec <= 0) {
        this.pauseMusic();
        this.stopAllAmbients();
        this.clearSleepTimer();
      }
    }, 1000);
  }

  public clearSleepTimer() {
    if (this.sleepTimerId) {
      clearInterval(this.sleepTimerId);
      this.sleepTimerId = null;
    }
    this.sleepTimerRemainingSec = 0;
    if (this.onSleepTimerTick) {
      this.onSleepTimerTick(0);
    }
    // Restore master gain
    if (this.masterGainNode && this.ctx && !this.isMuted) {
      this.masterGainNode.gain.setValueAtTime(1, this.ctx.currentTime);
    }
  }

  public stopAllAmbients() {
    const keys: AmbientSoundId[] = ['rain', 'fireplace', 'vinyl', 'night', 'cafe'];
    keys.forEach(k => {
      this.ambientVolumes[k] = 0;
      this.stopAmbient(k);
    });
  }
}

export const soundEngine = new AudioEngine();
