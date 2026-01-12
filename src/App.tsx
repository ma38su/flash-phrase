import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import './App.css'
import UnitSelect from './components/UnitSelect'
import PhraseCard from './components/PhraseCard'
import UnitList from './components/UnitList'
import UnitListHeader from './components/UnitListHeader'

interface Phrase {
  Unit: number
  No: string
  EN: string
  JA: string
}

interface UnitFile {
  unitNumber: number
  filepath: string
}

// 利用可能なユニットファイルのリスト
const UNIT_FILES: UnitFile[] = [
  { unitNumber: 1, filepath: '/flash-phrase/unit1.csv' },
  { unitNumber: 2, filepath: '/flash-phrase/unit2.csv' },
  { unitNumber: 3, filepath: '/flash-phrase/unit3.csv' },
  { unitNumber: 4, filepath: '/flash-phrase/unit4.csv' },
  { unitNumber: 5, filepath: '/flash-phrase/unit5.csv' },
  { unitNumber: 6, filepath: '/flash-phrase/unit6.csv' },
  { unitNumber: 7, filepath: '/flash-phrase/unit7.csv' },
  { unitNumber: 8, filepath: '/flash-phrase/unit8.csv' },
  { unitNumber: 9, filepath: '/flash-phrase/unit9.csv' },
  { unitNumber: 10, filepath: '/flash-phrase/unit10.csv' },
]

