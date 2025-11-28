import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/sqlite';

export async function GET() {
  try {
    const db = getDatabase();
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    console.log('[API] POST /api/categories - Starting');

    const db = getDatabase();
    console.log('[API] Database connection established');

    const { name } = await request.json();
    console.log('[API] Received category name:', name);

    if (!name || !name.trim()) {
      console.error('[API] Invalid category name');
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const stmt = db.prepare('INSERT INTO categories (name) VALUES (?)');
    const result = stmt.run(name.trim());
    console.log('[API] Category inserted, ID:', result.lastInsertRowid);

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    console.log('[API] Category retrieved:', category);

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('[API] Create category error:', error);
    console.error('[API] Error stack:', error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
