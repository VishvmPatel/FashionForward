import React, { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProductManager = () => {
  const { admin } = useAdmin();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    brand: '',
    stock: '',
    gender: '',
    sizes: [],
    colors: [],
    images: [],
    features: [],
    specifications: {},
    tags: []
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagesToRemove, setImagesToRemove] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory })
      });

      const response = await fetch(`${API_BASE_URL}/admin/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data.data.products);
      setCategories(data.data.categories);
      setPagination(data.data.pagination);
    } catch (err) {
      console.error('Products error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/categories`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([
        'Casual Wear',
        'Formal Wear', 
        'Ethnic Wear',
        'Kids Wear',
        'Eyewear',
        'Headwear',
        'Bags',
        'Jewelry',
        'Watches',
        'Tech Accessories',
        'Belts',
        'Scarves'
      ]);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      fetchProducts();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete product');
    }
  };

  const handleStatusToggle = async (productId, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update product status');
      }

      fetchProducts();
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update product status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      subcategory: '',
      brand: '',
      stock: '',
      gender: '',
      sizes: [],
      colors: [],
      images: [],
      features: [],
      specifications: {},
      tags: []
    });
    setSelectedImages([]);
    setImagesToRemove([]);
    setEditingProduct(null);
    setShowAddModal(false);
  };

  const handleEditProduct = (product) => {
    console.log('Editing product:', product); // Debug log
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      subcategory: product.subcategory || '',
      brand: product.brand || '',
      stock: product.stock || product.stockQuantity || '',
      gender: product.gender || '',
      sizes: product.sizes || [],
      colors: product.colors || [],
      images: product.images || [],
      features: product.features || [],
      specifications: product.specifications || {},
      tags: product.tags || []
    });
    setSelectedImages([]);
    setImagesToRemove([]);
    setShowAddModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
  };

  const handleRemoveImage = (imageIndex) => {
    if (editingProduct) {
      setImagesToRemove(prev => [...prev, imageIndex]);
    }
  };

  const handleRestoreImage = (imageIndex) => {
    setImagesToRemove(prev => prev.filter(index => index !== imageIndex));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log('Form data being submitted:', formData);
    console.log('Selected images:', selectedImages);

    if (!formData.name || !formData.brand || !formData.subcategory || !formData.price || !formData.category || !formData.gender) {
      alert('Please fill in all required fields: Product Name, Brand, Subcategory, Price, Category, and Gender');
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('subcategory', formData.subcategory);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('sizes', JSON.stringify(formData.sizes));
      formDataToSend.append('colors', JSON.stringify(formData.colors));
      formDataToSend.append('features', JSON.stringify(formData.features));
      formDataToSend.append('specifications', JSON.stringify(formData.specifications));
      formDataToSend.append('tags', JSON.stringify(formData.tags));

      selectedImages.forEach((image, index) => {
        formDataToSend.append('images', image);
      });

      if (imagesToRemove.length > 0) {
        formDataToSend.append('imagesToRemove', JSON.stringify(imagesToRemove));
      }

      const url = editingProduct 
        ? `${API_BASE_URL}/admin/products/${editingProduct._id}`
        : `${API_BASE_URL}/admin/products`;
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error response:', errorData);
        throw new Error(errorData.message || 'Failed to save product');
      }

      const result = await response.json();
      
      resetForm();
      
      fetchProducts();
      
      alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
      
    } catch (err) {
      console.error('Save product error:', err);
      console.error('Error details:', err.message);
      alert(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickUpdate = async (productId, field, value) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [field]: value })
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      fetchProducts();
      alert('Product updated successfully!');
    } catch (err) {
      console.error('Quick update error:', err);
      alert('Failed to update product');
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Product Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your product catalog
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Products
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img 
                            className="h-12 w-12 rounded-lg object-cover" 
                            src={product.images?.[0]?.url || 'https://via.placeholder.com/48x48?text=No+Image'} 
                            alt={product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.brand}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="number"
                        value={product.price}
                        onChange={(e) => handleQuickUpdate(product._id, 'price', parseFloat(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="number"
                        value={product.stock || product.stockQuantity || 0}
                        onChange={(e) => handleQuickUpdate(product._id, 'stock', parseInt(e.target.value))}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleStatusToggle(product._id, product.isActive)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * 20) + 1} to {Math.min(pagination.currentPage * 20, pagination.totalProducts)} of {pagination.totalProducts} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                  disabled={!pagination.hasNext}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {(showAddModal || editingProduct) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product'}
              </h3>
              
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter brand"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subcategory
                    </label>
                    <input
                      type="text"
                      value={formData.subcategory}
                      onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter subcategory (e.g., Track Pants, T-Shirts)"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter price"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter stock quantity"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Unisex">Unisex</option>
                      <option value="Kids">Kids</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter product description"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Select up to 5 images (JPG, PNG, GIF, WebP). Max 5MB per image.
                  </p>
                  {selectedImages.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Selected files:</p>
                      <ul className="text-sm text-gray-500">
                        {selectedImages.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Existing Images */}
                  {editingProduct && editingProduct.images && editingProduct.images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Current Images:</p>
                      <div className="grid grid-cols-4 gap-2">
                        {editingProduct.images.map((image, index) => {
                          const isMarkedForRemoval = imagesToRemove.includes(index);
                          return (
                            <div key={index} className={`relative ${isMarkedForRemoval ? 'opacity-50' : ''}`}>
                              <img
                                src={image.url}
                                alt={`Product image ${index + 1}`}
                                className="w-full h-20 object-cover rounded border"
                              />
                              <span className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                {index + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => isMarkedForRemoval ? handleRestoreImage(index) : handleRemoveImage(index)}
                                className={`absolute top-1 left-1 px-1 py-0.5 text-xs rounded ${
                                  isMarkedForRemoval 
                                    ? 'bg-green-500 text-white hover:bg-green-600' 
                                    : 'bg-red-500 text-white hover:bg-red-600'
                                }`}
                                title={isMarkedForRemoval ? 'Restore image' : 'Remove image'}
                              >
                                {isMarkedForRemoval ? '✓' : '×'}
                              </button>
                              {isMarkedForRemoval && (
                                <div className="absolute inset-0 bg-red-500 bg-opacity-20 rounded border-2 border-red-500 flex items-center justify-center">
                                  <span className="text-red-600 font-bold text-sm">REMOVED</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Click × to mark for removal, ✓ to restore. New images will be added to existing ones.
                      </p>
                    </div>
                  )}
                </div>

                {/* Sizes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Sizes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42'].map((size) => (
                      <label key={size} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.sizes.includes(size)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({...formData, sizes: [...formData.sizes, size]});
                            } else {
                              setFormData({...formData, sizes: formData.sizes.filter(s => s !== size)});
                            }
                          }}
                          className="mr-2 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">{size}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Colors
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink', 'Gray', 'Brown', 'Navy', 'Orange', 'Teal', 'Maroon', 'Beige', 'Khaki'].map((color) => (
                      <label key={color} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.colors.includes(color)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({...formData, colors: [...formData.colors, color]});
                            } else {
                              setFormData({...formData, colors: formData.colors.filter(c => c !== color)});
                            }
                          }}
                          className="mr-2 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">{color}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
