# Vault — Visual Asset Manager

A macOS app for organizing inspiration images, 3D renders, textures, and any visual assets. Built with Electron.

## Install

1. Download the latest `.dmg` from [Releases](../../releases)
2. Open the DMG and drag **Vault** to your Applications folder
3. **First launch:** macOS may block unsigned apps. Right-click Vault in Applications → **Open** → click Open in the dialog. You only need to do this once.

   Or run in Terminal:
   ```
   sudo xattr -rd com.apple.quarantine /Applications/Vault.app
   ```

## Features

- Import images via drag-and-drop or the Import button
- Organize into collections and nested sub-collections (right-click a collection to manage)
- Tag images, filter by color, search by name
- Right-panel with 6-color palette — click any swatch to copy its hex code
- Spacebar to fullscreen-preview a hovered image
- Shift-click to select a range of images
- Light / dark mode toggle
- All data persists between sessions

## Build from source

```bash
cd vault-app
npm install
npm run build:mac
# DMG lands in ../dist/
```
