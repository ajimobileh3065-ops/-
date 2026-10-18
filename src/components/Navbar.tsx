import React from 'react';
import {
  Store,
  ShoppingCart,
  Boxes,
  Barcode,
  BarChart3,
  Users,
  Settings,
  Bell,
  MapPin,
  Phone,
  FileSpreadsheet,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { ActiveTab, StoreInfo } from '../types';
import { User } from 'firebase/auth';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  storeInfo: StoreInfo;
  lowStockCount: number;
  googleUser: User | null;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  isLoggingIn: boolean;
  heldBillsCount: number;
  onOpenHeldBills: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  storeInfo,
  lowStockCount,
  googleUser,
  onGoogleSignIn,
  onGoogleSignOut,
  isLoggingIn,
  heldBillsCount,
  onOpenHeldBills,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top micro bar for store contact info */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-emerald-600 text-white text-[11px] py-1 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3 overflow-x-auto">
          <div className="flex items-center space-x-1 font-medium">
            <Store className="w-3.5 h-3.5 text-sky-200" />
            <span className="font-bold">{storeInfo.name}</span>
            <span className="text-white/80">({storeInfo.ownerName})</span>
          </div>
          <span className="text-white/40 hidden sm:inline">•</span>
          <div className="hidden sm:flex items-center space-x-1 text-white/90">
            <MapPin className="w-3 h-3 text-emerald-300" />
            <span>{storeInfo.fullAddress}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 ml-auto text-white/90">
          <div className="flex items-center space-x-1">
            <Phone className="w-3 h-3 text-emerald-300" />
            <span>{storeInfo.phone1} / {storeInfo.phone2}</span>
          </div>
          <span className="text-white/40 hidden md:inline">•</span>
          <span className="hidden md:inline text-sky-100">
            BCEL One: <strong className="font-mono text-white">{storeInfo.bankAccount}</strong>
          </span>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-emerald-500 p-0.5 shadow-sm flex items-center justify-center text-white">
            <div className="w-full h-full bg-white/10 rounded-[14px] flex items-center justify-center font-black text-lg tracking-tighter">
              HS
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">
                HS MINI MART
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                POS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              ລະບົບຈຸດຂາຍ & ຈັດການສິນຄ້າຄົບວົງຈອນ
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pos'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>ຈຸດຂາຍ (POS)</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'inventory'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>ສາງສິນຄ້າ (Stock)</span>
            {lowStockCount > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                {lowStockCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('barcode-tags')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'barcode-tags'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Barcode className="w-4 h-4" />
            <span>ປ້າຍລາຄາ & ບາໂຄດ</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'reports'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>ລາຍງານ & Sheets</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'customers'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>ສະມາຊິກ (CRM)</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>ຕັ້ງຄ່າຮ້ານ</span>
          </button>
        </nav>

        {/* Right Action Icons & Google Auth */}
        <div className="flex items-center space-x-2">
          {/* Held Bills button indicator */}
          <button
            onClick={onOpenHeldBills}
            className={`relative p-2 rounded-xl border transition-colors flex items-center space-x-1 ${
              heldBillsCount > 0
                ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                : 'border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title="ລາຍການພັກບິນ"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="text-xs font-bold hidden sm:inline">ພັກບິນ</span>
            {heldBillsCount > 0 && (
              <span className="bg-amber-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                {heldBillsCount}
              </span>
            )}
          </button>

          {/* Google Sheets / Auth state */}
          {googleUser ? (
            <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 py-1 px-2.5 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center overflow-hidden">
                {googleUser.photoURL ? (
                  <img src={googleUser.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[11px] font-bold text-emerald-900 truncate max-w-[100px]">
                  {googleUser.displayName || 'Google User'}
                </p>
                <p className="text-[9px] text-emerald-700 flex items-center space-x-1">
                  <FileSpreadsheet className="w-2.5 h-2.5" />
                  <span>Sheets ພ້ອມໃຊ້</span>
                </p>
              </div>
              <button
                onClick={onGoogleSignOut}
                className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white"
                title="ອອກຈາກລະບົບ Google"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onGoogleSignIn}
              disabled={isLoggingIn}
              className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs py-1.5 px-3 rounded-xl border border-slate-300 shadow-2xs flex items-center space-x-2 transition-colors"
              title="ເຊື່ອມຕໍ່ Google Sheets"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span className="hidden sm:inline">
                {isLoggingIn ? 'ກຳລັງເຂົ້າລະບົບ...' : 'Google Sheets'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile navigation tab scrollbar */}
      <div className="lg:hidden flex items-center space-x-1 px-4 py-1.5 overflow-x-auto border-t border-slate-100 bg-slate-50">
        <button
          onClick={() => setActiveTab('pos')}
          className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
            activeTab === 'pos' ? 'bg-sky-600 text-white' : 'text-slate-600'
          }`}
        >
          ຈຸດຂາຍ (POS)
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
            activeTab === 'inventory' ? 'bg-sky-600 text-white' : 'text-slate-600'
          }`}
        >
          ສາງສິນຄ້າ ({lowStockCount})
        </button>
        <button
          onClick={() => setActiveTab('barcode-tags')}
          className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
            activeTab === 'barcode-tags' ? 'bg-sky-600 text-white' : 'text-slate-600'
          }`}
        >
          ປ້າຍລາຄາ & ບາໂຄດ
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
            activeTab === 'reports' ? 'bg-sky-600 text-white' : 'text-slate-600'
          }`}
        >
          ລາຍງານ
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
            activeTab === 'customers' ? 'bg-sky-600 text-white' : 'text-slate-600'
          }`}
        >
          ສະມາຊິກ
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
            activeTab === 'settings' ? 'bg-sky-600 text-white' : 'text-slate-600'
          }`}
        >
          ຕັ້ງຄ່າ
        </button>
      </div>
    </header>
  );
};
