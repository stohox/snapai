import { create } from 'zustand'
import type { Annotation, EditorTool } from '../../shared/types'

interface EditorState {
  tool: EditorTool
  color: string
  strokeWidth: number
  fontSize: number
  annotations: Annotation[]
  history: Annotation[][]
  historyIndex: number
  sequenceNumber: number

  setTool: (tool: EditorTool) => void
  setColor: (color: string) => void
  setStrokeWidth: (width: number) => void
  setFontSize: (size: number) => void
  addAnnotation: (annotation: Annotation) => void
  undo: () => void
  redo: () => void
  nextSequenceNumber: () => number
  clearAnnotations: () => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  tool: 'select',
  color: '#FF0000',
  strokeWidth: 2,
  fontSize: 20,
  annotations: [],
  history: [[]],
  historyIndex: 0,
  sequenceNumber: 1,

  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
  setFontSize: (fontSize) => set({ fontSize }),

  addAnnotation: (annotation) => {
    const { annotations, history, historyIndex } = get()
    const newAnnotations = [...annotations, annotation]
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newAnnotations)
    set({
      annotations: newAnnotations,
      history: newHistory,
      historyIndex: newHistory.length - 1
    })
  },

  undo: () => {
    const { historyIndex, history } = get()
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      set({
        historyIndex: newIndex,
        annotations: history[newIndex]
      })
    }
  },

  redo: () => {
    const { historyIndex, history } = get()
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      set({
        historyIndex: newIndex,
        annotations: history[newIndex]
      })
    }
  },

  nextSequenceNumber: () => {
    const { sequenceNumber } = get()
    set({ sequenceNumber: sequenceNumber + 1 })
    return sequenceNumber
  },

  clearAnnotations: () => {
    set({
      annotations: [],
      history: [[]],
      historyIndex: 0,
      sequenceNumber: 1
    })
  }
}))
