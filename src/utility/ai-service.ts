import OpenAI from 'openai'
import type { AIConfig } from '../shared/types'
import { AI_ANALYZE_PROMPT, AI_TIMEOUT } from '../shared/constants'

let abortController: AbortController | null = null

function classifyError(error: unknown): Error {
  if (!(error instanceof Error)) {
    return new Error('未知错误')
  }

  if (error.name === 'AbortError') {
    return new Error('请求超时，请稍后重试')
  }

  const openaiError = error as { status?: number }
  switch (openaiError.status) {
    case 400:
      return new Error('请求参数错误，请检查模型设置')
    case 401:
      return new Error('API Key 无效，请检查设置')
    case 403:
      return new Error('没有访问权限，请检查 API Key 权限')
    case 404:
      return new Error('模型不存在，请检查模型 ID')
    case 429:
      return new Error('请求过于频繁，请稍后重试')
    case 500:
      return new Error('服务器内部错误，请稍后重试')
    case 502:
      return new Error('网关错误，请稍后重试')
    case 503:
      return new Error('服务暂不可用，请稍后重试')
    default:
      return error
  }
}

export async function analyzeImage(imageBase64: string, config: AIConfig): Promise<string> {
  if (abortController) {
    abortController.abort()
  }

  abortController = new AbortController()
  const timeoutId = setTimeout(() => {
    abortController?.abort()
  }, AI_TIMEOUT)

  try {
    const client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.apiBaseUrl
    })

    const response = await client.chat.completions.create(
      {
        model: config.modelId,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: AI_ANALYZE_PROMPT },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: config.maxTokens
      },
      {
        signal: abortController.signal
      }
    )

    const content = response.choices[0]?.message?.content || ''
    return content
  } catch (error: unknown) {
    throw classifyError(error)
  } finally {
    clearTimeout(timeoutId)
    abortController = null
  }
}

export function cancelRequest(): void {
  if (abortController) {
    abortController.abort()
    abortController = null
  }
}
