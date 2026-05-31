# Result Window

## ADDED Requirements

### Requirement: Independent BrowserWindow

The application SHALL display results in an independent frameless BrowserWindow.

- The result window SHALL be a separate BrowserWindow instance.
- The window SHALL be frameless (no native title bar or window chrome).
- The window SHALL have `alwaysOnTop` set to true.
- The window SHALL NOT steal focus from other applications when it appears.

#### Scenario: Result window appears as frameless

WHEN the result window is created
THEN the window SHALL have no native title bar or window frame
AND the window SHALL always stay on top of other windows

#### Scenario: Result window does not steal focus

WHEN the result window appears after an AI analysis or translation completes
THEN the window SHALL NOT steal focus from the currently active application

### Requirement: Smart Positioning

The application SHALL position the result window intelligently relative to the selection area.

- The default position SHALL be to the right of the selection area.
- If there is insufficient space to the right, the window SHALL be positioned below the selection area.
- The window SHALL NOT exceed screen boundaries under any circumstances.

#### Scenario: Position to the right of selection

WHEN the AI result is ready
AND there is sufficient space to the right of the selection area
THEN the result window SHALL be positioned immediately to the right of the selection area
AND the window SHALL be vertically aligned with the selection area

#### Scenario: Position below selection when insufficient right space

WHEN the AI result is ready
AND there is insufficient space to the right of the selection area
THEN the result window SHALL be positioned below the selection area
AND the window SHALL be horizontally aligned with the selection area

#### Scenario: Window does not exceed screen boundary

WHEN the result window is positioned
THEN the window SHALL NOT extend beyond any screen boundary
AND if necessary, the position SHALL be adjusted inward to remain fully visible

### Requirement: Drag to Move

The application SHALL allow the user to drag the result window to reposition it.

- The window header area SHALL use CSS `-webkit-app-region: drag` to enable native dragging.
- Interactive elements within the drag area SHALL use `-webkit-app-region: no-drag` to remain clickable.

#### Scenario: Drag the result window

WHEN the user clicks and drags on the header area of the result window
THEN the window SHALL move with the cursor
AND the window position SHALL update in real-time

#### Scenario: Click button in header area

WHEN the user clicks a button (e.g., copy, pin) within the header area
THEN the button click SHALL be registered
AND the window SHALL NOT initiate a drag operation

### Requirement: Pin to Keep Window

The application SHALL support pinning the result window to keep it open.

- The user SHALL be able to toggle the pin state by clicking a pin button.
- When pinned, clicking outside the result window SHALL NOT close it.
- When pinned, closing the screenshot overlay SHALL NOT close the result window.
- When pinned, the pin button SHALL indicate the pinned state visually.

#### Scenario: Pin the result window

WHEN the user clicks the pin button on the result window
THEN the window SHALL enter pinned state
AND the pin button SHALL visually indicate the pinned state (e.g., filled icon)
AND clicking outside the window SHALL NOT close it

#### Scenario: Pinned window persists after overlay closes

WHEN the result window is pinned
AND the user closes the screenshot overlay
THEN the result window SHALL remain open and visible

#### Scenario: Unpin the result window

WHEN the user clicks the pin button again while the window is pinned
THEN the window SHALL enter unpinned state
AND the pin button SHALL visually indicate the unpinned state (e.g., outlined icon)

### Requirement: Unpinned Auto-Close Behavior

The application SHALL auto-close the unpinned result window under specific conditions.

- When unpinned, clicking outside the result window SHALL close it.
- When unpinned, closing the screenshot overlay SHALL also close the result window.

#### Scenario: Click outside unpinned window

WHEN the result window is unpinned
AND the user clicks outside the result window
THEN the result window SHALL close

#### Scenario: Close overlay closes unpinned window

WHEN the result window is unpinned
AND the user closes the screenshot overlay (ESC or right-click)
THEN the result window SHALL also close

### Requirement: One-Click Copy Result Text

The application SHALL provide a one-click copy button for result text.

- A copy button SHALL be visible in the result window.
- Clicking the copy button SHALL copy the full result text to the system clipboard.
- A brief visual confirmation SHALL appear upon successful copy.

#### Scenario: Copy AI analysis result

WHEN the result window displays an AI analysis result
AND the user clicks the copy button
THEN the full analysis text SHALL be copied to the clipboard
AND a brief confirmation (e.g., "已复制") SHALL be displayed

#### Scenario: Copy translation result

WHEN the result window displays a translation result
AND the user clicks the copy button for the translated text
THEN the translated text SHALL be copied to the clipboard
AND a brief confirmation SHALL be displayed

### Requirement: Markdown Rendering with Code Syntax Highlighting

The application SHALL render AI analysis results as Markdown with code syntax highlighting.

- The result text SHALL be parsed and rendered as Markdown.
- Code blocks SHALL have syntax highlighting based on the detected language.
- Inline code SHALL be rendered with a distinct visual style.

#### Scenario: Render Markdown content

WHEN the AI analysis result contains Markdown-formatted text (headings, lists, bold, etc.)
THEN the result window SHALL render the text as formatted Markdown
AND headings, lists, and emphasis SHALL be visually distinct

#### Scenario: Syntax highlighting for code blocks

WHEN the AI analysis result contains a fenced code block with a language identifier (e.g., ```python)
THEN the code block SHALL be rendered with syntax highlighting for the specified language
AND keywords, strings, and comments SHALL be color-coded

#### Scenario: Inline code rendering

WHEN the AI analysis result contains inline code (e.g., `console.log`)
THEN the inline code SHALL be rendered with a monospace font and a distinct background

### Requirement: Side-by-Side Display for Translation Results

The application SHALL display translation results in a side-by-side layout.

- The original text SHALL be displayed on the left side.
- The translated text SHALL be displayed on the right side.
- Both sides SHALL be independently scrollable if the content exceeds the window height.

#### Scenario: Display translation side-by-side

WHEN the result window displays a translation result
THEN the original text SHALL appear on the left panel
AND the translated text SHALL appear on the right panel
AND both panels SHALL be visible simultaneously

#### Scenario: Scrollable panels for long text

WHEN the original or translated text exceeds the visible area of the result window
THEN each panel SHALL be independently scrollable
AND scrolling one panel SHALL NOT affect the other panel
