import { ipcRenderer } from 'electron'
import { analyzeImage } from './ai-service'
import { translateImage } from './translate-service'
import { IPC_CHANNELS } from '../shared/types'
import type { AIAnalyzeParams, AITranslateParams } from '../shared/types'

ipcRenderer.on(IPC_CHANNELS.AI_ANALYZE, async (_event, params: AIAnalyzeParams) => {
  try {
    const result = await analyzeImage(params.imageBase64, params.config)
    ipcRenderer.send(IPC_CHANNELS.AI_RESULT, { type: 'analyze', data: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    ipcRenderer.send(IPC_CHANNELS.AI_ERROR, { type: 'analyze', message })
  }
})

ipcRenderer.on(IPC_CHANNELS.AI_TRANSLATE, async (_event, params: AITranslateParams) => {
  try {
    const result = await translateImage(
      params.imageBase64,
      params.sourceLang,
      params.targetLang,
      params.config
    )
    ipcRenderer.send(IPC_CHANNELS.AI_RESULT, { type: 'translate', data: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    ipcRenderer.send(IPC_CHANNELS.AI_ERROR, { type: 'translate', message })
  }
})

ipcRenderer.on(IPC_CHANNELS.AI_CANCEL, () => {
  const { cancelRequest } = require('./ai-service')
  cancelRequest()
})
