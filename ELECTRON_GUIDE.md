# Electron Desktop Application Guide

## Overview

Your Inventory Management System has been successfully converted into an **Electron Desktop Application**! This means you can now run it as a standalone desktop app on Windows, macOS, and Linux.

## Key Features

- **Desktop Application**: Runs independently without a browser
- **Cross-Platform**: Works on Windows, Mac, and Linux
- **Local Database**: SQLite database stored in user's application data folder
- **Auto-Updates Ready**: Structure prepared for future auto-update implementation
- **Native Performance**: Fast and responsive desktop experience

## Project Structure

```
my-app/
├── electron/
│   ├── main.js          # Main Electron process
│   └── preload.js       # Preload script for security
├── app/                 # Next.js application
├── components/          # React components
├── lib/
│   ├── supabase.js      # Supabase (login only)
│   └── sqlite.js        # SQLite (local data)
├── out/                 # Built Next.js static files
├── dist/                # Electron build output
└── package.json         # Updated with Electron scripts
```

## Available Scripts

### Development Mode

#### 1. **Run Electron in Development** (Recommended for Development)
```bash
npm run electron:dev
```

This will:
- Start Next.js dev server on port 3000
- Wait for the server to be ready
- Launch Electron window with dev tools
- Enable hot-reload for changes

#### 2. **Run Next.js Only** (Web Development)
```bash
npm run dev
```

Opens in browser at http://localhost:3000

### Production Build

#### **Build for Windows** (Current Platform)
```bash
npm run electron:build:win
```

This will:
1. Build Next.js static export
2. Create Windows installer (.exe)
3. Output to `dist/` folder

**Output Files:**
- `dist/Inventory Software Setup 1.0.0.exe` - Installer
- `dist/win-unpacked/` - Unpacked application

#### **Build for macOS**
```bash
npm run electron:build:mac
```

Output: `.dmg` installer for Mac

#### **Build for Linux**
```bash
npm run electron:build:linux
```

Output: `.AppImage` and `.deb` packages

#### **Build for All Platforms**
```bash
npm run electron:build
```

## How It Works

### Electron Architecture

```
┌─────────────────────────────────────┐
│     Electron Main Process           │
│  (electron/main.js)                 │
│  - Creates window                   │
│  - Manages SQLite database path     │
│  - Handles system events            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     Preload Script                  │
│  (electron/preload.js)              │
│  - Secure bridge between processes  │
│  - Exposes safe APIs                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     Renderer Process                │
│  (Next.js React App)                │
│  - Login page (Supabase)            │
│  - Dashboard pages                  │
│  - All UI components                │
└─────────────────────────────────────┘
```

### Database Location

The SQLite database is automatically stored in:

**Windows:**
```
C:\Users\YourName\AppData\Roaming\inventory-software\inventory.db
```

**macOS:**
```
~/Library/Application Support/inventory-software/inventory.db
```

**Linux:**
```
~/.config/inventory-software/inventory.db
```

This ensures:
- Data persists across app updates
- Each user has their own data
- Data is backed up with user files

## Development Workflow

### Step 1: Setup (First Time Only)

1. **Install Dependencies** (already done)
```bash
npm install
```

2. **Configure Supabase** (for login)
- Update `.env.local` with your Supabase credentials
- Create users table in Supabase (see SETUP_INSTRUCTIONS.md)

### Step 2: Development

1. **Start Development Mode**
```bash
npm run electron:dev
```

2. **Make Changes**
- Edit files in `app/`, `components/`, etc.
- Next.js hot-reload will update automatically
- Electron window will refresh with changes

3. **Debug**
- Dev tools open automatically in development mode
- Use Console, Network, Elements tabs like in Chrome
- Check main process logs in terminal

### Step 3: Testing

1. **Test in Development**
```bash
npm run electron:dev
```

2. **Test Production Build Locally**
```bash
npm run electron:build:win
```

Then run the installer from `dist/` folder

### Step 4: Distribution

1. **Build for Production**
```bash
npm run electron:build:win
```

2. **Distribute**
- Share `Inventory Software Setup 1.0.0.exe` with users
- Users install like any Windows application
- No need for Node.js, npm, or any dependencies

