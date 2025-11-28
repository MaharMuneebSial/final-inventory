'use client';

import { Bell } from 'lucide-react';
import { useState } from 'react';
import StockOutPanel from './StockOutPanel';

export default function Topbar() {
  const [showStockOut, setShowStockOut] = useState(false);

  return (
    <>
      <header className="h-10 flex justify-between items-center bg-[#3a3a3a] px-4 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center">
          <h1 className="text-xs font-semibold tracking-tight text-white">
            Inventory Software <span className="text-neutral-400 font-normal text-[11px]">by Airoxlab</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowStockOut(!showStockOut)}
            className="relative p-1 rounded hover:bg-neutral-600/50 transition-all duration-150"
          >
            <Bell className="w-3.5 h-3.5 text-neutral-300" />
            <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          </button>

          <h2 className="text-xs font-semibold tracking-tight text-white">
            Nawab Cash and Carry
          </h2>
        </div>
      </header>

      {showStockOut && (
        <StockOutPanel onClose={() => setShowStockOut(false)} />
      )}
    </>
  );
}
