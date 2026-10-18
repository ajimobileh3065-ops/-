import React, { useRef } from 'react';
import { SaleTransaction, StoreInfo } from '../types';
import { formatDateTime, formatKip } from '../utils/formatters';
import { BarcodeRenderer, QRCodeRenderer } from './BarcodeRenderer';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  transaction: SaleTransaction | null;
  storeInfo: StoreInfo;
  onClose: () => void;
  onToggleReceiptType?: (newType: 'simplified' | 'tax_invoice') => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  transaction,
  storeInfo,
  onClose,
  onToggleReceiptType,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const isTaxInvoice = transaction.receiptType === 'tax_invoice';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Modal Top Bar */}
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">ສຳເລັດການຂາຍ</h3>
              <p className="text-xs text-slate-500">ເລກທີ: {transaction.receiptNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Options in Modal */}
        <div className="px-6 pt-3 flex items-center justify-between print:hidden bg-slate-50/50 border-b border-slate-100">
          <span className="text-xs font-medium text-slate-600">ຮູບແບບໃບຮັບເງິນ:</span>
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white shadow-xs">
            <button
              onClick={() => onToggleReceiptType && onToggleReceiptType('simplified')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                !isTaxInvoice
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ໃບຮັບເງິນແບບຫຍໍ້
            </button>
            <button
              onClick={() => onToggleReceiptType && onToggleReceiptType('tax_invoice')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                isTaxInvoice
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ໃບກຳກັບພາສີເຕັມ
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div
          ref={printRef}
          id="printable-receipt"
          className="p-6 text-slate-800 font-mono text-xs max-h-[70vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0 print:m-0"
        >
          {/* Store Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300">
            <h2 className="text-lg font-black text-sky-800 tracking-wider">
              {storeInfo.name}
            </h2>
            <p className="text-sm font-bold text-slate-700">{storeInfo.ownerName}</p>
            <p className="text-[11px] text-slate-500 mt-1">{storeInfo.fullAddress}</p>
            <p className="text-[11px] text-slate-500">
              ໂທ: {storeInfo.phone1} / {storeInfo.phone2}
            </p>
            <p className="text-[11px] text-slate-500">Email: {storeInfo.email}</p>

            <div className="mt-2 inline-block px-2.5 py-0.5 border border-slate-700 font-bold text-[11px] uppercase tracking-wide">
              {isTaxInvoice ? 'ໃບກຳກັບພາສີແບບເຕັມ (TAX INVOICE)' : 'ໃບຮັບເງິນແບບຫຍໍ້ (RECEIPT)'}
            </div>

            {isTaxInvoice && (
              <p className="text-[10px] text-slate-600 mt-1">
                ເລກປະຈຳຕົວຜູ້ເສຍອາກອນ: {storeInfo.taxNumber}
              </p>
            )}
          </div>

          {/* Transaction Metadata */}
          <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">ເລກທີບິນ:</span>
              <span className="font-bold">{transaction.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ວັນທີ & ເວລາ:</span>
              <span>{formatDateTime(transaction.timestamp)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ພະນັກງານ:</span>
              <span>{transaction.cashierName}</span>
            </div>
            {transaction.customerName && (
              <div className="flex justify-between">
                <span className="text-slate-500">ລູກຄ້າ:</span>
                <span className="font-semibold text-sky-700">{transaction.customerName}</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="py-3 border-b border-dashed border-slate-300">
            <div className="flex justify-between text-slate-500 font-bold border-b border-slate-200 pb-1 text-[10px] uppercase">
              <span className="w-1/2">ລາຍການ</span>
              <span className="w-1/6 text-center">ຈຳນວນ</span>
              <span className="w-1/3 text-right">ລວມ (₭)</span>
            </div>

            <div className="divide-y divide-slate-100 my-1">
              {transaction.items.map((item, idx) => (
                <div key={idx} className="py-1.5">
                  <div className="flex justify-between font-medium">
                    <span className="w-1/2 truncate font-sans text-slate-800">
                      {item.product.name}
                    </span>
                    <span className="w-1/6 text-center text-slate-600">x{item.quantity}</span>
                    <span className="w-1/3 text-right font-bold">
                      {formatKip(item.quantity * item.product.price)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    @ {formatKip(item.product.price)} /{item.product.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Section */}
          <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1.5 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>ລວມເງິນ (Subtotal):</span>
              <span>{formatKip(transaction.subtotal)}</span>
            </div>

            {transaction.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>ສ່ວນຫຼຸດ (Discount):</span>
                <span>-{formatKip(transaction.discount)}</span>
              </div>
            )}

            {isTaxInvoice && (
              <div className="flex justify-between text-slate-600">
                <span>ອາກອນມູນຄ່າເພີ່ມ VAT 7%:</span>
                <span>{formatKip(transaction.tax)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-300 text-slate-900">
              <span>ຍອດຊຳລະຕົວຈິງ (TOTAL):</span>
              <span className="text-base text-emerald-700">{formatKip(transaction.total)}</span>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">ວິທີຊຳລະ:</span>
              <span className="font-bold">
                {transaction.paymentMethod === 'CASH'
                  ? 'ເງິນສົດ (Cash)'
                  : transaction.paymentMethod === 'TRANSFER'
                  ? 'ໂອນຜ່ານທະນາຄານ (Bank QR)'
                  : 'ບັດເຄຣດິດ (Card)'}
              </span>
            </div>

            {transaction.paymentMethod === 'CASH' && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-500">ຮັບເງິນສົດມາ:</span>
                  <span>{formatKip(transaction.cashReceived || transaction.total)}</span>
                </div>
                <div className="flex justify-between font-bold text-sky-700">
                  <span>ເງິນທອນ:</span>
                  <span>{formatKip(transaction.changeGiven || 0)}</span>
                </div>
              </>
            )}

            {transaction.paymentMethod === 'TRANSFER' && (
              <div className="bg-sky-50 p-2 rounded-lg mt-1 border border-sky-100 text-[10px]">
                <p className="font-bold text-sky-900">ເລກບັນຊີຮ້ານ: {storeInfo.bankAccount}</p>
                <p className="text-sky-700">{storeInfo.bankName}</p>
                <p className="text-slate-500">ຊື່ບັນຊີ: {storeInfo.accountHolder}</p>
              </div>
            )}

            {transaction.pointsEarned ? (
              <div className="flex justify-between text-emerald-600 font-medium pt-1">
                <span>ຄະແນນສະສົມທີ່ໄດ້ຮັບ:</span>
                <span>+{transaction.pointsEarned} ຄະແນນ</span>
              </div>
            ) : null}
          </div>

          {/* Barcode & Footer note */}
          <div className="pt-4 text-center space-y-2">
            <div className="flex justify-center">
              <BarcodeRenderer
                value={transaction.receiptNumber}
                width={1.2}
                height={32}
                displayValue={true}
              />
            </div>

            <p className="text-[11px] font-bold text-slate-700">
              ຂໍຂອບໃຈທີ່ມາອຸດໜູນ HS MINI MART
            </p>
            <p className="text-[10px] text-slate-400">
              ສິນຄ້າຊື້ແລ້ວ ສາມາດປ່ຽນຄືນໄດ້ພາຍໃນ 24 ຊົ່ວໂມງ ພ້ອມໃບຮັບເງິນ
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex space-x-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>ພິມໃບຮັບເງິນ (Print)</span>
          </button>
          <button
            onClick={onClose}
            className="bg-white hover:bg-slate-100 text-slate-700 font-medium py-2.5 px-5 rounded-xl border border-slate-300 transition-colors"
          >
            ປິດໜ້າຕ່າງ
          </button>
        </div>
      </div>
    </div>
  );
};
