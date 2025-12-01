'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  List,
  ShoppingCart,
  Package,
  RotateCcw,
  Receipt,
  DollarSign,
  Plus,
  TrendingUp,
  Users,
  Wallet,
  Building2,
  ShoppingBag,
  CreditCard
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('Today');
  const [dashboardData, setDashboardData] = useState({
    todaySale: 0,
    stats: {
      totalSale: 0,
      salesChange: 0,
      customerBalances: 0,
      cashInHand: 0,
      bankBalance: 0,
      totalPurchase: 0,
      purchaseChange: 0,
      expenses: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, [activeFilter]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/stats?filter=${activeFilter}`);
      const data = await response.json();
      if (response.ok) {
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `Rs ${amount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
  };

  const filters = ['Today', 'This Week', 'This Month'];

  const quickActions = [
    {
      icon: FileText,
      label: 'Sale Invoice',
      path: '/dashboard/sales',
      bgColor: 'bg-neutral-900'
    },
    {
      icon: List,
      label: 'Sale Invoices List',
      path: '/dashboard/sales-list',
      bgColor: 'bg-neutral-900'
    },
    {
      icon: ShoppingCart,
      label: 'Purchase Invoice',
      path: '/dashboard/purchase',
      bgColor: 'bg-neutral-900'
    },
    {
      icon: Package,
      label: 'Purchase Invoices List',
      path: '/dashboard/purchase-list',
      bgColor: 'bg-neutral-900'
    },
    {
      icon: RotateCcw,
      label: 'Sale Return Invoice',
      path: '/dashboard/sale-return-invoice',
      bgColor: 'bg-neutral-900'
    },
    {
      icon: Receipt,
      label: 'Sale Return List',
      path: '/dashboard/sale-return-list',
      bgColor: 'bg-neutral-900'
    },
    {
      icon: DollarSign,
      label: 'Payment',
      path: '/dashboard/payment',
      bgColor: 'bg-neutral-900'
    },
    {
      icon: Plus,
      label: 'New Product Entry',
      path: '/dashboard/new-product',
      bgColor: 'bg-neutral-900'
    }
  ];

  const stats = [
    {
      title: 'Total Sale',
      value: formatCurrency(dashboardData.stats.totalSale),
      icon: TrendingUp,
      change: dashboardData.stats.salesChange > 0 ? `+${dashboardData.stats.salesChange}%` : `${dashboardData.stats.salesChange}%`,
      changeType: dashboardData.stats.salesChange >= 0 ? 'positive' : 'negative',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Customer Balances',
      value: formatCurrency(dashboardData.stats.customerBalances),
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Cash In Hand',
      value: formatCurrency(dashboardData.stats.cashInHand),
      icon: Wallet,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Balance in Bank',
      value: formatCurrency(dashboardData.stats.bankBalance),
      icon: Building2,
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600'
    },
    {
      title: 'Total Purchase',
      value: formatCurrency(dashboardData.stats.totalPurchase),
      icon: ShoppingBag,
      change: dashboardData.stats.purchaseChange > 0 ? `+${dashboardData.stats.purchaseChange}%` : `${dashboardData.stats.purchaseChange}%`,
      changeType: dashboardData.stats.purchaseChange >= 0 ? 'positive' : 'negative',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Expenses',
      value: formatCurrency(dashboardData.stats.expenses),
      icon: CreditCard,
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600'
    }
  ];

  return (
    <div className="p-3 space-y-3">
      {/* Header Section with Dashboard Title and Today's Sale */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-neutral-900">Dashboard</h1>
          <p className="text-[10px] text-neutral-500 mt-0.5">Welcome back, System Administrator</p>
        </div>

        {/* Today's Sale Counter */}
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <div className="flex flex-col">
            <span className="text-[9px] font-semibold text-emerald-600 uppercase tracking-wide">Today's Sale</span>
            <p className="text-xs font-bold text-emerald-700">
              {loading ? 'Loading...' : formatCurrency(dashboardData.todaySale)}
            </p>
          </div>
        </div>
      </div>

      {/* Time Period Filters */}
      <div className="bg-white rounded-lg border border-neutral-200 p-2 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-neutral-700 uppercase tracking-wide mr-1">Period:</span>
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-md font-semibold text-[10px] transition-all ${
                activeFilter === filter
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white rounded-lg border border-neutral-200 p-3 shadow-sm">
        <h2 className="text-[10px] font-bold text-neutral-900 mb-2.5 pb-2 border-b border-neutral-200 uppercase tracking-wide">Quick Actions</h2>
        <div className="grid grid-cols-8 gap-2">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => router.push(action.path)}
                className="bg-gradient-to-b from-neutral-50 to-white rounded-lg border border-neutral-200 p-2.5 transition-all duration-150 hover:shadow-md hover:border-neutral-300 hover:-translate-y-0.5 flex flex-col items-center gap-2 group"
              >
                <div className="bg-neutral-900 p-2.5 rounded-lg group-hover:bg-neutral-800 transition-all shadow-sm">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-[9px] font-semibold text-neutral-600 text-center leading-tight group-hover:text-neutral-900">
                  {action.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-white rounded-lg border border-neutral-200 p-3 shadow-sm">
        <h2 className="text-[10px] font-bold text-neutral-900 mb-2.5 pb-2 border-b border-neutral-200 uppercase tracking-wide">Statistics Overview</h2>
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-neutral-50/50 rounded-lg border border-neutral-200 shadow-sm p-3 transition-all duration-200 hover:shadow-md hover:border-neutral-300 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between mb-2.5">
                  <div className={`${stat.bgColor} p-2 rounded-lg shadow-sm`}>
                    <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                  </div>
                  {stat.change && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        stat.changeType === 'positive'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {stat.change}
                    </span>
                  )}
                </div>
                <h3 className="text-[10px] text-neutral-500 font-semibold mb-1 uppercase tracking-wide">
                  {stat.title}
                </h3>
                <p className="text-base font-bold text-neutral-900">
                  {loading ? (
                    <span className="text-neutral-400 text-sm">Loading...</span>
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
