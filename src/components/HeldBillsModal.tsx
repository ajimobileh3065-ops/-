import React from 'react';
import { HeldBill } from '../types';
import { formatDateTime, formatKip } from '../utils/formatters';
import { PauseCircle, Play, Trash2, X, Clock, ShoppingCart } from 'lucide-react';

interface HeldBillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  heldBills: HeldBill[];
  onResumeBill: (bill: HeldBill) => void;
  onDeleteBill: (id: string) => void;
}

export const HeldBillsModal: React.FC<HeldBillsModalProps> = ({
  isOpen,
  onClose,
  heldBills,
  onResumeBill,
  onDeleteBill,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-amber-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PauseCircle className="w-6 h-6" />
            <div>
              <h3 className="font-bold text-lg">ລາຍການພັກບິນ / ຄິວລໍຖ້າ (Held Bills)</h3>
              <p className="text-xs text-amber-100">
                ລວມທັງໝົດ {heldBills.length} ລາຍການທີ່ກຳລັງລໍຖ້າຊຳລະ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content List */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          {heldBills.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="font-medium text-sm">ບໍ່ມີລາຍການທີ່ພັກໄວ້ໃນຂະນະນີ້</p>
              <p className="text-xs text-slate-400 mt-1">
                ທ່ານສາມາດກົດ &quot;ພັກບິນ (Hold)&quot; ຢູ່ໜ້າ POS ເພື່ອຈັດຄິວລູກຄ້າໄດ້
              </p>
            </div>
          ) : (
            heldBills.map((bill) => (
              <div
                key={bill.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-amber-400 bg-amber-50/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-800">
                      {bill.customerName || 'ລູກຄ້າທົ່ວໄປ'}
                    </span>
                    {bill.note && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                        {bill.note}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDateTime(bill.savedAt)}</span>
                    </span>
                    <span>•</span>
                    <span>{bill.items.length} ລາຍການ</span>
                  </div>
                  <p className="text-sm font-extrabold text-emerald-600">
                    {formatKip(bill.total)}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onResumeBill(bill)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>ສືບຕໍ່ຂາຍ</span>
                  </button>
                  <button
                    onClick={() => onDeleteBill(bill.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-200"
                    title="ລຶບຄິວນີ້"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-xl transition-colors"
          >
            ປິດ
          </button>
        </div>
      </div>
    </div>
  );
};
