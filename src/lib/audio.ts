/**
 * AI Audio Utility for Text-to-Speech
 * Uses Browser Native SpeechSynthesis as the primary engine.
 * Future versions can integrate OpenAI TTS or Google Cloud TTS for premium voices.
 */

export interface SpeechOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

class AudioEngine {
  private synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return this.synth.getVoices();
  }

  public speak(text: string, options: SpeechOptions = {}) {
    this.stop();

    // Clean text: remove markdown artifacts
    const cleanText = text
      .replace(/[#*`_~]/g, '') // Remove markdown symbols
      .replace(/\[Slide \d+\]/gi, '') // Remove slide markers
      .replace(/!\[.*?\]\(.*?\)/g, ''); // Remove images

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Configure options
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;

    // Select the best English or Bengali voice if available
    const voices = this.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Premium')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => {
      this.currentUtterance = null;
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (err) => {
      console.error("Speech Error:", err);
      if (options.onError) options.onError(err);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public pause() {
    this.synth.pause();
  }

  public resume() {
    this.synth.resume();
  }

  public stop() {
    this.synth.cancel();
    this.currentUtterance = null;
  }

  public isSpeaking(): boolean {
    return this.synth.speaking;
  }
}

export const audioAI = new AudioEngine();
