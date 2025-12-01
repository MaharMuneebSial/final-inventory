import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/sqlite';

export async function GET(request) {
  try {
    const db = getDatabase();
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'Today';

    // Determine date range based on filter
    let dateCondition = '';
    const now = new Date();
    let today = now.toISOString().split('T')[0];

    if (filter === 'Today') {
      dateCondition = `AND DATE(sale_date) = '${today}'`;
    } else if (filter === 'This Week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];
      dateCondition = `AND DATE(sale_date) >= '${weekAgoStr}'`;
    } else if (filter === 'This Month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      dateCondition = `AND DATE(sale_date) >= '${monthStart}'`;
    }

    // Get total sales
    const totalSales = db.prepare(`
      SELECT COALESCE(SUM(grand_total), 0) as total
      FROM sales
      WHERE 1=1 ${dateCondition}
    `).get();

    // Get today's sale for the counter
    const todaySale = db.prepare(`
      SELECT COALESCE(SUM(grand_total), 0) as total
      FROM sales
      WHERE DATE(sale_date) = ?
    `).get(today);

    // Get previous period sales for comparison
    let prevDateCondition = '';
    if (filter === 'Today') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      prevDateCondition = `AND DATE(sale_date) = '${yesterdayStr}'`;
    } else if (filter === 'This Week') {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      prevDateCondition = `AND DATE(sale_date) BETWEEN '${twoWeeksAgo.toISOString().split('T')[0]}' AND '${weekAgo.toISOString().split('T')[0]}'`;
    } else if (filter === 'This Month') {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      prevDateCondition = `AND DATE(sale_date) BETWEEN '${lastMonthStart}' AND '${lastMonthEnd}'`;
    }

    const prevSales = db.prepare(`
      SELECT COALESCE(SUM(grand_total), 0) as total
      FROM sales
      WHERE 1=1 ${prevDateCondition}
    `).get();

    // Calculate sales change percentage
    const salesChange = prevSales.total > 0
      ? (((totalSales.total - prevSales.total) / prevSales.total) * 100).toFixed(1)
      : 0;

    // Get customer balances (if table exists)
    let customerBalances = { total: 0 };
    try {
      customerBalances = db.prepare(`
        SELECT COALESCE(SUM(balance), 0) as total
        FROM customers
      `).get();
    } catch (e) {
      // Table might not exist
    }

    // Get cash in hand (if table exists)
    let cashInHand = { total: 0 };
    try {
      cashInHand = db.prepare(`
        SELECT COALESCE(SUM(CASE WHEN transaction_type = 'in' THEN amount ELSE -amount END), 0) as total
        FROM cash_transactions
      `).get();
    } catch (e) {
      // Table might not exist
    }

    // Get bank balance (if table exists)
    let bankBalance = { total: 0 };
    try {
      bankBalance = db.prepare(`
        SELECT COALESCE(SUM(balance), 0) as total
        FROM bank_accounts
      `).get();
    } catch (e) {
      // Table might not exist
    }

    // Determine purchase date condition based on filter
    let purchaseDateCondition = '';
    if (filter === 'Today') {
      purchaseDateCondition = `AND DATE(purchase_date) = '${today}'`;
    } else if (filter === 'This Week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];
      purchaseDateCondition = `AND DATE(purchase_date) >= '${weekAgoStr}'`;
    } else if (filter === 'This Month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      purchaseDateCondition = `AND DATE(purchase_date) >= '${monthStart}'`;
    }

    // Get total purchases
    const totalPurchases = db.prepare(`
      SELECT COALESCE(SUM(grand_total), 0) as total
      FROM purchases
      WHERE 1=1 ${purchaseDateCondition}
    `).get();

    // Get previous period purchases for comparison
    let prevPurchaseDateCondition = '';
    if (filter === 'Today') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      prevPurchaseDateCondition = `AND DATE(purchase_date) = '${yesterdayStr}'`;
    } else if (filter === 'This Week') {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      prevPurchaseDateCondition = `AND DATE(purchase_date) BETWEEN '${twoWeeksAgo.toISOString().split('T')[0]}' AND '${weekAgo.toISOString().split('T')[0]}'`;
    } else if (filter === 'This Month') {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      prevPurchaseDateCondition = `AND DATE(purchase_date) BETWEEN '${lastMonthStart}' AND '${lastMonthEnd}'`;
    }

    const prevPurchases = db.prepare(`
      SELECT COALESCE(SUM(grand_total), 0) as total
      FROM purchases
      WHERE 1=1 ${prevPurchaseDateCondition}
    `).get();

    // Calculate purchase change percentage
    const purchaseChange = prevPurchases.total > 0
      ? (((totalPurchases.total - prevPurchases.total) / prevPurchases.total) * 100).toFixed(1)
      : 0;

    // Get total expenses (if table exists)
    let totalExpenses = { total: 0 };
    try {
      totalExpenses = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM expenses
        WHERE 1=1 ${dateCondition}
      `).get();
    } catch (e) {
      // Table might not exist
    }

    return NextResponse.json({
      todaySale: todaySale.total,
      stats: {
        totalSale: totalSales.total,
        salesChange: salesChange,
        customerBalances: customerBalances.total,
        cashInHand: cashInHand.total,
        bankBalance: bankBalance.total,
        totalPurchase: totalPurchases.total,
        purchaseChange: purchaseChange,
        expenses: totalExpenses.total
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
