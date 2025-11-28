'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Trash2, X, Plus, Printer, RotateCcw, User } from 'lucide-react';

export default function SaleReturnPage() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [returnId, setReturnId] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [originalSaleId, setOriginalSaleId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [contact, setContact] = useState('');
  const [createdBy, setCreatedBy] = useState('Admin');
  const [returnReason, setReturnReason] = useState('');
  const [stockAdjustment, setStockAdjustment] = useState('Added back to stock');
  const [notes, setNotes] = useState('');

  // Refund calculations
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [deduction, setDeduction] = useState(0);
  const [roundOff, setRoundOff] = useState(0);
  const [refundMethod, setRefundMethod] = useState('Cash');
  const [status, setStatus] = useState('Pending');

  // Items state
  const [items, setItems] = useState([{
    id: 1,
    product_name: '',
    sku: '',
    company: '',
    batch: '',
    expiry: '',
    return_qty: 1,
    price: 0,
    subtotal: 0,
    reason: '',
    item_id: null
  }]);

  const [selectedSale, setSelectedSale] = useState(null);
  const [showSaleSearch, setShowSaleSearch] = useState(false);
  const [saleSearchTerm, setSaleSearchTerm] = useState('');

  useEffect(() => {
    generateReturnId();
    const now = new Date();
    setReturnDate(now.toISOString().split('T')[0]);
    setReturnTime(now.toTimeString().split(' ')[0].substring(0, 5));
    fetchSales();
    fetchProducts();
  }, []);

  const generateReturnId = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000);
    setReturnId(`SR-${timestamp}-${randomNum}`);
  };

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/sales');
      const data = await response.json();
      setSales(data.sales || []);
    } catch (error) {
      console.error('Failed to fetch sales:', error);
    }
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

  const handleSaleSelect = async (sale) => {
    try {
      const response = await fetch(`/api/sales/${sale.sale_id}`);
      const data = await response.json();

      if (data.sale) {
        setSelectedSale(data.sale);
        setOriginalSaleId(data.sale.sale_id);
        setCustomerName(data.sale.customer_name || '');
        setContact(data.sale.contact || '');

        const returnItems = data.sale.items.map((item, index) => ({
          id: index + 1,
          item_id: item.item_id,
          product_name: item.product_name,
          sku: item.sku || '',
          company: item.company || '',
          batch: item.batch || '',
          expiry: item.expiry_date || '',
          return_qty: 0,
          price: item.rate_per_unit || 0,
          subtotal: 0,
          reason: ''
        }));

        setItems(returnItems);
        setShowSaleSearch(false);
        setSaleSearchTerm('');
      }
    } catch (error) {
      console.error('Failed to fetch sale details:', error);
      alert('Failed to load sale details');
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === 'return_qty' || field === 'price') {
      const qty = parseFloat(newItems[index].return_qty) || 0;
      const price = parseFloat(newItems[index].price) || 0;
      newItems[index].subtotal = qty * price;
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, {
      id: items.length + 1,
      product_name: '',
      sku: '',
      company: '',
      batch: '',
      expiry: '',
      return_qty: 1,
      price: 0,
      subtotal: 0,
      reason: '',
      item_id: null
    }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);
    const discountAmount = (subtotal * (parseFloat(discountPercent) || 0)) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * (parseFloat(taxPercent) || 0)) / 100;
    const deductionAmount = parseFloat(deduction) || 0;
    const roundOffAmount = parseFloat(roundOff) || 0;

    const refundTotal = taxableAmount + taxAmount - deductionAmount + roundOffAmount;

    return {
      subtotal: subtotal.toFixed(2),
      refundTotal: refundTotal.toFixed(2),
      refundAmount: refundTotal
    };
  }, [items, discountPercent, taxPercent, deduction, roundOff]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const returnItems = items.filter(item => (parseFloat(item.return_qty) || 0) > 0);

    if (returnItems.length === 0) {
      alert('Please specify return quantities for at least one item');
      return;
    }

    if (!originalSaleId) {
      alert('Please select a sale invoice');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/sale-returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          return_id: returnId,
          return_date: returnDate,
          return_time: returnTime,
          original_sale_id: originalSaleId,
          customer_name: customerName,
          return_reason: returnReason,
          total_return_amount: parseFloat(totals.subtotal),
          refund_amount: parseFloat(totals.refundTotal),
          refund_method: refundMethod,
          status: status,
          processed_by: createdBy,
          notes: notes,
          items: returnItems.map(item => ({
            item_id: item.item_id,
            product_name: item.product_name,
            original_quantity: item.return_qty,
            return_qty: item.return_qty,
            unit: 'PCS',
            unit_price: item.price,
            line_total: item.subtotal,
            item_condition: 'Good'
          }))
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Sale return created successfully!');
        handleReset();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to create sale return:', error);
      alert('Failed to create sale return');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setItems([{
      id: 1,
      product_name: '',
      sku: '',
      company: '',
      batch: '',
      expiry: '',
      return_qty: 1,
      price: 0,
      subtotal: 0,
      reason: '',
      item_id: null
    }]);
    setOriginalSaleId('');
    setCustomerName('');
    setContact('');
    setReturnReason('');
    setNotes('');
    setSelectedSale(null);
    setDiscountPercent(0);
    setTaxPercent(0);
    setDeduction(0);
    setRoundOff(0);
    generateReturnId();
    const now = new Date();
    setReturnTime(now.toTimeString().split(' ')[0].substring(0, 5));
  };

  const filteredSales = sales.filter(s =>
    s.sale_id?.toLowerCase().includes(saleSearchTerm.toLowerCase()) ||
    s.sold_by?.toLowerCase().includes(saleSearchTerm.toLowerCase())
  );

  return (
    <div className="h-screen bg-white p-4 overflow-hidden">
      <form onSubmit={handleSubmit} className="h-full max-w-[1800px] mx-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-gray-900">Sale Return Invoice</h1>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-gray-600">Return #: <span className="font-medium text-blue-600">{returnId}</span></span>
              <span className="text-gray-600">Date: <span className="font-medium text-gray-900">{returnDate}</span></span>
              <span className="text-gray-600">Time: <span className="font-medium text-gray-900">{returnTime}</span></span>
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <RotateCcw className="w-3.5 h-3.5" />
                Added back to stock
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              Process Return
            </button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
          {/* Left Section - 9 columns */}
          <div className="col-span-9 flex flex-col gap-3 min-h-0">
            {/* Top Form Fields */}
            <div className="bg-white border border-gray-200 rounded-lg p-3 shrink-0">
              <div className="grid grid-cols-4 gap-3">
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Original Sale Invoice *</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={saleSearchTerm}
                      onChange={(e) => {
                        setSaleSearchTerm(e.target.value);
                        setShowSaleSearch(e.target.value.length > 0);
                      }}
                      onFocus={() => setShowSaleSearch(saleSearchTerm.length > 0)}
                      placeholder="Search invoice..."
                      className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                  </div>

                  {showSaleSearch && filteredSales.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredSales.map(sale => (
                        <button
                          key={sale.id}
                          type="button"
                          onClick={() => handleSaleSelect(sale)}
                          className="w-full px-4 py-2.5 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{sale.sale_id}</p>
                              <p className="text-xs text-gray-500">{sale.sale_date}</p>
                            </div>
                            <p className="text-sm font-semibold">Rs {sale.grand_total}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Customer Name</label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Customer name"
                      className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Contact</label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Phone number"
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Created By</label>
                  <input
                    type="text"
                    value={createdBy}
                    onChange={(e) => setCreatedBy(e.target.value)}
                    placeholder="Staff name"
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Return Items */}
            <div className="bg-white border border-gray-200 rounded-lg flex-1 flex flex-col min-h-0">
              <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-gray-700 font-semibold text-[10px]">{items.length}</span>
                  </div>
                  <h3 className="text-xs font-semibold text-gray-900">Return Items</h3>
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Item
                </button>
              </div>

              <div className="flex-1 overflow-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-600 uppercase">#</th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-600 uppercase">Product</th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-600 uppercase">SKU</th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-600 uppercase">Company</th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-600 uppercase">Batch</th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-600 uppercase">Expiry</th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-600 uppercase">QTY</th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-600 uppercase">Price</th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-600 uppercase">Subtotal</th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-600 uppercase">Reason</th>
                      <th className="px-2 py-1.5 text-center text-[10px] font-semibold text-gray-600 uppercase"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {items.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-2 py-1.5 text-xs text-gray-900">{index + 1}</td>
                        <td className="px-2 py-1.5">
                          <input
                            type="text"
                            value={item.product_name}
                            onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                            placeholder="Product..."
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="text"
                            value={item.sku}
                            onChange={(e) => updateItem(index, 'sku', e.target.value)}
                            placeholder="SKU"
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="text"
                            value={item.company}
                            onChange={(e) => updateItem(index, 'company', e.target.value)}
                            placeholder="Company"
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="text"
                            value={item.batch}
                            onChange={(e) => updateItem(index, 'batch', e.target.value)}
                            placeholder="Batch"
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="text"
                            value={item.expiry}
                            onChange={(e) => updateItem(index, 'expiry', e.target.value)}
                            placeholder="mm/dd/yyyy"
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            value={item.return_qty}
                            onChange={(e) => updateItem(index, 'return_qty', e.target.value)}
                            min="0"
                            className="w-14 px-2 py-1 text-xs text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItem(index, 'price', e.target.value)}
                            min="0"
                            step="0.01"
                            className="w-16 px-2 py-1 text-xs text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                          />
                        </td>
                        <td className="px-2 py-1.5 text-xs font-semibold text-gray-900">
                          Rs.{item.subtotal.toFixed(0)}
                        </td>
                        <td className="px-2 py-1.5">
                          <select
                            value={item.reason}
                            onChange={(e) => updateItem(index, 'reason', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                          >
                            <option value="">Select</option>
                            <option value="Damaged">Damaged</option>
                            <option value="Defective">Defective</option>
                            <option value="Wrong Item">Wrong Item</option>
                            <option value="Expired">Expired</option>
                            <option value="Other">Other</option>
                          </select>
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-0.5 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Form Fields */}
            <div className="bg-white border border-gray-200 rounded-lg p-3 shrink-0">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Return Reason</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select reason</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Defective">Defective</option>
                    <option value="Wrong Item">Wrong Item</option>
                    <option value="Changed Mind">Changed Mind</option>
                    <option value="Not as Expected">Not as Expected</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Stock Adjustment</label>
                  <select
                    value={stockAdjustment}
                    onChange={(e) => setStockAdjustment(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="Added back to stock">Added back to stock</option>
                    <option value="Damaged - Not returned">Damaged - Not returned</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes..."
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - 3 columns */}
          <div className="col-span-3 flex flex-col gap-2 min-h-0 overflow-y-auto pb-2">
            {/* Refund Calculations */}
            <div className="bg-white border border-gray-200 rounded-lg p-2 shrink-0">
              <h3 className="text-xs font-semibold text-gray-900 mb-1.5">Refund Calculations</h3>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">Rs.{totals.subtotal}</span>
                </div>

                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-gray-600">Discount %</span>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-14 px-2 py-1 text-xs text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-gray-600">Tax %</span>
                  <input
                    type="number"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-14 px-2 py-1 text-xs text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-gray-600">Deduction</span>
                  <input
                    type="number"
                    value={deduction}
                    onChange={(e) => setDeduction(e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-14 px-2 py-1 text-xs text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-gray-600">Round Off</span>
                  <input
                    type="number"
                    value={roundOff}
                    onChange={(e) => setRoundOff(e.target.value)}
                    step="0.01"
                    className="w-14 px-2 py-1 text-xs text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Refund Details */}
            <div className="bg-white border border-gray-200 rounded-lg p-2 shrink-0">
              <h3 className="text-xs font-semibold text-gray-900 mb-1.5">Refund Details</h3>
              <div className="space-y-1.5">
                <div>
                  <label className="block text-[10px] text-gray-600 mb-1">Method</label>
                  <select
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Store Credit">Store Credit</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-600 mb-1">Amount</label>
                  <input
                    type="text"
                    value={`Rs.${totals.refundTotal}`}
                    readOnly
                    className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-300 rounded-lg font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-600 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Total Summary */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-lg p-2 text-white shrink-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-gray-400 uppercase">Subtotal</span>
                <span className="text-xs font-bold">Rs.{totals.subtotal}</span>
              </div>
              <div className="border-t border-gray-700 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-gray-400 uppercase">Refund Total</span>
                  <span className="text-base font-bold text-blue-400">Rs.{totals.refundTotal}</span>
                </div>
              </div>
            </div>

            {/* Process Refund Button */}
            <div className="flex items-center gap-2 shrink-0 sticky bottom-0 bg-white pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Process Refund
              </button>
              <button
                type="button"
                className="p-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
