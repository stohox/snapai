# Build and Release

## ADDED Requirements

### Requirement: Electron-Builder Windows Portable Packaging

The application SHALL be packaged using electron-builder as a Windows portable .zip archive. The build output SHALL be a self-contained .zip file that can be run without installation.

#### Scenario: Build produces Windows portable .zip

WHEN the build command is executed
THEN electron-builder SHALL produce a .zip archive containing the portable application
AND the .zip SHALL contain a single executable that runs without installation
AND the .zip SHALL NOT contain an installer (NSIS, MSI, etc.)

#### Scenario: User runs the portable application

WHEN the user extracts the .zip and runs the executable
THEN the application SHALL start without requiring installation
AND the application SHALL NOT require administrator privileges

### Requirement: App Icon and Metadata Configuration

The application build SHALL include the correct app icon and metadata (name, version, description, etc.) configured in the electron-builder configuration.

#### Scenario: Build includes correct app icon

WHEN the application is built
THEN the executable SHALL display the SnapAI app icon in the system tray
AND the executable SHALL display the SnapAI app icon in the Windows taskbar
AND the .zip file or extracted folder SHALL show the SnapAI app icon

#### Scenario: Build includes correct app metadata

WHEN the application is built
THEN the executable properties SHALL display:
- Product name: SnapAI
- Version number matching the package.json version
- Description and other metadata as configured

### Requirement: GitHub Actions CI/CD Workflow

A GitHub Actions workflow SHALL be configured to automatically build and release the application when a version tag (v*.*.*) is pushed. The workflow SHALL run on a Windows runner, build the application, and create a GitHub Release with the .zip attachment.

#### Scenario: Version tag pushed triggers workflow

WHEN a tag matching the pattern v*.*.* is pushed to the repository
THEN the GitHub Actions workflow SHALL be triggered
AND the workflow SHALL run on a Windows runner

#### Scenario: Successful build creates GitHub Release

WHEN the build completes successfully on the Windows runner
THEN a GitHub Release SHALL be created with the tag name as the release title
AND the .zip artifact SHALL be attached to the Release as an asset
AND the Release SHALL be marked as published

#### Scenario: Build failure does not create Release

WHEN the build fails on the Windows runner
THEN no GitHub Release SHALL be created
AND the workflow SHALL report a failure status
AND no partial or incomplete artifacts SHALL be attached to any Release

### Requirement: GitHub Pages Download Page

A GitHub Pages site SHALL provide a download page with an application introduction, screenshots, and a download button linking to the latest Release .zip.

#### Scenario: User visits the download page

WHEN a user navigates to the GitHub Pages URL
THEN the page SHALL display:
- An application introduction describing SnapAI features
- Application screenshots
- A download button linking to the latest Release .zip asset

#### Scenario: User clicks the download button

WHEN the user clicks the download button on the download page
THEN the browser SHALL initiate a download of the latest Release .zip file from GitHub Releases

### Requirement: Download Page Auto-Update via GitHub API

The download page SHALL automatically fetch and display the latest release information using the GitHub API, ensuring the download link always points to the most recent version.

#### Scenario: Download page fetches latest release info

WHEN the download page is loaded in a browser
THEN the page SHALL call the GitHub API to retrieve the latest Release information
AND the download button link SHALL be updated to point to the .zip asset from the latest Release
AND the version number displayed on the page SHALL match the latest Release tag

#### Scenario: New release is published

WHEN a new GitHub Release is published
THEN the download page SHALL reflect the new version on the next page load
AND the download button SHALL link to the new .zip asset
AND no manual update to the download page SHALL be required

### Requirement: Responsive Design for Download Page

The download page SHALL implement responsive design to provide an optimal viewing experience on both mobile and desktop devices.

#### Scenario: User views download page on desktop

WHEN the download page is viewed on a desktop browser with a viewport width of 1024px or greater
THEN the page layout SHALL be optimized for desktop viewing
AND all content SHALL be readable and accessible

#### Scenario: User views download page on mobile

WHEN the download page is viewed on a mobile browser with a viewport width less than 768px
THEN the page layout SHALL adapt to the mobile viewport
AND all content SHALL remain readable without horizontal scrolling
AND the download button SHALL be easily tappable on touch devices
