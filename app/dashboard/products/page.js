'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProductsListPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const data = await response.json();
      if (response.ok) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Product deleted successfully!');
        fetchProducts();
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name_english?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !filterCategory || product.category === filterCategory;
    const matchesStatus = !filterStatus || product.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <div className="p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Products List</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Total {filteredProducts.length} products
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/new-product')}
          className="flex items-center gap-2 px-4 py-2.5 bg-black text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
        <div className="grid grid-cols-4 gap-3">
          {/* Search */}
          <div className="col-span-2">
            <label className="block text-[10px] font-medium text-neutral-700 mb-1.5">Search Products</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by name, SKU, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-medium text-neutral-700 mb-1.5">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black bg-white transition-all"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-medium text-neutral-700 mb-1.5">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black bg-white transition-all"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gradient-to-r from-neutral-50 to-neutral-100 border-b-2 border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-neutral-700 uppercase tracking-wide">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-neutral-700 uppercase tracking-wide">
                  Product Name
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-neutral-700 uppercase tracking-wide">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-neutral-700 uppercase tracking-wide">
                  Brand
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-neutral-700 uppercase tracking-wide">
                  Unit
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-neutral-700 uppercase tracking-wide">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-neutral-700 uppercase tracking-wide">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-neutral-700 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-[10px] font-bold text-neutral-700 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-sm text-neutral-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-3 border-neutral-300 border-t-black rounded-full animate-spin"></div>
                      <p>Loading products...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-sm text-neutral-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-50/50 transition-colors group">
                    <td className="px-4 py-3 font-semibold text-neutral-900">
                      {product.sku || '--'}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-neutral-900">{product.name_english}</p>
                        {product.name_urdu && (
                          <p className="text-[10px] text-neutral-500 mt-0.5" dir="rtl">{product.name_urdu}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      <span className="px-2 py-1 bg-neutral-100 rounded text-[10px] font-medium">
                        {product.category || '--'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {product.brand || '--'}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {product.unit || '--'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-neutral-900">
                      <span className={`${
                        (product.stock || 0) <= 0
                          ? 'text-red-600'
                          : (product.stock || 0) < 10
                            ? 'text-amber-600'
                            : 'text-neutral-900'
                      }`}>
                        {product.stock || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-neutral-900">
                      Rs {product.price || 0}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                        product.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                      }`}>
                        {product.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => router.push(`/dashboard/products/${product.id}`)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-all hover:shadow-sm"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}
                          className="p-1.5 text-neutral-600 hover:bg-neutral-100 rounded-md transition-all hover:shadow-sm"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-all hover:shadow-sm"
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

      {/* Summary Footer */}
      {!loading && filteredProducts.length > 0 && (
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <p className="text-[10px] font-medium text-blue-700 mb-1 uppercase tracking-wide">Total Products</p>
              <p className="text-2xl font-bold text-blue-900">{filteredProducts.length}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
              <p className="text-[10px] font-medium text-emerald-700 mb-1 uppercase tracking-wide">Active Products</p>
              <p className="text-2xl font-bold text-emerald-900">
                {filteredProducts.filter(p => p.status === 'Active').length}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
              <p className="text-[10px] font-medium text-red-700 mb-1 uppercase tracking-wide">Out of Stock</p>
              <p className="text-2xl font-bold text-red-900">
                {filteredProducts.filter(p => p.stock === 0 || p.stock < 0).length}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
              <p className="text-[10px] font-medium text-amber-700 mb-1 uppercase tracking-wide">Total Value</p>
              <p className="text-2xl font-bold text-amber-900">
                Rs {filteredProducts.reduce((sum, p) => sum + (p.price * p.stock || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
