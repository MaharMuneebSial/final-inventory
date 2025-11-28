import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/sqlite';

export async function GET(request, { params }) {
  try {
    const db = getDatabase();
    const { saleId } = params;

    const sale = db.prepare(`
      SELECT * FROM sales WHERE sale_id = ?
    `).get(saleId);

    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    const items = db.prepare(`
      SELECT * FROM sale_items WHERE sale_id = ?
    `).all(saleId);

    return NextResponse.json({ sale: { ...sale, items } });
  } catch (error) {
    console.error('Get sale error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const db = getDatabase();
    const { saleId } = params;

    // Get sale items to restore stock
    const items = db.prepare(`
      SELECT * FROM sale_items WHERE sale_id = ?
    `).all(saleId);

    // Start transaction
    const deleteSale = db.prepare('DELETE FROM sales WHERE sale_id = ?');
    const updateProductStock = db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?');

    const transaction = db.transaction((sale_id, saleItems) => {
      // Restore stock for each item
      saleItems.forEach(item => {
        if (item.item_id) {
          updateProductStock.run(item.quantity, item.item_id);
        }
      });

      // Delete sale (will cascade to sale_items)
      deleteSale.run(sale_id);
    });

    transaction(saleId, items);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete sale error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
