import { useState, useEffect, useCallback } from 'react'
import { DEFAULT_SHORTCUT_KEY } from '../../../shared/constants'

function ShortcutConfig(): JSX.Element {
  const [shortcutKey, setShortcutKey] = useState(DEFAULT_SHORTCUT_KEY)
  const [isRecording, setIsRecording] = useState(false)
  const [conflictMessage, setConflictMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadShortcut = async (): Promise<void> => {
      if (window.electronAPI) {
        const saved = (await window.electronAPI.settings.get('shortcutKey')) as string
        if (saved) setShortcutKey(saved)
      }
    }
    loadShortcut()
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent): void => {
      if (!isRecording) return

      e.preventDefault()
      e.stopPropagation()

      const parts: string[] = []
      if (e.ctrlKey || e.metaKey) parts.push('CommandOrControl')
      if (e.shiftKey) parts.push('Shift')
      if (e.altKey) parts.push('Alt')

      const key = e.key
      if (!['Control', 'Shift', 'Alt', 'Meta'].includes(key)) {
        parts.push(key.length === 1 ? key.toUpperCase() : key)
      }

      if (parts.length > 1) {
        const newShortcut = parts.join('+')
        setShortcutKey(newShortcut)
        setIsRecording(false)
        setConflictMessage(null)
        window.electronAPI?.settings.set('shortcutKey', newShortcut)
      }
    },
    [isRecording]
  )

  useEffect(() => {
    if (isRecording) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isRecording, handleKeyDown])

  const handleReset = (): void => {
    setShortcutKey(DEFAULT_SHORTCUT_KEY)
    setConflictMessage(null)
    window.electronAPI?.settings.set('shortcutKey', DEFAULT_SHORTCUT_KEY)
  }

  const displayKey = shortcutKey
    .replace('CommandOrControl', 'Ctrl')
    .split('+')
    .join(' + ')

  return (
    <div>
      <h2 className="text-sm font-medium text-gray-400 mb-2">快捷键</h2>
      <div className="flex items-center gap-3">
        <div className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white font-mono">
          {displayKey}
        </div>
        <button
          className={`px-3 py-2 text-xs rounded ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          onClick={() => {
            setIsRecording(!isRecording)
            setConflictMessage(null)
          }}
        >
          {isRecording ? '按下新快捷键...' : '录制新快捷键'}
        </button>
        <button
          className="px-3 py-2 text-xs rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
          onClick={handleReset}
        >
          重置
        </button>
      </div>
      {conflictMessage && (
        <p className="text-xs text-red-400 mt-1">{conflictMessage}</p>
      )}
    </div>
  )
}

export default ShortcutConfig
