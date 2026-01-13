import { useState, useEffect } from 'react'
import './App.css'
import UnitSelect from './components/UnitSelect'
import PhraseCard from './components/PhraseCard'
import UnitList from './components/UnitList'
import UnitListHeader from './components/UnitListHeader'
import type { Phrase, SelectedUnit } from './types'
import { useCSVLoader } from './hooks/useCSVLoader'
import { useSpeech } from './hooks/useSpeech'
import { shufflePhrases, filterPhrasesByUnit, getUnitLabel } from './utils/phraseUtils'

function App() {
  const { phrases, units, loading } = useCSVLoader();
  const { speakEnglish } = useSpeech();
  
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

  // URLから状態を復元する関数
  const restoreStateFromURL = () => {
    if (phrases.length === 0) {
      // フレーズがまだ読み込まれていない場合は処理しない
      return;
    }
    
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
        const unitPhrases = filterPhrasesByUnit(phrases, unit);
        const randomParam = searchParams.get('random');
        const orderedPhrases = randomParam === 'true'
          ? shufflePhrases(unitPhrases)
          : unitPhrases;
        
        setCurrentPhrases(orderedPhrases);
        setSelectedUnit(unit);
        setCurrentIndex(Math.min(index, orderedPhrases.length - 1));
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

  // phrasesが読み込まれた後にURL状態を復元
  useEffect(() => {
    if (phrases.length > 0 && !loading) {
      restoreStateFromURL();
    }
  }, [phrases, loading]);

  // ブラウザの戻る/進むボタンとハッシュ変更に対応
  useEffect(() => {
    const handleHashChange = () => {
      if (phrases.length > 0) {
        restoreStateFromURL();
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [phrases]);

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
  const handleSelectUnit = (unit: SelectedUnit) => {
    if (unit === null) return;
    
    const unitPhrases = filterPhrasesByUnit(phrases, unit);
    const orderedPhrases = isRandom 
      ? shufflePhrases(unitPhrases)
      : unitPhrases;
    setCurrentPhrases(orderedPhrases);
    setSelectedUnit(unit);
    setCurrentIndex(0);
    setShowEnglish(false);
    setShowUnitList(null);
  }

  // ユニット一覧表示への切り替え
  const handleShowUnitList = (unit: number) => {
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
    const unitPhrases = phrases.filter(p => p.Unit === showUnitList);
    const currentUnitIndex = units.indexOf(showUnitList);
    
    const handleUnitNavigation = (direction: 'prev' | 'next') => {
      const newIndex = direction === 'prev' 
        ? Math.max(0, currentUnitIndex - 1)
        : Math.min(units.length - 1, currentUnitIndex + 1);
      setShowUnitList(units[newIndex]);
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
            onSpeak={speakEnglish}
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
          onSpeak={speakEnglish}
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
        />
      </div>
    </div>
  )
}

export default App
