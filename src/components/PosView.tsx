import React, { useState, useMemo } from 'react';
import {
  Search,
  ScanBarcode,
  Plus,
  Minus,
  Trash2,
  PauseCircle,
  Tag,
  UserPlus,
  User,
  ShoppingBag,
  CreditCard,
  X,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { CartItem, Customer, Product, Promotion, StoreInfo } from '../types';
import { formatKip, playBeep } from '../utils/formatters';
import { CATEGORIES } from '../data/defaultData';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { CheckoutModal } from './CheckoutModal';

interface PosViewProps {
  products: Product[];
  customers: Customer[];
  promotions: Promotion[];
  storeInfo: StoreInfo;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  selectedCustomer: Customer | null;
  setSelectedCustomer: (cust: Customer | null) => void;
  selectedPromotion: Promotion | null;
  setSelectedPromotion: (promo: Promotion | null) => void;
  onHoldBill: (note: string) => void;
  onCompleteSale: (details: any) => void;
}

export const PosView: React.FC<PosViewProps> = ({
  products,
  customers,
  promotions,
  storeInfo,
  cart,
  setCart,
  selectedCustomer,
  setSelectedCustomer,
  selectedPromotion,
  setSelectedPromotion,
  onHoldBill,
  onCompleteSale,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ທັງໝົດ');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [holdNotePrompt, setHoldNotePrompt] = useState(false);
  const [holdNote, setHoldNote] = useState('');

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        selectedCategory === 'ທັງໝົດ' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.nameEn && p.nameEn.toLowerCase().includes(q)) ||
        p.barcode.includes(q);
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart actions
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;

    playBeep(880, 0.07);

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`ສິນຄ້າໃນສະຕັອກມີພຽງແຕ່ ${product.stock} ${product.unit}`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock) {
              alert(`ສິນຄ້າໃນສະຕັອກມີພຽງແຕ່ ${item.product.stock} ${item.product.unit}`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('ຕ້ອງການລຶບລາຍການສິນຄ້າທັງໝົດໃນກະຕ່າແທ້ບໍ່?')) {
      setCart([]);
      setSelectedCustomer(null);
      setSelectedPromotion(null);
    }
  };

  // Barcode scanned from scanner
  const handleBarcodeScanned = (code: string) => {
    const match = products.find((p) => p.barcode === code.trim());
    if (match) {
      addToCart(match);
    } else {
      alert(`ບໍ່ພົບສິນຄ້າທີ່ມີລະຫັດບາໂຄດ: ${code}`);
    }
  };

  // Subtotal & Discount calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const discount = useMemo(() => {
    let disc = 0;
    if (selectedPromotion && selectedPromotion.isActive) {
      if (subtotal >= selectedPromotion.minSpend) {
        if (selectedPromotion.type === 'PERCENT_DISCOUNT') {
          disc += (subtotal * selectedPromotion.value) / 100;
        } else if (selectedPromotion.type === 'FIXED_DISCOUNT') {
          disc += selectedPromotion.value;
        }
      }
    }
    return disc;
  }, [subtotal, selectedPromotion]);

  const total = Math.max(0, subtotal - discount);

  const handleHoldConfirm = () => {
    if (cart.length === 0) return;
    onHoldBill(holdNote || 'ລູກຄ້າເລືອກສິນຄ້າເພີ່ມ');
    setHoldNote('');
    setHoldNotePrompt(false);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-100px)] overflow-hidden bg-slate-100">
      {/* LEFT: Product Catalog & Search (65% width on desktop) */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-5">
        {/* Search Bar & Actions */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ຄົ້ນຫາຊື່ສິນຄ້າ ຫຼື ລະຫັດບາໂຄດ (Search products / barcode)..."
              className="w-full pl-11 pr-4 py-2.5 bg-white rounded-2xl border border-slate-200 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-sm font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Barcode Camera Scanner Button */}
          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white rounded-2xl font-bold text-xs flex items-center space-x-2 shadow-xs transition-all flex-shrink-0"
            title="ສະແກນບາໂຄດດ້ວຍກ້ອງ ຫຼື ເຄື່ອງສະແກນ"
          >
            <ScanBarcode className="w-4 h-4" />
            <span className="hidden sm:inline">ສະແກນບາໂຄດ</span>
          </button>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <ShoppingBag className="w-12 h-12 mb-2 opacity-30" />
              <p className="font-semibold text-sm">ບໍ່ພົບສິນຄ້າທີ່ຄົ້ນຫາ</p>
              <p className="text-xs text-slate-400 mt-1">ລອງຄົ້ນຫາດ້ວຍຊື່ອື່ນ ຫຼື ເລືອກໝວດໝູ່ທັງໝົດ</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.stock <= 0;
                const isLowStock = p.stock > 0 && p.stock <= p.minStockAlert;

                return (
                  <div
                    key={p.id}
                    onClick={() => !isOutOfStock && addToCart(p)}
                    className={`bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between transition-all duration-150 select-none group ${
                      isOutOfStock
                        ? 'opacity-60 cursor-not-allowed border-slate-300'
                        : 'hover:border-sky-500 hover:shadow-md cursor-pointer active:scale-98'
                    }`}
                  >
                    {/* Image thumbnail with stock pill */}
                    <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Stock Badge */}
                      <div className="absolute top-2 right-2">
                        {isOutOfStock ? (
                          <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                            ໝົດ
                          </span>
                        ) : isLowStock ? (
                          <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs flex items-center space-x-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>ເຫຼືອ {p.stock}</span>
                          </span>
                        ) : (
                          <span className="bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                            ເຫຼືອ {p.stock}
                          </span>
                        )}
                      </div>

                      {/* Unit pill */}
                      <span className="absolute bottom-2 left-2 bg-slate-900/70 text-white text-[9px] font-medium px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                        {p.unit}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs line-clamp-2 leading-snug group-hover:text-sky-700 transition-colors">
                          {p.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-1 truncate">
                          {p.barcode}
                        </p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-sm font-black text-emerald-600">
                          {formatKip(p.price)}
                        </span>
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                            isOutOfStock
                              ? 'bg-slate-100 text-slate-300'
                              : 'bg-sky-50 text-sky-700 group-hover:bg-sky-600 group-hover:text-white'
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Order Cart & Checkout (35% width on desktop) */}
      <div className="w-full lg:w-96 xl:w-[420px] bg-white border-l border-slate-200 flex flex-col h-full shadow-lg">
        {/* Cart Top Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">ກະຕ່າສິນຄ້າ (Order Cart)</h3>
              <p className="text-[11px] text-slate-500">{cart.length} ລາຍການ</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {/* Hold Button */}
            <button
              onClick={() => setHoldNotePrompt(true)}
              disabled={cart.length === 0}
              className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 disabled:opacity-30 rounded-xl transition-colors"
              title="ພັກບິນ / ຈັດຄິວ (Hold Bill)"
            >
              <PauseCircle className="w-5 h-5" />
            </button>

            {/* Clear Button */}
            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 rounded-xl transition-colors"
              title="ລຶບກະຕ່າທັງໝົດ"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Member and Promotion Selectors Bar */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 space-y-2">
          {/* Member Picker */}
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={selectedCustomer?.id || ''}
              onChange={(e) => {
                const cust = customers.find((c) => c.id === e.target.value) || null;
                setSelectedCustomer(cust);
              }}
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
            >
              <option value="">-- ລູກຄ້າທົ່ວໄປ (ບໍ່ສະສົມຄະແນນ) --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone}) - {c.points} ຄະແນນ [{c.tier}]
                </option>
              ))}
            </select>
          </div>

          {/* Promotion Picker */}
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <select
              value={selectedPromotion?.id || ''}
              onChange={(e) => {
                const promo = promotions.find((p) => p.id === e.target.value) || null;
                setSelectedPromotion(promo);
              }}
              className="w-full text-xs font-semibold bg-white border border-emerald-200 rounded-xl px-2.5 py-1.5 text-emerald-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">-- ເລືອກໂປຣໂມຊັນ / ສ່ວນຫຼຸດພິເສດ --</option>
              {promotions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.description})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
              <ShoppingBag className="w-12 h-12 mb-2 opacity-30" />
              <p className="font-semibold text-sm">ກະຕ່າຍັງວ່າງເປົ່າ</p>
              <p className="text-xs text-slate-400 mt-1 text-center">
                ເລືອກສິນຄ້າຈາກລາຍການ ຫຼື ຍິງບາໂຄດເພື່ອເລີ່ມການຂາຍ
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-2 hover:border-slate-300 transition-colors"
              >
                {/* Image */}
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                />

                {/* Name & price */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {formatKip(item.product.price)} /{item.product.unit}
                  </p>
                  <p className="text-xs font-black text-emerald-600">
                    {formatKip(item.product.price * item.quantity)}
                  </p>
                </div>

                {/* Qty Controls */}
                <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-xl p-1">
                  <button
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-bold text-xs font-mono">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Delete Item */}
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Bottom Summary & Checkout Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>ລວມເງິນ (Subtotal):</span>
              <span className="font-semibold text-slate-800">{formatKip(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>ສ່ວນຫຼຸດໂປຣໂມຊັນ:</span>
                <span>-{formatKip(discount)}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
              <span className="text-sm font-bold text-slate-900">ຍອດຊຳລະສຸດທິ:</span>
              <span className="text-2xl font-black text-emerald-600">
                {formatKip(total)}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(true)}
            disabled={cart.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center space-x-2 shadow-md shadow-emerald-200 disabled:shadow-none transition-all text-sm"
          >
            <CreditCard className="w-5 h-5" />
            <span>ຊຳລະເງິນ (PAY {formatKip(total)})</span>
          </button>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScanned}
        products={products}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        subtotal={subtotal}
        discount={discount}
        selectedCustomer={selectedCustomer}
        storeInfo={storeInfo}
        onCompleteSale={(saleDetails) => {
          onCompleteSale(saleDetails);
          setIsCheckoutOpen(false);
        }}
      />

      {/* Hold Bill Prompt Modal */}
      {holdNotePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-slate-800">
              ພັກລາຍການຂາຍນີ້ (Hold Bill)
            </h3>
            <p className="text-xs text-slate-500">
              ໃສ່ຊື່ລູກຄ້າ ຫຼື ໝາຍເຫດ ເພື່ອກັບມາຊຳລະພາຍຫຼັງ:
            </p>
            <input
              type="text"
              value={holdNote}
              onChange={(e) => setHoldNote(e.target.value)}
              placeholder="ເຊັ່ນ: ລູກຄ້າເສື້ອຂາວ, ໂຕະ 1..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setHoldNotePrompt(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={handleHoldConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
              >
                ຢືນຢັນພັກບິນ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
