'use client';

import {
  LayoutGrid,
  FileText,
  List,
  ShoppingCart,
  RotateCcw,
  Receipt,
  DollarSign,
  Plus,
  Package
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { name: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
  { name: 'Sale Invoice', icon: FileText, path: '/dashboard/sales' },
  { name: 'Sale Invoices List', icon: List, path: '/dashboard/sales-list' },
  { name: 'Purchase Invoice', icon: ShoppingCart, path: '/dashboard/purchase' },
  { name: 'Purchase Invoices List', icon: List, path: '/dashboard/purchase-list' },
  { name: 'Purchase Return Invoice', icon: RotateCcw, path: '/dashboard/purchase-return' },
  { name: 'Sale Return ', icon: Receipt, path: '/dashboard/sale-return' },
  { name: 'Sale Return List', icon: List, path: '/dashboard/sale-return-list' },
  { name: 'Payment', icon: DollarSign, path: '/dashboard/payment' },
  { name: 'Products', icon: Package, path: '/dashboard/products' },
  { name: 'New Product Entry', icon: Plus, path: '/dashboard/new-product' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-52 bg-white border-r border-neutral-200 flex flex-col py-2.5 px-2 fixed left-0 top-10 bottom-0 overflow-y-auto">
      <div className="flex flex-col gap-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-150 ${
                isActive
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-xs font-normal tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
