# Inventory Software - Nawab Cash and Carry

<div align="center">

**Modern Inventory Management System**

*Desktop Application Built with Electron + Next.js*

By Airoxlab

---

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Build](#build)

</div>

## Overview

A professional inventory management desktop application featuring a premium 2030-style SaaS UI. Built with Electron for cross-platform compatibility and Next.js for modern web technologies.

## Features

### 🎨 Modern UI/UX
- 2030-style premium SaaS interface
- Glass morphism with backdrop blur effects
- Geist Sans typography
- Smooth animations and transitions
- Responsive and intuitive design

### 🔐 Authentication
- Secure login with Supabase
- User session management
- Protected routes

### 📦 Inventory Management
- **Sales**: Create and manage sales invoices
- **Sales List**: View all sales records
- **Purchase**: Create purchase orders
- **Purchase List**: View purchase history
- **Purchase Return**: Handle purchase returns
- **Sale Return**: Process sale returns
- **Payment**: Manage payments and transactions
- **Products**: Add and manage product inventory
- **Stock Alerts**: Real-time out-of-stock notifications

### 💾 Database
- **Supabase**: Authentication (online)
- **SQLite**: All inventory data (local, offline-ready)
- Auto-created database with proper schema
- Secure user data storage

### 💻 Cross-Platform Desktop App
- Windows (.exe installer)
- macOS (.dmg installer)
- Linux (.AppImage, .deb)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Create users table in Supabase:

```sql
CREATE TABLE public.users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  password VARCHAR(100)
);

-- Insert test user
INSERT INTO public.users (name, email, password)
VALUES ('Admin', 'admin@nawab.com', 'admin123');
```

### 3. Run the Application

#### As Desktop App (Recommended)
```bash
npm run electron:dev
```

#### As Web App
```bash
npm run dev
```
Visit: http://localhost:3000

### 4. Login

- **Email**: admin@nawab.com
- **Password**: admin123

## Documentation

- **[SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)** - Complete setup guide
- **[QUICK_START.md](QUICK_START.md)** - Quick reference guide
- **[ELECTRON_GUIDE.md](ELECTRON_GUIDE.md)** - Electron desktop app guide

## Build for Production

### Windows
```bash
npm run electron:build:win
```
Output: `dist/Inventory Software Setup 1.0.0.exe`

### macOS
```bash
npm run electron:build:mac
```
Output: `dist/Inventory Software-1.0.0.dmg`

### Linux
```bash
npm run electron:build:linux
```
Output: `dist/inventory-software-1.0.0.AppImage`

## Project Structure

```
my-app/
├── electron/               # Electron main process
│   ├── main.js            # Main process entry
│   └── preload.js         # Preload script
├── app/                   # Next.js application
│   ├── api/               # API routes (SQLite)
│   ├── dashboard/         # Dashboard pages
│   ├── layout.js          # Root layout
│   ├── page.js            # Login page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Sidebar.js         # Navigation sidebar
│   ├── Topbar.js          # Top bar
│   └── StockOutPanel.js   # Stock notifications
├── lib/                   # Utilities
│   ├── supabase.js        # Supabase client
│   └── sqlite.js          # SQLite database
├── public/                # Static assets
├── out/                   # Next.js build output
├── dist/                  # Electron build output
└── package.json           # Dependencies & scripts
```

## Tech Stack

- **Framework**: Next.js 16 (React 19)
- **Desktop**: Electron 39
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Database**:
  - Supabase (Authentication)
  - SQLite (Local data with better-sqlite3)
- **Build**: Electron Builder

## Features Breakdown

### Topbar (Fixed)
- Left: "Inventory Software by Airoxlab"
- Right: Stock alerts bell icon + "Nawab Cash and Carry"

### Sidebar (Fixed, 256px)
- Sales
- Sales List
- Purchase
- Purchase List
- Purchase Return
- Sale Return Invoice
- Sale Return List
- Payment
- New Product Entry
- All Products

### Main Content Area
- Centered between topbar and sidebar
- Modern card-based layout
- Glass morphism effects
- Smooth hover animations

## Database Schema

### Supabase (Online)
**users** - Authentication
- id (serial)
- name (varchar)
- email (varchar)
- password (varchar)

### SQLite (Local)

**products**
- id (integer, primary key)
- name (text)
- unit (text)
- stock (integer)
- price (real)
- created_at (datetime)

**sales**
- id (integer, primary key)
- invoice_no (text)
- customer_name (text)
- total_amount (real)
- created_at (datetime)

**purchases**
- id (integer, primary key)
- invoice_no (text)
- supplier_name (text)
- total_amount (real)
- created_at (datetime)

**payments**
- id (integer, primary key)
- payment_type (text)
- amount (real)
- description (text)
- created_at (datetime)

## API Routes

- `GET/POST /api/products` - Manage products
- `GET/POST /api/sales` - Manage sales
- `GET/POST /api/purchases` - Manage purchases

## Development

### Available Scripts

```bash
npm run dev              # Next.js dev server
npm run build            # Build Next.js
npm run start            # Start Next.js production

npm run electron:dev     # Run Electron in development
npm run electron:build   # Build for all platforms
npm run electron:build:win   # Build for Windows
npm run electron:build:mac   # Build for macOS
npm run electron:build:linux # Build for Linux
```

## Color Palette

- **Primary**: Neutral-900 (Dark)
- **Background**: Neutral-50 (Light)
- **Surface**: White/80 with backdrop blur
- **Border**: Neutral-200/60
- **Text**: Neutral-700 (Body), Neutral-900 (Headings)

## Contributing

This is a proprietary project by Airoxlab for Nawab Cash and Carry.

## License

Copyright © 2025 Airoxlab. All rights reserved.

## Support

For support and questions:
- Email: support@airoxlab.com
- Documentation: See docs/ folder

## Version

**v1.0.0** - Initial Release

---

<div align="center">

**Developed with ❤️ by Airoxlab**

*For Nawab Cash and Carry*

</div>