function App() {
  const [phrases, setPhrases] = useState<Phrase[]>([])
  const [units, setUnits] = useState<number[]>([])
  const [selectedUnit, setSelectedUnit] = useState<number | null | 'all'>(null)
  const [currentPhrases, setCurrentPhrases] = useState<Phrase[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showEnglish, setShowEnglish] = useState(false)
  const [isRandom, setIsRandom] = useState(false)
  const [loading, setLoading] = useState(true)

  // ユニット一覧表示用の状態
  const [showUnitList, setShowUnitList] = useState<number | null>(null);

  // 英→日モードの状態
  const [reverseMode, setReverseMode] = useState(false);

  // 一覧表示の英語・日本語表示状態
  const [showListEN, setShowListEN] = useState(true);
  const [showListJA, setShowListJA] = useState(true);

  // 複数のCSVファイルを読み込み
  useEffect(() => {
    const loadAllUnits = async () => {
      const allPhrases: Phrase[] = []
      
      for (const unitFile of UNIT_FILES) {
        try {
          const response = await fetch(unitFile.filepath)
          const csvText = await response.text()
          
          await new Promise<void>((resolve) => {
            Papa.parse<{ No: string; EN: string; JA: string }>(csvText, {
              header: true,
              complete: (results) => {
                const unitPhrases = results.data
                  .filter(row => row.EN && row.JA)
                  .map(row => ({
                    Unit: unitFile.unitNumber,
                    No: row.No,
                    EN: row.EN,
                    JA: row.JA
                  }))
                allPhrases.push(...unitPhrases)
                resolve()
              }
            })
          })
        } catch (error) {
          console.error(`Failed to load ${unitFile.filepath}:`, error)
        }
      }
      
      setPhrases(allPhrases)
      
      // ユニット一覧を抽出（数値としてソート）
      const uniqueUnits = Array.from(new Set(allPhrases.map(p => p.Unit))).sort((a, b) => a - b)
      setUnits(uniqueUnits)
      setLoading(false)
    }
    
    loadAllUnits()
  }, [])

  // ユニット選択時
  const handleSelectUnit = (unit: number | 'all') => {
    const unitPhrases = unit === 'all' 
      ? phrases 
      : phrases.filter(p => p.Unit === unit)
    const orderedPhrases = isRandom 
      ? [...unitPhrases].sort(() => Math.random() - 0.5)
      : unitPhrases
    setCurrentPhrases(orderedPhrases)
    setSelectedUnit(unit)
    setCurrentIndex(0)
    setShowEnglish(false)
  }

  // 全フレーズをランダムに選択
  const handleSelectAllRandom = () => {
    const shuffledPhrases = [...phrases].sort(() => Math.random() - 0.5)
    setCurrentPhrases(shuffledPhrases)
    setSelectedUnit('all')
    setCurrentIndex(0)
    setShowEnglish(false)
  }

  // ランダムモード切り替え
  const toggleRandomMode = () => {
    const newRandomMode = !isRandom
    setIsRandom(newRandomMode)
    
    // すでにユニット選択済みの場合は再シャッフル
    if (selectedUnit) {
      const unitPhrases = selectedUnit === 'all'
        ? phrases
        : phrases.filter(p => p.Unit === selectedUnit)
      const orderedPhrases = newRandomMode
        ? [...unitPhrases].sort(() => Math.random() - 0.5)
        : unitPhrases
      setCurrentPhrases(orderedPhrases)
      setCurrentIndex(0)
      setShowEnglish(false)
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

  // 英文音声再生（en-USの自然な声を優先）
  const speakEnglish = (text: string) => {
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      const voices = synth.getVoices();
      // Google, Microsoft, Appleなどのen-US自然音声を優先
      const preferred = voices.find(v => v.lang === 'en-US' && /Google|Microsoft|Apple|Samantha|Daniel|Karen|Moira|Fiona/i.test(v.name));
      const fallback = voices.find(v => v.lang === 'en-US');
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      utter.voice = preferred || fallback || voices[0];
      synth.speak(utter);
    }
  }

  // ユニット選択前画面
  if (!selectedUnit && showUnitList === null) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-700 p-4 sm:p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-100 tracking-wide drop-shadow-lg">Quick Response</h1>
          <div className="bg-gray-800 rounded-sm shadow-2xl p-4 sm:p-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto"></div>
                <p className="mt-4 text-gray-400">読み込み中...</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6 text-gray-200">ユニットを選択してください</h2>
                <div className="mb-6 flex items-center justify-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRandom}
                      onChange={toggleRandomMode}
                      className="w-5 h-5 text-indigo-400 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-lg text-gray-300 font-medium">
                      🔀 ランダム表示
                    </span>
                  </label>
                </div>
                <UnitSelect
                  units={units}
                  onSelectUnit={(unit: number) => { setReverseMode(false); handleSelectUnit(unit); }}
                  onSelectReverseUnit={(unit: number) => { setReverseMode(true); handleSelectUnit(unit); }}
                  onShowUnitList={setShowUnitList}
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
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-700 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <UnitListHeader
            unit={showUnitList}
            onBack={() => setShowUnitList(null)}
            onPrev={() => {
              const idx = units.indexOf(showUnitList);
              if (idx > 0) setShowUnitList(units[idx - 1]);
            }}
            onNext={() => {
              const idx = units.indexOf(showUnitList);
              if (idx < units.length - 1) setShowUnitList(units[idx + 1]);
            }}
            disablePrev={units.indexOf(showUnitList) <= 0}
            disableNext={units.indexOf(showUnitList) >= units.length - 1}
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
            onPrev={() => {
              const idx = units.indexOf(showUnitList);
              if (idx > 0) setShowUnitList(units[idx - 1]);
            }}
            onNext={() => {
              const idx = units.indexOf(showUnitList);
              if (idx < units.length - 1) setShowUnitList(units[idx + 1]);
            }}
            disablePrev={units.indexOf(showUnitList) <= 0}
            disableNext={units.indexOf(showUnitList) >= units.length - 1}
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
          unitLabel={selectedUnit === 'all' ? '全ユニット' : `Unit ${selectedUnit}`}
          onBack={() => setSelectedUnit(null)}
          onShuffle={() => {
            if (selectedUnit === 'all') {
              handleSelectAllRandom();
            } else if (selectedUnit !== null) {
              handleSelectUnit(selectedUnit);
            }
          }}
        />
      </div>
    </div>
  )
}

export default App
