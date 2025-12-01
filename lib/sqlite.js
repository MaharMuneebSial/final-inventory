import Database from 'better-sqlite3';
import path from 'path';

let db;

export function getDatabase() {
  if (!db) {
    // Database path - always use project root for Next.js
    const dbPath = path.join(process.cwd(), 'inventory.db');

    console.log('[SQLite] Database path:', dbPath);
    db = new Database(dbPath);

    // Create tables for inventory management
    db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT UNIQUE,
        barcode TEXT,
        name_english TEXT NOT NULL,
        name_urdu TEXT,
        category TEXT,
        sub_category TEXT,
        brand TEXT,
        unit TEXT,
        supplier TEXT,
        status TEXT DEFAULT 'Active',
        image_url TEXT,
        stock INTEGER DEFAULT 0,
        price REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS subcategories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        UNIQUE(name, category_id)
      );

      CREATE TABLE IF NOT EXISTS brands (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        contact TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id TEXT UNIQUE NOT NULL,
        sale_date TEXT NOT NULL,
        sale_time TEXT NOT NULL,
        total_items INTEGER DEFAULT 0,
        subtotal REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        tax REAL DEFAULT 0,
        grand_total REAL DEFAULT 0,
        payment_method TEXT,
        amount_received REAL DEFAULT 0,
        change_due REAL DEFAULT 0,
        sold_by TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sale_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id TEXT NOT NULL,
        item_id INTEGER,
        product_name TEXT NOT NULL,
        barcode TEXT,
        sale_type TEXT,
        quantity REAL NOT NULL,
        unit TEXT,
        rate_per_unit REAL NOT NULL,
        amount REAL NOT NULL,
        item_discount REAL DEFAULT 0,
        FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        purchase_id TEXT UNIQUE NOT NULL,
        purchase_date TEXT NOT NULL,
        supplier_name TEXT NOT NULL,
        supplier_phone TEXT,
        supplier_invoice_no TEXT,
        payment_type TEXT,
        due_date TEXT,
        total_items INTEGER DEFAULT 0,
        subtotal REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        tax REAL DEFAULT 0,
        grand_total REAL DEFAULT 0,
        amount_paid REAL DEFAULT 0,
        balance_due REAL DEFAULT 0,
        payment_status TEXT DEFAULT 'Pending',
        received_by TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS purchase_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        purchase_id TEXT NOT NULL,
        item_id INTEGER,
        product_name TEXT NOT NULL,
        barcode TEXT,
        quantity REAL NOT NULL,
        received_qty REAL,
        unit TEXT,
        rate REAL NOT NULL,
        purchase_price REAL NOT NULL,
        sale_price REAL,
        total REAL NOT NULL,
        expiry_date TEXT,
        FOREIGN KEY (purchase_id) REFERENCES purchases(purchase_id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payment_type TEXT,
        amount REAL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS customer_balances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        balance REAL DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS cash_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_type TEXT,
        amount REAL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS bank_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_name TEXT,
        balance REAL DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        expense_type TEXT,
        amount REAL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS purchase_returns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        return_id TEXT UNIQUE NOT NULL,
        return_date TEXT NOT NULL,
        original_invoice TEXT NOT NULL,
        supplier_name TEXT NOT NULL,
        return_reason TEXT,
        total_return_amount REAL DEFAULT 0,
        due_return_amount REAL DEFAULT 0,
        refund_method TEXT,
        status TEXT DEFAULT 'Pending',
        returned_by TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (original_invoice) REFERENCES purchases(purchase_id)
      );

      CREATE TABLE IF NOT EXISTS purchase_return_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        return_id TEXT NOT NULL,
        item_id INTEGER,
        product_name TEXT NOT NULL,
        original_quantity REAL NOT NULL,
        return_qty REAL NOT NULL,
        unit TEXT,
        unit_price REAL NOT NULL,
        line_total REAL NOT NULL,
        item_condition TEXT,
        FOREIGN KEY (return_id) REFERENCES purchase_returns(return_id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS sale_returns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        return_id TEXT UNIQUE NOT NULL,
        return_date TEXT NOT NULL,
        return_time TEXT NOT NULL,
        original_sale_id TEXT NOT NULL,
        customer_name TEXT,
        return_reason TEXT,
        total_return_amount REAL DEFAULT 0,
        refund_amount REAL DEFAULT 0,
        refund_method TEXT,
        status TEXT DEFAULT 'Pending',
        processed_by TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (original_sale_id) REFERENCES sales(sale_id)
      );

      CREATE TABLE IF NOT EXISTS sale_return_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        return_id TEXT NOT NULL,
        item_id INTEGER,
        product_name TEXT NOT NULL,
        original_quantity REAL NOT NULL,
        return_qty REAL NOT NULL,
        unit TEXT,
        unit_price REAL NOT NULL,
        line_total REAL NOT NULL,
        item_condition TEXT,
        FOREIGN KEY (return_id) REFERENCES sale_returns(return_id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES products(id)
      );
    `);
  }

  return db;
}
