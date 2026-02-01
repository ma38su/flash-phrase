import { useCallback } from 'react';
import { SPEECH_CONFIG, type Language } from '../constants';

export const useSpeech = () => {
  const speak = useCallback((text: string, language: Language, onEnd?: () => void) => {
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      
      // 既存の音声合成をキャンセル
      synth.cancel();
      
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
      
      if (onEnd) {
        utter.onend = onEnd;
      }
      
      synth.speak(utter);
    } else if (onEnd) {
      // 音声合成が利用できない場合もコールバックを呼ぶ
      onEnd();
    }
  }, []);

  return { speak };
};