import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/sqlite';

export async function GET(request, { params }) {
  try {
    const db = getDatabase();
    const { purchaseId } = params;

    const purchase = db.prepare(`
      SELECT * FROM purchases WHERE purchase_id = ?
    `).get(purchaseId);

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    const items = db.prepare(`
      SELECT * FROM purchase_items WHERE purchase_id = ?
    `).all(purchaseId);

    return NextResponse.json({ purchase: { ...purchase, items } });
  } catch (error) {
    console.error('Get purchase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const db = getDatabase();
    const { purchaseId } = params;

    // Get purchase items to restore stock
    const items = db.prepare(`
      SELECT * FROM purchase_items WHERE purchase_id = ?
    `).all(purchaseId);

    // Start transaction
    const deletePurchase = db.prepare('DELETE FROM purchases WHERE purchase_id = ?');
    const updateProductStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

    const transaction = db.transaction((purchase_id, purchaseItems) => {
      // Restore stock for each item (subtract the quantity that was added during purchase)
      purchaseItems.forEach(item => {
        if (item.item_id) {
          const receivedQty = item.received_qty || item.quantity;
          updateProductStock.run(receivedQty, item.item_id);
        }
      });

      // Delete purchase (will cascade to purchase_items)
      deletePurchase.run(purchase_id);
    });

    transaction(purchaseId, items);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete purchase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
