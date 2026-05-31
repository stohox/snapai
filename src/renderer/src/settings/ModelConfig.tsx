import { useState, useEffect } from 'react'
import { MODEL_PRESETS } from '../../../shared/models'
import type { ModelPreset } from '../../../shared/models'

function ModelConfig(): JSX.Element {
  const [selectedPreset, setSelectedPreset] = useState<string>(MODEL_PRESETS[0].name)
  const [isCustom, setIsCustom] = useState(false)
  const [customBaseUrl, setCustomBaseUrl] = useState('')
  const [customModelId, setCustomModelId] = useState('')
  const [maxTokens, setMaxTokens] = useState(MODEL_PRESETS[0].defaultMaxTokens)

  useEffect(() => {
    const loadModelSettings = async (): Promise<void> => {
      if (window.electronAPI) {
        const savedModel = (await window.electronAPI.settings.get('modelId')) as string
        const savedBaseUrl = (await window.electronAPI.settings.get('apiBaseUrl')) as string
        const savedMaxTokens = (await window.electronAPI.settings.get('maxTokens')) as number
        if (savedModel) {
          const preset = MODEL_PRESETS.find((p) => p.modelId === savedModel)
          if (preset) {
            setSelectedPreset(preset.name)
            setMaxTokens(savedMaxTokens || preset.defaultMaxTokens)
          } else {
            setIsCustom(true)
            setCustomModelId(savedModel)
            setCustomBaseUrl(savedBaseUrl || '')
            setSelectedPreset('')
          }
        }
      }
    }
    loadModelSettings()
  }, [])

  const handlePresetChange = (name: string): void => {
    setSelectedPreset(name)
    setIsCustom(false)
    const preset = MODEL_PRESETS.find((p) => p.name === name) as ModelPreset
    setMaxTokens(preset.defaultMaxTokens)
    window.electronAPI?.settings.set('modelId', preset.modelId)
    window.electronAPI?.settings.set('apiBaseUrl', preset.apiBaseUrl)
    window.electronAPI?.settings.set('maxTokens', preset.defaultMaxTokens)
  }

  const handleCustomToggle = (): void => {
    if (!isCustom) {
      setIsCustom(true)
      setSelectedPreset('')
    } else {
      setIsCustom(false)
      setSelectedPreset(MODEL_PRESETS[0].name)
      const preset = MODEL_PRESETS[0]
      setMaxTokens(preset.defaultMaxTokens)
      window.electronAPI?.settings.set('modelId', preset.modelId)
      window.electronAPI?.settings.set('apiBaseUrl', preset.apiBaseUrl)
      window.electronAPI?.settings.set('maxTokens', preset.defaultMaxTokens)
    }
  }

  const handleCustomSave = (): void => {
    window.electronAPI?.settings.set('modelId', customModelId)
    window.electronAPI?.settings.set('apiBaseUrl', customBaseUrl)
    window.electronAPI?.settings.set('maxTokens', maxTokens)
  }

  const handleMaxTokensChange = (value: number): void => {
    setMaxTokens(value)
    window.electronAPI?.settings.set('maxTokens', value)
  }

  return (
    <div>
      <h2 className="text-sm font-medium text-gray-400 mb-2">模型设置</h2>
      <div className="space-y-3">
        <div className="flex gap-2">
          <select
            value={selectedPreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            disabled={isCustom}
            className={`flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500 ${isCustom ? 'opacity-50' : ''}`}
          >
            {MODEL_PRESETS.map((preset) => (
              <option key={preset.name} value={preset.name}>
                {preset.name}
              </option>
            ))}
          </select>
          <button
            className={`px-3 py-2 text-xs rounded border ${isCustom ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}`}
            onClick={handleCustomToggle}
          >
            {isCustom ? '预设' : '自定义'}
          </button>
        </div>

        {isCustom && (
          <div className="space-y-2">
            <input
              type="text"
              value={customBaseUrl}
              onChange={(e) => setCustomBaseUrl(e.target.value)}
              placeholder="API Base URL (e.g. https://api.openai.com/v1)"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              value={customModelId}
              onChange={(e) => setCustomModelId(e.target.value)}
              placeholder="Model ID (e.g. gpt-4o)"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm text-white"
              onClick={handleCustomSave}
            >
              保存自定义配置
            </button>
          </div>
        )}

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Max Tokens</label>
          <input
            type="number"
            value={maxTokens}
            onChange={(e) => handleMaxTokensChange(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  )
}

export default ModelConfig
