import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/sqlite';

export async function GET() {
  try {
    const db = getDatabase();
    const sales = db.prepare(`
      SELECT * FROM sales
      ORDER BY created_at DESC
    `).all();

    return NextResponse.json({ sales });
  } catch (error) {
    console.error('Get sales error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = getDatabase();
    const data = await request.json();

    // Generate sale_id if not provided
    const timestamp = Date.now();
    const sale_id = data.sale_id || `SALE-${timestamp}`;

    // Start transaction
    const insertSale = db.prepare(`
      INSERT INTO sales (
        sale_id, sale_date, sale_time, total_items, subtotal, discount,
        tax, grand_total, payment_method, amount_received, change_due,
        sold_by, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertSaleItem = db.prepare(`
      INSERT INTO sale_items (
        sale_id, item_id, product_name, barcode, sale_type, quantity,
        unit, rate_per_unit, amount, item_discount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const updateProductStock = db.prepare(`
      UPDATE products SET stock = stock - ? WHERE id = ?
    `);

    // Execute transaction
    const transaction = db.transaction((saleData, items) => {
      // Insert sale
      insertSale.run(
        sale_id,
        saleData.sale_date,
        saleData.sale_time,
        saleData.total_items,
        saleData.subtotal,
        saleData.discount || 0,
        saleData.tax || 0,
        saleData.grand_total,
        saleData.payment_method,
        saleData.amount_received,
        saleData.change_due,
        saleData.sold_by || 'Admin',
        saleData.notes || ''
      );

      // Insert sale items and update stock
      items.forEach(item => {
        insertSaleItem.run(
          sale_id,
          item.item_id,
          item.product_name,
          item.barcode || '',
          item.sale_type || 'Regular',
          item.quantity,
          item.unit,
          item.rate_per_unit,
          item.amount,
          item.item_discount || 0
        );

        // Update product stock
        if (item.item_id) {
          updateProductStock.run(item.quantity, item.item_id);
        }
      });
    });

    transaction(data, data.items);

    // Fetch the created sale
    const sale = db.prepare('SELECT * FROM sales WHERE sale_id = ?').get(sale_id);
    const items = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(sale_id);

    return NextResponse.json({
      success: true,
      sale: { ...sale, items }
    });
  } catch (error) {
    console.error('Create sale error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
