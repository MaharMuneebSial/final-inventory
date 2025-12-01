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
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [showNewSubcategoryModal, setShowNewSubcategoryModal] = useState(false);
  const [showNewBrandModal, setShowNewBrandModal] = useState(false);
  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newSupplierContact, setNewSupplierContact] = useState('');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const barcodeInputRef = useRef(null);
  const [selectedSubcategoryParent, setSelectedSubcategoryParent] = useState('');
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingSubcategory, setIsCreatingSubcategory] = useState(false);

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

    // If category changes, fetch subcategories and reset sub_category
    if (name === 'category') {
      setFormData(prev => ({ ...prev, sub_category: '' }));
      if (value) {
        fetchSubcategories(value);
      } else {
        setSubcategories([]);
      }
    }
  };

  const fetchSubcategories = async (categoryName) => {
    try {
      const response = await fetch(`/api/subcategories?category=${encodeURIComponent(categoryName)}`);
      const data = await response.json();
      setSubcategories(data.subcategories || []);
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
      setSubcategories([]);
    }
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

  const handleBarcodeScanner = () => {
    setShowBarcodeScanner(true);
    // Focus on barcode input after a short delay to ensure modal is rendered
    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 100);
  };

  const handleCreateCategory = async () => {
    const trimmedName = newItemName.trim();

    if (!trimmedName) {
      alert('Category name is required');
      return;
    }

    setIsCreatingCategory(true);
    console.log('[Category] Creating category:', trimmedName);

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName })
      });

      console.log('[Category] Response status:', response.status);
      const data = await response.json();
      console.log('[Category] Response data:', data);

      if (response.ok && data.category) {
        console.log('[Category] Category created successfully:', data.category);

        // Update categories list
        setCategories(prev => {
          const updated = [...prev, data.category];
          console.log('[Category] Updated categories:', updated);
          return updated;
        });

        // Set the newly created category as selected
        setFormData(prev => ({ ...prev, category: data.category.name }));

        // Close modal and reset
        setShowNewCategoryModal(false);
        setNewItemName('');

        console.log('[Category] Category added successfully, modal should close now');

        // Show success message
        setTimeout(() => {
          alert('✅ Category "' + data.category.name + '" added successfully!\n\nCheck the Category dropdown!');
        }, 100);

        // Refetch categories to ensure sync
        await fetchDropdownData();
      } else {
        console.error('[Category] Failed to create category:', data);
        console.error('[Category] Response status was:', response.status);

        // Check for duplicate error
        let errorMessage = data.error || '';

        // If error message is empty, check if it's a 500 error (likely UNIQUE constraint)
        if (!errorMessage && response.status === 500) {
          errorMessage = 'UNIQUE constraint failed';
        }

        if (!errorMessage) {
          errorMessage = 'Unknown error';
        }

        if (errorMessage.includes('UNIQUE constraint') || errorMessage.includes('already exists')) {
          alert('❌ This category already exists!\n\nPlease use a different category name or select the existing category from the dropdown.');
        } else {
          alert('❌ Failed to create category: ' + errorMessage);
        }
      }
    } catch (error) {
      console.error('[Category] Exception creating category:', error);
      alert('❌ Failed to create category: ' + error.message);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleCreateBrand = async () => {
    const trimmedName = newItemName.trim();

    if (!trimmedName) {
      alert('Brand name is required');
      return;
    }

    setIsCreatingBrand(true);
    console.log('[Brand] Creating brand:', trimmedName);

    try {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName })
      });

      console.log('[Brand] Response status:', response.status);
      const data = await response.json();
      console.log('[Brand] Response data:', data);

      if (response.ok && data.brand) {
        console.log('[Brand] Brand created successfully:', data.brand);

        // Update brands list
        setBrands(prev => {
          const updated = [...prev, data.brand];
          console.log('[Brand] Updated brands list:', updated);
          return updated;
        });

        // Set the newly created brand as selected
        setFormData(prev => {
          const newData = { ...prev, brand: data.brand.name };
          console.log('[Brand] Updated form data:', newData);
          return newData;
        });

        // Close modal and reset
        setShowNewBrandModal(false);
        setNewItemName('');

        console.log('[Brand] Brand added successfully, modal should close now');

        // Show success message
        setTimeout(() => {
          alert('✅ Brand "' + data.brand.name + '" added successfully!\n\nCheck the Brand dropdown - your brand is now there!');
        }, 100);

        // Refetch brands to ensure sync
        await fetchDropdownData();
      } else {
        console.error('[Brand] Failed to create brand:', data);
        console.error('[Brand] Response status was:', response.status);

        // Check for duplicate error
        let errorMessage = data.error || '';

        // If error message is empty, check if it's a 500 error (likely UNIQUE constraint)
        if (!errorMessage && response.status === 500) {
          errorMessage = 'UNIQUE constraint failed';
        }

        if (!errorMessage) {
          errorMessage = 'Unknown error';
        }

        if (errorMessage.includes('UNIQUE constraint') || errorMessage.includes('already exists')) {
          alert('❌ This brand already exists!\n\nPlease use a different brand name or select the existing brand from the dropdown.');
        } else {
          alert('❌ Failed to create brand: ' + errorMessage);
        }
      }
    } catch (error) {
      console.error('[Brand] Exception creating brand:', error);
      alert('❌ Failed to create brand: ' + error.message);
    } finally {
      setIsCreatingBrand(false);
    }
  };

  const handleCreateSubcategory = async () => {
    const trimmedName = newItemName.trim();

    if (!trimmedName) {
      alert('Subcategory name is required');
      return;
    }

    if (!selectedSubcategoryParent) {
      alert('Please select a category first');
      return;
    }

    setIsCreatingSubcategory(true);
    console.log('[Subcategory] Creating subcategory:', trimmedName, 'under category:', selectedSubcategoryParent);

    try {
      const response = await fetch('/api/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, categoryName: selectedSubcategoryParent })
      });

      console.log('[Subcategory] Response status:', response.status);
      const data = await response.json();
      console.log('[Subcategory] Response data:', data);

      if (response.ok && data.subcategory) {
        console.log('[Subcategory] Subcategory created successfully:', data.subcategory);

        // Update subcategories list
        setSubcategories(prev => {
          const updated = [...prev, data.subcategory];
          console.log('[Subcategory] Updated subcategories:', updated);
          return updated;
        });

        // Set the newly created subcategory as selected
        setFormData(prev => ({ ...prev, sub_category: data.subcategory.name }));

        // Close modal and reset
        setShowNewSubcategoryModal(false);
        setNewItemName('');

        console.log('[Subcategory] Subcategory added successfully, modal should close now');

        // Show success message
        setTimeout(() => {
          alert('✅ Subcategory "' + data.subcategory.name + '" added successfully!\n\nCheck the Sub-Category dropdown!');
        }, 100);
      } else {
        console.error('[Subcategory] Failed to create subcategory:', data);
        console.error('[Subcategory] Response status was:', response.status);

        // Check for duplicate error
        let errorMessage = data.error || '';

        // If error message is empty, check if it's a 500 error (likely UNIQUE constraint)
        if (!errorMessage && response.status === 500) {
          errorMessage = 'UNIQUE constraint failed';
        }

        if (!errorMessage) {
          errorMessage = 'Unknown error';
        }

        if (errorMessage.includes('UNIQUE constraint') || errorMessage.includes('already exists')) {
          alert('❌ This subcategory already exists in this category!\n\nPlease use a different subcategory name or select the existing one from the dropdown.');
        } else {
          alert('❌ Failed to create subcategory: ' + errorMessage);
        }
      }
    } catch (error) {
      console.error('[Subcategory] Exception creating subcategory:', error);
      alert('❌ Failed to create subcategory: ' + error.message);
    } finally {
      setIsCreatingSubcategory(false);
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
                  onClick={handleBarcodeScanner}
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
                <div className="flex gap-1.5">
                  {!selectedSubcategoryParent ? (
                    <select
                      value={selectedSubcategoryParent}
                      onChange={(e) => {
                        setSelectedSubcategoryParent(e.target.value);
                        if (e.target.value) {
                          fetchSubcategories(e.target.value);
                        }
                        setFormData(prev => ({ ...prev, sub_category: '' }));
                      }}
                      className="flex-1 px-2 py-1 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black/5 bg-white"
                    >
                      <option value="">Select Category first</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex-1 flex gap-1.5">
                      <select
                        name="sub_category"
                        value={formData.sub_category}
                        onChange={handleChange}
                        className="flex-1 px-2 py-1 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black/5 bg-white"
                      >
                        <option value="">Select Sub-Category</option>
                        {subcategories.map(subcat => (
                          <option key={subcat.id} value={subcat.name}>{subcat.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSubcategoryParent('');
                          setFormData(prev => ({ ...prev, sub_category: '' }));
                        }}
                        className="px-2 py-1 text-[10px] bg-neutral-100 text-neutral-600 rounded-md hover:bg-neutral-200 transition-colors"
                        title="Change category"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedSubcategoryParent) {
                        alert('Please select a category first');
                        return;
                      }
                      setShowNewSubcategoryModal(true);
                    }}
                    className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 transition-colors disabled:opacity-50"
                    title="Add new subcategory"
                    disabled={!selectedSubcategoryParent}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                {selectedSubcategoryParent && (
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Category: <span className="font-medium text-blue-600">{selectedSubcategoryParent}</span>
                  </p>
                )}
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

            {/* Product Image */}
            <div>
              <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                PRODUCT IMAGE
              </label>
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

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-neutral-700 bg-white border-2 border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 rounded-lg transition-all shadow-sm"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
                <button
                  type="submit"
                  form="product-form"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-black text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {loading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column - Summary */}
        <div className="flex flex-col gap-3 overflow-y-auto">

          {/* Summary */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-blue-500/30">
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Product Summary
              </h3>
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-white/5 rounded-lg p-2.5 backdrop-blur-sm">
                <div className="flex justify-between items-start">
                  <span className="text-blue-100 text-[10px] font-medium">Product Name:</span>
                  <span className="font-semibold text-xs text-right truncate ml-2 max-w-[140px]" title={formData.name_english}>
                    {formData.name_english || '--'}
                  </span>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-2.5 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 text-[10px] font-medium">Category:</span>
                  <span className="font-semibold text-xs">{formData.category || '--'}</span>
                </div>
              </div>

              {formData.sub_category && (
                <div className="bg-white/5 rounded-lg p-2.5 backdrop-blur-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100 text-[10px] font-medium">Sub-Category:</span>
                    <span className="font-semibold text-xs">{formData.sub_category}</span>
                  </div>
                </div>
              )}

              <div className="bg-white/5 rounded-lg p-2.5 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 text-[10px] font-medium">Brand:</span>
                  <span className="font-semibold text-xs">{formData.brand || '--'}</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-2.5 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 text-[10px] font-medium">Unit:</span>
                  <span className="font-semibold text-xs">{formData.unit || '--'}</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-2.5 backdrop-blur-sm mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-white text-[10px] font-semibold">Status:</span>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold shadow-sm ${
                    formData.status === 'Active'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-neutral-400 text-white'
                  }`}>
                    {formData.status}
                  </span>
                </div>
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
                  disabled={isCreatingCategory}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCreatingCategory && (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {isCreatingCategory ? 'Adding...' : 'Add Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Subcategory Modal */}
      {showNewSubcategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowNewSubcategoryModal(false);
            setNewItemName('');
          }
        }}>
          <div className="bg-white rounded-lg p-4 w-80 shadow-xl">
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">Add New Subcategory</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                  Category: <span className="font-semibold text-blue-600">{selectedSubcategoryParent}</span>
                </label>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                  Subcategory Name *
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateSubcategory();
                    }
                  }}
                  placeholder="Enter subcategory name"
                  className="w-full px-2 py-1.5 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewSubcategoryModal(false);
                    setNewItemName('');
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateSubcategory}
                  disabled={isCreatingSubcategory}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCreatingSubcategory && (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {isCreatingSubcategory ? 'Adding...' : 'Add Subcategory'}
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
                  disabled={isCreatingBrand}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCreatingBrand && (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {isCreatingBrand ? 'Adding...' : 'Add Brand'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowBarcodeScanner(false);
          }
        }}>
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-base font-semibold text-neutral-900 mb-4">Scan Barcode</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-center p-8 bg-blue-50 rounded-lg">
                <Scan className="w-16 h-16 text-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-2">
                  Enter or Scan Barcode
                </label>
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setShowBarcodeScanner(false);
                    }
                  }}
                  placeholder="Use scanner or type barcode"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-neutral-500 mt-2">
                  Use a barcode scanner to automatically enter the barcode, or type it manually.
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowBarcodeScanner(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setShowBarcodeScanner(false)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
