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
    <div className="space-y-6">
      {/* Header Section with Filters and Today's Sale */}
      <div className="flex items-center justify-between">
        {/* Filters */}
        <div className="flex items-center gap-1">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1.5 rounded-lg font-medium text-[11px] transition-all duration-150 ${
                activeFilter === filter
                  ? 'bg-black text-white'
                  : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Today's Sale Counter */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <p className="text-xs font-semibold text-emerald-700">
            <span className="text-[10px] font-medium text-emerald-600 mr-1">Today's Sale</span>
            {loading ? 'Loading...' : formatCurrency(dashboardData.todaySale)}
          </p>
        </div>
      </div>

      {/* Dashboard Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-neutral-900 mb-1">Dashboard</h1>
        <p className="text-sm text-neutral-400">Welcome back, System Administrator</p>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-8 gap-2.5">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={() => router.push(action.path)}
              className="bg-white rounded-2xl border border-neutral-100 p-3 transition-all duration-150 hover:bg-neutral-50 flex flex-col items-center gap-2 group"
            >
              <div className={`${action.bgColor} p-3 rounded-xl group-hover:bg-neutral-800 transition-colors duration-150`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-[10px] font-medium text-neutral-500 text-center leading-tight">
                {action.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-xl rounded-2xl border border-neutral-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-6 transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_8px_28px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                {stat.change && (
                  <span
                    className={`text-sm font-semibold ${
                      stat.changeType === 'positive'
                        ? 'text-emerald-600'
                        : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                )}
              </div>
              <h3 className="text-sm text-neutral-500 font-medium mb-1">
                {stat.title}
              </h3>
              <p className="text-2xl font-semibold text-neutral-900 tracking-tight">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