## Configuration

### Application Info

Edit in [package.json](package.json):

```json
{
  "name": "inventory-software",
  "productName": "Inventory Software - Nawab Cash and Carry",
  "version": "1.0.0",
  "description": "Inventory Management System by Airoxlab",
  "author": "Airoxlab"
}
```

### Window Settings

Edit in [electron/main.js](electron/main.js):

```javascript
const mainWindow = new BrowserWindow({
  width: 1400,        // Window width
  height: 900,        // Window height
  minWidth: 1200,     // Minimum width
  minHeight: 700,     // Minimum height
  // ... other settings
});
```

### Build Settings

Edit in [package.json](package.json) under `"build"`:

```json
{
  "build": {
    "appId": "com.airoxlab.inventory",
    "productName": "Inventory Software",
    // ... platform-specific settings
  }
}
```

## Adding Application Icons

### Windows (.ico)

1. Create a 256x256 PNG icon
2. Convert to `.ico` using online tool or software
3. Save as `public/icon.ico`

### macOS (.icns)

1. Create a 512x512 PNG icon
2. Convert to `.icns` using iconutil or online tool
3. Save as `public/icon.icns`

### Linux (.png)

1. Create a 512x512 PNG icon
2. Save as `public/icon.png`

**Recommended Icon Sizes:**
- 16x16, 32x32, 48x48, 64x64, 128x128, 256x256, 512x512

## Troubleshooting

### Issue: "electron: command not found"

**Solution:**
```bash
npm install
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Stop any running Next.js server
# Or change port in electron/main.js
```

### Issue: SQLite database not found

**Solution:**
- Check that `better-sqlite3` is installed
- Ensure `lib/sqlite.js` has correct path logic
- Database is auto-created on first run

### Issue: Supabase authentication not working

**Solution:**
- Verify `.env.local` has correct credentials
- Check Supabase users table exists
- Ensure internet connection for Supabase

### Issue: Build fails

**Solution:**
```bash
# Clean and rebuild
rm -rf node_modules out dist
npm install
npm run electron:build:win
```

## Performance Tips

1. **Optimize Images**
   - Use compressed images
   - Leverage Next.js Image component (when not in static export)

2. **Reduce Bundle Size**
   - Only import needed components from libraries
   - Use dynamic imports for heavy components

3. **Database Optimization**
   - Add indexes to frequently queried columns
   - Use prepared statements (already implemented)

## Security Considerations

1. **Context Isolation**: Enabled by default
2. **Node Integration**: Disabled in renderer
3. **Preload Script**: Secure API exposure
4. **CSP Headers**: Consider adding for production

## Future Enhancements

1. **Auto-Updates**
   - Use `electron-updater` package
   - Configure update server

2. **Code Signing**
   - Sign Windows builds (certificate required)
   - Sign macOS builds (Apple Developer account)

3. **System Tray**
   - Add tray icon for background running
   - Quick access menu

4. **Notifications**
   - Native desktop notifications
   - Stock alerts, payment reminders

5. **Offline Mode**
   - Full offline functionality (already works!)
   - Sync when online

6. **Database Backup**
   - Auto-backup to cloud
   - Export/import functionality

## Quick Reference Commands

```bash
# Development
npm run electron:dev          # Run in development mode
npm run dev                   # Run Next.js only (web)

# Building
npm run electron:build:win    # Build for Windows
npm run electron:build:mac    # Build for macOS
npm run electron:build:linux  # Build for Linux
npm run electron:build        # Build for all platforms

# Next.js only
npm run build                 # Build Next.js
npm start                     # Start Next.js production server
```

## Support

For issues:
1. Check this guide
2. Review [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)
3. Check Electron docs: https://www.electronjs.org/docs
4. Check Next.js docs: https://nextjs.org/docs

## Version History

**v1.0.0** (Current)
- Initial Electron conversion
- Windows, macOS, Linux support
- Supabase authentication
- SQLite local database
- Modern 2030 UI design

---

**Built with:**
- Electron 39.x
- Next.js 16.x
- React 19.x
- Better-SQLite3
- Supabase

**Developed by Airoxlab**
**For: Nawab Cash and Carry**

Happy Desktop App Development! 🚀
