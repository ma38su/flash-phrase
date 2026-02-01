import { useCallback, useEffect, useRef } from 'react';
import { SPEECH_CONFIG, type Language } from '../constants';

export const useSpeech = () => {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // コンポーネントのアンマウント時にクリーンアップ
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((text: string, language: Language, onEnd?: () => void) => {
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      
      // Chrome用のハングアップ対策
      if (synth.speaking || synth.pending) {
        synth.pause();
        synth.resume();
      }
      synth.cancel();
      
      // 少し遅延を入れてからutteranceを作成・再生
      setTimeout(() => {
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
          utter.onerror = () => onEnd(); // エラー時もコールバックを呼ぶ
        }
        
        utteranceRef.current = utter;
        synth.speak(utter);
      }, 50);
    } else if (onEnd) {
      onEnd();
    }
  }, []);

  const cancelSpeech = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, cancelSpeech };
};