import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/sqlite';

export async function GET() {
  try {
    const db = getDatabase();
    const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = getDatabase();
    const data = await request.json();

    // Generate SKU if not provided
    if (!data.sku) {
      const count = db.prepare('SELECT COUNT(*) as count FROM products').get();
      data.sku = `PRD${String(count.count + 1).padStart(6, '0')}`;
    }

    const stmt = db.prepare(`
      INSERT INTO products (
        sku, barcode, name_english, name_urdu, category, sub_category,
        brand, unit, supplier, status, image_url, stock, price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.sku,
      data.barcode || null,
      data.name_english,
      data.name_urdu || null,
      data.category || null,
      data.sub_category || null,
      data.brand || null,
      data.unit || null,
      data.supplier || null,
      data.status || 'Active',
      data.image_url || null,
      data.stock || 0,
      data.price || 0
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
