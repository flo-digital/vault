# Vault — Visual Asset Manager

A macOS app for organizing inspiration images, 3D renders, textures, and any visual assets. Built with Electron.

## Download

Go to [Releases](../../releases) and download the DMG for your Mac:
- **Apple Silicon (M1/M2/M3/M4)** → `Vault-1.0.0-arm64.dmg`
- **Intel Mac** → `Vault-1.0.0.dmg`

## Install

1. Open the DMG and drag **Vault** to your Applications folder
2. Try to open Vault — macOS will show a security warning, click **OK**
3. Open **System Settings → Privacy & Security**
4. Scroll down — you'll see *"Vault was blocked…"* → click **Open Anyway**
5. Confirm with Touch ID or your password
6. Vault opens normally from now on — you only do this once

> **Why the warning?** Vault is not distributed through the Mac App Store, so macOS asks you to confirm trust the first time. This is normal for independent apps.

**Alternative (Terminal):**
```
xattr -cr /Applications/Vault.app
```

## Features

- Import images via drag-and-drop or the Import button — picks which collection to add them to
- Organize into collections and nested sub-collections (right-click a collection to manage)
- Tag images with custom tags — type to create new ones, × to delete unused ones
- Filter by color, search by name, sort by date/name/size
- Right panel shows 6-color palette — click any swatch to copy its hex code
- Spacebar to fullscreen-preview a hovered image; arrow keys to navigate
- Shift-click or Cmd-click to select multiple images
- Light / dark mode toggle
- All data and collections persist between sessions

## Build from source

```bash
cd vault-app
npm install
npm run build:mac
# DMGs land in ../dist/
```
