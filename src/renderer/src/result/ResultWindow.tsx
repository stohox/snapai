import { useState } from 'react'
import OcrResult from './OcrResult'
import TranslateResult from './TranslateResult'

type ResultType = 'analyze' | 'translate' | null

function ResultWindow(): JSX.Element {
  const [isPinned, setIsPinned] = useState(false)
  const [resultType, setResultType] = useState<ResultType>('analyze')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analyzeResult, setAnalyzeResult] = useState<string>('')
  const [translateResult, setTranslateResult] = useState<{
    original: string
    translated: string
  } | null>(null)

  const handlePinToggle = (): void => {
    setIsPinned(!isPinned)
  }

  const handleCopy = (): void => {
    const text =
      resultType === 'analyze'
        ? analyzeResult
        : translateResult
          ? `${translateResult.original}\n---\n${translateResult.translated}`
          : ''
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex flex-col w-full h-full bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
      <div
        className="flex items-center justify-between px-3 py-2 bg-gray-800 cursor-move"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <span className="text-sm text-gray-300">
          {resultType === 'analyze' ? 'AI 识图结果' : 'OCR 翻译结果'}
        </span>
        <div className="flex gap-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button
            className={`px-2 py-0.5 text-xs rounded ${isPinned ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={handlePinToggle}
          >
            {isPinned ? '📌 已固定' : '固定'}
          </button>
          <button
            className="px-2 py-0.5 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
            onClick={handleCopy}
          >
            复制
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400 text-sm">分析中...</div>
          </div>
        )}
        {error && (
          <div className="text-red-400 text-sm p-2 bg-red-900/20 rounded">{error}</div>
        )}
        {!isLoading && !error && resultType === 'analyze' && (
          <OcrResult content={analyzeResult} />
        )}
        {!isLoading && !error && resultType === 'translate' && translateResult && (
          <TranslateResult
            original={translateResult.original}
            translated={translateResult.translated}
          />
        )}
      </div>
    </div>
  )
}

export default ResultWindow
