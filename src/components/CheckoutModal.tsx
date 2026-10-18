import React, { useState, useEffect } from 'react';
import {
  Banknote,
  QrCode,
  CreditCard,
  X,
  Check,
  Copy,
  UserCheck,
  Percent,
  Receipt,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, Customer, PaymentMethod, StoreInfo } from '../types';
import { formatKip, formatNumber, playSuccessChime } from '../utils/formatters';
import { QRCodeRenderer } from './BarcodeRenderer';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  discount: number;
  selectedCustomer: Customer | null;
  storeInfo: StoreInfo;
  onCompleteSale: (details: {
    paymentMethod: PaymentMethod;
    cashReceived: number;
    changeGiven: number;
    receiptType: 'simplified' | 'tax_invoice';
    pointsUsed: number;
  }) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  subtotal,
  discount,
  selectedCustomer,
  storeInfo,
  onCompleteSale,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashReceivedInput, setCashReceivedInput] = useState<string>('');
  const [receiptType, setReceiptType] = useState<'simplified' | 'tax_invoice'>('simplified');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [pointsToUse, setPointsToUse] = useState<number>(0);

  // Points conversion: 1 point = 1,000 Kip discount (if customer has points)
  const maxRedeemablePoints = selectedCustomer ? Math.min(selectedCustomer.points, Math.floor((subtotal - discount) / 1000)) : 0;
  const pointDiscount = pointsToUse * 1000;
  const finalDiscount = discount + pointDiscount;
  const totalDue = Math.max(0, subtotal - finalDiscount);

  useEffect(() => {
    if (isOpen) {
      setCashReceivedInput(totalDue.toString());
      setPointsToUse(0);
      setCopiedAccount(false);
    }
  }, [isOpen, totalDue]);

  if (!isOpen) return null;

  const cashReceived = parseFloat(cashReceivedInput) || 0;
  const changeGiven = Math.max(0, cashReceived - totalDue);
  const isCashInsufficient = paymentMethod === 'CASH' && cashReceived < totalDue;

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(storeInfo.bankAccount);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleQuickCash = (amount: number) => {
    setCashReceivedInput(amount.toString());
  };

  const handleFinalize = () => {
    if (isCashInsufficient) return;

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
      playSuccessChime();
    } catch {
      // ignore
    }

    onCompleteSale({
      paymentMethod,
      cashReceived: paymentMethod === 'CASH' ? cashReceived : totalDue,
      changeGiven: paymentMethod === 'CASH' ? changeGiven : 0,
      receiptType,
      pointsUsed: pointsToUse,
    });
  };

  // Common quick money buttons in Laos
  const quickBills = [
    { label: 'ພໍດີ (Exact)', amount: totalDue },
    { label: '20,000', amount: 20000 },
    { label: '50,000', amount: 50000 },
    { label: '100,000', amount: 100000 },
    { label: '200,000', amount: 200000 },
    { label: '500,000', amount: 500000 },
  ].filter(b => b.amount >= totalDue || b.label.includes('Exact'));

  // QR Code payload for BCEL One / OnePay
  const transferQrPayload = `LA-BCEL-ONEPAY|ACC:${storeInfo.bankAccount}|AMT:${totalDue}|NAME:${encodeURIComponent(storeInfo.accountHolder)}|REF:HSM${Date.now().toString().slice(-6)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-emerald-600 p-5 text-white flex items-center justify-between">
          <div>
            <span className="text-sky-200 text-xs font-semibold tracking-wider uppercase">
              HS MINI MART POS
            </span>
            <h2 className="text-xl font-bold">ຊຳລະເງິນຄ່າສິນຄ້າ (Checkout)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Order Summary Pill */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">ຈຳນວນ {items.length} ລາຍການ</p>
              {finalDiscount > 0 && (
                <p className="text-xs text-emerald-600 font-medium mt-0.5">
                  ສ່ວນຫຼຸດລວມ: -{formatKip(finalDiscount)}
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">ຍອດຊຳລະທັງໝົດ</span>
              <span className="text-2xl font-black text-emerald-600">
                {formatKip(totalDue)}
              </span>
            </div>
          </div>

          {/* Customer Member Point Redemption if member selected */}
          {selectedCustomer && maxRedeemablePoints > 0 && (
            <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    ສະມາຊິກ: {selectedCustomer.name}
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    ມີຄະແນນ {selectedCustomer.points} ຄະແນນ (ໃຊ້ 1 ຄະແນນ = 1,000 ₭)
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={pointsToUse}
                  onChange={(e) => setPointsToUse(Number(e.target.value))}
                  className="text-xs font-semibold bg-white border border-emerald-300 rounded-lg px-2 py-1 text-slate-800"
                >
                  <option value={0}>ບໍ່ໃຊ້ຄະແນນ</option>
                  {Array.from({ length: Math.min(maxRedeemablePoints, 10) }, (_, i) => i + 1).map(
                    (p) => (
                      <option key={p} value={p}>
                        ໃຊ້ {p} ຄະແນນ (-{formatKip(p * 1000)})
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              ເລືອກຊ່ອງທາງການຊຳລະເງິນ:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`py-3 px-3 rounded-2xl border-2 flex flex-col items-center justify-center space-y-1 transition-all ${
                  paymentMethod === 'CASH'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                }`}
              >
                <Banknote className="w-6 h-6 text-emerald-600" />
                <span className="text-xs font-bold">ເງິນສົດ (Cash)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('TRANSFER')}
                className={`py-3 px-3 rounded-2xl border-2 flex flex-col items-center justify-center space-y-1 transition-all ${
                  paymentMethod === 'TRANSFER'
                    ? 'border-sky-500 bg-sky-50/70 text-sky-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                }`}
              >
                <QrCode className="w-6 h-6 text-sky-600" />
                <span className="text-xs font-bold">ໂອນເງິນ (OnePay)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`py-3 px-3 rounded-2xl border-2 flex flex-col items-center justify-center space-y-1 transition-all ${
                  paymentMethod === 'CARD'
                    ? 'border-indigo-500 bg-indigo-50/70 text-indigo-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                }`}
              >
                <CreditCard className="w-6 h-6 text-indigo-600" />
                <span className="text-xs font-bold">ບັດ (Card)</span>
              </button>
            </div>
          </div>

          {/* Payment Method Details */}
          {paymentMethod === 'CASH' && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  ຈຳນວນເງິນສົດທີ່ໄດ້ຮັບ (₭):
                </label>
                <input
                  type="number"
                  value={cashReceivedInput}
                  onChange={(e) => setCashReceivedInput(e.target.value)}
                  className="w-full text-xl font-bold font-mono px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                  placeholder="0"
                />
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {quickBills.map((b, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickCash(b.amount)}
                    className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 shadow-2xs"
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {/* Change Display */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">ເງິນທອນ (Change):</span>
                <span
                  className={`text-xl font-black font-mono ${
                    isCashInsufficient ? 'text-red-500' : 'text-emerald-700'
                  }`}
                >
                  {isCashInsufficient ? 'ຍັງຂາດ ' + formatKip(totalDue - cashReceived) : formatKip(changeGiven)}
                </span>
              </div>
            </div>
          )}

          {paymentMethod === 'TRANSFER' && (
            <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-200 space-y-3">
              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="bg-white p-2 rounded-xl shadow-xs border border-sky-100 flex-shrink-0">
                  <QRCodeRenderer value={transferQrPayload} size={130} />
                </div>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-sky-800 text-sm">{storeInfo.bankName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {storeInfo.bankAccount}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="p-1 text-sky-600 hover:text-sky-800 bg-white rounded-md border border-sky-200 shadow-2xs"
                      title="ສຳເນົາເລກບັນຊີ"
                    >
                      {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    ຊື່ບັນຊີ: <strong className="text-slate-800">{storeInfo.accountHolder}</strong>
                  </p>
                  <p className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                    ຈຳນວນເງິນໂອນ: {formatKip(totalDue)}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 text-center">
                * ສະແກນ QR ຜ່ານແອັບ BCEL One ຫຼື ໂອນເຂົ້າເລກບັນຊີດັ່ງກ່າວ
              </p>
            </div>
          )}

          {paymentMethod === 'CARD' && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <p className="text-xs font-medium text-slate-700">
                ຮູດ/ແຕະບັດຜ່ານເຄື່ອງ EDC Terminal ແລ້ວກວດສອບສະລິບ
              </p>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center justify-between">
                <span>ຍອດຕັດບັດ:</span>
                <span className="text-base font-bold">{formatKip(totalDue)}</span>
              </div>
            </div>
          )}

          {/* Receipt format option */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-slate-600 flex items-center space-x-1.5">
              <Receipt className="w-4 h-4 text-sky-600" />
              <span>ປະເພດໃບຮັບເງິນ:</span>
            </span>
            <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-100">
              <button
                type="button"
                onClick={() => setReceiptType('simplified')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  receiptType === 'simplified'
                    ? 'bg-white text-sky-700 shadow-2xs'
                    : 'text-slate-500'
                }`}
              >
                ແບບຫຍໍ້
              </button>
              <button
                type="button"
                onClick={() => setReceiptType('tax_invoice')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  receiptType === 'tax_invoice'
                    ? 'bg-white text-sky-700 shadow-2xs'
                    : 'text-slate-500'
                }`}
              >
                ໃບກຳກັບພາສີເຕັມ
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-sm transition-colors"
          >
            ຍົກເລີກ
          </button>
          <button
            type="button"
            onClick={handleFinalize}
            disabled={isCashInsufficient}
            className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 ${
              isCashInsufficient
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
            }`}
          >
            <Check className="w-5 h-5" />
            <span>ຢືນຢັນການຊຳລະ ({formatKip(totalDue)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
