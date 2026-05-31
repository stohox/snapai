import { useState, useEffect } from 'react'
import type { SelectionArea, AIConfig } from '../../../shared/types'

interface ToolbarProps {
  selection: SelectionArea
  getCroppedImage: () => string
}

function Toolbar({ selection, getCroppedImage }: ToolbarProps): JSX.Element {
  const [hasApiKey, setHasApiKey] = useState(false)
  const [config, setConfig] = useState<AIConfig | null>(null)
  const [sourceLang, setSourceLang] = useState('英文')
  const [targetLang, setTargetLang] = useState('中文')

  useEffect(() => {
    const loadSettings = async (): Promise<void> => {
      if (!window.electronAPI) return
      const apiKey = (await window.electronAPI.settings.get('apiKey')) as string
      const apiBaseUrl =
        ((await window.electronAPI.settings.get('apiBaseUrl')) as string) ||
        'https://api.openai.com/v1'
      const modelId = ((await window.electronAPI.settings.get('modelId')) as string) || 'gpt-4o'
      const maxTokens = ((await window.electronAPI.settings.get('maxTokens')) as number) || 4096
      const sLang = ((await window.electronAPI.settings.get('sourceLang')) as string) || '英文'
      const tLang = ((await window.electronAPI.settings.get('targetLang')) as string) || '中文'

      setHasApiKey(!!apiKey)
      setConfig({ apiKey, apiBaseUrl, modelId, maxTokens })
      setSourceLang(sLang)
      setTargetLang(tLang)
    }
    loadSettings()
  }, [])

  const handleAnalyze = (): void => {
    const imageBase64 = getCroppedImage()
    if (!imageBase64 || !config) return
    window.electronAPI.ai.analyze({ imageBase64, config })
  }

  const handleTranslate = (): void => {
    const imageBase64 = getCroppedImage()
    if (!imageBase64 || !config) return
    window.electronAPI.ai.translate({ imageBase64, sourceLang, targetLang, config })
  }

  const handleCopy = (): void => {
    const imageBase64 = getCroppedImage()
    if (!imageBase64) return
    window.electronAPI.capture.copyImage(imageBase64)
  }

  const handleSave = (): void => {
    const imageBase64 = getCroppedImage()
    if (!imageBase64) return
    window.electronAPI.capture.saveImage(imageBase64)
  }

  const toolbarWidth = 280
  const toolbarHeight = 40

  let toolbarTop = selection.y + selection.height + 8
  let toolbarLeft = selection.x + selection.width / 2 - toolbarWidth / 2

  if (toolbarTop + toolbarHeight > window.innerHeight) {
    toolbarTop = selection.y - toolbarHeight - 8
  }

  if (toolbarLeft < 0) {
    toolbarLeft = 0
  }

  if (toolbarLeft + toolbarWidth > window.innerWidth) {
    toolbarLeft = window.innerWidth - toolbarWidth
  }

  return (
    <div
      className="absolute flex gap-1 bg-gray-800 rounded-lg px-2 py-1.5 shadow-lg"
      style={{
        top: toolbarTop,
        left: toolbarLeft
      }}
    >
      <button
        className="px-3 py-1 text-xs text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!hasApiKey}
        onClick={handleAnalyze}
      >
        AI识图
      </button>
      <button
        className="px-3 py-1 text-xs text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!hasApiKey}
        onClick={handleTranslate}
      >
        OCR翻译
      </button>
      <button
        className="px-3 py-1 text-xs text-white rounded hover:bg-gray-700"
        onClick={handleCopy}
      >
        复制图片
      </button>
      <button
        className="px-3 py-1 text-xs text-white rounded hover:bg-gray-700"
        onClick={handleSave}
      >
        保存图片
      </button>
    </div>
  )
}

export default Toolbar
