import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import './App.css'

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
  // { unitNumber: 9, filepath: '/flash-phrase/unit9.csv' },
  // { unitNumber: 10, filepath: '/flash-phrase/unit10.csv' },
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 p-4 sm:p-8">
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
                <div className="mb-6">
                  <button
                    onClick={handleSelectAllRandom}
                    className="w-full bg-gradient-to-r from-indigo-700 to-pink-700 hover:from-indigo-800 hover:to-pink-800 text-white font-bold py-4 px-6 rounded-xl transition duration-200 transform hover:scale-105 shadow-lg text-lg tracking-wide"
                  >
                    🎲 全ユニットをランダムに学習
                  </button>
                </div>
                <div className="divide-y divide-gray-700">
                  {units.map(unit => (
                    <div key={unit} className="flex flex-col sm:flex-row items-center py-4 gap-2 sm:gap-4">
                      <span className="text-indigo-300 font-bold min-w-[4em] text-lg">Unit {unit}</span>
                      <div className="flex flex-row gap-2 w-full justify-center">
                        <button
                          onClick={() => { setReverseMode(false); handleSelectUnit(unit); }}
                          className="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-2 px-4 rounded-sm transition duration-200 shadow-md text-base"
                        >
                          日→英
                        </button>
                        <button
                          onClick={() => { setReverseMode(true); handleSelectUnit(unit); }}
                          className="bg-pink-700 hover:bg-pink-800 text-white font-semibold py-2 px-4 rounded-sm transition duration-200 shadow-md text-base"
                        >
                          英→日
                        </button>
                        <button
                          onClick={() => setShowUnitList(unit)}
                          className="bg-gray-700 hover:bg-gray-600 text-indigo-200 font-semibold py-2 px-4 rounded-sm transition duration-200 shadow-md text-base"
                        >
                          一覧
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => setShowUnitList(null)}
              className="bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold py-2 px-4 rounded-sm transition duration-200 mr-2 shadow-md"
            >
              ← ユニット選択に戻る
            </button>
            <h2 className="text-2xl font-bold text-gray-100">Unit {showUnitList} 一覧</h2>
          </div>
          <div className="bg-gray-800 rounded-sm shadow-2xl p-4 sm:p-8">
            <ul className="divide-y divide-gray-700">
              {unitPhrases.map((phrase, idx) => (
                <li key={idx} className="py-4 flex items-start gap-4">
                  <span className="text-indigo-300 font-bold min-w-[2.5em] text-center pt-1">{phrase.No}.</span>
                  <div className="flex flex-col flex-1">
                    <span className="text-indigo-300 text-base sm:text-lg break-words mb-1 font-semibold">{phrase.EN}</span>
                    <span className="text-gray-100 text-base sm:text-lg break-words">{phrase.JA}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // フレーズ表示画面
  const currentPhrase = currentPhrases[currentIndex]
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => setSelectedUnit(null)}
            className="bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold py-2 px-4 rounded-sm transition duration-200 shadow-md"
          >
            ← ユニット選択に戻る
          </button>
          <button
            onClick={() => {
              if (currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
                setShowEnglish(false);
              }
            }}
            disabled={currentIndex === 0}
            className={`bg-indigo-900 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-sm transition duration-200 shadow-md mr-4 ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{marginLeft: '8px'}}
          >
            ← 戻る
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleRandomMode}
              className={`${
                isRandom ? 'bg-green-700 hover:bg-green-800' : 'bg-gray-600 hover:bg-gray-700'
              } text-white font-semibold py-2 px-4 rounded-sm transition duration-200 shadow-md`}
              title="ランダムモード切り替え"
            >
              🔀 {isRandom ? 'ON' : 'OFF'}
            </button>
            <h1 className="text-2xl font-bold text-gray-100">
              {selectedUnit === 'all' 
                ? `全ユニット (Unit ${currentPhrase.Unit})` 
                : `Unit ${selectedUnit}`} - {currentIndex + 1} / {currentPhrases.length}
            </h1>
          </div>
        </div>

        <div 
          onClick={handleClick}
          className="bg-gray-800 rounded-sm shadow-2xl p-8 cursor-pointer hover:shadow-3xl transition duration-200 min-h-[400px] flex flex-col justify-center items-center"
        >
          <div className="text-center">
            {/* reverseModeによる表示切り替え */}
            {!reverseMode ? (
              <>
                <p className="text-3xl mb-8 text-gray-100 font-medium tracking-wide flex flex-col items-center">
                  {currentPhrase.JA}
                </p>
                {showEnglish && (
                  <div className="mt-8 pt-8 border-t-2 border-indigo-700 flex flex-col items-center">
                    <div className="flex items-center gap-2">
                      <p className="text-2xl text-indigo-300 font-semibold">
                        {currentPhrase.EN}
                      </p>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); speakEnglish(currentPhrase.EN); }}
                        className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm px-3 py-1 shadow-md text-base"
                        aria-label="英文を再生"
                      >
                        🔊
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-8 justify-center">
                  <p className="text-3xl text-indigo-300 font-semibold tracking-wide">
                    {currentPhrase.EN}
                  </p>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); speakEnglish(currentPhrase.EN); }}
                    className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm px-3 py-1 shadow-md text-base"
                    aria-label="英文を再生"
                  >
                    🔊
                  </button>
                </div>
                {showEnglish && (
                  <div className="mt-8 pt-8 border-t-2 border-pink-700">
                    <p className="text-2xl text-gray-100 font-medium">
                      {currentPhrase.JA}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="mt-12 text-gray-400 text-sm">
            {!showEnglish ? (reverseMode ? 'クリックして日本語訳を表示' : 'クリックして英訳を表示') : 
             currentIndex < currentPhrases.length - 1 ? 'クリックして次へ' : 'クリックして終了'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
