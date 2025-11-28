# Inventory Management System - Setup Instructions

## Overview
A modern inventory management system built with Next.js featuring a 2030-style premium SaaS UI. The system uses Supabase for authentication and SQLite for all other data management.

## Features
- Premium 2030 UI Design with Geist font
- Supabase Authentication (Login only)
- SQLite Database for inventory management
- Modern sidebar navigation
- Stock-out notifications
- Responsive design with Tailwind CSS

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account (for authentication)

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase

#### Create a Supabase Project
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Create a new project
3. Go to Project Settings > API
4. Copy your `Project URL` and `anon public` key

#### Create Users Table
Run this SQL in your Supabase SQL Editor:

```sql
create table public.users (
  id serial not null,
  name character varying(100) null,
  email character varying(100) null,
  password character varying(100) null,
  constraint users_pkey primary key (id)
) TABLESPACE pg_default;
```

#### Insert Test User (Optional)
```sql
INSERT INTO public.users (name, email, password)
VALUES ('Test User', 'test@example.com', 'password123');
```

### 3. Configure Environment Variables

Update the `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
my-app/
├── app/
│   ├── dashboard/
│   │   ├── sales/
│   │   ├── sales-list/
│   │   ├── purchase/
│   │   ├── purchase-list/
│   │   ├── purchase-return/
│   │   ├── sale-return-invoice/
│   │   ├── sale-return-list/
│   │   ├── payment/
│   │   ├── new-product/
│   │   ├── all-products/
│   │   └── layout.js
│   ├── layout.js
│   ├── page.js (Login Page)
│   └── globals.css
├── components/
│   ├── Sidebar.js
│   ├── Topbar.js
│   └── StockOutPanel.js
├── lib/
│   ├── supabase.js (Supabase client)
│   └── sqlite.js (SQLite database)
└── inventory.db (Auto-created SQLite database)
```

## Database Schema

### SQLite Tables (Auto-created)
The SQLite database will be automatically created when the app runs. Tables include:

- **products**: Product inventory management
- **sales**: Sales invoices
- **purchases**: Purchase invoices
- **payments**: Payment records

### Supabase Table (Manual setup)
- **users**: User authentication (email/password)

## Usage

### Login
1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Enter your Supabase user credentials
3. Click "Sign In"

### Navigation
- Use the sidebar to navigate between different modules
- Click the bell icon (top-right) to view out-of-stock items

## Design System

### Colors
- Primary: Neutral-900 (Black)
- Background: White/Neutral-50
- Borders: Neutral-200/60 (with transparency)

### Typography
- Font: Geist Sans
- Tracking: Tight
- Sizes: 15px (body), 2xl (headings)

### Components
- Cards: `bg-white/80 backdrop-blur-xl rounded-2xl`
- Buttons: `rounded-xl shadow-lg hover:shadow-xl`
- Sidebar: `w-64 bg-white/70 backdrop-blur-xl`

## Customization

### Adding New Pages
1. Create a new folder in `app/dashboard/your-page/`
2. Add `page.js` with your component
3. Update sidebar navigation in `components/Sidebar.js`

### Modifying Colors
Update Tailwind classes in components:
- Primary color: `bg-neutral-900`
- Accent: `bg-neutral-100/70`

## Support

For issues or questions:
- Email: support@airoxlab.com
- GitHub: Create an issue in the repository

## License

Copyright © 2025 Airoxlab. All rights reserved.

---

**Nawab Cash and Carry - Inventory Management System**
