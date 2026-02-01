import { useCallback } from 'react';
import { SPEECH_CONFIG, type Language } from '../constants';

export const useSpeech = () => {
  const speak = useCallback((text: string, language: Language) => {
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      const voices = synth.getVoices();
      
      const config = SPEECH_CONFIG[language];
      
      // Google, Microsoft, Appleなどの自然音声を優先
      const preferred = voices.find(v => 
        v.lang === config.language && 
        config.preferredVoices.test(v.name)
      );
      const fallback = voices.find(v => v.lang === config.language);
      
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = config.language;
      utter.voice = preferred || fallback || voices[0];
      synth.speak(utter);
    }
  }, []);

  return { speak };
};