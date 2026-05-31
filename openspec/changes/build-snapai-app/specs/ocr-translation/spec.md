# OCR Translation

## ADDED Requirements

### Requirement: One API Call for OCR and Translation

The application SHALL perform OCR and translation in a single AI Vision API call.

- The application SHALL send the cropped screenshot image along with a translation-specific prompt to the Vision API.
- The Vision API SHALL return both the recognized text and the translated text in one response.
- The application SHALL NOT make separate API calls for OCR and translation.

#### Scenario: OCR and translation in one request

WHEN the user triggers OCR translation on a screenshot
THEN the application SHALL send a single Vision API request containing the image and the translation prompt
AND the response SHALL contain both the original text and the translated text

#### Scenario: Avoid double API call

WHEN the user triggers OCR translation
THEN the application SHALL NOT send a separate OCR request followed by a translation request
AND both operations SHALL be completed in one API call

### Requirement: Predefined Translation Prompt Template

The application SHALL use a predefined prompt template for OCR translation with JSON format output.

- The translation prompt template SHALL be: "请识别图片中的所有{源语言}文字，并将它们翻译为{目标语言}。请按以下 JSON 格式返回结果：{"original": "识别到的原文", "translated": "翻译后的译文"}。如果图片中没有可识别的文字，请返回：{"original": "", "translated": "未检测到文字内容"}"
- The `{源语言}` placeholder SHALL be replaced with the configured source language name.
- The `{目标语言}` placeholder SHALL be replaced with the configured target language name.
- The application SHALL parse the JSON response and extract the `original` and `translated` fields.

#### Scenario: Translation prompt with language pair

WHEN the user triggers OCR translation with source language set to "英文" and target language set to "中文"
THEN the application SHALL replace `{源语言}` with "英文" and `{目标语言}` with "中文" in the prompt template
AND the resulting prompt SHALL be: "请识别图片中的所有英文文字，并将它们翻译为中文。请按以下 JSON 格式返回结果：{"original": "识别到的原文", "translated": "翻译后的译文"}。如果图片中没有可识别的文字，请返回：{"original": "", "translated": "未检测到文字内容"}"

#### Scenario: Parse JSON response

WHEN the Vision API returns a response containing `{"original": "Hello World", "translated": "你好世界"}`
THEN the application SHALL parse the JSON
AND extract "Hello World" as the original text
AND extract "你好世界" as the translated text

#### Scenario: No text detected in image

WHEN the Vision API returns a response containing `{"original": "", "translated": "未检测到文字内容"}`
THEN the application SHALL display "未检测到文字内容" to the user

### Requirement: Dynamic Language Pair Replacement

The application SHALL dynamically replace language placeholders in the translation prompt.

- The source and target language names SHALL be derived from the user's language pair configuration.
- The language names used in the prompt SHALL be in Chinese (e.g., "英文", "中文", "日文").

#### Scenario: Change source language

WHEN the user changes the source language from "英文" to "日文"
AND triggers OCR translation
THEN the prompt SHALL contain "请识别图片中的所有日文文字"

#### Scenario: Change target language

WHEN the user changes the target language from "中文" to "韩文"
AND triggers OCR translation
THEN the prompt SHALL contain "并将它们翻译为韩文"

### Requirement: Default Language Pair

The application SHALL default to English → Chinese as the language pair.

- The default source language SHALL be English (英文).
- The default target language SHALL be Chinese (中文).

#### Scenario: First-time usage default

WHEN the user uses OCR translation for the first time without configuring language settings
THEN the source language SHALL be "英文"
AND the target language SHALL be "中文"

### Requirement: Supported Languages

The application SHALL support the following languages for OCR translation:

- Chinese (中文)
- English (英文)
- Japanese (日文)
- Korean (韩文)
- French (法文)
- German (德文)
- Spanish (西班牙文)

- Both source and target language dropdowns SHALL contain all supported languages.
- The source and target languages SHALL be independently selectable.

#### Scenario: Select French as source language

WHEN the user opens the language configuration
THEN "法文" SHALL be available as an option in the source language dropdown
AND the user SHALL be able to select it

#### Scenario: Select German as target language

WHEN the user opens the language configuration
THEN "德文" SHALL be available as an option in the target language dropdown
AND the user SHALL be able to select it

#### Scenario: Same language for source and target

WHEN the user selects the same language for both source and target
THEN the application SHALL allow the selection
AND the translation result SHALL reflect the same language for both original and translated text

### Requirement: Copy Translation Result to Clipboard

The application SHALL allow the user to copy the translation result to the clipboard.

- The user SHALL be able to copy the translated text with a single click.
- The application SHALL provide a copy button in the result window.
- Upon successful copy, the application SHALL show a brief visual confirmation.

#### Scenario: Copy translated text

WHEN the user clicks the copy button in the translation result window
THEN the translated text SHALL be copied to the system clipboard
AND a brief visual confirmation (e.g., "已复制") SHALL be displayed

#### Scenario: Copy original text

WHEN the user clicks the copy button for the original text in the translation result window
THEN the original text SHALL be copied to the system clipboard
AND a brief visual confirmation SHALL be displayed
