'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Trash2, RotateCcw, DollarSign, Package } from 'lucide-react';

export default function SaleReturnListPage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sale-returns');
      const data = await response.json();

      if (data.returns) {
        // Fetch items for each return
        const returnsWithItems = await Promise.all(
          data.returns.map(async (returnItem) => {
            try {
              const itemsResponse = await fetch(`/api/sale-returns/${returnItem.return_id}/items`);
              const itemsData = await itemsResponse.json();
              return {
                ...returnItem,
                items: itemsData.items || []
              };
            } catch (error) {
              console.error(`Error fetching items for ${returnItem.return_id}:`, error);
              return {
                ...returnItem,
                items: []
              };
            }
          })
        );
        setReturns(returnsWithItems);
      }
    } catch (error) {
      console.error('Error fetching sale returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (returnId) => {
    try {
      const response = await fetch(`/api/sale-returns/${returnId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReturns(returns.filter(r => r.return_id !== returnId));
        setShowDeleteModal(null);
      } else {
        alert('Failed to delete sale return');
      }
    } catch (error) {
      console.error('Error deleting sale return:', error);
      alert('Error deleting sale return');
    }
  };

  const getFilteredReturns = () => {
    let filtered = returns;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(returnItem =>
        returnItem.return_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnItem.original_sale_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnItem.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnItem.processed_by?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(returnItem => returnItem.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter(returnItem => {
        const returnDate = new Date(returnItem.return_date);
        returnDate.setHours(0, 0, 0, 0);

        if (dateFilter === 'today') {
          return returnDate.getTime() === today.getTime();
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return returnDate >= weekAgo;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return returnDate >= monthAgo;
        }
        return true;
      });
    }

    return filtered;
  };

  const filteredReturns = getFilteredReturns();

  // Calculate summary statistics
  const totalReturns = filteredReturns.length;
  const totalRefundAmount = filteredReturns.reduce((sum, ret) => sum + (ret.refund_amount || 0), 0);
  const totalItems = filteredReturns.reduce((sum, ret) => sum + (ret.items?.length || 0), 0);

  const getStatusBadge = (status) => {
    const styles = {
      'Completed': 'bg-green-100 text-green-700 border-green-200',
      'Approved': 'bg-blue-100 text-blue-700 border-blue-200',
      'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Rejected': 'bg-red-100 text-red-700 border-red-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
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
          <div className="text-neutral-500">Loading sale returns...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs font-medium">Total Returns</p>
              <p className="text-2xl font-bold mt-1">{totalReturns}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <RotateCcw className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-xs font-medium">Total Refund Amount</p>
              <p className="text-2xl font-bold mt-1">Rs. {totalRefundAmount.toFixed(2)}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs font-medium">Total Items Returned</p>
              <p className="text-2xl font-bold mt-1">{totalItems}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-neutral-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Sale Return List</h1>
            <p className="text-neutral-500 text-sm mt-1">View and manage all sale return invoices</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by Return ID, Sale ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Return ID</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Date & Time</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Original Sale</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Customer</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Items</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Items Summary</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Reason</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Refund</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Method</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Processed By</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center py-12 text-neutral-500">
                    No sale returns found
                  </td>
                </tr>
              ) : (
                filteredReturns.map((returnItem) => (
                  <tr key={returnItem.return_id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-neutral-900">
                      {returnItem.return_id}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-600">
                      <div className="flex flex-col">
                        <span className="font-medium">{returnItem.return_date}</span>
                        <span className="text-xs text-neutral-500">{returnItem.return_time}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-neutral-900">
                      {returnItem.original_sale_id}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-600">
                      {returnItem.customer_name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-900 font-medium">
                      {returnItem.items?.length || 0}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-600 max-w-xs truncate">
                      {getItemsSummary(returnItem.items)}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-600">
                      {returnItem.return_reason || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-red-600 text-right font-semibold">
                      Rs. {(returnItem.refund_amount || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-600">
                      {returnItem.refund_method || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusBadge(returnItem.status)}`}>
                        {returnItem.status || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-600">
                      {returnItem.processed_by || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedReturn(returnItem)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(returnItem)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      {selectedReturn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">Sale Return Details</h2>
              <button
                onClick={() => setSelectedReturn(null)}
                className="text-neutral-500 hover:text-neutral-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Return Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Return ID</p>
                  <p className="font-semibold text-neutral-900">{selectedReturn.return_id}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Return Date & Time</p>
                  <p className="font-medium text-neutral-900">{selectedReturn.return_date} {selectedReturn.return_time}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Original Sale ID</p>
                  <p className="font-medium text-neutral-900">{selectedReturn.original_sale_id}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Customer Name</p>
                  <p className="font-medium text-neutral-900">{selectedReturn.customer_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Return Reason</p>
                  <p className="font-medium text-neutral-900">{selectedReturn.return_reason || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Processed By</p>
                  <p className="font-medium text-neutral-900">{selectedReturn.processed_by}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Refund Method</p>
                  <p className="font-medium text-neutral-900">{selectedReturn.refund_method || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Status</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusBadge(selectedReturn.status)}`}>
                    {selectedReturn.status}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">Returned Items ({selectedReturn.items?.length || 0})</h3>
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="text-left py-2 px-3 font-medium text-neutral-600">Product</th>
                        <th className="text-right py-2 px-3 font-medium text-neutral-600">Original Qty</th>
                        <th className="text-right py-2 px-3 font-medium text-neutral-600">Return Qty</th>
                        <th className="text-right py-2 px-3 font-medium text-neutral-600">Unit Price</th>
                        <th className="text-right py-2 px-3 font-medium text-neutral-600">Line Total</th>
                        <th className="text-left py-2 px-3 font-medium text-neutral-600">Condition</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {selectedReturn.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="py-2 px-3">{item.product_name}</td>
                          <td className="py-2 px-3 text-right">{item.original_quantity}</td>
                          <td className="py-2 px-3 text-right font-medium">{item.return_qty}</td>
                          <td className="py-2 px-3 text-right">Rs. {item.unit_price}</td>
                          <td className="py-2 px-3 text-right font-medium">Rs. {item.line_total}</td>
                          <td className="py-2 px-3">
                            <span className={`text-xs px-2 py-1 rounded ${
                              item.item_condition === 'Good' ? 'bg-green-50 text-green-700' :
                              item.item_condition === 'Damaged' ? 'bg-red-50 text-red-700' :
                              'bg-yellow-50 text-yellow-700'
                            }`}>
                              {item.item_condition}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-neutral-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Total Return Amount</span>
                  <span className="font-medium">Rs. {(selectedReturn.total_return_amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold border-t border-neutral-200 pt-2">
                  <span>Refund Amount</span>
                  <span className="text-red-600">Rs. {(selectedReturn.refund_amount || 0).toFixed(2)}</span>
                </div>
              </div>

              {selectedReturn.notes && (
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Notes</p>
                  <p className="text-sm text-neutral-700">{selectedReturn.notes}</p>
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
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Delete Sale Return</h2>
              <p className="text-neutral-600 mb-6">
                Are you sure you want to delete sale return <strong>{showDeleteModal.return_id}</strong>? This action cannot be undone and will restore stock quantities.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal.return_id)}
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
