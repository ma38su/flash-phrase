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

  // ユニット選択前画面
  if (!selectedUnit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-indigo-900">Quick Response</h1>
          <div className="bg-white rounded-lg shadow-lg p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">読み込み中...</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">ユニットを選択してください</h2>
                
                {/* ランダムモード切り替え */}
                <div className="mb-6 flex items-center justify-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRandom}
                      onChange={toggleRandomMode}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-lg text-gray-700 font-medium">
                      🔀 ランダム表示
                    </span>
                  </label>
                </div>

                {/* 全ユニットランダムボタン */}
                <div className="mb-6">
                  <button
                    onClick={handleSelectAllRandom}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-lg transition duration-200 transform hover:scale-105 shadow-lg"
                  >
                    🎲 全ユニットをランダムに学習
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {units.map(unit => (
                    <button
                      key={unit}
                      onClick={() => handleSelectUnit(unit)}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 transform hover:scale-105"
                    >
                      Unit {unit}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // フレーズ表示画面
  const currentPhrase = currentPhrases[currentIndex]
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => setSelectedUnit(null)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            ← ユニット選択に戻る
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleRandomMode}
              className={`${
                isRandom ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 hover:bg-gray-500'
              } text-white font-semibold py-2 px-4 rounded-lg transition duration-200`}
              title="ランダムモード切り替え"
            >
              🔀 {isRandom ? 'ON' : 'OFF'}
            </button>
            <h1 className="text-2xl font-bold text-indigo-900">
              {selectedUnit === 'all' 
                ? `全ユニット (Unit ${currentPhrase.Unit})` 
                : `Unit ${selectedUnit}`} - {currentIndex + 1} / {currentPhrases.length}
            </h1>
          </div>
        </div>

        <div 
          onClick={handleClick}
          className="bg-white rounded-lg shadow-xl p-12 cursor-pointer hover:shadow-2xl transition duration-200 min-h-[400px] flex flex-col justify-center items-center"
        >
          <div className="text-center">
            <p className="text-3xl mb-8 text-gray-800 font-medium">
              {currentPhrase.JA}
            </p>
            
            {showEnglish && (
              <div className="mt-8 pt-8 border-t-2 border-indigo-200">
                <p className="text-2xl text-indigo-600 font-semibold">
                  {currentPhrase.EN}
                </p>
              </div>
            )}
          </div>

          <div className="mt-12 text-gray-500 text-sm">
            {!showEnglish ? 'クリックして英訳を表示' : 
             currentIndex < currentPhrases.length - 1 ? 'クリックして次へ' : 'クリックして終了'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
