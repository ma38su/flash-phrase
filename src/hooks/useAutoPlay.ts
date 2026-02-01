import { useCallback, useEffect, useRef } from 'react';
import type { Phrase } from '../types';
import type { SpeechSettings } from '../types/settings';
import type { Language } from '../constants';

interface UseAutoPlayProps {
  displayPhrases: Phrase[];
  currentIndex: number;
  selectedUnit: number | 'all' | null;
  showUnitList: number | null;
  reverseMode: boolean;
  settings: SpeechSettings;
  speak: (text: string, language: Language, onEnd?: () => void) => void;
  cancelSpeech: () => void;
  setCurrentIndex: (index: number) => void;
  setShowEnglish: (show: boolean) => void;
  setSelectedUnit: (unit: number | 'all' | null) => void;
}

export const useAutoPlay = ({
  displayPhrases,
  currentIndex,
  selectedUnit,
  showUnitList,
  reverseMode,
  settings,
  speak,
  cancelSpeech,
  setCurrentIndex,
  setShowEnglish,
  setSelectedUnit,
}: UseAutoPlayProps) => {
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoPlayActiveRef = useRef(false);
  const currentIndexRef = useRef(currentIndex);
  const settingsRef = useRef(settings);

  // settingsの変更を追跡
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // 自動再生を停止する関数
  const stopAutoPlay = useCallback(() => {
    autoPlayActiveRef.current = false;
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
    cancelSpeech();
  }, [cancelSpeech]);

  // 1つのフレーズの自動再生シーケンスを実行
  const runAutoPlaySequence = useCallback((phraseIndex: number) => {
    // 自動再生が無効化されていたら停止
    if (!autoPlayActiveRef.current) return;
    
    const phrase = displayPhrases[phraseIndex];
    if (!phrase) {
      // フレーズがない = 終了
      setSelectedUnit(null);
      setCurrentIndex(0);
      setShowEnglish(false);
      autoPlayActiveRef.current = false;
      return;
    }

    // 現在のインデックスを更新（stateとrefの両方）
    currentIndexRef.current = phraseIndex;
    setCurrentIndex(phraseIndex);
    setShowEnglish(false);

    // Step 1: 最初の言語を読み上げ
    const firstLang: Language = reverseMode ? 'en' : 'ja';
    const firstText = reverseMode ? phrase.EN : phrase.JA;

    speak(firstText, firstLang, () => {
      if (!autoPlayActiveRef.current) return;
      
      // Step 2: 遅延後に答えを表示
      autoPlayTimerRef.current = setTimeout(() => {
        if (!autoPlayActiveRef.current) return;
        
        // 現在のインデックスを再確認して状態を更新
        setCurrentIndex(currentIndexRef.current);
        setShowEnglish(true);
        
        // Step 3: 答えの言語を読み上げ
        const secondLang: Language = reverseMode ? 'ja' : 'en';
        const secondText = reverseMode ? phrase.JA : phrase.EN;
        
        speak(secondText, secondLang, () => {
          if (!autoPlayActiveRef.current) return;
          
          // Step 4: 遅延後に次のフレーズへ
          autoPlayTimerRef.current = setTimeout(() => {
            if (!autoPlayActiveRef.current) return;
            
            const nextIndex = currentIndexRef.current + 1;
            if (nextIndex < displayPhrases.length) {
              runAutoPlaySequence(nextIndex);
            } else {
              // 最後のフレーズなので終了
              setSelectedUnit(null);
              setCurrentIndex(0);
              setShowEnglish(false);
              autoPlayActiveRef.current = false;
            }
          }, settingsRef.current.delayBeforeNext);
        });
      }, settingsRef.current.delayBeforeAnswer);
    });
  }, [displayPhrases, reverseMode, speak, setCurrentIndex, setShowEnglish, setSelectedUnit]);

  // 自動再生を開始する関数
  const startAutoPlay = useCallback((startIndex: number) => {
    if (autoPlayActiveRef.current) return;
    autoPlayActiveRef.current = true;
    runAutoPlaySequence(startIndex);
  }, [runAutoPlaySequence]);

  // 自動再生中かどうかを返す
  const isAutoPlayActive = useCallback(() => {
    return autoPlayActiveRef.current;
  }, []);

  // 画面を離れたら自動再生を停止
  useEffect(() => {
    if (selectedUnit === null || showUnitList !== null) {
      stopAutoPlay();
    }
  }, [selectedUnit, showUnitList, stopAutoPlay]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      stopAutoPlay();
    };
  }, [stopAutoPlay]);

  return {
    startAutoPlay,
    stopAutoPlay,
    isAutoPlayActive,
    autoPlayActiveRef, // URL更新スキップ用に公開
  };
};
