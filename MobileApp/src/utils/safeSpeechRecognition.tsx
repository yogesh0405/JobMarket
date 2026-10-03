import React, { useEffect } from 'react';

let NativeSpeechModule: any = null;
let nativeUseSpeechRecognitionEvent: any = null;
let isNativeSupported = false;

try {
  // Use dynamic require so Expo Go doesn't throw a module load crash
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pkg = require('expo-speech-recognition');
  if (pkg && pkg.ExpoSpeechRecognitionModule) {
    NativeSpeechModule = pkg.ExpoSpeechRecognitionModule;
    nativeUseSpeechRecognitionEvent = pkg.useSpeechRecognitionEvent;
    isNativeSupported = true;
  }
} catch (_err) {
  // Bypassed gracefully inside Expo Go client
  isNativeSupported = false;
  NativeSpeechModule = null;
  nativeUseSpeechRecognitionEvent = null;
}

export const isVoiceRecognitionAvailable = isNativeSupported && Boolean(NativeSpeechModule);
export const ExpoSpeechRecognition = NativeSpeechModule;

interface NativeVoiceEventsProps {
  onStart: () => void;
  onEnd: () => void;
  onResult: (event: any) => void;
  onError: (event: any) => void;
}

export const NativeVoiceEventsListener: React.FC<NativeVoiceEventsProps> = ({
  onStart,
  onEnd,
  onResult,
  onError,
}) => {
  if (!nativeUseSpeechRecognitionEvent) {
    return null;
  }

  return (
    <NativeVoiceListenerInner
      onStart={onStart}
      onEnd={onEnd}
      onResult={onResult}
      onError={onError}
    />
  );
};

const NativeVoiceListenerInner: React.FC<NativeVoiceEventsProps> = ({
  onStart,
  onEnd,
  onResult,
  onError,
}) => {
  nativeUseSpeechRecognitionEvent('start', onStart);
  nativeUseSpeechRecognitionEvent('end', onEnd);
  nativeUseSpeechRecognitionEvent('result', onResult);
  nativeUseSpeechRecognitionEvent('error', onError);

  return null;
};
