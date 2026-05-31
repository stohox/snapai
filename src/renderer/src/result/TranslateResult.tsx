interface TranslateResultProps {
  original: string
  translated: string
}

function TranslateResult({ original, translated }: TranslateResultProps): JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="text-xs text-gray-500 mb-1">原文</div>
        <div className="text-sm text-gray-300 bg-gray-800 rounded p-2 whitespace-pre-wrap">
          {original || '无原文内容'}
        </div>
      </div>
      <div className="border-t border-gray-700" />
      <div>
        <div className="text-xs text-gray-500 mb-1">译文</div>
        <div className="text-sm text-white bg-gray-800 rounded p-2 whitespace-pre-wrap">
          {translated || '无翻译内容'}
        </div>
      </div>
    </div>
  )
}

export default TranslateResult
