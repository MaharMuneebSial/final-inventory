import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/sqlite';

export async function GET() {
  try {
    const db = getDatabase();
    const returns = db.prepare(`
      SELECT * FROM purchase_returns
      ORDER BY created_at DESC
    `).all();

    return NextResponse.json({ returns });
  } catch (error) {
    console.error('Get purchase returns error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = getDatabase();
    const data = await request.json();

    // Generate return_id if not provided
    const timestamp = Date.now();
    const return_id = data.return_id || `RET-${timestamp}`;

    // Start transaction
    const insertReturn = db.prepare(`
      INSERT INTO purchase_returns (
        return_id, return_date, original_invoice, supplier_name, return_reason,
        total_return_amount, due_return_amount, refund_method, status, returned_by, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertReturnItem = db.prepare(`
      INSERT INTO purchase_return_items (
        return_id, item_id, product_name, original_quantity, return_qty,
        unit, unit_price, line_total, item_condition
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const updateProductStock = db.prepare(`
      UPDATE products SET stock = stock - ? WHERE id = ?
    `);

    // Execute transaction
    const transaction = db.transaction((returnData, items) => {
      // Insert purchase return
      insertReturn.run(
        return_id,
        returnData.return_date,
        returnData.original_invoice,
        returnData.supplier_name,
        returnData.return_reason || '',
        returnData.total_return_amount,
        returnData.due_return_amount,
        returnData.refund_method || '',
        returnData.status || 'Pending',
        returnData.returned_by || 'Admin',
        returnData.notes || ''
      );

      // Insert return items and update stock (reduce stock as items are returned)
      items.forEach(item => {
        insertReturnItem.run(
          return_id,
          item.item_id,
          item.product_name,
          item.original_quantity,
          item.return_qty,
          item.unit,
          item.unit_price,
          item.line_total,
          item.item_condition || 'Good'
        );

        // Reduce stock for returned items
        if (item.item_id) {
          updateProductStock.run(item.return_qty, item.item_id);
        }
      });
    });

    transaction(data, data.items);

    // Fetch the created return
    const purchaseReturn = db.prepare('SELECT * FROM purchase_returns WHERE return_id = ?').get(return_id);
    const items = db.prepare('SELECT * FROM purchase_return_items WHERE return_id = ?').all(return_id);

    return NextResponse.json({
      success: true,
      return: { ...purchaseReturn, items }
    });
  } catch (error) {
    console.error('Create purchase return error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
