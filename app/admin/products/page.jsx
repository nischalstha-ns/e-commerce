"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/lib/firestore/products/read";
import { useCategories } from "@/lib/firestore/categories/read";
import { useBrands } from "@/lib/firestore/brands/read";
import { createNewProduct, updateProduct, deleteProduct } from "@/lib/firestore/products/write";
import { Package, Plus, Search, Edit, Trash2, X, AlertCircle, RefreshCw } from "lucide-react";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import toast from "react-hot-toast";

export default function ProductsPage() {
  const { userRole } = useAuth();
  const { data: products = [], isLoading, refresh } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    setLastUpdate(new Date());
  }, [products]);

  const filteredProducts = useMemo(() => 
    products.filter(p => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [products, searchTerm]
  );

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setDetailModalOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct({ id: productId });
      toast.success("Product deleted");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" label="Loading products..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Products</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your inventory • Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => refresh && refresh()}
            className="p-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Refresh products"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={handleAddProduct}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Product</span>
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">No products found</h3>
          <p className="mt-2 text-gray-500">Try adjusting your search or add a new product.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onView={handleViewDetails}
              userRole={userRole}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {isModalOpen && (
        <ProductFormModal
          product={selectedProduct}
          categories={categories}
          brands={brands}
          onClose={() => setModalOpen(false)}
        />
      )}

      {isDetailModalOpen && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setDetailModalOpen(false)}
        />
      )}
    </div>
  );
}

// Product Card Component
function ProductCard({ product, onEdit, onDelete, onView, userRole }) {
  const getStatusBadge = () => {
    if (product.stock === 0) {
      return <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">Out of Stock</span>;
    }
    if (product.stock <= 10) {
      return <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">Low Stock</span>;
    }
    return <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">In Stock</span>;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative">
        <img
          src={product.imageURLs?.[0] || product.imageURL || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={product.name}
          className="w-full h-48 object-cover"
          onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'}
        />
        {getStatusBadge()}
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{product.categoryName || 'Uncategorized'}</p>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-1 line-clamp-2">{product.name}</h3>
        <div className="mt-4 flex justify-between items-center">
          <p className="text-2xl font-bold text-blue-600">Rs. {product.price?.toFixed(2) || '0.00'}</p>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Stock: {product.stock || 0}</p>
        </div>
      </div>
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex gap-2">
        <button
          onClick={() => onView(product)}
          className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 dark:bg-blue-500/10 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-500/20 transition-colors"
        >
          View
        </button>
        <button
          onClick={() => onEdit(product)}
          className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
        {userRole === 'admin' && (
          <button
            onClick={() => onDelete(product.id)}
            className="px-3 py-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Product Form Modal
function ProductFormModal({ product, categories, brands, onClose }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    price: product?.price || 0,
    salePrice: product?.salePrice || 0,
    stock: product?.stock || 0,
    categoryId: product?.categoryId || categories[0]?.id || '',
    brandId: product?.brandId || brands[0]?.id || '',
    description: product?.description || '',
    imageURL: product?.imageURLs?.[0] || product?.imageURL || '',
  });
  const [isSubmitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (product) {
        await updateProduct({ id: product.id, data: formData });
        toast.success("Product updated");
      } else {
        // For new products, we need at least a placeholder image
        const images = formData.imageURL ? [] : [];
        await createNewProduct({ data: { ...formData, imageURLs: formData.imageURL ? [formData.imageURL] : [] }, images });
        toast.success("Product added");
      }
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl m-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Product Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Brand</label>
              <select
                value={formData.brandId}
                onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Price (Rs.)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Sale Price (Rs.)</label>
              <input
                type="number"
                step="0.01"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Image URL</label>
              <input
                type="url"
                value={formData.imageURL}
                onChange={(e) => setFormData({ ...formData, imageURL: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium disabled:bg-blue-400"
            >
              {isSubmitting ? 'Saving...' : product ? 'Update' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Product Detail Modal
function ProductDetailModal({ product, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl m-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Product Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <img
              src={product.imageURLs?.[0] || product.imageURL || 'https://via.placeholder.com/400x300?text=No+Image'}
              alt={product.name}
              className="md:col-span-1 w-full h-48 object-cover rounded-lg"
              onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'}
            />
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h3>
              <p className="text-gray-600 dark:text-gray-300">{product.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <DetailItem label="Price" value={`Rs. ${product.price?.toFixed(2) || '0.00'}`} />
                <DetailItem label="Stock" value={product.stock || 0} />
                <DetailItem label="SKU" value={product.sku} />
                <DetailItem label="Category" value={product.categoryName || 'N/A'} />
                <DetailItem label="Brand" value={product.brandName || 'N/A'} />
                <DetailItem label="Status" value={product.status || 'active'} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-md text-gray-900 dark:text-white font-semibold">{value}</p>
    </div>
  );
}
