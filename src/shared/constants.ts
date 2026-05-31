export const DEFAULT_SHORTCUT_KEY = 'CommandOrControl+Shift+A'

export const DEFAULT_SOURCE_LANG = '英文'

export const DEFAULT_TARGET_LANG = '中文'

export const SUPPORTED_LANGUAGES = [
  '中文',
  '英文',
  '日文',
  '韩文',
  '法文',
  '德文',
  '西班牙文',
  '俄文'
]

export const AI_ANALYZE_PROMPT = `你是一个专业的图像分析助手。请仔细分析这张截图，提供以下信息：

1. 图像内容概述：简要描述图像的主要内容
2. 文字内容：如果图像中包含文字，请完整提取
3. 关键信息：提取图像中的重要数据、代码、公式等
4. 补充说明：任何其他值得注意的细节

请用中文回答，格式清晰。`

export const AI_TRANSLATE_PROMPT = `请识别图片中的所有{sourceLang}文字，并将它们翻译为{targetLang}。请按以下 JSON 格式返回结果：{"original": "识别到的原文", "translated": "翻译后的译文"}。如果图片中没有可识别的文字，请返回：{"original": "", "translated": "未检测到文字内容"}。只返回JSON，不要添加任何其他内容。`

export const AI_TIMEOUT = 10000
