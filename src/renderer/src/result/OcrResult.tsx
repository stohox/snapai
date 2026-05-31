import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

interface OcrResultProps {
  content: string
}

function OcrResult({ content }: OcrResultProps): JSX.Element {
  return (
    <div className="prose prose-invert prose-sm max-w-none text-gray-200">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content || '暂无分析结果'}
      </ReactMarkdown>
    </div>
  )
}

export default OcrResult
