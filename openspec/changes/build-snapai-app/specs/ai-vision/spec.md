# AI Vision

## ADDED Requirements

### Requirement: OpenAI Compatible Vision API Integration

The application SHALL integrate with OpenAI-compatible Vision API endpoints for image analysis.

- The application SHALL send the cropped screenshot as a base64-encoded image to the Vision API.
- The request SHALL follow the OpenAI Chat Completions API format with image content parts.
- The application SHALL use the configured API key for authentication.

#### Scenario: Send screenshot to Vision API

WHEN the user confirms a screenshot selection and triggers AI analysis
THEN the application SHALL encode the cropped image as base64
AND send a Chat Completions request with the image as a vision content part
AND include the configured API key in the Authorization header

#### Scenario: Receive analysis result

WHEN the Vision API returns a successful response
THEN the application SHALL extract the text content from the response
AND display the result in the result window

### Requirement: Predefined Analyze Prompt Template

The application SHALL use a predefined prompt template for screenshot analysis.

- The default analyze prompt SHALL be: "请详细描述这张截图的内容。如果截图中包含文字，请提取所有文字内容。如果截图中包含代码，请识别代码并标注语言。如果截图中包含 UI 界面，请描述界面元素和布局。"
- The prompt SHALL be sent as the user message alongside the image in the API request.

#### Scenario: Analyze screenshot with default prompt

WHEN the user triggers AI analysis on a screenshot
THEN the application SHALL send the predefined analyze prompt along with the screenshot image to the Vision API
AND the prompt text SHALL exactly match the predefined template

### Requirement: Built-in Model Presets

The application SHALL provide built-in model presets for common AI providers.

- The following presets SHALL be available:
  - OpenAI GPT-4o (api.openai.com, model: gpt-4o)
  - Claude (api.anthropic.com, model: claude-sonnet-4-20250514)
  - Qwen (dashscope.aliyuncs.com, model: qwen-vl-max)
  - Kimi (api.moonshot.cn, model: moonshot-v1-8k)
  - DeepSeek (api.deepseek.com, model: deepseek-chat)
- Each preset SHALL define the API endpoint URL and model identifier.
- The user SHALL be able to select a preset from the settings panel.

#### Scenario: Select a built-in model preset

WHEN the user selects "OpenAI GPT-4o" from the model preset list
THEN the application SHALL configure the API endpoint as `https://api.openai.com/v1/chat/completions`
AND set the model parameter to `gpt-4o`

#### Scenario: Switch between presets

WHEN the user switches from "OpenAI GPT-4o" to "DeepSeek"
THEN the application SHALL update the API endpoint to `https://api.deepseek.com/v1/chat/completions`
AND set the model parameter to `deepseek-chat`

### Requirement: Custom API Endpoint Support

The application SHALL allow users to configure a custom API endpoint.

- The user SHALL be able to enter a custom API URL.
- The user SHALL be able to enter a custom model name.
- The custom endpoint SHALL follow the OpenAI Chat Completions API format.

#### Scenario: Configure custom API endpoint

WHEN the user selects "Custom" mode in the settings panel
AND enters a custom API URL (e.g., `https://my-proxy.example.com/v1/chat/completions`)
AND enters a custom model name (e.g., `my-custom-vision-model`)
THEN the application SHALL use the custom URL and model name for Vision API requests

### Requirement: Timeout and Cancel Mechanism

The application SHALL enforce a timeout on AI Vision requests and provide a cancel mechanism.

- The request timeout SHALL be 10 seconds.
- The user SHALL be able to cancel an in-progress AI request.
- Upon timeout or cancellation, the application SHALL abort the request and display an appropriate message.

#### Scenario: Request times out

WHEN an AI Vision request exceeds 10 seconds without a response
THEN the application SHALL abort the request
AND display a timeout error message to the user

#### Scenario: User cancels request

WHEN the user clicks the cancel button during an in-progress AI request
THEN the application SHALL immediately abort the request
AND display a cancellation message to the user

### Requirement: Error Handling

The application SHALL handle API errors with specific user-facing messages.

- HTTP 401 (Unauthorized): The application SHALL display "API Key 无效或未配置，请在设置中检查 API Key。"
- HTTP 429 (Too Many Requests): The application SHALL display "请求过于频繁，请稍后重试。"
- HTTP 500 (Internal Server Error): The application SHALL display "AI 服务暂时不可用，请稍后重试。"
- Network errors: The application SHALL display "网络连接失败，请检查网络设置。"

#### Scenario: API returns 401 error

WHEN the Vision API responds with HTTP 401
THEN the application SHALL display the message "API Key 无效或未配置，请在设置中检查 API Key。"

#### Scenario: API returns 429 error

WHEN the Vision API responds with HTTP 429
THEN the application SHALL display the message "请求过于频繁，请稍后重试。"

#### Scenario: API returns 500 error

WHEN the Vision API responds with HTTP 500
THEN the application SHALL display the message "AI 服务暂时不可用，请稍后重试。"

#### Scenario: Network connection failure

WHEN the Vision API request fails due to a network error
THEN the application SHALL display the message "网络连接失败，请检查网络设置。"

### Requirement: Non-Blocking UI During AI Requests

The application SHALL remain responsive while AI Vision requests are in progress.

- The UI SHALL NOT freeze or become unresponsive during API calls.
- A loading indicator SHALL be displayed while the AI request is in progress.
- The user SHALL be able to interact with other application elements during the request.

#### Scenario: UI remains responsive during AI request

WHEN an AI Vision request is in progress
THEN the application UI SHALL remain responsive
AND a loading indicator SHALL be displayed
AND the user SHALL be able to click the cancel button

#### Scenario: Loading indicator displayed

WHEN the AI Vision request starts
THEN a loading indicator SHALL appear in the result window
AND the loading indicator SHALL be removed when the request completes or is cancelled
