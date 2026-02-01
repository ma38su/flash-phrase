import { useCallback, useEffect, useRef } from 'react';
import { SPEECH_CONFIG, type Language } from '../constants';
import type { SpeechSettings } from '../types/settings';
import { DEFAULT_SETTINGS } from '../types/settings';

export const useSpeech = (settings: SpeechSettings = DEFAULT_SETTINGS) => {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const settingsRef = useRef(settings);

  // settingsの変更を追跡
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

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
        const currentSettings = settingsRef.current;
        
        // 設定から音声を取得、なければ自動選択
        const selectedVoiceURI = language === 'en' ? currentSettings.enVoice : currentSettings.jaVoice;
        let voice: SpeechSynthesisVoice | undefined;
        
        if (selectedVoiceURI) {
          // 設定で指定された音声を探す
          voice = voices.find(v => v.voiceURI === selectedVoiceURI);
        }
        
        if (!voice) {
          // 自動選択: Google, Microsoft, Appleなどの自然音声を優先
          const preferred = voices.find(v => 
            v.lang === config.language && 
            config.preferredVoices.test(v.name)
          );
          const fallback = voices.find(v => v.lang === config.language);
          voice = preferred || fallback || voices[0];
        }
        
        const utter = new window.SpeechSynthesisUtterance(text);
        utter.lang = config.language;
        utter.voice = voice || null;
        // 設定から速度を取得
        utter.rate = language === 'en' ? currentSettings.enRate : currentSettings.jaRate;
        
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