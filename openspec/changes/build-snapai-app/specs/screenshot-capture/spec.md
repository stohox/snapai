# Screenshot Capture

## ADDED Requirements

### Requirement: Keyboard Shortcut Trigger

The application SHALL register a global keyboard shortcut to initiate screenshot capture.

- The default shortcut SHALL be `Ctrl+Shift+A`.
- The shortcut SHALL be customizable via the settings panel.
- When the shortcut is pressed, the application SHALL initiate the screenshot capture workflow within 200ms.

#### Scenario: Trigger screenshot with default shortcut

WHEN the user presses `Ctrl+Shift+A`
THEN the application SHALL initiate the screenshot capture workflow
AND the overlay SHALL appear within 200ms of the keypress

#### Scenario: Custom shortcut triggers screenshot

WHEN the user has configured a custom shortcut (e.g., `Ctrl+Alt+S`) in the settings panel
AND the user presses that custom shortcut
THEN the application SHALL initiate the screenshot capture workflow
AND the overlay SHALL appear within 200ms of the keypress

### Requirement: Multi-Monitor Support

The application SHALL support capturing screenshots across multiple monitors.

- The application SHALL capture all connected screens and composite them into a single image.
- The transparent overlay SHALL cover all screens simultaneously.
- The selection area SHALL be able to cross screen boundaries.

#### Scenario: Capture across multiple monitors

WHEN the user triggers screenshot capture on a multi-monitor setup
THEN the application SHALL capture all screens
AND composite them into a single image
AND display a transparent overlay covering all screens

#### Scenario: Selection crosses screen boundary

WHEN the user drags a selection area that spans across two monitors
THEN the selection rectangle SHALL render continuously across the screen boundary
AND the captured image SHALL include content from both monitors within the selection

### Requirement: Full-Screen Transparent Overlay with Selection

The application SHALL display a full-screen transparent overlay for region selection.

- The overlay SHALL be semi-transparent to show the underlying screen content.
- The user SHALL be able to create a selection by clicking and dragging.
- The user SHALL be able to resize the selection by dragging its edges or corners.
- The user SHALL be able to move the selection by dragging inside the selection area.
- The minimum selection size SHALL be 10x10 pixels.

#### Scenario: Create selection by dragging

WHEN the user clicks and drags on the overlay
THEN a selection rectangle SHALL appear and follow the cursor
AND the area outside the selection SHALL be dimmed

#### Scenario: Resize selection

WHEN the user drags an edge or corner of an existing selection
THEN the selection SHALL resize accordingly
AND the selection SHALL NOT shrink below 10x10 pixels

#### Scenario: Move selection

WHEN the user clicks inside an existing selection and drags
THEN the selection SHALL move with the cursor
AND the selection dimensions SHALL remain unchanged

#### Scenario: Minimum selection enforcement

WHEN the user attempts to create or resize a selection smaller than 10x10 pixels
THEN the selection SHALL be clamped to a minimum of 10x10 pixels

### Requirement: Selection Confirm and Cancel

The application SHALL provide mechanisms to confirm or cancel the selection.

- The user SHALL confirm the selection by double-clicking inside it or pressing Enter.
- The user SHALL cancel the selection by pressing ESC or right-clicking.

#### Scenario: Confirm selection with double-click

WHEN the user double-clicks inside the selection area
THEN the application SHALL capture the selected region
AND proceed to the next step (AI analysis or OCR)

#### Scenario: Confirm selection with Enter key

WHEN the user presses Enter while a selection exists
THEN the application SHALL capture the selected region
AND proceed to the next step

#### Scenario: Cancel selection with ESC

WHEN the user presses ESC
THEN the application SHALL dismiss the overlay
AND no screenshot SHALL be captured

#### Scenario: Cancel selection with right-click

WHEN the user right-clicks on the overlay
THEN the application SHALL dismiss the overlay
AND no screenshot SHALL be captured

### Requirement: Canvas-Based Cropping in Renderer Process

The application SHALL perform image cropping in the Renderer Process using Canvas.

- The full screenshot image SHALL be loaded into a Canvas element in the Renderer Process.
- Cropping SHALL be performed using Canvas `drawImage` with source rectangle parameters.
- The application SHALL NOT transfer the full uncropped image via IPC to avoid large data transfers.
- Only the cropped image data (base64 or Blob) SHALL be sent via IPC if needed for downstream processing.

#### Scenario: Crop screenshot in renderer

WHEN the user confirms a selection
THEN the application SHALL crop the screenshot using Canvas in the Renderer Process
AND only the cropped region SHALL be extracted
AND the full screenshot image SHALL NOT be sent via IPC

#### Scenario: Large screenshot on high-resolution display

WHEN the user captures a screenshot on a 4K display
AND selects a small region
THEN the application SHALL crop only the selected region via Canvas
AND the IPC message SHALL contain only the cropped image data
AND the memory footprint SHALL remain proportional to the selection size, not the full screen

### Requirement: Response Time

The screenshot capture workflow SHALL be responsive.

- The time from shortcut trigger to overlay display SHALL be less than 200ms.
- The time from selection confirmation to cropped image availability SHALL be less than 200ms.

#### Scenario: Overlay appears quickly

WHEN the user triggers the screenshot shortcut
THEN the overlay SHALL be visible within 200ms

#### Scenario: Cropped image available quickly

WHEN the user confirms a selection
THEN the cropped image SHALL be available for downstream processing within 200ms
