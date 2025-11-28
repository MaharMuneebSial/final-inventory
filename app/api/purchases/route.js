import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/sqlite';

export async function GET() {
  try {
    const db = getDatabase();
    const purchases = db.prepare(`
      SELECT * FROM purchases
      ORDER BY created_at DESC
    `).all();

    return NextResponse.json({ purchases });
  } catch (error) {
    console.error('Get purchases error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = getDatabase();
    const data = await request.json();

    // Generate purchase_id if not provided
    const timestamp = Date.now();
    const purchase_id = data.purchase_id || `PUR-${timestamp}`;

    // Start transaction
    const insertPurchase = db.prepare(`
      INSERT INTO purchases (
        purchase_id, purchase_date, supplier_name, supplier_phone, supplier_invoice_no,
        payment_type, due_date, total_items, subtotal, discount, tax, grand_total,
        amount_paid, balance_due, payment_status, received_by, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertPurchaseItem = db.prepare(`
      INSERT INTO purchase_items (
        purchase_id, item_id, product_name, barcode, quantity, received_qty,
        unit, rate, purchase_price, sale_price, total, expiry_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const updateProductStock = db.prepare(`
      UPDATE products SET stock = stock + ?, price = ? WHERE id = ?
    `);

    // Execute transaction
    const transaction = db.transaction((purchaseData, items) => {
      // Insert purchase
      insertPurchase.run(
        purchase_id,
        purchaseData.purchase_date,
        purchaseData.supplier_name,
        purchaseData.supplier_phone || '',
        purchaseData.supplier_invoice_no || '',
        purchaseData.payment_type,
        purchaseData.due_date || '',
        purchaseData.total_items,
        purchaseData.subtotal,
        purchaseData.discount || 0,
        purchaseData.tax || 0,
        purchaseData.grand_total,
        purchaseData.amount_paid,
        purchaseData.balance_due,
        purchaseData.payment_status,
        purchaseData.received_by || 'Admin',
        purchaseData.notes || ''
      );

      // Insert purchase items and update stock
      items.forEach(item => {
        insertPurchaseItem.run(
          purchase_id,
          item.item_id,
          item.product_name,
          item.barcode || '',
          item.quantity,
          item.received_qty || item.quantity,
          item.unit,
          item.rate,
          item.purchase_price,
          item.sale_price || 0,
          item.total,
          item.expiry_date || ''
        );

        // Update product stock and sale price
        if (item.item_id) {
          const receivedQty = item.received_qty || item.quantity;
          updateProductStock.run(receivedQty, item.sale_price || item.purchase_price, item.item_id);
        }
      });
    });

    transaction(data, data.items);

    // Fetch the created purchase
    const purchase = db.prepare('SELECT * FROM purchases WHERE purchase_id = ?').get(purchase_id);
    const items = db.prepare('SELECT * FROM purchase_items WHERE purchase_id = ?').all(purchase_id);

    return NextResponse.json({
      success: true,
      purchase: { ...purchase, items }
    });
  } catch (error) {
    console.error('Create purchase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
