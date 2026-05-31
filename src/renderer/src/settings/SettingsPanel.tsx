import { useState, useEffect } from 'react'
import ModelConfig from './ModelConfig'
import ShortcutConfig from './ShortcutConfig'
import { SUPPORTED_LANGUAGES } from '../../../shared/constants'

function SettingsPanel(): JSX.Element {
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [sourceLang, setSourceLang] = useState('英文')
  const [targetLang, setTargetLang] = useState('中文')

  useEffect(() => {
    const loadSettings = async (): Promise<void> => {
      if (window.electronAPI) {
        const savedApiKey = (await window.electronAPI.settings.get('apiKey')) as string
        const savedSourceLang = (await window.electronAPI.settings.get('sourceLang')) as string
        const savedTargetLang = (await window.electronAPI.settings.get('targetLang')) as string
        if (savedApiKey) setApiKey(savedApiKey)
        if (savedSourceLang) setSourceLang(savedSourceLang)
        if (savedTargetLang) setTargetLang(savedTargetLang)
      }
    }
    loadSettings()
  }, [])

  const handleApiKeySave = (): void => {
    window.electronAPI?.settings.set('apiKey', apiKey)
  }

  const handleSourceLangChange = (value: string): void => {
    setSourceLang(value)
    window.electronAPI?.settings.set('sourceLang', value)
  }

  const handleTargetLangChange = (value: string): void => {
    setTargetLang(value)
    window.electronAPI?.settings.set('targetLang', value)
  }

  return (
    <div className="w-full h-screen bg-gray-900 text-white overflow-auto">
      <div className="max-w-lg mx-auto p-6">
        <h1 className="text-xl font-bold mb-6">SnapAI 设置</h1>

        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-medium text-gray-400 mb-2">API Key</h2>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="输入你的 API Key"
                  className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-xs"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? '隐藏' : '显示'}
                </button>
              </div>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm text-white"
                onClick={handleApiKeySave}
              >
                保存
              </button>
            </div>
          </div>

          <ModelConfig />

          <ShortcutConfig />

          <div>
            <h2 className="text-sm font-medium text-gray-400 mb-2">语言设置</h2>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">源语言</label>
                <select
                  value={sourceLang}
                  onChange={(e) => handleSourceLangChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">目标语言</label>
                <select
                  value={targetLang}
                  onChange={(e) => handleTargetLangChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel
