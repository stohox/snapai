import { useEditorStore } from '../store/editorStore'

const PRESET_COLORS = [
  '#FF0000', '#FF6600', '#FFCC00', '#00CC00', '#0066FF',
  '#9900FF', '#FF0099', '#000000', '#FFFFFF', '#888888'
]

function ColorPicker(): JSX.Element {
  const { color, setColor } = useEditorStore()

  return (
    <div className="flex items-center gap-1">
      {PRESET_COLORS.map((c) => (
        <button
          key={c}
          className={`w-5 h-5 rounded-sm border ${color === c ? 'border-white ring-1 ring-white' : 'border-gray-500'}`}
          style={{ backgroundColor: c }}
          onClick={() => setColor(c)}
        />
      ))}
      <input
        type="text"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="w-16 h-5 text-[10px] bg-gray-700 text-white border border-gray-500 rounded px-1"
      />
    </div>
  )
}

export default ColorPicker
