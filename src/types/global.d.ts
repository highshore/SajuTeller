export {};

declare global {
  interface Window {
    Kakao?: {
      isInitialized?: () => boolean;
      Auth: {
        login: (options: { scope?: string }) => Promise<unknown>;
      };
    };
    webkitSpeechRecognition?: {
      new (): SpeechRecognition;
    };
    SpeechRecognition?: {
      new (): SpeechRecognition;
    };
  }

  // Minimal Google Maps typings used by the Locations route
  interface Window {
    google?: any;
  }

  interface SpeechRecognition {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start: () => void;
    stop: () => void;
    onaudioend?: (() => void) | null;
    onend?: (() => void) | null;
    onerror?: ((event: any) => void) | null;
    onresult?: ((event: SpeechRecognitionEvent) => void) | null;
  }

  interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
    resultIndex: number;
  }

  interface SpeechRecognitionResultList {
    length: number;
    item: (index: number) => SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    length: number;
    isFinal: boolean;
    item: (index: number) => SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
  }
}
