import { useEffect, useCallback } from 'react';
import type { Phrase, SelectedUnit, URLParams } from '../types';

interface URLManagerProps {
  phrases: Phrase[];
  loading: boolean;
  selectedUnit: SelectedUnit;
  showUnitList: number | null;
  reverseMode: boolean;
  currentIndex: number;
  showEnglish: boolean;
  isRandom: boolean;
  showListEN: boolean;
  showListJA: boolean;
  setSelectedUnit: (unit: SelectedUnit) => void;
  setShowUnitList: (unit: number | null) => void;
  setReverseMode: (mode: boolean) => void;
  setCurrentIndex: (index: number) => void;
  setShowEnglish: (show: boolean) => void;
  setIsRandom: (random: boolean) => void;
  setShowListEN: (show: boolean) => void;
  setShowListJA: (show: boolean) => void;
  setCurrentPhrases: (phrases: Phrase[]) => void;
}

export const useURLManager = ({
  phrases,
  loading,
  selectedUnit,
  showUnitList,
  reverseMode,
  currentIndex,
  showEnglish,
  isRandom,
  showListEN,
  showListJA,
  setSelectedUnit,
  setShowUnitList,
  setReverseMode,
  setCurrentIndex,
  setShowEnglish,
  setIsRandom,
  setShowListEN,
  setShowListJA,
  setCurrentPhrases,
}: URLManagerProps) => {
  
  // URLから状態を復元する関数
  const restoreStateFromURL = useCallback(() => {
    if (phrases.length === 0) {
      return;
    }
    
    const hash = window.location.hash.substring(1);
    const [path, queryString] = hash.split('?');
    const searchParams = new URLSearchParams(queryString || '');
    
    if (!path || path === '/') {
      return;
    }

    const pathParts = path.split('/').filter(Boolean);
    
    if (pathParts.length >= 2) {
      const unitOrAll = pathParts[0];
      const mode = pathParts[1];
      
      // ランダムモードの復元
      const randomParam = searchParams.get('random');
      if (randomParam === 'true') {
        setIsRandom(true);
      }
      
      if (mode === 'list' && unitOrAll !== 'all') {
        // ユニット一覧表示
        const unitNum = parseInt(unitOrAll.replace('unit', ''));
        if (!isNaN(unitNum)) {
          setShowUnitList(unitNum);
          // 一覧表示の表示設定を復元
          const showEN = searchParams.get('showEN');
          const showJA = searchParams.get('showJA');
          if (showEN !== null) setShowListEN(showEN === 'true');
          if (showJA !== null) setShowListJA(showJA === 'true');
        }
      } else if (mode === 'ja-en' || mode === 'en-ja') {
        // フレーズ表示モード
        const isReverse = mode === 'en-ja';
        setReverseMode(isReverse);
        
        let unit: number | 'all';
        if (unitOrAll === 'all') {
          unit = 'all';
        } else {
          unit = parseInt(unitOrAll.replace('unit', ''));
          if (isNaN(unit)) return;
        }
        
        // フレーズの状態を復元
        const index = parseInt(searchParams.get('index') || '0');
        const showEnglish = searchParams.get('show') === 'true';
        
        // currentPhrasesを設定
        const unitPhrases = unit === 'all' 
          ? phrases 
          : phrases.filter(p => p.Unit === unit);
        const randomParam = searchParams.get('random');
        const orderedPhrases = randomParam === 'true'
          ? [...unitPhrases].sort(() => Math.random() - 0.5)
          : unitPhrases;
        
        setCurrentPhrases(orderedPhrases);
        setSelectedUnit(unit);
        setCurrentIndex(Math.min(index, orderedPhrases.length - 1));
        setShowEnglish(showEnglish);
      }
    }
  }, [phrases, setSelectedUnit, setShowUnitList, setReverseMode, setCurrentIndex, setShowEnglish, setIsRandom, setShowListEN, setShowListJA, setCurrentPhrases]);

  // URLを更新する関数
  const updateURL = useCallback((path: string, params: URLParams = {}) => {
    let hash = '#' + path;
    
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.set(key, value);
    });
    
    if (queryParams.toString()) {
      hash += '?' + queryParams.toString();
    }
    
    window.location.hash = hash;
  }, []);

  // phrasesが読み込まれた後にURL状態を復元
  useEffect(() => {
    if (phrases.length > 0 && !loading) {
      restoreStateFromURL();
    }
  }, [phrases, loading, restoreStateFromURL]);

  // ブラウザの戻る/進むボタンとハッシュ変更に対応
  useEffect(() => {
    const handleHashChange = () => {
      if (phrases.length > 0) {
        restoreStateFromURL();
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [phrases, restoreStateFromURL]);

  // selectedUnit変更時にURLを更新
  useEffect(() => {
    if (loading) return;
    
    if (selectedUnit === null && showUnitList === null) {
      updateURL('/');
    }
  }, [selectedUnit, showUnitList, loading, updateURL]);

  // フレーズ表示状態変更時にURLを更新
  useEffect(() => {
    if (loading || selectedUnit === null || showUnitList !== null) return;
    
    const unitPath = selectedUnit === 'all' ? '/all' : `/unit${selectedUnit}`;
    const mode = reverseMode ? '/en-ja' : '/ja-en';
    const params: URLParams = {
      index: currentIndex.toString(),
      show: showEnglish.toString(),
    };
    
    if (isRandom) {
      params.random = 'true';
    }
    
    updateURL(unitPath + mode, params);
  }, [selectedUnit, reverseMode, currentIndex, showEnglish, isRandom, loading, showUnitList, updateURL]);

  // ユニット一覧表示状態変更時にURLを更新
  useEffect(() => {
    if (loading || showUnitList === null) return;
    
    const params: URLParams = {
      showEN: showListEN.toString(),
      showJA: showListJA.toString(),
    };
    
    updateURL(`/unit${showUnitList}/list`, params);
  }, [showUnitList, showListEN, showListJA, loading, updateURL]);

  return { updateURL };
};