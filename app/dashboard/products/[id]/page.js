'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Package, Tag, Box, Layers } from 'lucide-react';

export default function ViewProductPage() {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setProduct(data.product);
      } else {
        alert('Product not found');
        router.push('/dashboard/products');
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      alert('Failed to load product');
      router.push('/dashboard/products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Product deleted successfully!');
        router.push('/dashboard/products');
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-neutral-300 border-t-black rounded-full animate-spin"></div>
          <p className="text-sm text-neutral-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-600">Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Product Details</h1>
            <p className="text-sm text-neutral-500">View product information</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/dashboard/products/${params.id}/edit`)}
            className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 transition-all"
          >
            <Edit className="w-4 h-4" />
            Edit Product
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Product Image and Status */}
        <div className="space-y-6">
          {/* Product Image */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-neutral-900 mb-4">Product Image</h3>
            <div className="aspect-square bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-200 flex items-center justify-center overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name_english}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <Package className="w-16 h-16 text-neutral-300 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400">No image</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-neutral-900 mb-4">Status</h3>
            <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold ${
              product.status === 'Active'
                ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                : 'bg-neutral-100 text-neutral-600 border-2 border-neutral-300'
            }`}>
              {product.status || 'Active'}
            </span>
          </div>
        </div>

        {/* Right Column - Product Information */}
        <div className="col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Product Name (English)</label>
                <p className="text-sm font-semibold text-neutral-900">{product.name_english || '--'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Product Name (Urdu)</label>
                <p className="text-sm font-semibold text-neutral-900" dir="rtl">{product.name_urdu || '--'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">SKU</label>
                <p className="text-sm font-semibold text-neutral-900">{product.sku || '--'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Barcode</label>
                <p className="text-sm font-semibold text-neutral-900">{product.barcode || '--'}</p>
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Classification
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Category</label>
                <p className="text-sm font-semibold text-neutral-900">
                  <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200">
                    {product.category || '--'}
                  </span>
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Sub-Category</label>
                <p className="text-sm font-semibold text-neutral-900">
                  {product.sub_category ? (
                    <span className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium border border-purple-200">
                      {product.sub_category}
                    </span>
                  ) : '--'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Brand</label>
                <p className="text-sm font-semibold text-neutral-900">
                  <span className="inline-flex items-center px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium border border-amber-200">
                    {product.brand || '--'}
                  </span>
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Unit of Measure</label>
                <p className="text-sm font-semibold text-neutral-900">
                  <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-200">
                    {product.unit || '--'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Inventory & Pricing */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Box className="w-5 h-5" />
              Inventory & Pricing
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <label className="block text-xs font-medium text-blue-700 mb-1">Current Stock</label>
                <p className="text-2xl font-bold text-blue-900">{product.stock || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
                <label className="block text-xs font-medium text-emerald-700 mb-1">Price</label>
                <p className="text-2xl font-bold text-emerald-900">Rs {product.price || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <label className="block text-xs font-medium text-purple-700 mb-1">Total Value</label>
                <p className="text-2xl font-bold text-purple-900">Rs {(product.stock || 0) * (product.price || 0)}</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Additional Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Supplier</label>
                <p className="text-sm font-semibold text-neutral-900">{product.supplier || '--'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Created At</label>
                <p className="text-sm font-semibold text-neutral-900">
                  {product.created_at ? new Date(product.created_at).toLocaleString() : '--'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
