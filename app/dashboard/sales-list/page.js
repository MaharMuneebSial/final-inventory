'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, DollarSign, Package, TrendingUp } from 'lucide-react';

export default function SalesListPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sales');
      const data = await response.json();

      if (data.sales) {
        // Fetch items for each sale
        const salesWithItems = await Promise.all(
          data.sales.map(async (sale) => {
            const itemsResponse = await fetch(`/api/sales/${sale.sale_id}/items`);
            const itemsData = await itemsResponse.json();
            return {
              ...sale,
              items: itemsData.items || []
            };
          })
        );
        setSales(salesWithItems);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (saleId) => {
    try {
      const response = await fetch(`/api/sales/${saleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSales(sales.filter(s => s.sale_id !== saleId));
        setShowDeleteModal(null);
      } else {
        alert('Failed to delete sale');
      }
    } catch (error) {
      console.error('Error deleting sale:', error);
      alert('Error deleting sale');
    }
  };

  const getFilteredSales = () => {
    let filtered = sales;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.sale_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.sold_by.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.sale_date);
        saleDate.setHours(0, 0, 0, 0);

        if (dateFilter === 'today') {
          return saleDate.getTime() === today.getTime();
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return saleDate >= weekAgo;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return saleDate >= monthAgo;
        }
        return true;
      });
    }

    return filtered;
  };

  const filteredSales = getFilteredSales();

  // Calculate summary statistics
  const totalSales = filteredSales.length;
  const totalAmount = filteredSales.reduce((sum, sale) => sum + (sale.grand_total || 0), 0);
  const totalItems = filteredSales.reduce((sum, sale) => sum + (sale.total_items || 0), 0);

  const getPaymentStatusBadge = (method) => {
    const styles = {
      'Cash': 'bg-green-100 text-green-700 border-green-200',
      'Card': 'bg-blue-100 text-blue-700 border-blue-200',
      'Online': 'bg-purple-100 text-purple-700 border-purple-200',
      'Credit': 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return styles[method] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getItemsSummary = (items) => {
    if (!items || items.length === 0) return 'No items';
    if (items.length === 1) return items[0].product_name;
    if (items.length === 2) return `${items[0].product_name}, ${items[1].product_name}`;
    return `${items[0].product_name}, ${items[1].product_name} +${items.length - 2} more`;
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-neutral-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-neutral-500">Loading sales...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-[10px] font-medium uppercase tracking-wide">Total Sales</p>
              <p className="text-2xl font-bold mt-1">{totalSales}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-[10px] font-medium uppercase tracking-wide">Total Amount</p>
              <p className="text-2xl font-bold mt-1">Rs. {totalAmount.toFixed(2)}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-[10px] font-medium uppercase tracking-wide">Total Items Sold</p>
              <p className="text-2xl font-bold mt-1">{totalItems}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Sales List</h1>
            <p className="text-xs text-neutral-500 mt-0.5">View and manage all sales invoices</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by Sale ID or Sold By..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all w-full sm:w-56"
              />
            </div>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black bg-white transition-all"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-neutral-50 to-neutral-100 border-b-2 border-neutral-200">
                <th className="text-left py-3 px-4 text-[10px] font-bold text-neutral-700 uppercase tracking-wide">Sale ID</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold text-neutral-700 uppercase tracking-wide">Date & Time</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold text-neutral-700 uppercase tracking-wide">Items</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold text-neutral-700 uppercase tracking-wide">Items Summary</th>
                <th className="text-right py-3 px-4 text-[10px] font-bold text-neutral-700 uppercase tracking-wide">Subtotal</th>
                <th className="text-right py-3 px-4 text-[10px] font-bold text-neutral-700 uppercase tracking-wide">Discount</th>
                <th className="text-right py-3 px-4 text-[10px] font-bold text-neutral-700 uppercase tracking-wide">Total</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold text-neutral-700 uppercase tracking-wide">Payment</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold text-neutral-700 uppercase tracking-wide">Sold By</th>
                <th className="text-center py-3 px-4 text-[10px] font-bold text-neutral-700 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-12 text-neutral-500">
                    No sales found
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.sale_id} className="hover:bg-neutral-50/50 transition-colors duration-150">
                    <td className="py-3 px-4 font-semibold text-neutral-900">
                      {sale.sale_id}
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      <div className="flex flex-col">
                        <span className="font-medium text-neutral-900">{sale.sale_date}</span>
                        <span className="text-[10px] text-neutral-500 mt-0.5">{sale.sale_time}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-900 font-semibold">
                      {sale.total_items || sale.items?.length || 0}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 max-w-xs truncate">
                      {getItemsSummary(sale.items)}
                    </td>
                    <td className="py-3 px-4 text-neutral-900 text-right font-medium">
                      Rs. {(sale.subtotal || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 text-right">
                      Rs. {(sale.discount || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-neutral-900 text-right font-bold">
                      Rs. {(sale.grand_total || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold border ${getPaymentStatusBadge(sale.payment_method)}`}>
                        {sale.payment_method || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-600 font-medium">
                      {sale.sold_by || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedSale(sale)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-150 hover:shadow-sm"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.location.href = `/dashboard/sales?edit=${sale.sale_id}`}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-all duration-150 hover:shadow-sm"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(sale)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-all duration-150 hover:shadow-sm"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">Sale Details</h2>
              <button
                onClick={() => setSelectedSale(null)}
                className="text-neutral-500 hover:text-neutral-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Sale Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Sale ID</p>
                  <p className="font-semibold text-neutral-900">{selectedSale.sale_id}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Date & Time</p>
                  <p className="font-medium text-neutral-900">{selectedSale.sale_date} {selectedSale.sale_time}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Sold By</p>
                  <p className="font-medium text-neutral-900">{selectedSale.sold_by}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Payment Method</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getPaymentStatusBadge(selectedSale.payment_method)}`}>
                    {selectedSale.payment_method}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">Items ({selectedSale.items?.length || 0})</h3>
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="text-left py-2 px-3 font-medium text-neutral-600">Product</th>
                        <th className="text-right py-2 px-3 font-medium text-neutral-600">Qty</th>
                        <th className="text-right py-2 px-3 font-medium text-neutral-600">Rate</th>
                        <th className="text-right py-2 px-3 font-medium text-neutral-600">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {selectedSale.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="py-2 px-3">{item.product_name}</td>
                          <td className="py-2 px-3 text-right">{item.quantity}</td>
                          <td className="py-2 px-3 text-right">Rs. {item.rate_per_unit}</td>
                          <td className="py-2 px-3 text-right font-medium">Rs. {item.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-neutral-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-medium">Rs. {(selectedSale.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Discount</span>
                  <span className="font-medium">Rs. {(selectedSale.discount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Tax</span>
                  <span className="font-medium">Rs. {(selectedSale.tax || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold border-t border-neutral-200 pt-2">
                  <span>Grand Total</span>
                  <span>Rs. {(selectedSale.grand_total || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Amount Received</span>
                  <span className="font-medium">Rs. {(selectedSale.amount_received || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Change Due</span>
                  <span className="font-medium">Rs. {(selectedSale.change_due || 0).toFixed(2)}</span>
                </div>
              </div>

              {selectedSale.notes && (
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Notes</p>
                  <p className="text-sm text-neutral-700">{selectedSale.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Delete Sale</h2>
              <p className="text-neutral-600 mb-6">
                Are you sure you want to delete sale <strong>{showDeleteModal.sale_id}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal.sale_id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
