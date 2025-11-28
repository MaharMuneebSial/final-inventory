import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/sqlite';

export async function GET(request, { params }) {
  try {
    const db = getDatabase();
    const { saleId } = params;

    const items = db.prepare(`
      SELECT * FROM sale_items
      WHERE sale_id = ?
    `).all(saleId);

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Get sale items error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
