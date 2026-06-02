import { useState, useEffect } from 'react'
import OcrResult from './OcrResult'
import TranslateResult from './TranslateResult'
import type { AIResultPayload, AIErrorPayload } from '../../../shared/types'

type ResultType = 'analyze' | 'translate' | null

function ResultWindow(): JSX.Element {
  const [isPinned, setIsPinned] = useState(false)
  const [resultType, setResultType] = useState<ResultType>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analyzeResult, setAnalyzeResult] = useState<string>('')
  const [translateResult, setTranslateResult] = useState<{
    original: string
    translated: string
  } | null>(null)

  useEffect(() => {
    const unsubLoading = window.electronAPI.ai.onLoading((loading: boolean) => {
      setIsLoading(loading)
      if (loading) {
        setError(null)
      }
    })

    const unsubResult = window.electronAPI.ai.onResult((result: AIResultPayload) => {
      setIsLoading(false)
      setResultType(result.type)
      setError(null)

      if (result.type === 'analyze') {
        setAnalyzeResult(result.data as string)
      } else if (result.type === 'translate') {
        setTranslateResult(result.data as { original: string; translated: string })
      }
    })

    const unsubError = window.electronAPI.ai.onError((err: AIErrorPayload) => {
      setIsLoading(false)
      setResultType(err.type)
      setError(err.message)
    })

    return () => {
      unsubLoading()
      unsubResult()
      unsubError()
    }
  }, [])

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

  const handleClose = (): void => {
    window.close()
  }

  return (
    <div
      className="flex flex-col w-full h-full rounded-xl overflow-hidden border border-white/[0.08]"
      style={{
        background: 'rgba(15, 15, 24, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
    >
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]"
        style={{
          background: 'rgba(30, 30, 50, 0.8)',
          cursor: 'move',
          WebkitAppRegion: 'drag'
        } as React.CSSProperties}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-500 shadow-glow" />
          <span className="text-sm text-gray-200 font-medium">
            {resultType === 'translate' ? 'OCR 翻译结果' : 'AI 识图结果'}
          </span>
        </div>
        <div
          className="flex gap-1"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
              isPinned
                ? 'bg-brand-500/20 text-brand-300'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.06]'
            }`}
            onClick={handlePinToggle}
          >
            {isPinned ? '📌 已固定' : '固定'}
          </button>
          <button
            className="px-2.5 py-1 text-xs text-gray-400 rounded-lg hover:text-gray-200 hover:bg-white/[0.06] transition-colors font-medium"
            onClick={handleCopy}
          >
            复制
          </button>
          <button
            className="px-2.5 py-1 text-xs text-gray-400 rounded-lg hover:text-red-400 hover:bg-red-500/10 transition-colors font-medium"
            onClick={handleClose}
            title="关闭窗口"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        {isLoading && (
          <div className="flex items-center justify-center h-full gap-2">
            <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-400 text-sm">分析中...</span>
          </div>
        )}
        {error && (
          <div className="text-red-400 text-sm p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            {error}
          </div>
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
