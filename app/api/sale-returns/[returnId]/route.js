import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/sqlite';

export async function DELETE(request, { params }) {
  try {
    const db = getDatabase();
    const { returnId } = params;

    // Get return items to restore stock (reverse the stock increase from return)
    const items = db.prepare(`
      SELECT * FROM sale_return_items WHERE return_id = ?
    `).all(returnId);

    // Start transaction
    const deleteReturn = db.prepare('DELETE FROM sale_returns WHERE return_id = ?');
    const updateProductStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

    const transaction = db.transaction((return_id, returnItems) => {
      // Restore stock for each item (subtract the returned quantity that was added)
      returnItems.forEach(item => {
        if (item.item_id) {
          updateProductStock.run(item.return_qty, item.item_id);
        }
      });

      // Delete return (will cascade to sale_return_items)
      deleteReturn.run(return_id);
    });

    transaction(returnId, items);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete sale return error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
