import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/sqlite';

export async function GET() {
  try {
    const db = getDatabase();
    const brands = db.prepare('SELECT * FROM brands ORDER BY name').all();
    return NextResponse.json({ brands });
  } catch (error) {
    console.error('Get brands error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    console.log('[API] POST /api/brands - Starting');

    const db = getDatabase();
    console.log('[API] Database connection established');

    const { name } = await request.json();
    console.log('[API] Received brand name:', name);

    if (!name || !name.trim()) {
      console.error('[API] Invalid brand name');
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
    }

    const stmt = db.prepare('INSERT INTO brands (name) VALUES (?)');
    const result = stmt.run(name.trim());
    console.log('[API] Brand inserted, ID:', result.lastInsertRowid);

    const brand = db.prepare('SELECT * FROM brands WHERE id = ?').get(result.lastInsertRowid);
    console.log('[API] Brand retrieved:', brand);

    return NextResponse.json({ success: true, brand });
  } catch (error) {
    console.error('[API] Create brand error:', error);
    console.error('[API] Error stack:', error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
