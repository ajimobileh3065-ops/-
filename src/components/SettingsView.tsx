import React, { useState } from 'react';
import {
  Store,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Save,
  RotateCcw,
  Volume2,
  Printer,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { StoreInfo } from '../types';
import { playBeep, playSuccessChime } from '../utils/formatters';

interface SettingsViewProps {
  storeInfo: StoreInfo;
  onUpdateStoreInfo: (info: StoreInfo) => void;
  onResetSampleData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  storeInfo,
  onUpdateStoreInfo,
  onResetSampleData,
}) => {
  const [formData, setFormData] = useState<StoreInfo>({ ...storeInfo });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStoreInfo(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestSound = () => {
    playSuccessChime();
  };

  return (
    <div className="flex-1 p-4 sm:p-6 bg-slate-100 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              ຕັ້ງຄ່າຂໍ້ມູນຮ້ານຄ້າ & ລະບົບ (Store Settings)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              ຈັດການຂໍ້ມູນຮ້ານ HS MINI MART, ທີ່ຢູ່, ເບີໂທລະສັບ ແລະ ບັນຊີທະນາຄານ
            </p>
          </div>
          {savedSuccess && (
            <div className="flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold animate-in fade-in">
              <CheckCircle className="w-4 h-4" />
              <span>ບັນທຶກສຳເລັດແລ້ວ</span>
            </div>
          )}
        </div>

        {/* Store Info Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center space-x-2">
            <Store className="w-4 h-4 text-sky-600" />
            <span>ຂໍ້ມູນທົ່ວໄປຂອງຮ້ານຄ້າ (Store Profile)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ຊື່ຮ້ານຄ້າ (Store Name) *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ຊື່ເຈົ້າຂອງຮ້ານ / ຫົວບິນ *
              </label>
              <input
                type="text"
                required
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ເບີໂທລະສັບຫຼັກ 1 *
              </label>
              <input
                type="text"
                required
                value={formData.phone1}
                onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
                className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ເບີໂທລະສັບ 2 (ສຳຮອງ)
              </label>
              <input
                type="text"
                value={formData.phone2}
                onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Email ຮ້ານຄ້າ
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              ທີ່ຕັ້ງຮ້ານ (ໂລເຄເຊີນ) *
            </label>
            <input
              type="text"
              required
              value={formData.fullAddress}
              onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
              placeholder="ບ້ານໂນນເດື່ອ, ເມືອງເລົ່າງາມ, ແຂວງສາລະວັນ"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pt-3 pb-3 flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>ຂໍ້ມູນບັນຊີທະນາຄານສຳລັບຮັບເງິນໂອນ (BCEL One)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ເລກບັນຊີທະນາຄານ (Account Number) *
              </label>
              <input
                type="text"
                required
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                className="w-full text-xs font-mono font-bold text-sky-800 px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ຊື່ທະນາຄານ
              </label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl flex items-center space-x-2 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>ບັນທຶກການຕັ້ງຄ່າ</span>
            </button>
          </div>
        </form>

        {/* System & Hardware Tools */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
            ເຄື່ອງມືທົດສອບລະບົບ & ສຽງ
          </h3>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleTestSound}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center space-x-2 transition-colors"
            >
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <span>ທົດສອບສຽງປີ໊ບ/ສຽງຄິດໄລ່ເງິນ</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('ຕ້ອງການຣີເຊັດຂໍ້ມູນກັບສູ່ຄ່າເລີ່ມຕົ້ນ (Default Data) ແທ້ບໍ່?')) {
                  onResetSampleData();
                }
              }}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl flex items-center space-x-2 transition-colors border border-red-200"
            >
              <RotateCcw className="w-4 h-4 text-red-500" />
              <span>ຣີເຊັດຂໍ້ມູນຕົວຢ່າງ (Restore Defaults)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
