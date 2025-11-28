'use client';

import { useState, useEffect, useRef } from 'react';
import { X, RotateCw, Scan, Upload, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    sku: '',
    barcode: '',
    name_english: '',
    name_urdu: '',
    category: '',
    sub_category: '',
    brand: '',
    unit: '',
    supplier: '',
    status: 'Active',
    image_url: '',
    stock: 0,
    price: 0
  });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [showNewBrandModal, setShowNewBrandModal] = useState(false);
  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newSupplierContact, setNewSupplierContact] = useState('');

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [categoriesRes, brandsRes, suppliersRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/brands'),
        fetch('/api/suppliers')
      ]);

      const categoriesData = await categoriesRes.json();
      const brandsData = await brandsRes.json();
      const suppliersData = await suppliersRes.json();

      setCategories(categoriesData.categories || []);
      setBrands(brandsData.brands || []);
      setSuppliers(suppliersData.suppliers || []);
    } catch (error) {
      console.error('Failed to fetch dropdown data:', error);
    }
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'name_english':
        if (!value.trim()) {
          newErrors.name_english = 'Product name is required';
        } else {
          delete newErrors.name_english;
        }
        break;
      case 'sku':
        if (value && value.length < 3) {
          newErrors.sku = 'SKU must be at least 3 characters';
        } else {
          delete newErrors.sku;
        }
        break;
      case 'price':
        if (value && parseFloat(value) < 0) {
          newErrors.price = 'Price cannot be negative';
        } else {
          delete newErrors.price;
        }
        break;
      case 'stock':
        if (value && parseInt(value) < 0) {
          newErrors.stock = 'Stock cannot be negative';
        } else {
          delete newErrors.stock;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, image_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateSKU = () => {
    const timestamp = Date.now().toString().slice(-6);
    setFormData(prev => ({ ...prev, sku: `PRD${timestamp}` }));
  };

  const handleCreateCategory = async () => {
    const trimmedName = newItemName.trim();

    if (!trimmedName) {
      alert('Category name is required');
      return;
    }

    console.log('Creating category:', trimmedName);

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.category) {
        console.log('Category created successfully:', data.category);
        setCategories(prev => {
          const updated = [...prev, data.category];
          console.log('Updated categories:', updated);
          return updated;
        });
        setFormData(prev => ({ ...prev, category: data.category.name }));
        setShowNewCategoryModal(false);
        setNewItemName('');
        alert('Category added successfully!');

        // Refetch categories to ensure sync
        await fetchDropdownData();
      } else {
        console.error('Failed to create category:', data);
        alert(`Failed to create category: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Exception creating category:', error);
      alert('Failed to create category: ' + error.message);
    }
  };

  const handleCreateBrand = async () => {
    const trimmedName = newItemName.trim();

    if (!trimmedName) {
      alert('Brand name is required');
      return;
    }

    console.log('Creating brand:', trimmedName);

    try {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.brand) {
        console.log('Brand created successfully:', data.brand);
        setBrands(prev => {
          const updated = [...prev, data.brand];
          console.log('Updated brands:', updated);
          return updated;
        });
        setFormData(prev => ({ ...prev, brand: data.brand.name }));
        setShowNewBrandModal(false);
        setNewItemName('');
        alert('Brand added successfully!');

        // Refetch brands to ensure sync
        await fetchDropdownData();
      } else {
        console.error('Failed to create brand:', data);
        alert(`Failed to create brand: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Exception creating brand:', error);
      alert('Failed to create brand: ' + error.message);
    }
  };

  const handleCreateSupplier = async () => {
    if (!newItemName.trim()) {
      alert('Supplier name is required');
      return;
    }

    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newItemName, contact: newSupplierContact })
      });

      if (response.ok) {
        const data = await response.json();
        setSuppliers(prev => [...prev, data.supplier]);
        setFormData(prev => ({ ...prev, supplier: data.supplier.name }));
        setShowNewSupplierModal(false);
        setNewItemName('');
        setNewSupplierContact('');
      }
    } catch (error) {
      console.error('Failed to create supplier:', error);
      alert('Failed to create supplier');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all required fields
    const newErrors = {};
    if (!formData.name_english.trim()) {
      newErrors.name_english = 'Product name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Auto-generate SKU if not provided
      const timestamp = Date.now().toString().slice(-6);
      const autoSKU = `PRD${timestamp}`;

      // Prepare data with default values for removed fields
      const productData = {
        ...formData,
        sku: formData.sku || autoSKU,
        supplier: '',
        stock: 0,
        price: 0
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Product created successfully!');
        // Reset form
        setFormData({
          sku: '',
          barcode: '',
          name_english: '',
          name_urdu: '',
          category: '',
          sub_category: '',
          brand: '',
          unit: '',
          supplier: '',
          status: 'Active',
          image_url: '',
          stock: 0,
          price: 0
        });
        setImagePreview(null);
        setErrors({});
        router.push('/dashboard/products');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to create product:', error);
      alert('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const units = ['Pc', 'Kg', 'Ltr', 'Box', 'Dozen', 'Gram', '100gm', 'Pack'];

  return (
    <div className="h-screen flex flex-col p-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-neutral-900">Add Product</h1>
          <p className="text-[10px] text-neutral-500">Fields marked with * are required</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-3 h-3" />
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1 bg-black text-white text-[10px] font-medium rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            <Upload className="w-3 h-3" />
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[1fr_280px] gap-3 min-h-0">
        {/* Left Column - Form */}
        <div className="bg-white rounded-lg border border-neutral-200 p-3 overflow-y-auto">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-3">
            {/* Barcode */}
            <div>
              <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                Barcode
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  placeholder="For scanner support"
                  className="flex-1 px-2 py-1 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black/5"
                />
                <button
                  type="button"
                  className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                  title="Scan barcode"
                >
                  <Scan className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Product Names */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                  Product Name (English) *
                </label>
                <input
                  type="text"
                  name="name_english"
                  value={formData.name_english}
                  onChange={handleChange}
                  placeholder="e.g., Pepsi 1.5L"
                  className={`w-full px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-black/5 ${
                    errors.name_english ? 'border-red-500' : 'border-neutral-200'
                  }`}
                />
                {errors.name_english && <p className="text-[10px] text-red-500 mt-0.5">{errors.name_english}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                  Product Name (Urdu)
                </label>
                <input
                  type="text"
                  name="name_urdu"
                  value={formData.name_urdu}
                  onChange={handleChange}
                  placeholder="Optional for local receipts - اردو نام"
                  className="w-full px-2 py-1 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black/5"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Category & Sub-Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                  Category
                </label>
                <div className="flex gap-1.5">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="flex-1 px-2 py-1 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black/5 bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryModal(true)}
                    className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 transition-colors"
                    title="Add new category"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                  Sub-Category
                </label>
                <select
                  name="sub_category"
                  value={formData.sub_category}
                  onChange={handleChange}
                  className="w-full px-2 py-1 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black/5 bg-white"
                  disabled={!formData.category}
                >
                  <option value="">Select Category first</option>
                </select>
              </div>
            </div>

            {/* Brand & Unit of Measure */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                  Brand
                </label>
                <div className="flex gap-1.5">
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="flex-1 px-2 py-1 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black/5 bg-white"
                  >
                    <option value="">Select Brand</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.name}>{brand.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewBrandModal(true)}
                    className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 transition-colors"
                    title="Add new brand"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                  Unit of Measure
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-2 py-1 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black/5 bg-white"
                >
                  <option value="">Select Unit</option>
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                Status
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: 'Active' }))}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md border-2 transition-all ${
                    formData.status === 'Active'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: 'Inactive' }))}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md border-2 transition-all ${
                    formData.status === 'Inactive'
                      ? 'border-neutral-400 bg-neutral-50 text-neutral-700'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column - Image Upload & Summary */}
        <div className="flex flex-col gap-3 overflow-y-auto">
          {/* Product Image */}
          <div className="bg-white rounded-lg border border-neutral-200 p-2 shrink-0">
            <h3 className="text-[10px] font-semibold text-neutral-700 uppercase tracking-wide mb-2">
              PRODUCT IMAGE
            </h3>
            <div
              className="border-2 border-dashed border-neutral-200 rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:border-neutral-300 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-full h-24 object-contain mb-2"
                />
              ) : (
                <>
                  <div className="w-12 h-12 bg-neutral-100 rounded-md flex items-center justify-center mb-2">
                    <Upload className="w-6 h-6 text-neutral-400" />
                  </div>
                  <p className="text-[10px] font-medium text-neutral-600 mb-0.5">Click to upload</p>
                  <p className="text-[9px] text-neutral-400">PNG, JPG up to 5MB</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full mt-2 py-1 text-[10px] font-medium text-neutral-700 bg-neutral-50 hover:bg-neutral-100 rounded-md transition-colors flex items-center justify-center gap-1"
            >
              <Upload className="w-3 h-3" />
              {imagePreview ? 'Change Image' : 'Browse Files'}
            </button>
          </div>

          {/* Summary */}
          <div className="bg-blue-600 rounded-lg p-3 text-white shrink-0">
            <h3 className="text-[10px] font-semibold uppercase tracking-wide mb-2">
              SUMMARY
            </h3>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-blue-100">Name:</span>
                <span className="font-medium truncate ml-2" title={formData.name_english}>
                  {formData.name_english || '--'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-blue-100">Category:</span>
                <span className="font-medium">{formData.category || '--'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-blue-100">Brand:</span>
                <span className="font-medium">{formData.brand || '--'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-blue-100">Unit:</span>
                <span className="font-medium">{formData.unit || '--'}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1.5 border-t border-blue-500">
                <span className="text-blue-100">Status:</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  formData.status === 'Active' ? 'bg-emerald-500' : 'bg-neutral-400'
                }`}>
                  {formData.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals for Adding New Items */}
      {/* Add Category Modal */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowNewCategoryModal(false);
            setNewItemName('');
          }
        }}>
          <div className="bg-white rounded-lg p-4 w-80 shadow-xl">
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">Add New Category</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateCategory();
                    }
                  }}
                  placeholder="Enter category name"
                  className="w-full px-2 py-1.5 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategoryModal(false);
                    setNewItemName('');
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-md hover:bg-emerald-700 transition-colors"
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Brand Modal */}
      {showNewBrandModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowNewBrandModal(false);
            setNewItemName('');
          }
        }}>
          <div className="bg-white rounded-lg p-4 w-80 shadow-xl">
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">Add New Brand</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateBrand();
                    }
                  }}
                  placeholder="Enter brand name"
                  className="w-full px-2 py-1.5 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewBrandModal(false);
                    setNewItemName('');
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateBrand}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-md hover:bg-emerald-700 transition-colors"
                >
                  Add Brand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
