import { useEditorStore } from '../store/editorStore'

const PRESET_WIDTHS = [1, 2, 3, 5, 8]

function StrokeWidthSelector(): JSX.Element {
  const { strokeWidth, setStrokeWidth } = useEditorStore()

  return (
    <div className="flex items-center gap-1">
      {PRESET_WIDTHS.map((w) => (
        <button
          key={w}
          className={`w-6 h-6 flex items-center justify-center rounded ${strokeWidth === w ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          onClick={() => setStrokeWidth(w)}
        >
          <div
            className="rounded-full bg-white"
            style={{ width: Math.max(2, w), height: Math.max(2, w) }}
          />
        </button>
      ))}
    </div>
  )
}

export default StrokeWidthSelector
