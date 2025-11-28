import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/sqlite';

export async function GET(request, { params }) {
  try {
    const db = getDatabase();
    const { id } = params;

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const db = getDatabase();
    const { id } = params;
    const data = await request.json();

    const stmt = db.prepare(`
      UPDATE products SET
        sku = ?,
        barcode = ?,
        name_english = ?,
        name_urdu = ?,
        category = ?,
        sub_category = ?,
        brand = ?,
        unit = ?,
        supplier = ?,
        status = ?,
        image_url = ?,
        stock = ?,
        price = ?
      WHERE id = ?
    `);

    stmt.run(
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
      data.price || 0,
      id
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const db = getDatabase();
    const { id } = params;

    db.prepare('DELETE FROM products WHERE id = ?').run(id);

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
