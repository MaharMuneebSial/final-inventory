# Quick Start Guide

## What's Been Created

Your inventory management system is now ready with:

### UI Components
- Modern 2030-style premium SaaS interface
- Fixed Sidebar with navigation
- Fixed Topbar with company branding
- Stock-out notification panel (click bell icon)
- All pages display in the center area

### Pages Created
1. **Sales** - `/dashboard/sales`
2. **Sales List** - `/dashboard/sales-list`
3. **Purchase** - `/dashboard/purchase`
4. **Purchase List** - `/dashboard/purchase-list`
5. **Purchase Return** - `/dashboard/purchase-return`
6. **Sale Return Invoice** - `/dashboard/sale-return-invoice`
7. **Sale Return List** - `/dashboard/sale-return-list`
8. **Payment** - `/dashboard/payment`
9. **New Product Entry** - `/dashboard/new-product`
10. **All Products** - `/dashboard/all-products`

### Authentication
- **Login Page**: Uses Supabase authentication
- **Dashboard Pages**: Use SQLite for backend

### Backend APIs Created
- `/api/products` - GET/POST for products
- `/api/sales` - GET/POST for sales
- `/api/purchases` - GET/POST for purchases

## Next Steps

### 1. Configure Supabase (Required)

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Create a new project
3. Run this SQL in SQL Editor:

```sql
create table public.users (
  id serial not null,
  name character varying(100) null,
  email character varying(100) null,
  password character varying(100) null,
  constraint users_pkey primary key (id)
);

-- Insert a test user
INSERT INTO public.users (name, email, password)
VALUES ('Admin', 'admin@nawab.com', 'admin123');
```

4. Update `.env.local` with your credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Run the Application

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 3. Login
- Email: `admin@nawab.com`
- Password: `admin123`

## Color Scheme

The application uses a neutral color palette:

- **Primary**: Neutral-900 (Dark gray/black)
- **Background**: Neutral-50 (Light gray)
- **Surface**: White with 80% opacity + backdrop blur
- **Border**: Neutral-200 with 60% opacity
- **Text**: Neutral-700 (Body), Neutral-900 (Headings)

## Design Features

### Topbar (Fixed)
- Left: "Inventory Software by Airoxlab"
- Right: Bell icon (stock alerts) + "Nawab Cash and Carry"

### Sidebar (Fixed, 256px wide)
- Modern icons from Lucide
- Hover effects with smooth transitions
- Active state with dark background

### Main Content Area
- Positioned: `margin-left: 256px` (sidebar width)
- Positioned: `margin-top: 64px` (topbar height)
- Padding: 32px (8 in Tailwind)

### Cards/Panels
- Background: `bg-white/80 backdrop-blur-xl`
- Border: `border-neutral-200/60`
- Rounded: `rounded-2xl`
- Shadow: `shadow-[0_4px_20px_rgba(0,0,0,0.04)]`
- Hover: Slight lift with enhanced shadow

## File Structure

```
my-app/
├── app/
│   ├── api/                    # SQLite API routes
│   │   ├── products/
│   │   ├── sales/
│   │   └── purchases/
│   ├── dashboard/              # All dashboard pages
│   │   └── [page-name]/
│   ├── layout.js               # Root layout
│   ├── page.js                 # Login page
│   └── globals.css
├── components/
│   ├── Sidebar.js              # Fixed sidebar
│   ├── Topbar.js               # Fixed topbar
│   └── StockOutPanel.js        # Stock notification
├── lib/
│   ├── supabase.js             # Supabase client (login only)
│   └── sqlite.js               # SQLite database (all other data)
└── .env.local                  # Environment variables
```

## Development Tips

### Adding New Features to a Page

Edit any page in `app/dashboard/[page-name]/page.js`:

```jsx
'use client';

import { useState, useEffect } from 'react';

export default function YourPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch data from SQLite API
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setData(data.products));
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-neutral-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-6">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
        Your Page Title
      </h1>
      {/* Your content here */}
    </div>
  );
}
```

### Using SQLite in Pages

Call your API routes:

```javascript
// GET data
const response = await fetch('/api/products');
const { products } = await response.json();

// POST data
const response = await fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Product Name', unit: 'Pc', stock: 100, price: 50 })
});
```

## Database Schema

### SQLite (Auto-created)

**products**
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- unit (TEXT)
- stock (INTEGER)
- price (REAL)
- created_at (DATETIME)

**sales**
- id (INTEGER PRIMARY KEY)
- invoice_no (TEXT)
- customer_name (TEXT)
- total_amount (REAL)
- created_at (DATETIME)

**purchases**
- id (INTEGER PRIMARY KEY)
- invoice_no (TEXT)
- supplier_name (TEXT)
- total_amount (REAL)
- created_at (DATETIME)

**payments**
- id (INTEGER PRIMARY KEY)
- payment_type (TEXT)
- amount (REAL)
- description (TEXT)
- created_at (DATETIME)

## Support

Need help? Check:
- [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) - Full setup guide
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)

---

**Happy Coding!**
Built with ❤️ by Airoxlab
