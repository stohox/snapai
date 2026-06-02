import { useState, useEffect } from 'react'
import { useEditorStore } from '../store/editorStore'
import ColorPicker from './ColorPicker'
import StrokeWidthSelector from './StrokeWidthSelector'
import type { SelectionArea, AIConfig, EditorTool } from '../../../shared/types'

interface ToolPanelProps {
  selection: SelectionArea
  getCroppedImage: () => string
  onPinImage: (imageBase64: string) => void
}

const TOOLS: { id: EditorTool; label: string; icon: string }[] = [
  { id: 'select', label: '选择', icon: '⊹' },
  { id: 'rect', label: '矩形', icon: '▭' },
  { id: 'ellipse', label: '椭圆', icon: '◯' },
  { id: 'arrow', label: '箭头', icon: '→' },
  { id: 'pen', label: '画笔', icon: '✎' },
  { id: 'number', label: '序号', icon: '①' },
  { id: 'text', label: '文字', icon: 'T' },
  { id: 'mosaic', label: '马赛克', icon: '▦' }
]

function ToolPanel({ selection, getCroppedImage, onPinImage }: ToolPanelProps): JSX.Element {
  const { tool, setTool } = useEditorStore()
  const [hasApiKey, setHasApiKey] = useState(false)
  const [config, setConfig] = useState<AIConfig | null>(null)
  const [sourceLang, setSourceLang] = useState('英文')
  const [targetLang, setTargetLang] = useState('中文')
  const [showColorPicker, setShowColorPicker] = useState(false)

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

  const handlePin = (): void => {
    const imageBase64 = getCroppedImage()
    if (!imageBase64) return
    onPinImage(imageBase64)
  }

  const panelWidth = 420
  const panelHeight = 80

  let panelTop = selection.y + selection.height + 8
  let panelLeft = selection.x + selection.width / 2 - panelWidth / 2

  if (panelTop + panelHeight > window.innerHeight) {
    panelTop = selection.y - panelHeight - 8
  }

  if (panelLeft < 0) {
    panelLeft = 0
  }

  if (panelLeft + panelWidth > window.innerWidth) {
    panelLeft = window.innerWidth - panelWidth
  }

  return (
    <div
      className="absolute flex flex-col gap-1 rounded-xl px-2 py-1.5 shadow-card border border-white/[0.08]"
      style={{
        top: panelTop,
        left: panelLeft,
        background: 'rgba(15, 15, 24, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
    >
      <div className="flex items-center gap-0.5">
        {TOOLS.map(({ id, label, icon }) => (
          <button
            key={id}
            className={`w-7 h-7 flex items-center justify-center text-sm rounded-lg transition-all duration-150 ${
              tool === id
                ? 'bg-brand-500 text-white shadow-glow'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.06]'
            }`}
            title={label}
            onClick={() => setTool(id)}
          >
            {icon}
          </button>
        ))}

        <div className="w-px h-5 bg-white/[0.08] mx-1" />

        <button
          className="w-7 h-7 flex items-center justify-center text-sm text-gray-400 rounded-lg hover:text-gray-200 hover:bg-white/[0.06] transition-colors"
          title="颜色/粗细"
          onClick={() => setShowColorPicker(!showColorPicker)}
        >
          🎨
        </button>

        <div className="w-px h-5 bg-white/[0.08] mx-1" />

        <button
          className="px-2.5 h-7 text-[11px] text-gray-300 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors font-medium"
          onClick={handleCopy}
        >
          复制
        </button>
        <button
          className="px-2.5 h-7 text-[11px] text-gray-300 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors font-medium"
          onClick={handleSave}
        >
          保存
        </button>
        <button
          className="px-2.5 h-7 text-[11px] text-gray-300 rounded-lg hover:text-white hover:bg-brand-500/20 hover:text-brand-300 transition-colors font-medium"
          onClick={handlePin}
        >
          钉图
        </button>
        <button
          className="px-2.5 h-7 text-[11px] text-gray-300 rounded-lg hover:text-white hover:bg-brand-500/20 hover:text-brand-300 transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-300"
          disabled={!hasApiKey}
          onClick={handleAnalyze}
        >
          AI识图
        </button>
        <button
          className="px-2.5 h-7 text-[11px] text-gray-300 rounded-lg hover:text-white hover:bg-brand-500/20 hover:text-brand-300 transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-300"
          disabled={!hasApiKey}
          onClick={handleTranslate}
        >
          翻译
        </button>
      </div>

      {showColorPicker && (
        <div
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-white/[0.06]"
          style={{ background: 'rgba(15, 15, 24, 0.95)' }}
        >
          <ColorPicker />
          <div className="w-px h-5 bg-white/[0.08]" />
          <StrokeWidthSelector />
        </div>
      )}
    </div>
  )
}

export default ToolPanel
