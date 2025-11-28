'use client';

import { useState, useEffect } from 'react';
import { Search, Trash2, Save, X, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PurchaseReturnPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [returnId, setReturnId] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [originalInvoice, setOriginalInvoice] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [refundMethod, setRefundMethod] = useState('Cash');
  const [status, setStatus] = useState('Pending');
  const [returnedBy, setReturnedBy] = useState('Admin');
  const [notes, setNotes] = useState('');

  // Items state
  const [items, setItems] = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showPurchaseSearch, setShowPurchaseSearch] = useState(false);
  const [purchaseSearchTerm, setPurchaseSearchTerm] = useState('');

  useEffect(() => {
    generateReturnId();
    const now = new Date();
    setReturnDate(now.toISOString().split('T')[0]);
    fetchPurchases();
  }, []);

  const generateReturnId = () => {
    const timestamp = Date.now();
    setReturnId(`RET-${timestamp}`);
  };

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/purchases');
      const data = await response.json();
      setPurchases(data.purchases || []);
    } catch (error) {
      console.error('Failed to fetch purchases:', error);
    }
  };

  const handlePurchaseSelect = async (purchase) => {
    try {
      // Fetch full purchase details with items
      const response = await fetch(`/api/purchases/${purchase.purchase_id}`);
      const data = await response.json();

      if (data.purchase) {
        setSelectedPurchase(data.purchase);
        setOriginalInvoice(data.purchase.purchase_id);
        setSupplierName(data.purchase.supplier_name);

        // Map purchase items to return items
        const returnItems = data.purchase.items.map(item => ({
          item_id: item.item_id,
          product_name: item.product_name,
          original_quantity: item.quantity,
          return_qty: 0,
          unit: item.unit,
          unit_price: item.purchase_price,
          line_total: 0,
          item_condition: 'Good'
        }));

        setItems(returnItems);
        setShowPurchaseSearch(false);
        setPurchaseSearchTerm('');
      }
    } catch (error) {
      console.error('Failed to fetch purchase details:', error);
      alert('Failed to load purchase details');
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];

    if (field === 'item_condition') {
      newItems[index][field] = value;
    } else {
      newItems[index][field] = parseFloat(value) || 0;
    }

    if (field === 'return_qty' || field === 'unit_price') {
      const qty = newItems[index].return_qty;
      const price = newItems[index].unit_price;
      newItems[index].line_total = qty * price;
    }

    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const totalReturnAmount = items.reduce((sum, item) => sum + item.line_total, 0);
    const dueReturnAmount = totalReturnAmount; // Can be modified based on partial refunds

    return {
      total_items: items.filter(item => item.return_qty > 0).length,
      total_return_amount: totalReturnAmount.toFixed(2),
      due_return_amount: dueReturnAmount.toFixed(2)
    };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const returnItems = items.filter(item => item.return_qty > 0);

    if (returnItems.length === 0) {
      alert('Please specify return quantities for at least one item');
      return;
    }

    if (!originalInvoice) {
      alert('Please select a purchase invoice');
      return;
    }

    // Validate return quantities don't exceed original quantities
    const invalidItems = returnItems.filter(item => item.return_qty > item.original_quantity);
    if (invalidItems.length > 0) {
      alert('Return quantity cannot exceed original quantity');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/purchase-returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          return_id: returnId,
          return_date: returnDate,
          original_invoice: originalInvoice,
          supplier_name: supplierName,
          return_reason: returnReason,
          total_return_amount: parseFloat(totals.total_return_amount),
          due_return_amount: parseFloat(totals.due_return_amount),
          refund_method: refundMethod,
          status: status,
          returned_by: returnedBy,
          notes: notes,
          items: returnItems
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Purchase return created successfully!');
        handleReset();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to create purchase return:', error);
      alert('Failed to create purchase return');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setItems([]);
    setOriginalInvoice('');
    setSupplierName('');
    setReturnReason('');
    setNotes('');
    setSelectedPurchase(null);
    generateReturnId();
  };

  const filteredPurchases = purchases.filter(p =>
    p.purchase_id?.toLowerCase().includes(purchaseSearchTerm.toLowerCase()) ||
    p.supplier_name?.toLowerCase().includes(purchaseSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Purchase Return Invoice</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Return purchased items to supplier</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            type="submit"
            form="return-form"
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-black text-white text-xs font-medium rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {loading ? 'Saving...' : 'Save Return'}
          </button>
        </div>
      </div>

      <form id="return-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Return Details */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <h3 className="text-sm font-semibold text-neutral-900 mb-3">Return Details</h3>
          <div className="grid grid-cols-6 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Return ID</label>
              <input
                type="text"
                value={returnId}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg bg-neutral-50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Return Date</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Refund Method</label>
              <select
                value={refundMethod}
                onChange={(e) => setRefundMethod(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 bg-white"
              >
                <option value="Cash">Cash</option>
                <option value="Credit Note">Credit Note</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 bg-white"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Returned By</label>
              <input
                type="text"
                value={returnedBy}
                onChange={(e) => setReturnedBy(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Return Reason</label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 bg-white"
              >
                <option value="">Select Reason</option>
                <option value="Damaged">Damaged</option>
                <option value="Defective">Defective</option>
                <option value="Wrong Item">Wrong Item</option>
                <option value="Expired">Expired</option>
                <option value="Overstocked">Overstocked</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Purchase Invoice Selection */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <h3 className="text-sm font-semibold text-neutral-900 mb-3">Select Purchase Invoice</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <label className="block text-xs font-medium text-neutral-700 mb-1">Original Invoice *</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={purchaseSearchTerm}
                  onChange={(e) => {
                    setPurchaseSearchTerm(e.target.value);
                    setShowPurchaseSearch(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowPurchaseSearch(purchaseSearchTerm.length > 0)}
                  placeholder="Search purchase invoice..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>

              {showPurchaseSearch && filteredPurchases.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredPurchases.map(purchase => (
                    <button
                      key={purchase.id}
                      type="button"
                      onClick={() => handlePurchaseSelect(purchase)}
                      className="w-full px-4 py-2 text-left hover:bg-neutral-50 border-b border-neutral-100 last:border-0"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{purchase.purchase_id}</p>
                          <p className="text-xs text-neutral-500">
                            {purchase.supplier_name} | {purchase.purchase_date}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-neutral-900">Rs {purchase.grand_total}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Supplier Name</label>
              <input
                type="text"
                value={supplierName}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg bg-neutral-50"
              />
            </div>
          </div>

          {selectedPurchase && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-medium text-blue-900">
                Selected: {selectedPurchase.purchase_id} | Date: {selectedPurchase.purchase_date} |
                Total: Rs {selectedPurchase.grand_total} | Items: {selectedPurchase.items?.length || 0}
              </p>
            </div>
          )}
        </div>

        {/* Return Items Table */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">#</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Product Name</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Original Qty</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Return Qty</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Unit</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Unit Price</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Line Total</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Condition</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-neutral-600 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-2 py-8 text-center text-sm text-neutral-500">
                      Select a purchase invoice to load items
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={index} className="hover:bg-neutral-50">
                      <td className="px-2 py-2 text-sm text-neutral-900">{index + 1}</td>
                      <td className="px-2 py-2 text-sm font-medium text-neutral-900">{item.product_name}</td>
                      <td className="px-2 py-2 text-sm text-neutral-600">{item.original_quantity}</td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={item.return_qty}
                          onChange={(e) => updateItem(index, 'return_qty', e.target.value)}
                          min="0"
                          max={item.original_quantity}
                          step="0.01"
                          className="w-20 px-1 py-1 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-black/5"
                        />
                      </td>
                      <td className="px-2 py-2 text-sm text-neutral-600">{item.unit}</td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-24 px-1 py-1 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-black/5"
                        />
                      </td>
                      <td className="px-2 py-2 text-sm font-semibold text-neutral-900">
                        Rs {item.line_total.toFixed(2)}
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={item.item_condition}
                          onChange={(e) => updateItem(index, 'item_condition', e.target.value)}
                          className="px-2 py-1 text-xs border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-black/5 bg-white"
                        >
                          <option value="Good">Good</option>
                          <option value="Damaged">Damaged</option>
                          <option value="Defective">Defective</option>
                          <option value="Expired">Expired</option>
                        </select>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals and Notes */}
        <div className="grid grid-cols-2 gap-4">
          {/* Notes */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about the return..."
              rows="6"
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
            />
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">Return Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-600">Total Items Returned:</span>
                <span className="font-medium text-neutral-900">{totals.total_items}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-600">Return Reason:</span>
                <span className="font-medium text-neutral-900">{returnReason || 'Not specified'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-600">Refund Method:</span>
                <span className="font-medium text-neutral-900">{refundMethod}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-neutral-200">
                <span className="text-neutral-600">Total Return Amount:</span>
                <span className="font-medium text-neutral-900">Rs {totals.total_return_amount}</span>
              </div>
              <div className="flex justify-between items-center text-base pt-2 border-t border-neutral-200">
                <span className="font-semibold text-neutral-900">Due Return Amount:</span>
                <span className="font-bold text-red-600 text-lg">Rs {totals.due_return_amount}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-neutral-200">
                <span className="text-neutral-600">Status:</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                  status === 'Approved' ? 'bg-blue-50 text-blue-700' :
                  status === 'Rejected' ? 'bg-red-50 text-red-700' :
                  'bg-yellow-50 text-yellow-700'
                }`}>
                  {status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
