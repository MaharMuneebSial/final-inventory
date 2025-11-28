'use client';

import { useState, useEffect } from 'react';
import { Search, Trash2, Save, X, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PurchasePage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [purchaseId, setPurchaseId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('');
  const [paymentType, setPaymentType] = useState('Cash');
  const [dueDate, setDueDate] = useState('');
  const [receivedBy, setReceivedBy] = useState('Admin');
  const [notes, setNotes] = useState('');
  const [amountPaid, setAmountPaid] = useState(0);

  // Items state
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  // Calculations
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);

  useEffect(() => {
    generatePurchaseId();
    const now = new Date();
    setPurchaseDate(now.toISOString().split('T')[0]);
    fetchProducts();
    fetchSuppliers();
  }, []);

  const generatePurchaseId = () => {
    const timestamp = Date.now();
    setPurchaseId(`PUR-${timestamp}`);
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

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      const data = await response.json();
      setSuppliers(data.suppliers || []);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
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
          ? {
              ...item,
              quantity: item.quantity + 1,
              received_qty: item.quantity + 1,
              total: (item.quantity + 1) * item.purchase_price
            }
          : item
      ));
    } else {
      setItems([...items, {
        item_id: product.id,
        product_name: product.name_english,
        barcode: product.barcode || '',
        quantity: 1,
        received_qty: 1,
        unit: product.unit || 'Pc',
        rate: product.price || 0,
        purchase_price: product.price || 0,
        sale_price: product.price || 0,
        total: product.price || 0,
        expiry_date: ''
      }]);
    }

    setSearchTerm('');
    setShowSearch(false);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];

    if (field === 'expiry_date') {
      newItems[index][field] = value;
    } else {
      newItems[index][field] = parseFloat(value) || 0;
    }

    if (field === 'quantity' || field === 'purchase_price') {
      const qty = newItems[index].quantity;
      const price = newItems[index].purchase_price;
      newItems[index].total = qty * price;
      newItems[index].rate = price;

      if (!newItems[index].received_qty || newItems[index].received_qty === 0) {
        newItems[index].received_qty = qty;
      }
    }

    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = (subtotal * discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * tax) / 100;
    const grandTotal = taxableAmount + taxAmount;
    const balanceDue = grandTotal - amountPaid;

    let paymentStatus = 'Pending';
    if (amountPaid >= grandTotal) {
      paymentStatus = 'Paid';
    } else if (amountPaid > 0) {
      paymentStatus = 'Partial';
    }

    return {
      total_items: items.length,
      subtotal: subtotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      grand_total: grandTotal.toFixed(2),
      balance_due: balanceDue.toFixed(2),
      payment_status: paymentStatus
    };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    if (!supplierName.trim()) {
      alert('Please enter supplier name');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchase_id: purchaseId,
          purchase_date: purchaseDate,
          supplier_name: supplierName,
          supplier_phone: supplierPhone,
          supplier_invoice_no: supplierInvoiceNo,
          payment_type: paymentType,
          due_date: dueDate,
          total_items: totals.total_items,
          subtotal: parseFloat(totals.subtotal),
          discount: discount,
          tax: tax,
          grand_total: parseFloat(totals.grand_total),
          amount_paid: parseFloat(amountPaid),
          balance_due: parseFloat(totals.balance_due),
          payment_status: totals.payment_status,
          received_by: receivedBy,
          notes: notes,
          items: items
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Purchase invoice created successfully!');
        router.push('/dashboard/purchase-list');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to create purchase:', error);
      alert('Failed to create purchase invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setItems([]);
    setDiscount(0);
    setTax(0);
    setAmountPaid(0);
    setNotes('');
    setSupplierName('');
    setSupplierPhone('');
    setSupplierInvoiceNo('');
    setDueDate('');
    generatePurchaseId();
  };

  const handleSupplierSelect = (e) => {
    const selectedSupplier = suppliers.find(s => s.name === e.target.value);
    if (selectedSupplier) {
      setSupplierName(selectedSupplier.name);
      setSupplierPhone(selectedSupplier.contact || '');
    } else {
      setSupplierName(e.target.value);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Purchase Invoice</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Create new purchase transaction</p>
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
            form="purchase-form"
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-black text-white text-xs font-medium rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {loading ? 'Saving...' : 'Save Invoice'}
          </button>
        </div>
      </div>

      <form id="purchase-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Invoice Details */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <h3 className="text-sm font-semibold text-neutral-900 mb-3">Purchase Details</h3>
          <div className="grid grid-cols-6 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Purchase ID</label>
              <input
                type="text"
                value={purchaseId}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg bg-neutral-50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Purchase Date</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Supplier Invoice No</label>
              <input
                type="text"
                value={supplierInvoiceNo}
                onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                placeholder="Supplier invoice #"
                className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Payment Type</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 bg-white"
              >
                <option value="Cash">Cash</option>
                <option value="Credit">Credit</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Received By</label>
              <input
                type="text"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
          </div>
        </div>

        {/* Supplier Details */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <h3 className="text-sm font-semibold text-neutral-900 mb-3">Supplier Information</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Supplier Name *</label>
              <select
                value={supplierName}
                onChange={handleSupplierSelect}
                className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 bg-white"
              >
                <option value="">Select Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.name}>{supplier.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Or Enter New Supplier</label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Enter supplier name"
                className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Supplier Phone</label>
              <input
                type="text"
                value={supplierPhone}
                onChange={(e) => setSupplierPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
          </div>
        </div>

        {/* Product Search */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <h3 className="text-sm font-semibold text-neutral-900 mb-3">Add Products</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by product name, SKU, or barcode..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
            />

            {showSearch && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map(product => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addItem(product)}
                    className="w-full px-4 py-2 text-left hover:bg-neutral-50 border-b border-neutral-100 last:border-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{product.name_english}</p>
                        <p className="text-xs text-neutral-500">SKU: {product.sku} | Stock: {product.stock}</p>
                      </div>
                      <p className="text-sm font-semibold text-neutral-900">Rs {product.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">#</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Product</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Barcode</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Qty</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Received</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Unit</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Purchase Price</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Sale Price</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Total</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-neutral-600 uppercase">Expiry</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-neutral-600 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="px-2 py-8 text-center text-sm text-neutral-500">
                      No items added. Search and add products above.
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={index} className="hover:bg-neutral-50">
                      <td className="px-2 py-2 text-sm text-neutral-900">{index + 1}</td>
                      <td className="px-2 py-2 text-sm font-medium text-neutral-900">{item.product_name}</td>
                      <td className="px-2 py-2 text-sm text-neutral-600">{item.barcode || '--'}</td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-16 px-1 py-1 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-black/5"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={item.received_qty}
                          onChange={(e) => updateItem(index, 'received_qty', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-16 px-1 py-1 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-black/5"
                        />
                      </td>
                      <td className="px-2 py-2 text-sm text-neutral-600">{item.unit}</td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={item.purchase_price}
                          onChange={(e) => updateItem(index, 'purchase_price', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-20 px-1 py-1 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-black/5"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={item.sale_price}
                          onChange={(e) => updateItem(index, 'sale_price', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-20 px-1 py-1 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-black/5"
                        />
                      </td>
                      <td className="px-2 py-2 text-sm font-semibold text-neutral-900">
                        Rs {item.total.toFixed(2)}
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="date"
                          value={item.expiry_date}
                          onChange={(e) => updateItem(index, 'expiry_date', e.target.value)}
                          className="w-28 px-1 py-1 text-xs border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-black/5"
                        />
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

        {/* Totals and Payment */}
        <div className="grid grid-cols-2 gap-4">
          {/* Notes */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or comments..."
              rows="6"
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
            />
          </div>

          {/* Calculations */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-600">Total Items:</span>
                <span className="font-medium text-neutral-900">{totals.total_items}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-600">Subtotal:</span>
                <span className="font-medium text-neutral-900">Rs {totals.subtotal}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-600">Discount (%):</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-24 px-2 py-1 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-black/5 text-right"
                />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-600">Discount Amount:</span>
                <span className="font-medium text-red-600">- Rs {totals.discountAmount}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-600">Tax (%):</span>
                <input
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-24 px-2 py-1 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-black/5 text-right"
                />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-600">Tax Amount:</span>
                <span className="font-medium text-neutral-900">+ Rs {totals.taxAmount}</span>
              </div>
              <div className="flex justify-between items-center text-base pt-2 border-t border-neutral-200">
                <span className="font-semibold text-neutral-900">Grand Total:</span>
                <span className="font-bold text-emerald-600 text-lg">Rs {totals.grand_total}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-neutral-600">Amount Paid:</span>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="w-32 px-2 py-1 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-black/5 text-right font-medium"
                />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-600">Balance Due:</span>
                <span className={`font-semibold ${parseFloat(totals.balance_due) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  Rs {totals.balance_due}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-neutral-200">
                <span className="text-neutral-600">Payment Status:</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  totals.payment_status === 'Paid' ? 'bg-emerald-50 text-emerald-700' :
                  totals.payment_status === 'Partial' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-red-50 text-red-700'
                }`}>
                  {totals.payment_status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
