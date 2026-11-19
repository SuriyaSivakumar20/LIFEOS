/**
 * LIFEOS Voice Services Module
 * Sprint 1: Contracts and placeholder status.
 * Audio recording and offline speech recognition will be integrated in a future sprint.
 */

export interface VoiceRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

export interface IVoiceService {
  isAvailable(): boolean;
  startListening(): Promise<void>;
  stopListening(): Promise<VoiceRecognitionResult | null>;
}

export class VoiceServicePlaceholder implements IVoiceService {
  isAvailable(): boolean {
    return false;
  }

  async startListening(): Promise<void> {
    throw new Error('Voice input is not yet available in Sprint 1.');
  }

  async stopListening(): Promise<VoiceRecognitionResult | null> {
    return null;
  }
}
