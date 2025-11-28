import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/sqlite';

export async function GET(request, { params }) {
  try {
    const db = getDatabase();
    const { returnId } = params;

    const items = db.prepare(`
      SELECT * FROM sale_return_items
      WHERE return_id = ?
    `).all(returnId);

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Get sale return items error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
