export type RecordingStatus = 'idle' | 'recording' | 'paused' | 'completed';

export interface RecordingData {
  status: RecordingStatus;
  duration: number;
  audioUrl?: string;
  transcript?: string;
}

export interface Question {
  id: string;
  text: string;
  recording?: RecordingData;
}

export type Mode = 'manual' | 'generated';
export type Flow = 'sell' | 'buy' | 'browse';