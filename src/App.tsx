import { useState, useEffect, useCallback } from 'react'
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
import { useAutoPlay } from './hooks/useAutoPlay'
import { useURLManager } from './hooks/useURLManager'
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

  // 設定ページの表示状態
  const [showSettings, setShowSettings] = useState(false);

  // 自動再生フック
  const { startAutoPlay, stopAutoPlay, autoPlayActiveRef } = useAutoPlay({
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
  });

  // URL管理フック
  const { parseURL } = useURLManager({
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
  });

  // URLから状態を復元する関数（動的読み込み対応）
  const restoreStateFromURL = useCallback(async () => {
    const urlState = parseURL();
    if (!urlState || urlState.type === 'home') {
      return;
    }

    if (urlState.type === 'list' && urlState.unit !== undefined && typeof urlState.unit === 'number') {
      // 一覧表示の表示設定を復元
      if (urlState.showListEN !== undefined) setShowListEN(urlState.showListEN);
      if (urlState.showListJA !== undefined) setShowListJA(urlState.showListJA);
      
      // データを読み込んでから一覧表示
      await handleShowUnitList(urlState.unit);
    } else if (urlState.type === 'phrase' && urlState.unit !== undefined) {
      // ランダムモードの復元
      if (urlState.isRandom) {
        setIsRandom(true);
      }
      
      // フレーズ表示モード
      const isReverse = urlState.mode === 'en-ja';
      setReverseMode(isReverse);
      
      // データを読み込んでからフレーズ表示
      await handleSelectUnit(urlState.unit);
      if (urlState.index !== undefined) setCurrentIndex(urlState.index);
      if (urlState.showEnglish !== undefined) setShowEnglish(urlState.showEnglish);
    }
  }, [parseURL]);

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
  }, [restoreStateFromURL]);

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

  // isAutoPlayがtrueになったら自動再生シーケンスを開始
  useEffect(() => {
    if (isAutoPlay && selectedUnit !== null && showUnitList === null && !autoPlayActiveRef.current) {
      startAutoPlay(currentIndex);
    } else if (!isAutoPlay) {
      stopAutoPlay();
    }
  }, [isAutoPlay, selectedUnit, showUnitList, currentIndex, startAutoPlay, stopAutoPlay]);

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
