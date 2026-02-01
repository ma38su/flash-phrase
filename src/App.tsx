import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import UnitSelect from './components/UnitSelect'
import PhraseCard from './components/PhraseCard'
import UnitList from './components/UnitList'
import UnitListHeader from './components/UnitListHeader'
import type { Phrase, SelectedUnit } from './types'
import { useCSVLoader } from './hooks/useCSVLoader'
import { useSpeech } from './hooks/useSpeech'
import { shufflePhrases, filterPhrasesByUnit, getUnitLabel } from './utils/phraseUtils'
import { AUTO_PLAY_CONFIG } from './constants'

function App() {
  const { units, loadUnit, isUnitLoading, getLoadedUnit } = useCSVLoader();
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [loading, setLoading] = useState(false);
  const { speak } = useSpeech();
  
  const [selectedUnit, setSelectedUnit] = useState<SelectedUnit>(null)
  const [currentPhrases, setCurrentPhrases] = useState<Phrase[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showEnglish, setShowEnglish] = useState(false)
  const [isRandom, setIsRandom] = useState(false)

  // ユニット一覧表示用の状態
  const [showUnitList, setShowUnitList] = useState<number | null>(null);

  // 英→日モードの状態
  const [reverseMode, setReverseMode] = useState(false);

  // 一覧表示の英語・日本語表示状態
  const [showListEN, setShowListEN] = useState(true);
  const [showListJA, setShowListJA] = useState(true);

  // 自動再生モードの状態
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // URLから状態を復元する関数（動的読み込み対応）
  const restoreStateFromURL = async () => {
    const hash = window.location.hash.substring(1); // #を除去
    const [path, queryString] = hash.split('?');
    const searchParams = new URLSearchParams(queryString || '');
    
    if (!path || path === '/') {
      // ルートハッシュはユニット選択画面
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
          // 一覧表示の表示設定を復元
          const showEN = searchParams.get('showEN');
          const showJA = searchParams.get('showJA');
          if (showEN !== null) setShowListEN(showEN === 'true');
          if (showJA !== null) setShowListJA(showJA === 'true');
          
          // データを読み込んでから一覧表示
          await handleShowUnitList(unitNum);
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
        
        // データを読み込んでからフレーズ表示
        await handleSelectUnit(unit);
        setCurrentIndex(index);
        setShowEnglish(showEnglish);
      }
    }
  };

  // URLを更新する関数
  const updateURL = (path: string, params: Record<string, string> = {}) => {
    let hash = '#' + path;
    
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.set(key, value);
    });
    
    if (queryParams.toString()) {
      hash += '?' + queryParams.toString();
    }
    
    window.location.hash = hash;
  };

  // 初回読み込み時のURL状態復元
  useEffect(() => {
    restoreStateFromURL();
  }, []); // 初回のみ実行

  // ブラウザの戻る/進むボタンとハッシュ変更に対応
  useEffect(() => {
    const handleHashChange = () => {
      restoreStateFromURL();
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // selectedUnit変更時にURLを更新
  useEffect(() => {
    if (loading) return;
    
    if (selectedUnit === null && showUnitList === null) {
      updateURL('/');
    }
  }, [selectedUnit, showUnitList, loading]);

  // フレーズ表示状態変更時にURLを更新
  useEffect(() => {
    if (loading || selectedUnit === null || showUnitList !== null) return;
    
    const unitPath = selectedUnit === 'all' ? '/all' : `/unit${selectedUnit}`;
    const mode = reverseMode ? '/en-ja' : '/ja-en';
    const params: Record<string, string> = {
      index: currentIndex.toString(),
      show: showEnglish.toString(),
    };
    
    if (isRandom) {
      params.random = 'true';
    }
    
    updateURL(unitPath + mode, params);
  }, [selectedUnit, reverseMode, currentIndex, showEnglish, isRandom, loading, showUnitList]);

  // ユニット一覧表示状態変更時にURLを更新
  useEffect(() => {
    if (loading || showUnitList === null) return;
    
    const params: Record<string, string> = {
      showEN: showListEN.toString(),
      showJA: showListJA.toString(),
    };
    
    updateURL(`/unit${showUnitList}/list`, params);
  }, [showUnitList, showListEN, showListJA, loading]);

  // ユニット選択時
  const handleSelectUnit = async (unit: SelectedUnit) => {
    if (unit === null) return;
    
    setLoading(true);
    try {
      let allPhrases: Phrase[];
      
      if (unit === 'all') {
        // 全ユニットを読み込む
        allPhrases = [];
        for (const unitNumber of units) {
          const unitPhrases = await loadUnit(unitNumber);
          allPhrases.push(...unitPhrases);
        }
      } else {
        // 指定ユニットのみ読み込む
        allPhrases = await loadUnit(unit);
      }

      const orderedPhrases = isRandom 
        ? shufflePhrases(allPhrases)
        : allPhrases;
      setCurrentPhrases(orderedPhrases);
      setPhrases(allPhrases); // 後続の処理のためにphrasesも更新
    } catch (error) {
      console.error(`Failed to load unit data:`, error);
    } finally {
      setLoading(false);
    }
    
    setSelectedUnit(unit);
    setCurrentIndex(0);
    setShowEnglish(false);
    setShowUnitList(null);
  }

  // ユニット一覧表示への切り替え
  const handleShowUnitList = async (unit: number) => {
    // まだ読み込まれていない場合は読み込む
    if (!getLoadedUnit(unit).length && !isUnitLoading(unit)) {
      try {
        await loadUnit(unit);
      } catch (error) {
        console.error(`Failed to load unit ${unit} for list view:`, error);
      }
    }
    setShowUnitList(unit);
    setSelectedUnit(null);
  };

  // ランダムモード切り替え
  const toggleRandomMode = () => {
    const newRandomMode = !isRandom
    setIsRandom(newRandomMode)
    
    // すでにユニット選択済みの場合は再シャッフル
    if (selectedUnit) {
      const unitPhrases = filterPhrasesByUnit(phrases, selectedUnit);
      const orderedPhrases = newRandomMode
        ? shufflePhrases(unitPhrases)
        : unitPhrases;
      setCurrentPhrases(orderedPhrases);
      setCurrentIndex(0);
      setShowEnglish(false);
    }
  }

  // クリックで英訳表示/次のフレーズへ
  const handleClick = () => {
    if (!showEnglish) {
      // 英訳を表示
      setShowEnglish(true)
    } else {
      // 次のフレーズへ
      if (currentIndex < currentPhrases.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setShowEnglish(false)
      } else {
        // 最後のフレーズなので、ユニット選択に戻る
        setSelectedUnit(null)
        setCurrentIndex(0)
        setShowEnglish(false)
      }
    }
  }

  // 自動再生モードのトグル
  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlay(prev => !prev);
  }, []);

  // 自動再生モードのロジック
  useEffect(() => {
    if (!isAutoPlay || !selectedUnit || showUnitList !== null) {
      // タイマーと音声をクリア
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    const currentPhrase = currentPhrases[currentIndex];
    if (!currentPhrase) return;

    // クリーンアップ関数
    const cleanup = () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    };

    // 最初の言語を読み上げ
    if (!showEnglish) {
      const firstLang = reverseMode ? 'en' : 'ja';
      const firstText = reverseMode ? currentPhrase.EN : currentPhrase.JA;
      
      speak(firstText, firstLang, () => {
        // 読み上げ完了後、一定時間待ってから答えを表示
        autoPlayTimerRef.current = setTimeout(() => {
          setShowEnglish(true);
        }, AUTO_PLAY_CONFIG.DELAY_BEFORE_ANSWER);
      });
    } else {
      // 答えの言語を読み上げ
      const secondLang = reverseMode ? 'ja' : 'en';
      const secondText = reverseMode ? currentPhrase.JA : currentPhrase.EN;
      
      speak(secondText, secondLang, () => {
        // 読み上げ完了後、一定時間待ってから次へ
        autoPlayTimerRef.current = setTimeout(() => {
          if (currentIndex < currentPhrases.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setShowEnglish(false);
          } else {
            // 最後のフレーズなので自動再生を停止
            setIsAutoPlay(false);
            setSelectedUnit(null);
            setCurrentIndex(0);
            setShowEnglish(false);
          }
        }, AUTO_PLAY_CONFIG.DELAY_BEFORE_NEXT);
      });
    }

    return cleanup;
  }, [isAutoPlay, selectedUnit, showUnitList, currentIndex, showEnglish, reverseMode, currentPhrases, speak]);


  // ユニット選択前画面
  if (!selectedUnit && showUnitList === null) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-700 p-4 sm:p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 sm:mb-8 text-gray-100 tracking-wide drop-shadow-lg">Quick Response</h1>
          <div className="bg-gray-800 rounded-sm shadow-2xl p-4 sm:p-8">
            {loading ? (
              <div className="text-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-10 sm:h-12 w-10 sm:w-12 border-b-2 border-gray-400 mx-auto"></div>
                <p className="mt-3 sm:mt-4 text-gray-400 text-sm sm:text-base">読み込み中...</p>
              </div>
            ) : (
              <>
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-200 text-center">ユニットを選択してください</h2>
                <div className="mb-4 sm:mb-6 flex items-center justify-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRandom}
                      onChange={toggleRandomMode}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="ml-2 sm:ml-3 text-base sm:text-lg text-gray-300 font-medium">
                      🔀 ランダム表示
                    </span>
                  </label>
                </div>
                <UnitSelect
                  units={units}
                  onSelectUnit={(unit: number) => { setReverseMode(false); handleSelectUnit(unit); }}
                  onSelectReverseUnit={(unit: number) => { setReverseMode(true); handleSelectUnit(unit); }}
                  onShowUnitList={handleShowUnitList}
                />
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ユニット一覧画面
  if (showUnitList !== null) {
    const unitPhrases = getLoadedUnit(showUnitList);
    const currentUnitIndex = units.indexOf(showUnitList);
    
    const handleUnitNavigation = async (direction: 'prev' | 'next') => {
      const newIndex = direction === 'prev' 
        ? Math.max(0, currentUnitIndex - 1)
        : Math.min(units.length - 1, currentUnitIndex + 1);
      const newUnit = units[newIndex];
      
      // 新しいユニットが読み込まれていない場合は読み込む
      if (!getLoadedUnit(newUnit).length && !isUnitLoading(newUnit)) {
        try {
          await loadUnit(newUnit);
        } catch (error) {
          console.error(`Failed to load unit ${newUnit}:`, error);
        }
      }
      
      setShowUnitList(newUnit);
    };
    
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-700 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <UnitListHeader
            unit={showUnitList}
            onBack={() => setShowUnitList(null)}
            onPrev={() => handleUnitNavigation('prev')}
            onNext={() => handleUnitNavigation('next')}
            disablePrev={currentUnitIndex <= 0}
            disableNext={currentUnitIndex >= units.length - 1}
          />
          <UnitList
            phrases={unitPhrases}
            showEN={showListEN}
            showJA={showListJA}
            onToggleEN={() => setShowListEN(v => !v)}
            onToggleJA={() => setShowListJA(v => !v)}
            onSpeak={(text) => speak(text, 'en')}
            onSpeakJapanese={(text) => speak(text, 'ja')}
            unit={showUnitList}
            units={units}
            onPrev={() => handleUnitNavigation('prev')}
            onNext={() => handleUnitNavigation('next')}
            disablePrev={currentUnitIndex <= 0}
            disableNext={currentUnitIndex >= units.length - 1}
          />
        </div>
      </div>
    )
  }

  // フレーズ表示画面
  const currentPhrase = currentPhrases[currentIndex]
  
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-700 p-4 sm:p-8">
      <div className="max-w-xl mx-auto">
        <PhraseCard
          phrase={currentPhrase}
          showEnglish={showEnglish}
          reverseMode={reverseMode}
          onClick={handleClick}
          onSpeak={(text) => speak(text, 'en')}
          onSpeakJapanese={(text) => speak(text, 'ja')}
          onPrev={() => {
            if (currentIndex > 0) {
              setCurrentIndex(currentIndex - 1);
              setShowEnglish(false);
            }
          }}
          total={currentPhrases.length}
          index={currentIndex}
          unitLabel={getUnitLabel(selectedUnit)}
          onBack={() => setSelectedUnit(null)}
          onShuffle={() => {
            toggleRandomMode();
          }}
          isRandom={isRandom}
          isAutoPlay={isAutoPlay}
          onToggleAutoPlay={toggleAutoPlay}
        />
      </div>
    </div>
  )
}

export default App
