'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, ShoppingCart, DollarSign, Package, TrendingUp } from 'lucide-react';

export default function PurchaseListPage() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/purchases');
      const data = await response.json();

      if (data.purchases) {
        // Fetch items for each purchase
        const purchasesWithItems = await Promise.all(
          data.purchases.map(async (purchase) => {
            const itemsResponse = await fetch(`/api/purchases/${purchase.purchase_id}`);
            const itemsData = await itemsResponse.json();
            return {
              ...purchase,
              items: itemsData.purchase?.items || []
            };
          })
        );
        setPurchases(purchasesWithItems);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (purchaseId) => {
    try {
      const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPurchases(purchases.filter(p => p.purchase_id !== purchaseId));
        setShowDeleteModal(null);
      } else {
        alert('Failed to delete purchase');
      }
    } catch (error) {
      console.error('Error deleting purchase:', error);
      alert('Error deleting purchase');
    }
  };

  const getFilteredPurchases = () => {
    let filtered = purchases;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(purchase =>
        purchase.purchase_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.received_by?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Payment status filter
    if (paymentStatusFilter !== 'all') {
      filtered = filtered.filter(purchase => purchase.payment_status === paymentStatusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter(purchase => {
        const purchaseDate = new Date(purchase.purchase_date);
        purchaseDate.setHours(0, 0, 0, 0);

        if (dateFilter === 'today') {
          return purchaseDate.getTime() === today.getTime();
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return purchaseDate >= weekAgo;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return purchaseDate >= monthAgo;
        }
        return true;
      });
    }

    return filtered;
  };

  const filteredPurchases = getFilteredPurchases();

  // Calculate summary statistics
  const totalPurchases = filteredPurchases.length;
  const totalAmount = filteredPurchases.reduce((sum, purchase) => sum + (purchase.grand_total || 0), 0);
  const totalItems = filteredPurchases.reduce((sum, purchase) => sum + (purchase.total_items || 0), 0);
  const totalDue = filteredPurchases.reduce((sum, purchase) => sum + (purchase.balance_due || 0), 0);

  const getPaymentStatusBadge = (status) => {
    const styles = {
      'Paid': 'bg-green-100 text-green-700 border-green-200',
      'Partial': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Pending': 'bg-red-100 text-red-700 border-red-200',
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
          <div className="text-neutral-500">Loading purchases...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs font-medium">Total Purchases</p>
              <p className="text-2xl font-bold mt-1">{totalPurchases}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs font-medium">Total Amount</p>
              <p className="text-2xl font-bold mt-1">Rs. {totalAmount.toFixed(2)}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs font-medium">Total Items</p>
              <p className="text-2xl font-bold mt-1">{totalItems}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-xs font-medium">Total Due</p>
              <p className="text-2xl font-bold mt-1">Rs. {totalDue.toFixed(2)}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-neutral-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Purchase List</h1>
            <p className="text-neutral-500 text-sm mt-1">View and manage all purchase invoices</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by ID, Supplier or Received By..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>

            {/* Payment Status Filter */}
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="px-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
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
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Purchase ID</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Date</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Supplier</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Items</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Items Summary</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Subtotal</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Total</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Paid</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Due</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Received By</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center py-12 text-neutral-500">
                    No purchases found
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => (
                  <tr key={purchase.purchase_id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-neutral-900">
                      {purchase.purchase_id}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-600">
                      {purchase.purchase_date}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-900">
                      <div className="flex flex-col">
                        <span className="font-medium">{purchase.supplier_name}</span>
                        {purchase.supplier_phone && (
                          <span className="text-xs text-neutral-500">{purchase.supplier_phone}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-900 font-medium">
                      {purchase.total_items || purchase.items?.length || 0}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-600 max-w-xs truncate">
                      {getItemsSummary(purchase.items)}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-900 text-right font-medium">
                      Rs. {(purchase.subtotal || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-900 text-right font-semibold">
                      Rs. {(purchase.grand_total || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-green-600 text-right font-medium">
                      Rs. {(purchase.amount_paid || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-red-600 text-right font-medium">
                      Rs. {(purchase.balance_due || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getPaymentStatusBadge(purchase.payment_status)}`}>
                        {purchase.payment_status || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-600">
                      {purchase.received_by || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedPurchase(purchase)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.location.href = `/dashboard/purchase?edit=${purchase.purchase_id}`}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(purchase)}
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
      {selectedPurchase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">Purchase Details</h2>
              <button
                onClick={() => setSelectedPurchase(null)}
                className="text-neutral-500 hover:text-neutral-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Purchase Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Purchase ID</p>
                  <p className="font-semibold text-neutral-900">{selectedPurchase.purchase_id}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Purchase Date</p>
                  <p className="font-medium text-neutral-900">{selectedPurchase.purchase_date}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Supplier Name</p>
                  <p className="font-medium text-neutral-900">{selectedPurchase.supplier_name}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Supplier Phone</p>
                  <p className="font-medium text-neutral-900">{selectedPurchase.supplier_phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Supplier Invoice No</p>
                  <p className="font-medium text-neutral-900">{selectedPurchase.supplier_invoice_no || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Received By</p>
                  <p className="font-medium text-neutral-900">{selectedPurchase.received_by}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Payment Type</p>
                  <p className="font-medium text-neutral-900">{selectedPurchase.payment_type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Payment Status</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getPaymentStatusBadge(selectedPurchase.payment_status)}`}>
                    {selectedPurchase.payment_status}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">Items ({selectedPurchase.items?.length || 0})</h3>
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="text-left py-2 px-3 font-medium text-neutral-600">Product</th>
                        <th className="text-right py-2 px-3 font-medium text-neutral-600">Qty</th>
                        <th className="text-right py-2 px-3 font-medium text-neutral-600">Received</th>
                        <th className="text-right py-2 px-3 font-medium text-neutral-600">Price</th>
                        <th className="text-right py-2 px-3 font-medium text-neutral-600">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {selectedPurchase.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="py-2 px-3">
                            <div className="flex flex-col">
                              <span className="font-medium">{item.product_name}</span>
                              {item.expiry_date && (
                                <span className="text-xs text-neutral-500">Exp: {item.expiry_date}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-right">{item.quantity}</td>
                          <td className="py-2 px-3 text-right">{item.received_qty || item.quantity}</td>
                          <td className="py-2 px-3 text-right">Rs. {item.purchase_price}</td>
                          <td className="py-2 px-3 text-right font-medium">Rs. {item.total}</td>
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
                  <span className="font-medium">Rs. {(selectedPurchase.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Discount</span>
                  <span className="font-medium">Rs. {(selectedPurchase.discount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Tax</span>
                  <span className="font-medium">Rs. {(selectedPurchase.tax || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold border-t border-neutral-200 pt-2">
                  <span>Grand Total</span>
                  <span>Rs. {(selectedPurchase.grand_total || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Amount Paid</span>
                  <span className="font-medium text-green-600">Rs. {(selectedPurchase.amount_paid || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Balance Due</span>
                  <span className="font-medium text-red-600">Rs. {(selectedPurchase.balance_due || 0).toFixed(2)}</span>
                </div>
              </div>

              {selectedPurchase.notes && (
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Notes</p>
                  <p className="text-sm text-neutral-700">{selectedPurchase.notes}</p>
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
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Delete Purchase</h2>
              <p className="text-neutral-600 mb-6">
                Are you sure you want to delete purchase <strong>{showDeleteModal.purchase_id}</strong>? This action cannot be undone and will restore stock quantities.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal.purchase_id)}
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
