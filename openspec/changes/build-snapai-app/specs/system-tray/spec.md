# System Tray

## ADDED Requirements

### Requirement: Tray Icon Display on App Start

The application SHALL display a tray icon in the system notification area when the app starts.

#### Scenario: App starts and tray icon appears

WHEN the application launches
THEN a tray icon SHALL be visible in the system notification area
AND the tray icon SHALL reflect the application icon

### Requirement: Close Main Window Minimizes to Tray

The application SHALL NOT exit when the user closes the main window. Instead, the main window SHALL be hidden and the app SHALL continue running in the system tray.

#### Scenario: User closes the main window

WHEN the user clicks the close button on the main window
THEN the main window SHALL be hidden
AND the application SHALL continue running in the system tray
AND the application process SHALL NOT terminate

#### Scenario: User reopens the main window from tray

WHEN the main window is hidden and the user interacts with the tray to show the window
THEN the main window SHALL become visible again

### Requirement: Right-Click Context Menu

The tray icon SHALL provide a right-click context menu with the following items: Screenshot, Settings, About, and Exit.

#### Scenario: User right-clicks the tray icon

WHEN the user right-clicks the tray icon
THEN a context menu SHALL appear with the following items in order:
1. Screenshot
2. Settings
3. About
4. Exit

#### Scenario: User clicks Screenshot in context menu

WHEN the user clicks the "Screenshot" menu item
THEN the application SHALL initiate a screenshot capture

#### Scenario: User clicks Settings in context menu

WHEN the user clicks the "Settings" menu item
THEN the Settings window SHALL open

#### Scenario: User clicks About in context menu

WHEN the user clicks the "About" menu item
THEN the About window SHALL open

#### Scenario: User clicks Exit in context menu

WHEN the user clicks the "Exit" menu item
THEN the application SHALL terminate completely
AND the tray icon SHALL be removed from the notification area

### Requirement: Double-Click Tray Icon Triggers Screenshot

Double-clicking the tray icon SHALL trigger a screenshot capture action.

#### Scenario: User double-clicks the tray icon

WHEN the user double-clicks the tray icon
THEN the application SHALL initiate a screenshot capture

### Requirement: About Window

The About window SHALL display the application name "SnapAI", version number, GitHub repository link, and MIT license information. The window SHALL have a fixed size and SHALL NOT be resizable.

#### Scenario: User opens the About window

WHEN the About window is opened
THEN the window SHALL display:
- Application name: "SnapAI"
- Current version number
- GitHub repository link (clickable)
- MIT License notice
AND the window SHALL have a fixed size
AND the window SHALL NOT be resizable by the user

#### Scenario: User clicks the GitHub repository link

WHEN the user clicks the GitHub repository link in the About window
THEN the default web browser SHALL open and navigate to the repository URL
