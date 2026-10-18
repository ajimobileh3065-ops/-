import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  Banknote,
  QrCode,
  FileSpreadsheet,
  Calendar,
  Eye,
  RotateCcw,
  CheckCircle,
  ExternalLink,
  Loader2,
  DollarSign,
  PackageCheck,
  Search,
} from 'lucide-react';
import { Product, SaleTransaction, StoreInfo } from '../types';
import { formatDateTime, formatKip, formatNumber } from '../utils/formatters';
import { syncToGoogleSheets } from '../services/googleSheets';
import { getAccessToken } from '../services/firebaseAuth';
import { User } from 'firebase/auth';

interface ReportsViewProps {
  transactions: SaleTransaction[];
  products: Product[];
  storeInfo: StoreInfo;
  googleUser: User | null;
  onGoogleSignIn: () => void;
  onViewReceipt: (transaction: SaleTransaction) => void;
  onRefundTransaction: (id: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  products,
  storeInfo,
  googleUser,
  onGoogleSignIn,
  onViewReceipt,
  onRefundTransaction,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'all'>('today');
  const [searchReceipt, setSearchReceipt] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedSheetUrl, setSyncedSheetUrl] = useState<string | null>(null);
  const [syncConfirmOpen, setSyncConfirmOpen] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Filter by date
  const filteredTransactions = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return transactions.filter((t) => {
      const matchPeriod =
        filterPeriod === 'all' || t.timestamp.startsWith(today);
      const matchSearch =
        !searchReceipt ||
        t.receiptNumber.toLowerCase().includes(searchReceipt.toLowerCase()) ||
        (t.customerName &&
          t.customerName.toLowerCase().includes(searchReceipt.toLowerCase()));
      return matchPeriod && matchSearch;
    });
  }, [transactions, filterPeriod, searchReceipt]);

  // Aggregate Metrics
  const completedList = filteredTransactions.filter((t) => t.status === 'COMPLETED');
  const totalRevenue = completedList.reduce((sum, t) => sum + t.total, 0);
  const totalSalesCount = completedList.length;

  const cashTotal = completedList
    .filter((t) => t.paymentMethod === 'CASH')
    .reduce((sum, t) => sum + t.total, 0);

  const transferTotal = completedList
    .filter((t) => t.paymentMethod === 'TRANSFER')
    .reduce((sum, t) => sum + t.total, 0);

  const cardTotal = completedList
    .filter((t) => t.paymentMethod === 'CARD')
    .reduce((sum, t) => sum + t.total, 0);

  // Estimate profit
  const totalCost = completedList.reduce((sum, t) => {
    return (
      sum +
      t.items.reduce((itemSum, item) => itemSum + item.product.costPrice * item.quantity, 0)
    );
  }, 0);
  const estimatedProfit = Math.max(0, totalRevenue - totalCost);

  // Best-selling products ranking
  const bestSellers = useMemo(() => {
    const map: Record<string, { product: Product; count: number; revenue: number }> = {};
    completedList.forEach((t) => {
      t.items.forEach((item) => {
        if (!map[item.product.id]) {
          map[item.product.id] = {
            product: item.product,
            count: 0,
            revenue: 0,
          };
        }
        map[item.product.id].count += item.quantity;
        map[item.product.id].revenue += item.quantity * item.product.price;
      });
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [completedList]);

  // Execute Google Sheets Sync
  const handlePerformSync = async () => {
    setSyncConfirmOpen(false);
    setSyncError(null);

    const token = await getAccessToken();
    if (!token) {
      alert('ກະລຸນາເຊື່ອມຕໍ່ບັນຊີ Google ກ່ອນທີ່ຈະສົ່ງອອກຂໍ້ມູນ');
      onGoogleSignIn();
      return;
    }

    setIsSyncing(true);
    try {
      const result = await syncToGoogleSheets(token, {
        storeInfo,
        products,
        transactions,
      });
      setSyncedSheetUrl(result.spreadsheetUrl);
    } catch (err: any) {
      console.error('Google Sheets sync failed:', err);
      setSyncError(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ Google Sheets');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 bg-slate-100 overflow-y-auto">
      {/* Top Banner & Google Sheets Sync Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-sky-100 text-sky-700 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              ລາຍງານການຂາຍ & ຜົນກຳໄລ (Reports & Analytics)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ສະຫຼຸບຍອດຂາຍ, ວິທີຊຳລະເງິນ, ສິນຄ້າຂາຍດີ ແລະ ເຊື່ອມຕໍ່ Google Sheets
          </p>
        </div>

        {/* Google Sheets Trigger */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          {googleUser ? (
            <button
              onClick={() => setSyncConfirmOpen(true)}
              disabled={isSyncing}
              className="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-xs transition-colors"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ກຳລັງສົ່ງອອກໄປ Sheets...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>ສົ່ງອອກໄປ Google Sheets</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onGoogleSignIn}
              className="w-full md:w-auto bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2.5 px-4 rounded-xl border border-slate-300 shadow-2xs flex items-center justify-center space-x-2 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>ເຊື່ອມຕໍ່ Google ເພື່ອໃຊ້ Sheets</span>
            </button>
          )}
        </div>
      </div>

      {/* Sync Success banner if spreadsheet generated */}
      {syncedSheetUrl && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl mb-6 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-emerald-900">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>ສົ່ງອອກຂໍ້ມູນສຳເລັດແລ້ວ!</strong> ຕາຕະລາງລາຍງານຍອດຂາຍຖືກສ້າງໃນ Google
              Sheets ຮຽບຮ້ອຍແລ້ວ.
            </span>
          </div>
          <a
            href={syncedSheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 font-bold text-emerald-700 hover:text-emerald-900 bg-white px-3 py-1.5 rounded-lg border border-emerald-300 shadow-2xs"
          >
            <span>ເປີດ Google Sheet</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {syncError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-4 text-xs">
          {syncError}
        </div>
      )}

      {/* Filter Period Switch */}
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-white shadow-2xs">
          <button
            onClick={() => setFilterPeriod('today')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              filterPeriod === 'today'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ຍອດຂາຍມື້ນີ້
          </button>
          <button
            onClick={() => setFilterPeriod('all')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              filterPeriod === 'all'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ຍອດຂາຍທັງໝົດ
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          ພົບ {filteredTransactions.length} ລາຍການບິນ
        </span>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400">ຍອດຂາຍລວມ</span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {formatKip(totalRevenue)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{totalSalesCount} ບິນຂາຍ</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400">ກຳໄລຄາດຄະເນ</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {formatKip(estimatedProfit)}
          </p>
          <p className="text-[11px] text-emerald-600 mt-0.5">
            {totalRevenue > 0
              ? `ກຳໄລ ${Math.round((estimatedProfit / totalRevenue) * 100)}%`
              : '0%'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400">ເງິນສົດ (Cash)</span>
          <p className="text-xl font-black text-slate-800 mt-1">{formatKip(cashTotal)}</p>
          <div className="flex items-center space-x-1 text-[11px] text-emerald-600 mt-0.5">
            <Banknote className="w-3.5 h-3.5" />
            <span>{totalRevenue > 0 ? Math.round((cashTotal / totalRevenue) * 100) : 0}%</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400">ໂອນເງິນ (BCEL One)</span>
          <p className="text-xl font-black text-sky-700 mt-1">{formatKip(transferTotal)}</p>
          <div className="flex items-center space-x-1 text-[11px] text-sky-600 mt-0.5">
            <QrCode className="w-3.5 h-3.5" />
            <span>
              {totalRevenue > 0 ? Math.round((transferTotal / totalRevenue) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Best Sellers Leaderboard (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>ສິນຄ້າຂາຍດີອັນດັບ TOP 5</span>
            </h3>
            <span className="text-[10px] text-slate-400">ຕາມຈຳນວນທີ່ຂາຍ</span>
          </div>

          {bestSellers.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">ຍັງບໍ່ມີຂໍ້ມູນການຂາຍ</p>
          ) : (
            <div className="space-y-3">
              {bestSellers.map((item, idx) => (
                <div key={item.product.id} className="flex items-center space-x-3 text-xs">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <img
                    src={item.product.imageUrl}
                    alt=""
                    className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 truncate">{item.product.name}</p>
                    <p className="text-[10px] text-slate-400">
                      ຂາຍໄດ້ {item.count} {item.product.unit}
                    </p>
                  </div>
                  <span className="font-extrabold text-emerald-600 text-right">
                    {formatKip(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800">
              ສັດສ່ວນຊ່ອງທາງການຊຳລະເງິນ (Payment Breakdown)
            </h3>
          </div>

          <div className="space-y-3 py-2">
            {/* Cash */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center space-x-1.5 text-slate-700">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>ເງິນສົດ (Cash)</span>
                </span>
                <span className="text-slate-900 font-bold">{formatKip(cashTotal)}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: totalRevenue > 0 ? `${(cashTotal / totalRevenue) * 100}%` : '0%',
                  }}
                ></div>
              </div>
            </div>

            {/* Transfer */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center space-x-1.5 text-slate-700">
                  <QrCode className="w-4 h-4 text-sky-600" />
                  <span>ໂອນເງິນຜ່ານ BCEL One / OnePay</span>
                </span>
                <span className="text-slate-900 font-bold">{formatKip(transferTotal)}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                  style={{
                    width:
                      totalRevenue > 0 ? `${(transferTotal / totalRevenue) * 100}%` : '0%',
                  }}
                ></div>
              </div>
            </div>

            {/* Card */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center space-x-1.5 text-slate-700">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>ບັດເຄຣດິດ (Card)</span>
                </span>
                <span className="text-slate-900 font-bold">{formatKip(cardTotal)}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{
                    width: totalRevenue > 0 ? `${(cardTotal / totalRevenue) * 100}%` : '0%',
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions History Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-800">
            ປະຫວັດການຂາຍທັງໝົດ (Sales Transaction Log)
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchReceipt}
              onChange={(e) => setSearchReceipt(e.target.value)}
              placeholder="ຄົ້ນຫາເລກບິນ ຫຼື ຊື່ລູກຄ້າ..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">ເລກບິນ (Receipt #)</th>
                <th className="py-3 px-4">ວັນທີ & ເວລາ</th>
                <th className="py-3 px-4">ລູກຄ້າ</th>
                <th className="py-3 px-4">ວິທີຊຳລະ</th>
                <th className="py-3 px-4 text-center">ຈຳນວນລາຍການ</th>
                <th className="py-3 px-4 text-right">ຍອດຊຳລະ (₭)</th>
                <th className="py-3 px-4 text-center">ສະຖານະ</th>
                <th className="py-3 px-4 text-center">ຈັດການ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    ບໍ່ມີປະຫວັດການຂາຍໃນຊ່ວງເວລານີ້
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {t.receiptNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{formatDateTime(t.timestamp)}</td>
                    <td className="py-3 px-4">
                      {t.customerName ? (
                        <span className="font-semibold text-sky-700">{t.customerName}</span>
                      ) : (
                        <span className="text-slate-400">ລູກຄ້າທົ່ວໄປ</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-[10px]">
                        {t.paymentMethod === 'CASH'
                          ? 'ເງິນສົດ'
                          : t.paymentMethod === 'TRANSFER'
                          ? 'ໂອນ BCEL'
                          : 'ບັດ'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">
                      {t.items.reduce((sum, i) => sum + i.quantity, 0)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      {formatKip(t.total)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {t.status === 'COMPLETED' ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          ສຳເລັດ
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          ຍົກເລີກ/ຄືນເງິນ
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => onViewReceipt(t)}
                          className="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition-colors"
                          title="ເບິ່ງໃບຮັບເງິນ"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {t.status === 'COMPLETED' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`ຕ້ອງການຍົກເລີກບິນ ${t.receiptNumber} ແລະ ຄືນສະຕັອກສິນຄ້າແທ້ບໍ່?`)) {
                                onRefundTransaction(t.id);
                              }
                            }}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="ຍົກເລີກບິນ / ຄືນສິນຄ້າ"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Workspace Google Sheets operation */}
      {syncConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center space-x-3 text-emerald-600">
              <span className="p-2.5 bg-emerald-100 rounded-2xl">
                <FileSpreadsheet className="w-6 h-6" />
              </span>
              <div>
                <h3 className="font-bold text-base text-slate-800">
                  ຢືນຢັນການສົ່ງອອກ Google Sheets
                </h3>
                <p className="text-xs text-slate-400">Google Workspace Synchronization</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການສ້າງ/ອັບເດດຕາຕະລາງຍອດຂາຍ ແລະ ສາງສິນຄ້າ HS MINI MART
              ໄປຍັງ Google Sheets ຂອງທ່ານ?
              ລະບົບຈະສ້າງເອກະສານໃໝ່ພ້ອມ 3 ແຜ່ນງານ (Summary, Sales, Inventory) ດ້ວຍສິດອະນຸຍາດຈາກບັນຊີຂອງທ່ານ.
            </p>

            <div className="bg-slate-50 p-3 rounded-xl text-[11px] text-slate-500 space-y-1">
              <p>• ລາຍການຂາຍທັງໝົດ: {transactions.length} ບິນ</p>
              <p>• ຈຳນວນສິນຄ້າໃນສາງ: {products.length} ລາຍການ</p>
              <p>• ບັນຊີທີ່ເຊື່ອມຕໍ່: {googleUser?.email}</p>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSyncConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                ຍົກເລີກ
              </button>
              <button
                type="button"
                onClick={handlePerformSync}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
              >
                ຢືນຢັນສົ່ງອອກ (Export)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
