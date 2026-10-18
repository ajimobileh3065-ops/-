import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Tag,
  Plus,
  Search,
  Award,
  Phone,
  Calendar,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';
import { Customer, Promotion } from '../types';
import { formatKip, formatNumber } from '../utils/formatters';

interface CustomersViewProps {
  customers: Customer[];
  promotions: Promotion[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onAddPromotion: (promo: Promotion) => void;
  onTogglePromotion: (id: string) => void;
  onDeletePromotion: (id: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  promotions,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onAddPromotion,
  onTogglePromotion,
  onDeletePromotion,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'members' | 'promotions'>('members');
  const [searchQuery, setSearchQuery] = useState('');

  // Customer Modal
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    points: 10,
    notes: '',
  });

  // Promo Modal
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoForm, setPromoForm] = useState<Partial<Promotion>>({
    title: '',
    description: '',
    type: 'PERCENT_DISCOUNT',
    value: 5,
    minSpend: 50000,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-12-31',
    isActive: true,
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const handleOpenAddCustomer = () => {
    setEditingCustomer(null);
    setCustomerForm({
      name: '',
      phone: '',
      points: 10,
      notes: '',
    });
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name || !customerForm.phone) {
      alert('ກະລຸນາປ້ອນຊື່ ແລະ ເບີໂທ');
      return;
    }

    if (editingCustomer) {
      onUpdateCustomer({
        ...editingCustomer,
        name: customerForm.name!,
        phone: customerForm.phone!,
        points: Number(customerForm.points) || 0,
        notes: customerForm.notes,
      });
    } else {
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        name: customerForm.name!,
        phone: customerForm.phone!,
        points: Number(customerForm.points) || 10,
        totalSpent: 0,
        tier: 'General',
        registeredDate: new Date().toISOString().split('T')[0],
        notes: customerForm.notes,
      };
      onAddCustomer(newCust);
    }
    setIsCustomerModalOpen(false);
  };

  const handleSavePromotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoForm.title) return;

    const newPromo: Promotion = {
      id: `promo-${Date.now()}`,
      title: promoForm.title!,
      description: promoForm.description || '',
      type: promoForm.type || 'PERCENT_DISCOUNT',
      value: Number(promoForm.value) || 5,
      minSpend: Number(promoForm.minSpend) || 0,
      startDate: promoForm.startDate || new Date().toISOString().split('T')[0],
      endDate: promoForm.endDate || '2026-12-31',
      isActive: true,
    };
    onAddPromotion(newPromo);
    setIsPromoModalOpen(false);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 bg-slate-100 overflow-y-auto">
      {/* Top Bar Switch */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              ລະບົບສະມາຊິກ & ໂປຣໂມຊັນ (CRM & Promotions)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ສະສົມຄະແນນ, ມອບສິດທິພິເສດລູກຄ້າ ແລະ ຈັດການແຄມເປນສ່ວນຫຼຸດ
          </p>
        </div>

        {/* Sub-tab Pill */}
        <div className="inline-flex rounded-2xl border border-slate-200 p-1 bg-slate-50">
          <button
            onClick={() => setActiveSubTab('members')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5 ${
              activeSubTab === 'members'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>ຖານຂໍ້ມູນສະມາຊິກ ({customers.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('promotions')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5 ${
              activeSubTab === 'promotions'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>ໂປຣໂມຊັນ ({promotions.length})</span>
          </button>
        </div>
      </div>

      {/* Members Section */}
      {activeSubTab === 'members' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ຄົ້ນຫາຊື່ສະມາຊິກ ຫຼື ເບີໂທ..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              onClick={handleOpenAddCustomer}
              className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>ລົງທະບຽນສະມາຊິກໃໝ່</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-3 px-4">ຊື່ ແລະ ນາມສະກຸນ</th>
                    <th className="py-3 px-4">ເບີໂທລະສັບ</th>
                    <th className="py-3 px-4 text-center">ລະດັບ (Tier)</th>
                    <th className="py-3 px-4 text-center">ຄະແນນສະສົມ</th>
                    <th className="py-3 px-4 text-right">ຍອດຊື້ສະສົມ (₭)</th>
                    <th className="py-3 px-4">ໝາຍເຫດ</th>
                    <th className="py-3 px-4 text-center">ຈັດການ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        ບໍ່ພົບລາຍຊື່ສະມາຊິກ
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{c.phone}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              c.tier === 'VIP'
                                ? 'bg-purple-100 text-purple-800'
                                : c.tier === 'Gold'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {c.tier}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-black text-emerald-600 text-sm">
                          {formatNumber(c.points)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatKip(c.totalSpent)}
                        </td>
                        <td className="py-3 px-4 text-slate-400 truncate max-w-xs">
                          {c.notes || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => {
                                setEditingCustomer(c);
                                setCustomerForm({ ...c });
                                setIsCustomerModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`ຕ້ອງການລຶບສະມາຊິກ "${c.name}" ແທ້ບໍ່?`)) {
                                  onDeleteCustomer(c.id);
                                }
                              }}
                              className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Promotions Section */}
      {activeSubTab === 'promotions' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex justify-between items-center">
            <p className="text-xs text-slate-500">
              ໂປຣໂມຊັນທີ່ເປີດໃຊ້ຈະສະແດງໃຫ້ເລືອກອັດຕະໂນມັດໃນໜ້າຈຸດຂາຍ (POS)
            </p>
            <button
              onClick={() => setIsPromoModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>ສ້າງໂປຣໂມຊັນໃໝ່</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promotions.map((p) => (
              <div
                key={p.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {p.isActive ? 'ກຳລັງເປີດໃຊ້' : 'ປິດໃຊ້ງານ'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{p.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>
                  </div>
                  <span className="text-xl font-black text-emerald-600">
                    {p.type === 'PERCENT_DISCOUNT' ? `-${p.value}%` : `-${formatKip(p.value)}`}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                  <span>ຍອດຂັ້ນຕໍ່າ: {formatKip(p.minSpend)}</span>
                  <span>ໝົດກຳນົດ: {p.endDate}</span>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-1">
                  <button
                    onClick={() => onTogglePromotion(p.id)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      p.isActive
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {p.isActive ? 'ປິດໂປຣໂມຊັນ' : 'ເປີດໃຊ້ງານ'}
                  </button>
                  <button
                    onClick={() => onDeletePromotion(p.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-base text-slate-800">
                {editingCustomer ? 'ແກ້ໄຂຂໍ້ມູນສະມາຊິກ' : 'ລົງທະບຽນສະມາຊິກໃໝ່'}
              </h3>
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ຊື່ ແລະ ນາມສະກຸນ *
                </label>
                <input
                  type="text"
                  required
                  value={customerForm.name || ''}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  placeholder="ເຊັ່ນ: ທ້າວ ສົມພອນ..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ເບີໂທລະສັບ (ໃຊ້ສະສົມຄະແນນ) *
                </label>
                <input
                  type="text"
                  required
                  value={customerForm.phone || ''}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  placeholder="020 XXXXXXXX"
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ຄະແນນເລີ່ມຕົ້ນ
                </label>
                <input
                  type="number"
                  value={customerForm.points || 0}
                  onChange={(e) =>
                    setCustomerForm({
                      ...customerForm,
                      points: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">ໝາຍເຫດ</label>
                <textarea
                  value={customerForm.notes || ''}
                  onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                  placeholder="ເຊັ່ນ: ລູກຄ້າປະຈຳ..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl resize-none"
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs"
                >
                  ບັນທຶກ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Promotion Modal */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-base text-slate-800">ສ້າງໂປຣໂມຊັນໃໝ່</h3>
              <button
                onClick={() => setIsPromoModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePromotion} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ຊື່ໂປຣໂມຊັນ *
                </label>
                <input
                  type="text"
                  required
                  value={promoForm.title || ''}
                  onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                  placeholder="ເຊັ່ນ: ສ່ວນຫຼຸດພິເສດ 5%..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ລາຍລະອຽດເງື່ອນໄຂ
                </label>
                <input
                  type="text"
                  value={promoForm.description || ''}
                  onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                  placeholder="ເຊັ່ນ: ຊື້ຄົບ 100,000 ກີບ..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ປະເພດສ່ວນຫຼຸດ
                  </label>
                  <select
                    value={promoForm.type}
                    onChange={(e) =>
                      setPromoForm({ ...promoForm, type: e.target.value as any })
                    }
                    className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="PERCENT_DISCOUNT">ຫຼຸດເປັນເປີເຊັນ (%)</option>
                    <option value="FIXED_DISCOUNT">ຫຼຸດເປັນເງິນສົດ (₭)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ມູນຄ່າສ່ວນຫຼຸດ
                  </label>
                  <input
                    type="number"
                    value={promoForm.value || 0}
                    onChange={(e) =>
                      setPromoForm({ ...promoForm, value: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ຍອດຊື້ຂັ້ນຕໍ່າ (₭)
                </label>
                <input
                  type="number"
                  value={promoForm.minSpend || 0}
                  onChange={(e) =>
                    setPromoForm({ ...promoForm, minSpend: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  ບັນທຶກໂປຣໂມຊັນ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
