import { useCallback } from 'react';
import { SPEECH_CONFIG } from '../constants';

export const useSpeech = () => {
  const speakEnglish = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      const voices = synth.getVoices();
      
      // Google, Microsoft, Appleなどのen-US自然音声を優先
      const preferred = voices.find(v => 
        v.lang === SPEECH_CONFIG.LANGUAGE && 
        SPEECH_CONFIG.PREFERRED_VOICES.test(v.name)
      );
      const fallback = voices.find(v => v.lang === SPEECH_CONFIG.LANGUAGE);
      
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = SPEECH_CONFIG.LANGUAGE;
      utter.voice = preferred || fallback || voices[0];
      synth.speak(utter);
    }
  }, []);

  return { speakEnglish };
};