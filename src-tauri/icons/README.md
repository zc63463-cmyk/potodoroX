# PomodoroX Icons

This directory should contain the application icons for all supported platforms.

## Generating Icons

Use the Tauri CLI to generate all required icon sizes from a single source image (recommended: 1024x1024 PNG with transparent background):

```bash
pnpm tauri icon path/to/icon.png
```

This will generate the following files:
- `32x32.png` - Small icon
- `128x128.png` - Medium icon
- `128x128@2x.png` - Retina medium icon
- `icon.icns` - macOS icon bundle
- `icon.ico` - Windows icon
- `icon.png` - Linux icon (1024x1024)
