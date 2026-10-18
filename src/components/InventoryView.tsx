import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  Edit2,
  Trash2,
  ArrowUpDown,
  RefreshCw,
  Package,
  CheckCircle2,
  X,
  Sparkles,
  Barcode as BarcodeIcon,
} from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES } from '../data/defaultData';
import { formatKip, formatNumber, generateBarcode } from '../utils/formatters';

interface InventoryViewProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAdjustStock: (productId: string, newStock: number, reason: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAdjustStock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ທັງໝົດ');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingStockProduct, setAdjustingStockProduct] = useState<Product | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('ຮັບສິນຄ້າເຂົ້າຕື່ມ (Restock)');

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    nameEn: '',
    barcode: '',
    category: 'ເຄື່ອງດື່ມ',
    price: 10000,
    costPrice: 8000,
    stock: 20,
    minStockAlert: 5,
    unit: 'ຕຸກ',
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80',
    description: '',
  });

  // KPI summaries
  const totalStockItems = products.length;
  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const totalInventoryCost = products.reduce((sum, p) => sum + p.costPrice * p.stock, 0);
  const totalRetailValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;

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
      const matchLow = filterLowStockOnly ? p.stock <= p.minStockAlert : true;
      return matchCat && matchSearch && matchLow;
    });
  }, [products, selectedCategory, searchQuery, filterLowStockOnly]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      nameEn: '',
      barcode: generateBarcode(),
      category: 'ເຄື່ອງດື່ມ',
      price: 10000,
      costPrice: 8000,
      stock: 24,
      minStockAlert: 6,
      unit: 'ຕຸກ',
      imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({ ...p });
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.barcode) {
      alert('ກະລຸນາປ້ອນຊື່ສິນຄ້າ ແລະ ລະຫັດບາໂຄດ');
      return;
    }

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        ...(formData as Product),
      });
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: formData.name || '',
        nameEn: formData.nameEn || '',
        barcode: formData.barcode || generateBarcode(),
        category: formData.category || 'ເຄື່ອງດື່ມ',
        price: Number(formData.price) || 0,
        costPrice: Number(formData.costPrice) || 0,
        stock: Number(formData.stock) || 0,
        minStockAlert: Number(formData.minStockAlert) || 5,
        unit: formData.unit || 'ອັນ',
        imageUrl:
          formData.imageUrl ||
          'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80',
        description: formData.description || '',
      };
      onAddProduct(newProduct);
    }
    setIsModalOpen(false);
  };

  const handleStockAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingStockProduct) return;
    const newStock = Math.max(0, adjustingStockProduct.stock + adjustAmount);
    onAdjustStock(adjustingStockProduct.id, newStock, adjustReason);
    setAdjustingStockProduct(null);
    setAdjustAmount(0);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 bg-slate-100 overflow-y-auto">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">ລາຍການສິນຄ້າທັງໝົດ</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900">{totalStockItems}</span>
            <span className="text-xs font-semibold text-slate-400">
              {formatNumber(totalUnits)} ໜ່ວຍ
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">ມູນຄ່າສາງ (ຕົ້ນທຶນ)</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-sky-700">
              {formatKip(totalInventoryCost)}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">ມູນຄ່າສາງ (ລາຄາຂາຍ)</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-emerald-600">
              {formatKip(totalRetailValue)}
            </span>
          </div>
        </div>

        <div
          onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
          className={`p-4 rounded-2xl border cursor-pointer transition-colors shadow-2xs ${
            filterLowStockOnly
              ? 'bg-amber-500 text-white border-amber-600'
              : 'bg-white border-slate-200 hover:border-amber-400'
          }`}
        >
          <p className={`text-xs font-semibold ${filterLowStockOnly ? 'text-amber-100' : 'text-slate-500'}`}>
            ສິນຄ້າໃກ້ໝົດ (Low Stock)
          </p>
          <div className="flex items-baseline justify-between mt-1">
            <span
              className={`text-2xl font-black ${
                filterLowStockOnly ? 'text-white' : 'text-amber-600'
              }`}
            >
              {lowStockCount}
            </span>
            <span className="text-[10px] uppercase font-bold underline">
              {filterLowStockOnly ? 'ສະແດງທັງໝົດ' : 'ກັ່ນຕອງເບິ່ງ'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs mb-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ຄົ້ນຫາຊື່ສິນຄ້າ ຫຼື ບາໂຄດ..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Add Product Button */}
          <button
            onClick={handleOpenAddModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>ເພີ່ມສິນຄ້າໃໝ່</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">ສິນຄ້າ</th>
                <th className="py-3 px-4">ໝວດໝູ່</th>
                <th className="py-3 px-4">ບາໂຄດ (Barcode)</th>
                <th className="py-3 px-4 text-right">ຕົ້ນທຶນ</th>
                <th className="py-3 px-4 text-right">ລາຄາຂາຍ</th>
                <th className="py-3 px-4 text-center">ສະຕັອກຄົງເຫຼືອ</th>
                <th className="py-3 px-4 text-center">ສະຖານະ</th>
                <th className="py-3 px-4 text-center">ຈັດການ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.stock <= 0;
                const isLowStock = p.stock > 0 && p.stock <= p.minStockAlert;
                const profitMargin =
                  p.price > 0 ? Math.round(((p.price - p.costPrice) / p.price) * 100) : 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Product Name & Image */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">{p.name}</p>
                          {p.nameEn && (
                            <p className="text-[10px] text-slate-400 line-clamp-1">{p.nameEn}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-medium">
                        {p.category}
                      </span>
                    </td>

                    {/* Barcode */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {p.barcode}
                    </td>

                    {/* Cost */}
                    <td className="py-3 px-4 text-right font-medium text-slate-500">
                      {formatKip(p.costPrice)}
                    </td>

                    {/* Price & Margin */}
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-emerald-600 block">
                        {formatKip(p.price)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ກຳໄລ {profitMargin}%
                      </span>
                    </td>

                    {/* Stock Count */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center space-x-1.5 font-bold">
                        <span className="text-sm">{p.stock}</span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          {p.unit}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      {isOutOfStock ? (
                        <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          ໝົດສະຕັອກ
                        </span>
                      ) : isLowStock ? (
                        <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          ໃກ້ໝົດ ({p.stock}/{p.minStockAlert})
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          ປົກກະຕິ
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {/* Adjust Stock */}
                        <button
                          onClick={() => {
                            setAdjustingStockProduct(p);
                            setAdjustAmount(0);
                          }}
                          className="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition-colors"
                          title="ປັບປຸງຈຳນວນສະຕັອກ"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="ແກ້ໄຂຂໍ້ມູນສິນຄ້າ"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            if (window.confirm(`ຕ້ອງການລຶບສິນຄ້າ "${p.name}" ແທ້ບໍ່?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="ລຶບສິນຄ້າ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-sky-600 to-emerald-600 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingProduct ? 'ແກ້ໄຂຂໍ້ມູນສິນຄ້າ' : 'ເພີ່ມສິນຄ້າໃໝ່ (HS MINI MART)'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Product Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ຊື່ສິນຄ້າ (ພາສາລາວ) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ເຊັ່ນ: ນ້ຳດື່ມຫົວເສືອ 600ml..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              {/* English Name */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  ຊື່ພາສາອັງກິດ (ທາງເລືອກ)
                </label>
                <input
                  type="text"
                  value={formData.nameEn || ''}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="e.g. Tigerhead Water 600ml..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              {/* Barcode with Auto Generate */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    ລະຫັດບາໂຄດ (Barcode) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, barcode: generateBarcode() })}
                    className="text-[10px] text-sky-600 hover:text-sky-800 font-bold flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>ສ້າງບາໂຄດອັດຕະໂນມັດ (EAN-13)</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formData.barcode || ''}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="ເຊັ່ນ: 8850029010012"
                  className="w-full font-mono text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              {/* Category & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">ໝວດໝູ່</label>
                  <select
                    value={formData.category || 'ເຄື່ອງດື່ມ'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    {CATEGORIES.filter((c) => c !== 'ທັງໝົດ').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">ຫົວໜ່ວຍ</label>
                  <input
                    type="text"
                    value={formData.unit || 'ຕຸກ'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="ຕຸກ, ແກ້ວ, ຊອງ, ກະປ໋ອງ..."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Pricing: Cost & Retail */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ລາຄາຕົ້ນທຶນ (₭)
                  </label>
                  <input
                    type="number"
                    value={formData.costPrice || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ລາຄາຂາຍໜ້າຮ້ານ (₭) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full text-xs font-mono font-bold text-emerald-700 px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Stock and Alert */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ຈຳນວນສະຕັອກເລີ່ມຕົ້ນ
                  </label>
                  <input
                    type="number"
                    value={formData.stock || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ແຈ້ງເຕືອນເມື່ອຕໍ່າກວ່າ
                  </label>
                  <input
                    type="number"
                    value={formData.minStockAlert || 5}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minStockAlert: parseInt(e.target.value, 10) || 5,
                      })
                    }
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  ລິ້ງຮູບພາບສິນຄ້າ (Image URL)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.imageUrl || ''}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-xl"
                  />
                  {formData.imageUrl && (
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                    />
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  ບັນທຶກສິນຄ້າ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustingStockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-slate-800">
              ປັບປຸງສະຕັອກ: {adjustingStockProduct.name}
            </h3>
            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
              <p className="text-slate-500">
                ສະຕັອກປັດຈຸບັນ:{' '}
                <strong className="text-slate-800 font-bold">
                  {adjustingStockProduct.stock} {adjustingStockProduct.unit}
                </strong>
              </p>
              <p className="text-slate-500">
                ສະຕັອກໃໝ່ຫຼັງປັບ:{' '}
                <strong className="text-emerald-700 font-bold">
                  {Math.max(0, adjustingStockProduct.stock + adjustAmount)}{' '}
                  {adjustingStockProduct.unit}
                </strong>
              </p>
            </div>

            <form onSubmit={handleStockAdjustmentSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ຈຳນວນທີ່ເພີ່ມ (+) ຫຼື ຫຼຸດ (-)
                </label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(parseInt(e.target.value, 10) || 0)}
                  placeholder="ເຊັ່ນ: +20 ຫຼື -5"
                  className="w-full text-base font-bold font-mono px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">ສາເຫດ</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="ຮັບສິນຄ້າເຂົ້າຕື່ມ (Restock)">ຮັບສິນຄ້າເຂົ້າຕື່ມ (Restock)</option>
                  <option value="ສິນຄ້າຊຳລຸດ/ໝົດອາຍຸ (Damaged/Expired)">
                    ສິນຄ້າຊຳລຸດ/ໝົດອາຍຸ (Damaged/Expired)
                  </option>
                  <option value="ປັບຍອດນັບຕົວຈິງ (Audit Adjustment)">
                    ປັບຍອດນັບຕົວຈິງ (Audit Adjustment)
                  </option>
                  <option value="ອື່ນໆ (Other)">ອື່ນໆ (Other)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingStockProduct(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs"
                >
                  ຢືນຢັນປັບສະຕັອກ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
