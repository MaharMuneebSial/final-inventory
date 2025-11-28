'use client';

import { X, AlertTriangle } from 'lucide-react';

const outOfStockItems = [
  { product: 'Air Freshener', unit: 'Pc', stock: -6 },
  { product: 'Bubble', unit: 'Pc', stock: -1 },
  { product: 'Pen RS 80', unit: 'Pc', stock: -16 },
  { product: 'Rio Strawb S/P', unit: 'Pc', stock: -4 },
  { product: '3D Bugles Hot', unit: 'Pc', stock: -1 },
  { product: '4U Crisp Chee', unit: 'Pc', stock: -14 },
  { product: '4u Liner Chips', unit: '100gm', stock: -1 },
  { product: '4u Masala Chi', unit: '100gm', stock: -10 },
  { product: '4U Masala Chi', unit: 'Pc', stock: -20 },
  { product: '4u Masala Flav', unit: '100am', stock: -65 },
];

export default function StockOutPanel({ onClose }) {
  return (
    <div className="fixed top-10 right-8 w-96 bg-white/95 backdrop-blur-xl rounded-2xl border border-neutral-200/60 shadow-[0_8px_28px_rgba(0,0,0,0.12)] z-50 overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-neutral-200/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 bg-red-50 rounded-lg">
            <div className="relative flex items-center justify-center w-6 h-6 border-2 border-red-500 rounded-sm" style={{ transform: 'rotate(180deg)' }}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-0.5 h-2.5 bg-red-500 rounded-full mb-0.5"></div>
                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-neutral-900">Out of Stock</h3>
            <p className="text-xs text-neutral-500">{outOfStockItems.length} items</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-neutral-100/70 rounded-lg transition-all duration-200"
        >
          <X className="w-4 h-4 text-neutral-600" />
        </button>
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        <table className="w-full">
          <thead className="bg-neutral-50/50 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                Product
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                Unit
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                Stock
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200/40">
            {outOfStockItems.map((item, index) => (
              <tr key={index} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-6 py-3 text-sm text-neutral-700">{item.product}</td>
                <td className="px-6 py-3 text-center text-sm text-neutral-600">{item.unit}</td>
                <td className="px-6 py-3 text-right text-sm font-semibold text-red-600">
                  {item.stock}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
