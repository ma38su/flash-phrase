import { useEffect, useCallback, useRef } from 'react';
import type { SelectedUnit } from '../types';

interface URLParams {
  [key: string]: string;
}

interface UseURLManagerProps {
  loading: boolean;
  selectedUnit: SelectedUnit;
  showUnitList: number | null;
  reverseMode: boolean;
  currentIndex: number;
  showEnglish: boolean;
  isRandom: boolean;
  showListEN: boolean;
  showListJA: boolean;
  autoPlayActiveRef: React.RefObject<boolean>;
}

interface URLState {
  type: 'home' | 'list' | 'phrase';
  unit?: number | 'all';
  mode?: 'ja-en' | 'en-ja';
  index?: number;
  showEnglish?: boolean;
  isRandom?: boolean;
  showListEN?: boolean;
  showListJA?: boolean;
}

export const useURLManager = ({
  loading,
  selectedUnit,
  showUnitList,
  reverseMode,
  currentIndex,
  showEnglish,
  isRandom,
  showListEN,
  showListJA,
  autoPlayActiveRef,
}: UseURLManagerProps) => {
  
  // プログラムからのURL更新時にhashchangeをスキップするためのフラグ
  const skipNextHashChangeRef = useRef(false);
  
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
    
    // プログラムからのURL更新なのでhashchangeをスキップ
    skipNextHashChangeRef.current = true;
    window.location.hash = hash;
  }, []);

  // URLからパラメータを解析する関数
  const parseURL = useCallback((): URLState | null => {
    const hash = window.location.hash.substring(1);
    const [path, queryString] = hash.split('?');
    const searchParams = new URLSearchParams(queryString || '');
    
    if (!path || path === '/') {
      return { type: 'home' };
    }

    const pathParts = path.split('/').filter(Boolean);
    
    if (pathParts.length >= 2) {
      const unitOrAll = pathParts[0];
      const mode = pathParts[1];
      
      if (mode === 'list' && unitOrAll !== 'all') {
        const unitNum = parseInt(unitOrAll.replace('unit', ''));
        if (!isNaN(unitNum)) {
          return {
            type: 'list',
            unit: unitNum,
            showListEN: searchParams.get('showEN') === 'true',
            showListJA: searchParams.get('showJA') === 'true',
          };
        }
      } else if (mode === 'ja-en' || mode === 'en-ja') {
        let unit: number | 'all';
        if (unitOrAll === 'all') {
          unit = 'all';
        } else {
          unit = parseInt(unitOrAll.replace('unit', ''));
          if (isNaN(unit)) return null;
        }
        
        return {
          type: 'phrase',
          unit,
          mode,
          index: parseInt(searchParams.get('index') || '0'),
          showEnglish: searchParams.get('show') === 'true',
          isRandom: searchParams.get('random') === 'true',
        };
      }
    }
    
    return null;
  }, []);

  // selectedUnit変更時にURLを更新
  useEffect(() => {
    if (loading) return;
    
    if (selectedUnit === null && showUnitList === null) {
      updateURL('/');
    }
  }, [selectedUnit, showUnitList, loading, updateURL]);

  // フレーズ表示状態変更時にURLを更新
  useEffect(() => {
    // 自動再生中はURL更新をスキップ（頻繁な更新を避ける）
    if (loading || selectedUnit === null || showUnitList !== null || autoPlayActiveRef.current) return;
    
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
  }, [selectedUnit, reverseMode, currentIndex, showEnglish, isRandom, loading, showUnitList, autoPlayActiveRef, updateURL]);

  // ユニット一覧表示状態変更時にURLを更新
  useEffect(() => {
    if (loading || showUnitList === null) return;
    
    const params: URLParams = {
      showEN: showListEN.toString(),
      showJA: showListJA.toString(),
    };
    
    updateURL(`/unit${showUnitList}/list`, params);
  }, [showUnitList, showListEN, showListJA, loading, updateURL]);

  return { parseURL, updateURL, skipNextHashChangeRef };
};
