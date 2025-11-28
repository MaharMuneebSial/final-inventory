import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/sqlite';

export async function GET() {
  try {
    const db = getDatabase();
    const suppliers = db.prepare('SELECT * FROM suppliers ORDER BY name').all();
    return NextResponse.json({ suppliers });
  } catch (error) {
    console.error('Get suppliers error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = getDatabase();
    const { name, contact } = await request.json();

    const stmt = db.prepare('INSERT INTO suppliers (name, contact) VALUES (?, ?)');
    const result = stmt.run(name, contact || null);

    const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({ success: true, supplier });
  } catch (error) {
    console.error('Create supplier error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
