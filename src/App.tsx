import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import UnitSelect from './components/UnitSelect'
import PhraseCard from './components/PhraseCard'
import UnitList from './components/UnitList'
import UnitListHeader from './components/UnitListHeader'
import PageContainer from './components/PageContainer'
import SettingsPage from './components/SettingsPage'
import type { Phrase, SelectedUnit } from './types'
import { useCSVLoader } from './hooks/useCSVLoader'
import { useSpeech } from './hooks/useSpeech'
import { useSettings } from './hooks/useSettings'
import { useVoices } from './hooks/useVoices'
import { shufflePhrases, filterPhrasesByUnit, getUnitLabel } from './utils/phraseUtils'

function App() {
  const { units, loadUnit, isUnitLoading, getLoadedUnit } = useCSVLoader();
  const [originalPhrases, setOriginalPhrases] = useState<Phrase[]>([]);
  const [loading, setLoading] = useState(false);
  const { settings, updateSettings, resetSettings } = useSettings();
  const { speak, cancelSpeech } = useSpeech(settings);
  const { englishVoices, japaneseVoices } = useVoices();
  
  const [selectedUnit, setSelectedUnit] = useState<SelectedUnit>(null)
  const [displayPhrases, setDisplayPhrases] = useState<Phrase[]>([])
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
  const autoPlayActiveRef = useRef(false); // 自動再生シーケンスが進行中かどうか
  const currentIndexRef = useRef(0); // 自動再生用の現在インデックス
  const settingsRef = useRef(settings); // 自動再生用の設定参照

  // 設定ページの表示状態
  const [showSettings, setShowSettings] = useState(false);

  // settingsの変更を追跡
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

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
      // 自動再生中はハッシュ変更による状態復元をスキップ
      if (autoPlayActiveRef.current) return;
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
    // 自動再生中はURL更新をスキップ（頻繁な更新を避ける）
    if (loading || selectedUnit === null || showUnitList !== null || autoPlayActiveRef.current) return;
    
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
      setDisplayPhrases(orderedPhrases);
      setOriginalPhrases(allPhrases); // シャッフル前の元データを保持
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
      const unitPhrases = filterPhrasesByUnit(originalPhrases, selectedUnit);
      const orderedPhrases = newRandomMode
        ? shufflePhrases(unitPhrases)
        : unitPhrases;
      setDisplayPhrases(orderedPhrases);
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
      if (currentIndex < displayPhrases.length - 1) {
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
      setIsAutoPlay(false);
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
    const firstLang = reverseMode ? 'en' : 'ja';
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
        const secondLang = reverseMode ? 'ja' : 'en';
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
              setIsAutoPlay(false);
              setSelectedUnit(null);
              setCurrentIndex(0);
              setShowEnglish(false);
              autoPlayActiveRef.current = false;
            }
          }, settingsRef.current.delayBeforeNext);
        });
      }, settingsRef.current.delayBeforeAnswer);
    });
  }, [displayPhrases, reverseMode, speak]);
  useEffect(() => {
    if (isAutoPlay && selectedUnit !== null && showUnitList === null && !autoPlayActiveRef.current) {
      autoPlayActiveRef.current = true;
      runAutoPlaySequence(currentIndex);
    } else if (!isAutoPlay) {
      stopAutoPlay();
    }
  }, [isAutoPlay]);

  // 自動再生中に画面を離れたら停止
  useEffect(() => {
    if (selectedUnit === null || showUnitList !== null) {
      stopAutoPlay();
      setIsAutoPlay(false);
    }
  }, [selectedUnit, showUnitList, stopAutoPlay]);


  // 設定ページ
  if (showSettings) {
    return (
      <SettingsPage
        settings={settings}
        onUpdateSettings={updateSettings}
        onResetSettings={resetSettings}
        onBack={() => setShowSettings(false)}
        onTestSpeech={(language) => {
          // テスト前に現在の音声を確実に停止
          cancelSpeech();
          // 少し待ってから再生（Chromeのハング防止）
          setTimeout(() => {
            const testText = language === 'en' 
              ? 'This is a test of the voice type and speech speed settings.'
              : 'これは音声の種類と読み上げ速度のテストです。';
            speak(testText, language);
          }, 100);
        }}
        englishVoices={englishVoices}
        japaneseVoices={japaneseVoices}
      />
    );
  }

  // ユニット選択前画面
  if (!selectedUnit && showUnitList === null) {
    return (
      <PageContainer maxWidth="3xl" showTitle>
        <div className="bg-gray-800 rounded-sm shadow-2xl p-4 sm:p-8">
          {loading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-10 sm:h-12 w-10 sm:w-12 border-b-2 border-gray-400 mx-auto"></div>
              <p className="mt-3 sm:mt-4 text-gray-400 text-sm sm:text-base">読み込み中...</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-200 text-center">ユニットを選択してください</h2>
              <div className="mb-4 sm:mb-6 flex items-center justify-center gap-4 sm:gap-6">
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
                <button
                  onClick={() => setShowSettings(true)}
                  className="text-base sm:text-lg text-gray-400 hover:text-gray-200 font-medium transition"
                >
                  ⚙️ 音声設定
                </button>
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
      </PageContainer>
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
      <PageContainer maxWidth="2xl">
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
      </PageContainer>
    )
  }

  // フレーズ表示画面
  const currentPhrase = displayPhrases[currentIndex]
  
  return (
    <PageContainer maxWidth="xl">
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
        total={displayPhrases.length}
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
    </PageContainer>
  )
}

export default App
