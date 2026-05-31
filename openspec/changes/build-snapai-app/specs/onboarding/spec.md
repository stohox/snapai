# Onboarding

## ADDED Requirements

### Requirement: First Launch Detection

The application SHALL detect whether the current launch is the first launch by checking for the absence of configuration data in electron-store.

#### Scenario: First launch with no config in electron-store

WHEN the application starts and no configuration data exists in electron-store
THEN the application SHALL identify this as a first launch

#### Scenario: Subsequent launch with existing config in electron-store

WHEN the application starts and configuration data exists in electron-store
THEN the application SHALL identify this as a subsequent (non-first) launch

### Requirement: Onboarding Window Content

The onboarding window SHALL display an application introduction, an API Key configuration entry, and shortcut key information.

#### Scenario: Onboarding window displays all required content

WHEN the onboarding window is shown
THEN the window SHALL display:
- An application introduction section describing SnapAI
- An API Key configuration entry where the user can input their API key
- Shortcut key information showing available keyboard shortcuts

#### Scenario: User enters API Key in onboarding

WHEN the user enters an API Key in the onboarding window
THEN the API Key SHALL be saved securely using the security module
AND the configuration SHALL be persisted in electron-store

### Requirement: Skip Onboarding

The user SHALL be able to skip the onboarding process, which minimizes the application directly to the system tray.

#### Scenario: User skips onboarding

WHEN the user clicks the skip button or action on the onboarding window
THEN the onboarding window SHALL close
AND the application SHALL minimize to the system tray
AND the application SHALL NOT exit

#### Scenario: User skips onboarding without entering API Key

WHEN the user skips onboarding without entering an API Key
THEN the application SHALL minimize to the system tray
AND the API Key SHALL remain unconfigured
AND the user SHALL be able to configure the API Key later via Settings

### Requirement: Non-First Launch Behavior

On non-first launches, the application SHALL directly minimize to the system tray without showing the onboarding window.

#### Scenario: Non-first launch minimizes to tray directly

WHEN the application starts on a non-first launch (configuration exists in electron-store)
THEN the onboarding window SHALL NOT be displayed
AND the application SHALL directly minimize to the system tray
AND the tray icon SHALL be visible in the notification area
