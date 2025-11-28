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

    if (filter === 'Today') {
      const today = now.toISOString().split('T')[0];
      dateCondition = `AND DATE(created_at) = '${today}'`;
    } else if (filter === 'This Week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
      dateCondition = `AND DATE(created_at) >= '${weekAgo}'`;
    } else if (filter === 'This Month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      dateCondition = `AND DATE(created_at) >= '${monthStart}'`;
    }

    // Get total sales
    const totalSales = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total
      FROM sales
      WHERE 1=1 ${dateCondition}
    `).get();

    // Get today's sale for the counter
    const today = new Date().toISOString().split('T')[0];
    const todaySale = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total
      FROM sales
      WHERE DATE(created_at) = ?
    `).get(today);

    // Get previous period sales for comparison
    let prevDateCondition = '';
    if (filter === 'Today') {
      const yesterday = new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0];
      prevDateCondition = `AND DATE(created_at) = '${yesterday}'`;
    } else if (filter === 'This Week') {
      const twoWeeksAgo = new Date(now.setDate(now.getDate() - 14)).toISOString().split('T')[0];
      const weekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
      prevDateCondition = `AND DATE(created_at) BETWEEN '${twoWeeksAgo}' AND '${weekAgo}'`;
    } else if (filter === 'This Month') {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      prevDateCondition = `AND DATE(created_at) BETWEEN '${lastMonthStart}' AND '${lastMonthEnd}'`;
    }

    const prevSales = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total
      FROM sales
      WHERE 1=1 ${prevDateCondition}
    `).get();

    // Calculate sales change percentage
    const salesChange = prevSales.total > 0
      ? (((totalSales.total - prevSales.total) / prevSales.total) * 100).toFixed(1)
      : 0;

    // Get customer balances
    const customerBalances = db.prepare(`
      SELECT COALESCE(SUM(balance), 0) as total
      FROM customer_balances
    `).get();

    // Get cash in hand
    const cashInHand = db.prepare(`
      SELECT COALESCE(SUM(CASE WHEN transaction_type = 'in' THEN amount ELSE -amount END), 0) as total
      FROM cash_transactions
    `).get();

    // Get bank balance
    const bankBalance = db.prepare(`
      SELECT COALESCE(SUM(balance), 0) as total
      FROM bank_accounts
    `).get();

    // Get total purchases
    const totalPurchases = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total
      FROM purchases
      WHERE 1=1 ${dateCondition}
    `).get();

    // Get previous period purchases
    const prevPurchases = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total
      FROM purchases
      WHERE 1=1 ${prevDateCondition}
    `).get();

    // Calculate purchase change percentage
    const purchaseChange = prevPurchases.total > 0
      ? (((totalPurchases.total - prevPurchases.total) / prevPurchases.total) * 100).toFixed(1)
      : 0;

    // Get total expenses
    const totalExpenses = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM expenses
      WHERE 1=1 ${dateCondition}
    `).get();

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
