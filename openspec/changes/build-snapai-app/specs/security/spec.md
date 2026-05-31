# Security and Privacy

## ADDED Requirements

### Requirement: API Key Encrypted Storage

The application SHALL encrypt the API Key using Electron safeStorage API (encryptString/decryptString) before persisting it. Encrypted data SHALL be stored in electron-store. No plaintext API Key SHALL ever be written to disk.

#### Scenario: User saves an API Key

WHEN the user configures and saves an API Key
THEN the application SHALL call safeStorage.encryptString with the plaintext API Key
AND the resulting encrypted string SHALL be stored in electron-store
AND the plaintext API Key SHALL NOT be written to disk at any point

#### Scenario: Application reads a stored API Key

WHEN the application needs to use the stored API Key
THEN the application SHALL read the encrypted string from electron-store
AND the application SHALL call safeStorage.decryptString to obtain the plaintext key
AND the decrypted key SHALL only exist in memory
AND the decrypted key SHALL NOT be written to disk

#### Scenario: API Key stored on disk is encrypted

WHEN the electron-store data file on disk is inspected
THEN the API Key field SHALL contain an encrypted string
AND no plaintext API Key SHALL be found in any file on disk

### Requirement: Decrypted Key Memory-Only

The decrypted API Key SHALL only exist in application memory and SHALL NEVER be persisted to disk in plaintext form.

#### Scenario: Decrypted key lifecycle

WHEN the API Key is decrypted for use
THEN the decrypted value SHALL reside only in volatile memory
AND the decrypted value SHALL NOT be logged
AND the decrypted value SHALL NOT be written to any file on disk
AND the decrypted value SHALL NOT be included in any error report or crash dump

### Requirement: No Telemetry Data Collection

The application SHALL NOT collect or transmit any telemetry data.

#### Scenario: Application runs without telemetry

WHEN the application is running
THEN no telemetry data SHALL be collected
AND no telemetry data SHALL be transmitted to any remote server
AND no unique device or user identifiers SHALL be generated or sent

### Requirement: No Usage Statistics Collection

The application SHALL NOT collect or transmit any usage statistics.

#### Scenario: Application runs without usage tracking

WHEN the application is running
THEN no usage statistics SHALL be collected
AND no usage statistics SHALL be transmitted to any remote server
AND no event tracking or analytics SHALL be performed

### Requirement: Screenshot Data Memory-Only

Screenshot data SHALL only exist in memory and SHALL NOT be automatically cached or saved to disk. The only exception is when the user explicitly chooses to save a screenshot.

#### Scenario: Screenshot captured and held in memory

WHEN a screenshot is captured
THEN the screenshot image data SHALL reside only in memory
AND the screenshot SHALL NOT be automatically written to any temporary file on disk

#### Scenario: User explicitly saves a screenshot

WHEN the user chooses to save a screenshot to disk
THEN the application SHALL write the screenshot data to the user-specified file path
AND this is the ONLY scenario where screenshot data is written to disk

#### Scenario: Screenshot is cancelled or discarded

WHEN the user cancels or discards a screenshot
THEN the screenshot data SHALL be cleared from memory
AND no residual screenshot data SHALL remain on disk

### Requirement: All AI Requests Use HTTPS

All network requests to AI services SHALL use HTTPS protocol. Unencrypted HTTP connections to AI services SHALL NOT be permitted.

#### Scenario: AI analysis request is sent over HTTPS

WHEN the application sends an AI analysis request
THEN the request SHALL be transmitted over HTTPS
AND the request SHALL NOT be sent over unencrypted HTTP

#### Scenario: AI translation request is sent over HTTPS

WHEN the application sends an AI translation request
THEN the request SHALL be transmitted over HTTPS
AND the request SHALL NOT be sent over unencrypted HTTP

#### Scenario: Any AI service URL is validated

WHEN the application constructs a URL for an AI service request
THEN the URL MUST use the https:// scheme
AND requests to http:// URLs SHALL be rejected
