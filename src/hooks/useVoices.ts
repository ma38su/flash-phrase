import { useState, useEffect, useCallback } from 'react';

export interface VoiceInfo {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
}

export const useVoices = () => {
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadVoices = useCallback(() => {
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      const availableVoices = synth.getVoices();
      
      if (availableVoices.length > 0) {
        const voiceInfos = availableVoices.map(v => ({
          voiceURI: v.voiceURI,
          name: v.name,
          lang: v.lang,
          localService: v.localService,
        }));
        setVoices(voiceInfos);
        setIsLoaded(true);
      }
    }
  }, []);

  useEffect(() => {
    loadVoices();
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, [loadVoices]);

  // 言語でフィルタリング
  const getVoicesForLanguage = useCallback((langPrefix: string): VoiceInfo[] => {
    return voices.filter(v => v.lang.startsWith(langPrefix));
  }, [voices]);

  // 英語の音声
  const englishVoices = getVoicesForLanguage('en');
  
  // 日本語の音声
  const japaneseVoices = getVoicesForLanguage('ja');

  return { 
    voices, 
    englishVoices, 
    japaneseVoices, 
    isLoaded,
    getVoicesForLanguage 
  };
};
