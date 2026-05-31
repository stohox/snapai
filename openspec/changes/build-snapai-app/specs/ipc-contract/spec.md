# IPC Channel Interface Contract

## ADDED Requirements

### Requirement: Renderer to Main IPC Channels

The renderer process SHALL communicate with the main process through the following IPC channels: capture:confirm, capture:cancel, capture:copy-image, capture:save-image, settings:open, settings:get, settings:set, ai:analyze, ai:translate, ai:cancel.

#### Scenario: Renderer sends capture:confirm

WHEN the renderer process sends a capture:confirm message
THEN the main process SHALL receive the message and confirm the screenshot capture

#### Scenario: Renderer sends capture:cancel

WHEN the renderer process sends a capture:cancel message
THEN the main process SHALL receive the message and cancel the current screenshot capture

#### Scenario: Renderer sends capture:copy-image

WHEN the renderer process sends a capture:copy-image message with image data
THEN the main process SHALL receive the message and copy the image to the system clipboard

#### Scenario: Renderer sends capture:save-image

WHEN the renderer process sends a capture:save-image message with image data
THEN the main process SHALL receive the message and prompt the user to save the image to disk

#### Scenario: Renderer sends settings:open

WHEN the renderer process sends a settings:open message
THEN the main process SHALL receive the message and open the Settings window

#### Scenario: Renderer sends settings:get

WHEN the renderer process sends a settings:get message with a key
THEN the main process SHALL receive the message and return the corresponding setting value

#### Scenario: Renderer sends settings:set

WHEN the renderer process sends a settings:set message with a key and value
THEN the main process SHALL receive the message and persist the setting value

#### Scenario: Renderer sends ai:analyze

WHEN the renderer process sends an ai:analyze message with image data and prompt
THEN the main process SHALL receive the message and forward the AI analysis request

#### Scenario: Renderer sends ai:translate

WHEN the renderer process sends an ai:translate message with image data and target language
THEN the main process SHALL receive the message and forward the AI translation request

#### Scenario: Renderer sends ai:cancel

WHEN the renderer process sends an ai:cancel message
THEN the main process SHALL receive the message and cancel the ongoing AI request

### Requirement: Main to Utility IPC Channels

The main process SHALL communicate with the utility process through the following IPC channels: ai:analyze, ai:translate, ai:cancel.

#### Scenario: Main sends ai:analyze to utility

WHEN the main process sends an ai:analyze message to the utility process
THEN the utility process SHALL receive the message and execute the AI analysis

#### Scenario: Main sends ai:translate to utility

WHEN the main process sends an ai:translate message to the utility process
THEN the utility process SHALL receive the message and execute the AI translation

#### Scenario: Main sends ai:cancel to utility

WHEN the main process sends an ai:cancel message to the utility process
THEN the utility process SHALL receive the message and abort the ongoing AI operation

### Requirement: Utility to Main IPC Channels

The utility process SHALL communicate with the main process through the following IPC channels: ai:result, ai:error, ai:progress.

#### Scenario: Utility sends ai:result to main

WHEN the utility process completes an AI operation successfully
THEN the utility process SHALL send an ai:result message to the main process with the result data

#### Scenario: Utility sends ai:error to main

WHEN the utility process encounters an error during an AI operation
THEN the utility process SHALL send an ai:error message to the main process with error details

#### Scenario: Utility sends ai:progress to main

WHEN the utility process makes progress on an AI operation
THEN the utility process SHALL send an ai:progress message to the main process with progress information

### Requirement: Main to Renderer IPC Channels

The main process SHALL communicate with the renderer process through the following IPC channels: capture:screenshot, ai:result, ai:error, ai:loading.

#### Scenario: Main sends capture:screenshot to renderer

WHEN the main process captures a screenshot
THEN the main process SHALL send a capture:screenshot message to the renderer process with the screenshot data

#### Scenario: Main sends ai:result to renderer

WHEN the main process receives an AI result from the utility process
THEN the main process SHALL forward the ai:result message to the renderer process

#### Scenario: Main sends ai:error to renderer

WHEN the main process receives an AI error from the utility process
THEN the main process SHALL forward the ai:error message to the renderer process

#### Scenario: Main sends ai:loading to renderer

WHEN the main process starts an AI operation
THEN the main process SHALL send an ai:loading message to the renderer process to indicate loading state

### Requirement: TypeScript Type Definitions

All IPC channels SHALL have TypeScript type definitions in src/shared/types.ts. Every channel name, request payload, and response payload SHALL be fully typed.

#### Scenario: IPC types are defined in shared types file

WHEN the codebase is inspected
THEN all IPC channel names SHALL be defined as typed constants in src/shared/types.ts
AND each channel SHALL have a corresponding request type and response type
AND the type definitions SHALL cover all channels listed in this spec

#### Scenario: Developer uses an IPC channel with incorrect payload type

WHEN a developer attempts to send an IPC message with a payload that does not match the defined type
THEN the TypeScript compiler SHALL produce a type error
AND the code SHALL NOT compile successfully

### Requirement: Preload Script Type-Safe IPC Interfaces

The preload script SHALL only expose type-safe IPC call interfaces to the renderer process. Raw ipcRenderer methods SHALL NOT be directly exposed.

#### Scenario: Preload script exposes type-safe invoke methods

WHEN the preload script is loaded
THEN it SHALL expose a typed API object to the renderer via contextBridge
AND each exposed method SHALL correspond to an IPC channel with typed parameters and return values
AND the raw ipcRenderer.send or ipcRenderer.invoke SHALL NOT be directly exposed to the renderer

#### Scenario: Renderer calls a type-safe IPC method

WHEN the renderer process calls an IPC method exposed by the preload script
THEN the call SHALL be type-checked at compile time
AND the method SHALL internally invoke the correct IPC channel with the correct payload format
