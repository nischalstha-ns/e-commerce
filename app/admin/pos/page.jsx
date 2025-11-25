"use client";

import { useState, useMemo, useRef } from "react";
import { useProducts } from "@/lib/firestore/products/read";
import { updateProduct } from "@/lib/firestore/products/write";
import { createSale } from "@/lib/firestore/sales/write";
import { useHistoryStore } from "@/lib/store/historyStore";
import { Search, Plus, Minus, Trash2, ShoppingCart, Scan, Printer, CreditCard, Banknote, Smartphone } from "lucide-react";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import toast from "react-hot-toast";

export default function POSPage() {
  const { data: products = [], isLoading } = useProducts();
  const addHistory = useHistoryStore((state) => state.addHistory);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const barcodeRef = useRef(null);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.stock > 0 &&
          (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
    [products, searchTerm]
  );

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(
          cart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        toast.error("Not enough stock");
      }
    } else {
      setCart([...cart, { 
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        imageURL: product.imageURLs?.[0] || product.imageURL || "",
        imageURLs: product.imageURLs || [product.imageURL],
        quantity: 1 
      }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    const item = cart.find((i) => i.id === productId);
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    if (item && newQuantity <= item.stock) {
      setCart(
        cart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    } else {
      toast.error("Not enough stock");
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const total = cart.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  );

  const handleBarcodeSearch = (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    
    const product = products.find(p => 
      p.sku?.toLowerCase() === barcodeInput.toLowerCase() || 
      p.barcode?.toLowerCase() === barcodeInput.toLowerCase()
    );
    
    if (product && product.stock > 0) {
      addToCart(product);
      setBarcodeInput("");
      toast.success(`${product.name} added`);
    } else {
      toast.error("Product not found or out of stock");
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      const saleData = await createSale({
        items: cart,
        total,
        paymentMethod
      });
      
      for (const item of cart) {
        const originalProduct = products.find(p => p.id === item.id);
        if (originalProduct) {
          await updateProduct({
            id: item.id,
            data: { 
              stock: originalProduct.stock - item.quantity
            },
            newImages: []
          });
        }
      }

      addHistory({ 
        type: 'sale', 
        description: `Sale completed: Rs. ${total.toFixed(2)} (${cart.length} items)`, 
        data: saleData 
      });

      setLastSale({ ...saleData, items: cart, timestamp: new Date() });
      setShowReceipt(true);
      toast.success(`Sale completed! Total: Rs. ${total.toFixed(2)}`);
      setCart([]);
      setPaymentMethod("cash");
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.message || "Failed to complete sale");
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" label="Loading POS..." />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Products Grid */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md flex flex-col overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <form onSubmit={handleBarcodeSearch} className="relative">
            <Scan className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={barcodeRef}
              type="text"
              placeholder="Scan or enter barcode/SKU"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </form>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="group border rounded-lg p-3 flex flex-col items-center text-center bg-gray-50 dark:bg-gray-700 dark:border-gray-600 hover:shadow-xl hover:border-blue-500 transition-all hover:-translate-y-1"
              >
                <img
                  src={product.imageURLs?.[0] || product.imageURL || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect fill='%23ddd' width='150' height='150'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='14'%3ENo Image%3C/svg%3E"}
                  alt={product.name}
                  className="w-full h-24 object-cover rounded-md mb-2"
                  loading="lazy"
                  onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect fill='%23ddd' width='150' height='150'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='14'%3ENo Image%3C/svg%3E"; }}
                />
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white line-clamp-2 flex-grow">
                  {product.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Stock: {product.stock}
                </p>
                <p className="text-md font-bold text-blue-600 mt-1">
                  Rs. {product.price?.toFixed(2) || "0.00"}
                </p>
              </button>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                No products available
              </h3>
              <p className="mt-2 text-gray-500">
                Try adjusting your search
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md flex flex-col overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Current Sale
          </h3>
          {cart.length > 0 && (
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
              {cart.length} items
            </span>
          )}
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400 mt-4">
                Cart is empty
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Click on products to add
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {cart.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <img
                    src={item.imageURLs?.[0] || item.imageURL || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect fill='%23ddd' width='50' height='50'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='10'%3ENo Image%3C/svg%3E"}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                    loading="lazy"
                    onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect fill='%23ddd' width='50' height='50'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='10'%3ENo Image%3C/svg%3E"; }}
                  />
                  <div className="flex-grow min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Rs. {item.price?.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t dark:border-gray-700 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="font-medium">Rs. {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-blue-600">Rs. {total.toFixed(2)}</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setPaymentMethod("cash")} className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors ${paymentMethod === "cash" ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600"}`}>
                <Banknote className="w-5 h-5" />
                <span className="text-xs font-medium">Cash</span>
              </button>
              <button type="button" onClick={() => setPaymentMethod("card")} className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors ${paymentMethod === "card" ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600"}`}>
                <CreditCard className="w-5 h-5" />
                <span className="text-xs font-medium">Card</span>
              </button>
              <button type="button" onClick={() => setPaymentMethod("upi")} className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors ${paymentMethod === "upi" ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600"}`}>
                <Smartphone className="w-5 h-5" />
                <span className="text-xs font-medium">UPI</span>
              </button>
            </div>
          </div>
          
          <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full py-3 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-lg font-semibold transition-colors">
            Complete Sale
          </button>
        </div>
      </div>
      
      {showReceipt && lastSale && (
        <ReceiptModal sale={lastSale} onClose={() => setShowReceipt(false)} />
      )}
    </div>
  );
}

function ReceiptModal({ sale, onClose }) {
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-2xl m-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 space-y-4">
          <div className="text-center border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Receipt</h2>
            <p className="text-sm text-gray-500 mt-1">Thank you for your purchase!</p>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Date:</span>
              <span className="font-medium">{sale.timestamp?.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Time:</span>
              <span className="font-medium">{sale.timestamp?.toLocaleTimeString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
              <span className="font-medium uppercase">{sale.paymentMethod}</span>
            </div>
          </div>
          
          <div className="border-t border-b py-3 space-y-2">
            {sale.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-gray-500">Rs. {item.price?.toFixed(2)} × {item.quantity}</p>
                </div>
                <p className="font-semibold">Rs. {(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-blue-600">Rs. {sale.total?.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>
            <button onClick={onClose} className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
