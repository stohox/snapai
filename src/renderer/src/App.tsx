import { useState, useEffect } from 'react'
import CaptureOverlay from './capture/CaptureOverlay'
import ResultWindow from './result/ResultWindow'
import SettingsPanel from './settings/SettingsPanel'

type Route = 'capture' | 'result' | 'settings' | 'about' | 'onboarding'

function getRoute(): Route {
  const hash = window.location.hash.replace('#/', '')
  return (hash as Route) || 'settings'
}

function App(): JSX.Element {
  const [route, setRoute] = useState<Route>(getRoute())

  useEffect(() => {
    const handleHashChange = (): void => {
      setRoute(getRoute())
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  switch (route) {
    case 'capture':
      return <CaptureOverlay />
    case 'result':
      return <ResultWindow />
    case 'settings':
      return <SettingsPanel />
    case 'onboarding':
      return (
        <div className="flex items-center justify-center w-full h-screen bg-gray-900 text-white">
          <div className="text-center max-w-md">
            <h1 className="text-3xl font-bold mb-4">欢迎使用 SnapAI</h1>
            <p className="text-gray-400 mb-6">智能截图工具，支持 AI 分析和翻译</p>
            <button
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium"
              onClick={() => {
                window.location.hash = '#/settings'
              }}
            >
              开始设置
            </button>
          </div>
        </div>
      )
    case 'about':
      return (
        <div className="flex items-center justify-center w-full h-screen bg-gray-900 text-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">SnapAI</h1>
            <p className="text-gray-400">v1.0.0</p>
            <p className="text-gray-400 mt-2">智能截图工具</p>
          </div>
        </div>
      )
    default:
      return <SettingsPanel />
  }
}

export default App
