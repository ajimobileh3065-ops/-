import React, { useState } from 'react';
import { Product, StoreInfo } from '../types';
import { ShelfPriceTag, BarcodeRenderer, QRCodeRenderer } from './BarcodeRenderer';
import { Printer, CheckSquare, Square, Filter, Search, Sparkles, Tag } from 'lucide-react';
import { CATEGORIES } from '../data/defaultData';
import { formatKip } from '../utils/formatters';

interface BarcodeGeneratorViewProps {
  products: Product[];
  storeInfo: StoreInfo;
}

export const BarcodeGeneratorView: React.FC<BarcodeGeneratorViewProps> = ({
  products,
  storeInfo,
}) => {
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    products.slice(0, 6).map((p) => p.id)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ທັງໝົດ');

  const filteredProducts = products.filter((p) => {
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

  const toggleSelect = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedProductIds(filteredProducts.map((p) => p.id));
  };

  const deselectAll = () => {
    setSelectedProductIds([]);
  };

  const handlePrint = () => {
    window.print();
  };

  const productsToPrint = products.filter((p) => selectedProductIds.includes(p.id));

  return (
    <div className="flex-1 p-4 sm:p-6 bg-slate-100 overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-sky-100 text-sky-700 rounded-xl">
              <Tag className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              ສ້າງປ້າຍລາຄາ & ບາໂຄດສິນຄ້າ (Barcode & Price Tag Generator)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ສ້າງ ແລະ ພິມປ້າຍລາຄາຕິດໜ້າຊັ້ນວາງສິນຄ້າ (Shelf Price Tags) ພ້ອມບາໂຄດ, ຄິວອາໂຄດ ແລະ ລາຄາເປັນເງິນກີບ
          </p>
        </div>

        <button
          onClick={handlePrint}
          disabled={productsToPrint.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs py-2.5 px-5 rounded-xl flex items-center space-x-2 shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>ພິມປ້າຍລາຄາທີ່ເລືອກ ({productsToPrint.length})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
        {/* Left Column: Product Selector (print:hidden) */}
        <div className="lg:col-span-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-3 print:hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-800">
              ເລືອກສິນຄ້າເພື່ອພິມ ({selectedProductIds.length}/{products.length})
            </span>
            <div className="flex items-center space-x-2 text-xs">
              <button
                onClick={selectAll}
                className="text-sky-600 hover:text-sky-800 font-semibold"
              >
                ເລືອກໝົດ
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={deselectAll}
                className="text-slate-400 hover:text-slate-600 font-medium"
              >
                ຍົກເລີກ
              </button>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ຄົ້ນຫາຊື່ສິນຄ້າ..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Product checklist */}
          <div className="max-h-[500px] overflow-y-auto space-y-1.5 pr-1">
            {filteredProducts.map((p) => {
              const isChecked = selectedProductIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => toggleSelect(p.id)}
                  className={`p-2 rounded-xl border cursor-pointer flex items-center space-x-2.5 text-xs transition-colors ${
                    isChecked
                      ? 'bg-sky-50 border-sky-300 text-sky-900 font-medium'
                      : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-sky-600 flex-shrink-0">
                    {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-300" />}
                  </div>
                  <img
                    src={p.imageUrl}
                    alt=""
                    className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {formatKip(p.price)} • {p.barcode}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Printable Sheet Preview */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs print:p-0 print:border-none print:shadow-none">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 print:hidden">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                ຕົວຢ່າງໜ້າເຈ້ຍປ້າຍລາຄາ (Print Preview)
              </h3>
              <p className="text-[11px] text-slate-400">
                ຂະໜາດປ້າຍຖືກອອກແບບໃຫ້ເໝາະສົມກັບຊັ້ນວາງມິນິມາດ (A4 / Sticker Paper)
              </p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold">
              {productsToPrint.length} ປ້າຍ
            </span>
          </div>

          {productsToPrint.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Tag className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="font-medium text-sm">ຍັງບໍ່ໄດ້ເລືອກສິນຄ້າໃດໆ</p>
              <p className="text-xs text-slate-400 mt-1">
                ກະລຸນາໝາຍເລືອກສິນຄ້າຈາກຖັນດ້ານຊ້າຍເພື່ອສ້າງປ້າຍລາຄາ
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 justify-start print:gap-3 print:justify-start">
              {productsToPrint.map((p) => (
                <ShelfPriceTag
                  key={p.id}
                  storeName={storeInfo.name}
                  productName={p.name}
                  price={p.price}
                  barcode={p.barcode}
                  unit={p.unit}
                  category={p.category}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
