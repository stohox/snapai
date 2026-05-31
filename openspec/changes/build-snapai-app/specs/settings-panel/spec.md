# Settings Panel

## ADDED Requirements

### Requirement: Open from Tray Menu

The application SHALL provide access to the settings panel from the system tray menu.

- A "设置" (Settings) menu item SHALL be present in the tray context menu.
- Clicking the "设置" menu item SHALL open the settings panel window.
- The settings panel SHALL be a separate BrowserWindow.

#### Scenario: Open settings from tray

WHEN the user right-clicks the application tray icon
AND clicks "设置" in the context menu
THEN the settings panel window SHALL open

#### Scenario: Settings panel is a separate window

WHEN the settings panel opens
THEN it SHALL be displayed as an independent BrowserWindow
AND it SHALL NOT be embedded in another window

### Requirement: API Key Configuration

The application SHALL allow the user to configure an API Key for the AI Vision service.

- The API Key input SHALL use a password mask (e.g., `••••••••`) to hide the entered value.
- The API Key SHALL be encrypted using Electron's `safeStorage` API before storage.
- The encrypted API Key SHALL be stored in `electron-store`.
- The application SHALL decrypt the API Key at runtime when making API requests.

#### Scenario: Enter API Key

WHEN the user types an API Key in the settings panel
THEN the input field SHALL display masked characters (e.g., `••••••••`)
AND the actual value SHALL NOT be visible

#### Scenario: API Key is encrypted before storage

WHEN the user saves the API Key
THEN the application SHALL encrypt the API Key using `safeStorage.encryptString()`
AND store the encrypted value in `electron-store`
AND the plaintext API Key SHALL NOT be stored on disk

#### Scenario: API Key is decrypted at runtime

WHEN the application needs to make an API request
THEN the application SHALL retrieve the encrypted API Key from `electron-store`
AND decrypt it using `safeStorage.decryptString()`
AND use the decrypted value in the API request

### Requirement: Model Selection

The application SHALL allow the user to select an AI model from presets or configure a custom model.

- A preset list SHALL be available with the following options:
  - OpenAI GPT-4o
  - Claude
  - Qwen
  - Kimi
  - DeepSeek
- A "Custom" option SHALL be available for manual configuration.
- When "Custom" is selected, the user SHALL be able to enter a custom API URL and model name.
- The selected model configuration SHALL be persisted in `electron-store`.

#### Scenario: Select a preset model

WHEN the user selects "OpenAI GPT-4o" from the model dropdown
THEN the API URL and model name SHALL be automatically configured for OpenAI GPT-4o
AND the custom URL and model name fields SHALL be hidden or disabled

#### Scenario: Select custom model

WHEN the user selects "Custom" from the model dropdown
THEN the custom API URL input field SHALL become visible and editable
AND the custom model name input field SHALL become visible and editable

#### Scenario: Enter custom API URL and model

WHEN the user selects "Custom" mode
AND enters `https://my-api.example.com/v1/chat/completions` as the API URL
AND enters `my-vision-model` as the model name
AND saves the settings
THEN the application SHALL use the custom URL and model name for subsequent API requests

### Requirement: Shortcut Key Settings

The application SHALL allow the user to configure the screenshot shortcut key.

- The shortcut key input SHALL support key recording (the user presses the desired key combination and it is captured).
- The application SHALL detect shortcut conflicts with existing system or application shortcuts.
- If a conflict is detected, the application SHALL display a warning message.
- The configured shortcut SHALL be persisted in `electron-store`.

#### Scenario: Record a new shortcut

WHEN the user clicks the shortcut key input field
AND presses `Ctrl+Alt+S`
THEN the input field SHALL display "Ctrl+Alt+S"
AND the shortcut SHALL be recorded

#### Scenario: Detect shortcut conflict

WHEN the user records a shortcut that conflicts with an existing system shortcut
THEN the application SHALL display a warning message indicating the conflict
AND the user SHALL be able to confirm or choose a different shortcut

#### Scenario: Persist shortcut configuration

WHEN the user saves the shortcut key settings
THEN the shortcut SHALL be stored in `electron-store`
AND the application SHALL re-register the global shortcut with the new key combination

### Requirement: Translation Language Pair Configuration

The application SHALL allow the user to configure the source and target languages for OCR translation.

- A source language dropdown SHALL be available with all supported languages.
- A target language dropdown SHALL be available with all supported languages.
- The supported languages SHALL be: Chinese (中文), English (英文), Japanese (日文), Korean (韩文), French (法文), German (德文), Spanish (西班牙文).
- The default source language SHALL be English (英文).
- The default target language SHALL be Chinese (中文).
- The configured language pair SHALL be persisted in `electron-store`.

#### Scenario: Change source language

WHEN the user opens the language pair configuration
AND selects "日文" from the source language dropdown
AND saves the settings
THEN the source language SHALL be updated to Japanese
AND subsequent OCR translation requests SHALL use "日文" as the source language in the prompt

#### Scenario: Change target language

WHEN the user opens the language pair configuration
AND selects "韩文" from the target language dropdown
AND saves the settings
THEN the target language SHALL be updated to Korean
AND subsequent OCR translation requests SHALL use "韩文" as the target language in the prompt

#### Scenario: Language pair persisted

WHEN the user configures source language as "法文" and target language as "德文"
AND saves the settings
AND restarts the application
THEN the source language SHALL be restored as "法文"
AND the target language SHALL be restored as "德文"

### Requirement: Settings Persistence via electron-store

The application SHALL persist all settings using `electron-store` and auto-restore them on restart.

- All settings (API Key, model selection, shortcut key, language pair) SHALL be stored in `electron-store`.
- When the application starts, it SHALL automatically load and apply the stored settings.
- If no stored settings exist, the application SHALL use default values.

#### Scenario: Settings persist across restarts

WHEN the user configures all settings (API Key, model, shortcut, language pair)
AND saves the settings
AND restarts the application
THEN all settings SHALL be automatically restored to their last saved values

#### Scenario: Default values on first launch

WHEN the application starts for the first time
AND no stored settings exist
THEN the application SHALL use default values:
- Shortcut: `Ctrl+Shift+A`
- Model: OpenAI GPT-4o
- Source language: 英文
- Target language: 中文
- API Key: empty
