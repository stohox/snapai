export interface ModelPreset {
  name: string
  apiBaseUrl: string
  modelId: string
  defaultMaxTokens: number
}

export const MODEL_PRESETS: ModelPreset[] = [
  {
    name: 'OpenAI GPT-4o',
    apiBaseUrl: 'https://api.openai.com/v1',
    modelId: 'gpt-4o',
    defaultMaxTokens: 4096
  },
  {
    name: 'Claude',
    apiBaseUrl: 'https://api.anthropic.com/v1',
    modelId: 'claude-sonnet-4-20250514',
    defaultMaxTokens: 4096
  },
  {
    name: '通义千问',
    apiBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    modelId: 'qwen-vl-max',
    defaultMaxTokens: 4096
  },
  {
    name: 'Kimi',
    apiBaseUrl: 'https://api.moonshot.cn/v1',
    modelId: 'moonshot-v1-8k',
    defaultMaxTokens: 4096
  },
  {
    name: 'DeepSeek',
    apiBaseUrl: 'https://api.deepseek.com/v1',
    modelId: 'deepseek-chat',
    defaultMaxTokens: 4096
  }
]
