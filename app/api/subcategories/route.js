import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/sqlite';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryName = searchParams.get('category');

    const db = getDatabase();

    if (categoryName) {
      // Get subcategories for a specific category
      const category = db.prepare('SELECT id FROM categories WHERE name = ?').get(categoryName);

      if (!category) {
        return NextResponse.json({ subcategories: [] });
      }

      const subcategories = db.prepare(
        'SELECT * FROM subcategories WHERE category_id = ? ORDER BY name'
      ).all(category.id);

      return NextResponse.json({ subcategories });
    } else {
      // Get all subcategories
      const subcategories = db.prepare('SELECT * FROM subcategories ORDER BY name').all();
      return NextResponse.json({ subcategories });
    }
  } catch (error) {
    console.error('Get subcategories error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    console.log('[API] POST /api/subcategories - Starting');

    const db = getDatabase();
    const { name, categoryName } = await request.json();

    console.log('[API] Received:', { name, categoryName });

    if (!name || !name.trim() || !categoryName) {
      console.error('[API] Invalid data');
      return NextResponse.json({
        error: 'Subcategory name and category are required'
      }, { status: 400 });
    }

    // Get category ID
    const category = db.prepare('SELECT id FROM categories WHERE name = ?').get(categoryName);

    if (!category) {
      return NextResponse.json({
        error: 'Category not found'
      }, { status: 404 });
    }

    const stmt = db.prepare('INSERT INTO subcategories (name, category_id) VALUES (?, ?)');
    const result = stmt.run(name.trim(), category.id);

    console.log('[API] Subcategory inserted, ID:', result.lastInsertRowid);

    const subcategory = db.prepare('SELECT * FROM subcategories WHERE id = ?').get(result.lastInsertRowid);
    console.log('[API] Subcategory retrieved:', subcategory);

    return NextResponse.json({ success: true, subcategory });
  } catch (error) {
    console.error('[API] Create subcategory error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
