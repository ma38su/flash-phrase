import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import './App.css'

interface Phrase {
  Unit: string
  No: string
  EN: string
  JA: string
}

function App() {
  const [phrases, setPhrases] = useState<Phrase[]>([])
  const [units, setUnits] = useState<string[]>([])
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null)
  const [currentPhrases, setCurrentPhrases] = useState<Phrase[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showEnglish, setShowEnglish] = useState(false)

  // CSVファイルを読み込み
  useEffect(() => {
    fetch('/phrase.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse<Phrase>(csvText, {
          header: true,
          complete: (results) => {
            const data = results.data.filter(row => row.Unit && row.EN && row.JA)
            setPhrases(data)
            
            // ユニット一覧を抽出
            const uniqueUnits = Array.from(new Set(data.map(p => p.Unit))).sort()
            setUnits(uniqueUnits)
          }
        })
      })
  }, [])

  // ユニット選択時
  const handleSelectUnit = (unit: string) => {
    const unitPhrases = phrases.filter(p => p.Unit === unit)
    setCurrentPhrases(unitPhrases)
    setSelectedUnit(unit)
    setCurrentIndex(0)
    setShowEnglish(false)
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
          <h1 className="text-4xl font-bold text-center mb-8 text-indigo-900">Flash Phrase</h1>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">ユニットを選択してください</h2>
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
          <h1 className="text-2xl font-bold text-indigo-900">
            Unit {selectedUnit} - {currentIndex + 1} / {currentPhrases.length}
          </h1>
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
