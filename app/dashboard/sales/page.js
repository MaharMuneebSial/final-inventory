'use client';

import { useState, useEffect } from 'react';
import { Search, Trash2, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SalesPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [saleId, setSaleId] = useState('');
  const [saleDate, setSaleDate] = useState('');
  const [saleTime, setSaleTime] = useState('');
  const [soldBy, setSoldBy] = useState('Admin');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountReceived, setAmountReceived] = useState(0);

  // Items state
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  // Calculations
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);

  useEffect(() => {
    generateSaleId();
    const now = new Date();
    setSaleDate(now.toISOString().split('T')[0]);
    setSaleTime(now.toTimeString().split(' ')[0].substring(0, 5));
    fetchProducts();
  }, []);

  const generateSaleId = () => {
    const timestamp = Date.now();
    setSaleId(`SALE-${timestamp}`);
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.length > 0) {
      const results = products.filter(p =>
        p.name_english?.toLowerCase().includes(term.toLowerCase()) ||
        p.sku?.toLowerCase().includes(term.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(results);
      setShowSearch(true);
    } else {
      setShowSearch(false);
    }
  };

  const addItem = (product) => {
    const existingItem = items.find(item => item.item_id === product.id);

    if (existingItem) {
      setItems(items.map(item =>
        item.item_id === product.id
          ? { ...item, quantity: item.quantity + 1, amount: (item.quantity + 1) * item.rate_per_unit }
          : item
      ));
    } else {
      setItems([...items, {
        item_id: product.id,
        product_name: product.name_english,
        barcode: product.barcode || '',
        sale_type: 'Regular',
        quantity: 1,
        unit: product.unit || 'Pc',
        rate_per_unit: product.price || 0,
        amount: product.price || 0,
        item_discount: 0
      }]);
    }

    setSearchTerm('');
    setShowSearch(false);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = parseFloat(value) || 0;

    if (field === 'quantity' || field === 'rate_per_unit' || field === 'item_discount') {
      const qty = newItems[index].quantity;
      const rate = newItems[index].rate_per_unit;
      const itemDisc = newItems[index].item_discount;
      newItems[index].amount = (qty * rate) - itemDisc;
    }

    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const discountAmount = (subtotal * discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * tax) / 100;
    const grandTotal = taxableAmount + taxAmount;
    const changeDue = amountReceived - grandTotal;

    return {
      total_items: items.length,
      subtotal: subtotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      grand_total: grandTotal.toFixed(2),
      change_due: changeDue.toFixed(2)
    };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sale_id: saleId,
          sale_date: saleDate,
          sale_time: saleTime,
          total_items: totals.total_items,
          subtotal: parseFloat(totals.subtotal),
          discount: discount,
          tax: tax,
          grand_total: parseFloat(totals.grand_total),
          payment_method: paymentMethod,
          amount_received: parseFloat(amountReceived),
          change_due: parseFloat(totals.change_due),
          sold_by: soldBy,
          notes: notes,
          items: items
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Sale invoice created successfully!');
        router.push('/dashboard/sales-list');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to create sale:', error);
      alert('Failed to create sale invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setItems([]);
    setDiscount(0);
    setTax(0);
    setAmountReceived(0);
    setNotes('');
    generateSaleId();
  };

  return (
    <div className="h-[calc(100vh-1.75rem)] flex flex-col p-2 gap-2 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-sm font-bold text-neutral-900">Sale Invoice</h1>
          <p className="text-[10px] text-neutral-500 mt-0.5">Create new sales transaction</p>
        </div>
      </div>

      <form id="sale-form" onSubmit={handleSubmit} className="flex-1 flex flex-col gap-2 min-h-0">
        {/* Invoice Details */}
        <div className="bg-white rounded-lg border border-neutral-200 p-2.5 shrink-0 shadow-sm">
          <div className="grid grid-cols-5 gap-2">
            <div>
              <label className="block text-[9px] font-semibold text-neutral-700 mb-1">Sale ID</label>
              <input
                type="text"
                value={saleId}
                readOnly
                className="w-full px-2 py-1.5 text-[10px] border border-neutral-300 rounded-md bg-neutral-50 font-medium"
              />
            </div>
            <div>
              <label className="block text-[9px] font-semibold text-neutral-700 mb-1">Date</label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full px-2 py-1.5 text-[10px] border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black transition-all"
              />
            </div>
            <div>
              <label className="block text-[9px] font-semibold text-neutral-700 mb-1">Time</label>
              <input
                type="time"
                value={saleTime}
                onChange={(e) => setSaleTime(e.target.value)}
                className="w-full px-2 py-1.5 text-[10px] border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black transition-all"
              />
            </div>
            <div>
              <label className="block text-[9px] font-semibold text-neutral-700 mb-1">Sold By</label>
              <input
                type="text"
                value={soldBy}
                onChange={(e) => setSoldBy(e.target.value)}
                className="w-full px-2 py-1.5 text-[10px] border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black transition-all"
              />
            </div>
            <div>
              <label className="block text-[9px] font-semibold text-neutral-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-2 py-1.5 text-[10px] border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black bg-white transition-all"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Mobile Payment">Mobile Payment</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Search */}
        <div className="bg-white rounded-lg border border-neutral-200 p-2.5 shrink-0 shadow-sm">
          <h3 className="text-[10px] font-bold text-neutral-900 mb-2 pb-1.5 border-b border-neutral-200 uppercase tracking-wide">Add Products</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by product name, SKU, or barcode..."
              className="w-full pl-9 pr-2 py-1.5 text-[10px] border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black transition-all"
            />

            {showSearch && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {searchResults.map(product => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addItem(product)}
                    className="w-full px-2.5 py-1.5 text-left hover:bg-neutral-50 border-b border-neutral-100 last:border-0 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-semibold text-neutral-900">{product.name_english}</p>
                        <p className="text-[9px] text-neutral-500 mt-0.5">SKU: {product.sku} | Stock: {product.stock}</p>
                      </div>
                      <p className="text-[10px] font-bold text-neutral-900">Rs {product.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden flex-1 min-h-0 shadow-sm">
          <div className="h-full overflow-auto">
            <table className="w-full text-[10px]">
              <thead className="bg-gradient-to-r from-neutral-50 to-neutral-100 border-b-2 border-neutral-200 sticky top-0">
                <tr>
                  <th className="px-2 py-2 text-left text-[9px] font-bold text-neutral-700 uppercase tracking-wide">#</th>
                  <th className="px-2 py-2 text-left text-[9px] font-bold text-neutral-700 uppercase tracking-wide">Product Name</th>
                  <th className="px-2 py-2 text-left text-[9px] font-bold text-neutral-700 uppercase tracking-wide">Barcode</th>
                  <th className="px-2 py-2 text-left text-[9px] font-bold text-neutral-700 uppercase tracking-wide">Type</th>
                  <th className="px-2 py-2 text-left text-[9px] font-bold text-neutral-700 uppercase tracking-wide">QTY</th>
                  <th className="px-2 py-2 text-left text-[9px] font-bold text-neutral-700 uppercase tracking-wide">Unit</th>
                  <th className="px-2 py-2 text-left text-[9px] font-bold text-neutral-700 uppercase tracking-wide">Rate</th>
                  <th className="px-2 py-2 text-left text-[9px] font-bold text-neutral-700 uppercase tracking-wide">Discount</th>
                  <th className="px-2 py-2 text-left text-[9px] font-bold text-neutral-700 uppercase tracking-wide">Amount</th>
                  <th className="px-2 py-2 text-center text-[9px] font-bold text-neutral-700 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-2 py-8 text-center text-xs text-neutral-500">
                      No items added. Search and add products above.
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={index} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-2 py-2 font-semibold text-neutral-900">{index + 1}</td>
                      <td className="px-2 py-2 font-semibold text-neutral-900">{item.product_name}</td>
                      <td className="px-2 py-2 text-neutral-600">{item.barcode || '--'}</td>
                      <td className="px-2 py-2">
                        <select
                          value={item.sale_type}
                          onChange={(e) => updateItem(index, 'sale_type', e.target.value)}
                          className="px-1.5 py-1 text-[10px] border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black bg-white transition-all"
                        >
                          <option value="Regular">Regular</option>
                          <option value="Wholesale">Wholesale</option>
                          <option value="Retail">Retail</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-16 px-1.5 py-1 text-[10px] border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black transition-all"
                        />
                      </td>
                      <td className="px-2 py-2 text-neutral-600">{item.unit}</td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={item.rate_per_unit}
                          onChange={(e) => updateItem(index, 'rate_per_unit', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-20 px-1.5 py-1 text-[10px] border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black transition-all"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={item.item_discount}
                          onChange={(e) => updateItem(index, 'item_discount', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-16 px-1.5 py-1 text-[10px] border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black transition-all"
                        />
                      </td>
                      <td className="px-2 py-2 font-bold text-neutral-900">
                        Rs {item.amount.toFixed(2)}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-all hover:shadow-sm"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals and Payment */}
        <div className="grid grid-cols-2 gap-2 shrink-0">
          {/* Notes */}
          <div className="bg-white rounded-lg border border-neutral-200 p-2.5 shadow-sm">
            <h3 className="text-[10px] font-bold text-neutral-900 mb-2 pb-1.5 border-b border-neutral-200 uppercase tracking-wide">Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or comments..."
              rows="3"
              className="w-full px-2 py-1.5 text-[10px] border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black resize-none mb-2 transition-all"
            />

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-semibold text-neutral-700 bg-white border-2 border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 rounded-md transition-all shadow-sm"
              >
                <X className="w-3.5 h-3.5" />
                Reset
              </button>
              <button
                type="submit"
                form="sale-form"
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1.5 bg-black text-white text-[10px] font-semibold rounded-md hover:bg-neutral-800 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
              >
                <Save className="w-3.5 h-3.5" />
                {loading ? 'Saving...' : 'Save Invoice'}
              </button>
            </div>
          </div>

          {/* Calculations */}
          <div className="bg-white rounded-lg border border-neutral-200 p-2.5 shadow-sm">
            <h3 className="text-[10px] font-bold text-neutral-900 mb-2 pb-1.5 border-b border-neutral-200 uppercase tracking-wide">Payment Summary</h3>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-neutral-600 font-medium">Total Items:</span>
                <span className="font-semibold text-neutral-900">{totals.total_items}</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-neutral-600 font-medium">Subtotal:</span>
                <span className="font-semibold text-neutral-900">Rs {totals.subtotal}</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-neutral-600 font-medium">Discount (%):</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-16 px-1.5 py-1 text-[10px] border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black text-right font-medium transition-all"
                />
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-neutral-600 font-medium">Discount Amount:</span>
                <span className="font-semibold text-red-600">- Rs {totals.discountAmount}</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-neutral-600 font-medium">Tax (%):</span>
                <input
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-16 px-1.5 py-1 text-[10px] border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black text-right font-medium transition-all"
                />
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-neutral-600 font-medium">Tax Amount:</span>
                <span className="font-semibold text-neutral-900">+ Rs {totals.taxAmount}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1.5 border-t-2 border-neutral-200">
                <span className="font-bold text-neutral-900">Grand Total:</span>
                <span className="font-bold text-emerald-600 text-sm">Rs {totals.grand_total}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] pt-1">
                <span className="text-neutral-600 font-medium">Amount Received:</span>
                <input
                  type="number"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="w-20 px-1.5 py-1 text-[10px] border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black text-right font-semibold transition-all"
                />
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-neutral-600 font-medium">Change Due:</span>
                <span className={`font-bold ${parseFloat(totals.change_due) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  Rs {totals.change_due}
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
