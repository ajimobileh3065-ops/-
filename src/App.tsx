/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  CartItem,
  Customer,
  HeldBill,
  Product,
  Promotion,
  SaleTransaction,
  StoreInfo,
} from './types';
import {
  DEFAULT_CUSTOMERS,
  DEFAULT_PRODUCTS,
  DEFAULT_PROMOTIONS,
  DEFAULT_STORE_INFO,
  DEFAULT_TRANSACTIONS,
} from './data/defaultData';
import { Navbar } from './components/Navbar';
import { PosView } from './components/PosView';
import { InventoryView } from './components/InventoryView';
import { BarcodeGeneratorView } from './components/BarcodeGeneratorView';
import { ReportsView } from './components/ReportsView';
import { CustomersView } from './components/CustomersView';
import { SettingsView } from './components/SettingsView';
import { ReceiptModal } from './components/ReceiptModal';
import { HeldBillsModal } from './components/HeldBillsModal';
import { generateReceiptNumber } from './utils/formatters';
import { googleSignIn, initAuth, logout } from './services/firebaseAuth';
import { User } from 'firebase/auth';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');

  // Core Data States (persisted in localStorage)
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(() => {
    const saved = localStorage.getItem('hsm_store_info');
    return saved ? JSON.parse(saved) : DEFAULT_STORE_INFO;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('hsm_products');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('hsm_customers');
    return saved ? JSON.parse(saved) : DEFAULT_CUSTOMERS;
  });

  const [promotions, setPromotions] = useState<Promotion[]>(() => {
    const saved = localStorage.getItem('hsm_promotions');
    return saved ? JSON.parse(saved) : DEFAULT_PROMOTIONS;
  });

  const [transactions, setTransactions] = useState<SaleTransaction[]>(() => {
    const saved = localStorage.getItem('hsm_transactions');
    return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS;
  });

  const [heldBills, setHeldBills] = useState<HeldBill[]>(() => {
    const saved = localStorage.getItem('hsm_held_bills');
    return saved ? JSON.parse(saved) : [];
  });

  // Active POS Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('hsm_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

  // Modals & UI states
  const [activeReceipt, setActiveReceipt] = useState<SaleTransaction | null>(null);
  const [isHeldBillsOpen, setIsHeldBillsOpen] = useState(false);

  // Google Auth User
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Persist data whenever changed
  useEffect(() => {
    localStorage.setItem('hsm_store_info', JSON.stringify(storeInfo));
  }, [storeInfo]);

  useEffect(() => {
    localStorage.setItem('hsm_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('hsm_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('hsm_promotions', JSON.stringify(promotions));
  }, [promotions]);

  useEffect(() => {
    localStorage.setItem('hsm_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('hsm_held_bills', JSON.stringify(heldBills));
  }, [heldBills]);

  useEffect(() => {
    localStorage.setItem('hsm_cart', JSON.stringify(cart));
  }, [cart]);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setGoogleUser(user);
      },
      () => {
        setGoogleUser(null);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
      }
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      alert('ການເຂົ້າສູ່ລະບົບ Google ຜິດພາດ: ' + (err.message || 'ລອງໃໝ່ອີກຄັ້ງ'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await logout();
    setGoogleUser(null);
  };

  // Low stock counter
  const lowStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;

  // Complete Sale Logic
  const handleCompleteSale = (saleDetails: {
    paymentMethod: any;
    cashReceived: number;
    changeGiven: number;
    receiptType: 'simplified' | 'tax_invoice';
    pointsUsed: number;
  }) => {
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    // Calculate promotion discount
    let promoDiscount = 0;
    if (selectedPromotion && selectedPromotion.isActive && subtotal >= selectedPromotion.minSpend) {
      if (selectedPromotion.type === 'PERCENT_DISCOUNT') {
        promoDiscount = (subtotal * selectedPromotion.value) / 100;
      } else if (selectedPromotion.type === 'FIXED_DISCOUNT') {
        promoDiscount = selectedPromotion.value;
      }
    }

    const pointDiscount = (saleDetails.pointsUsed || 0) * 1000;
    const totalDiscount = promoDiscount + pointDiscount;
    const total = Math.max(0, subtotal - totalDiscount);
    const tax = saleDetails.receiptType === 'tax_invoice' ? Math.round(total * 0.07) : 0;

    // 10,000 Kip = 1 Point
    const pointsEarned = selectedCustomer ? Math.floor(total / 10000) : 0;

    const newTransaction: SaleTransaction = {
      id: `tx-${Date.now()}`,
      receiptNumber: generateReceiptNumber(),
      timestamp: new Date().toISOString(),
      items: [...cart],
      subtotal,
      discount: totalDiscount,
      tax,
      total,
      paymentMethod: saleDetails.paymentMethod,
      cashReceived: saleDetails.cashReceived,
      changeGiven: saleDetails.changeGiven,
      bankAccount: storeInfo.bankAccount,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      pointsEarned,
      pointsUsed: saleDetails.pointsUsed,
      cashierName: 'ນາງ ກັນຍາ',
      receiptType: saleDetails.receiptType,
      status: 'COMPLETED',
    };

    // 1. Auto-deduct stock for each item sold
    setProducts((prev) =>
      prev.map((p) => {
        const cartMatch = cart.find((item) => item.product.id === p.id);
        if (cartMatch) {
          return {
            ...p,
            stock: Math.max(0, p.stock - cartMatch.quantity),
          };
        }
        return p;
      })
    );

    // 2. Update customer points and total spent
    if (selectedCustomer) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === selectedCustomer.id) {
            const updatedPoints = Math.max(
              0,
              c.points - (saleDetails.pointsUsed || 0) + pointsEarned
            );
            const updatedSpent = c.totalSpent + total;
            const updatedTier =
              updatedSpent >= 3000000
                ? 'VIP'
                : updatedSpent >= 1000000
                ? 'Gold'
                : updatedSpent >= 500000
                ? 'Silver'
                : 'General';

            return {
              ...c,
              points: updatedPoints,
              totalSpent: updatedSpent,
              tier: updatedTier,
            };
          }
          return c;
        })
      );
    }

    // 3. Save transaction & open receipt
    setTransactions((prev) => [newTransaction, ...prev]);
    setActiveReceipt(newTransaction);

    // 4. Reset active cart
    setCart([]);
    setSelectedCustomer(null);
    setSelectedPromotion(null);
  };

  // Hold Bill Logic
  const handleHoldBill = (note: string) => {
    if (cart.length === 0) return;

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const newHeld: HeldBill = {
      id: `held-${Date.now()}`,
      customerName: selectedCustomer?.name,
      note,
      items: [...cart],
      savedAt: new Date().toISOString(),
      subtotal,
      discount: 0,
      total: subtotal,
      memberId: selectedCustomer?.id,
    };

    setHeldBills((prev) => [newHeld, ...prev]);
    setCart([]);
    setSelectedCustomer(null);
    setSelectedPromotion(null);
  };

  // Resume Held Bill Logic
  const handleResumeBill = (bill: HeldBill) => {
    setCart(bill.items);
    if (bill.memberId) {
      const match = customers.find((c) => c.id === bill.memberId) || null;
      setSelectedCustomer(match);
    }
    setHeldBills((prev) => prev.filter((b) => b.id !== bill.id));
    setIsHeldBillsOpen(false);
    setActiveTab('pos');
  };

  // Delete Held Bill
  const handleDeleteHeldBill = (id: string) => {
    if (window.confirm('ຕ້ອງການລຶບຄິວລໍຖ້ານີ້ແທ້ບໍ່?')) {
      setHeldBills((prev) => prev.filter((b) => b.id !== id));
    }
  };

  // Refund / Cancel sale transaction
  const handleRefundTransaction = (transactionId: string) => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx || tx.status === 'REFUNDED') return;

    // Restore stock
    setProducts((prev) =>
      prev.map((p) => {
        const itemMatch = tx.items.find((item) => item.product.id === p.id);
        if (itemMatch) {
          return { ...p, stock: p.stock + itemMatch.quantity };
        }
        return p;
      })
    );

    // Deduct points earned if member
    if (tx.customerId && tx.pointsEarned) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === tx.customerId) {
            return {
              ...c,
              points: Math.max(0, c.points - (tx.pointsEarned || 0)),
              totalSpent: Math.max(0, c.totalSpent - tx.total),
            };
          }
          return c;
        })
      );
    }

    // Mark as refunded
    setTransactions((prev) =>
      prev.map((t) => (t.id === transactionId ? { ...t, status: 'REFUNDED' } : t))
    );
  };

  // Reset to sample defaults
  const handleResetSampleData = () => {
    setStoreInfo(DEFAULT_STORE_INFO);
    setProducts(DEFAULT_PRODUCTS);
    setCustomers(DEFAULT_CUSTOMERS);
    setPromotions(DEFAULT_PROMOTIONS);
    setTransactions(DEFAULT_TRANSACTIONS);
    setHeldBills([]);
    setCart([]);
    localStorage.clear();
    alert('ຣີເຊັດຂໍ້ມູນກັບສູ່ຄ່າເລີ່ມຕົ້ນຮຽບຮ້ອຍແລ້ວ');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-sky-500 selection:text-white">
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        storeInfo={storeInfo}
        lowStockCount={lowStockCount}
        googleUser={googleUser}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
        isLoggingIn={isLoggingIn}
        heldBillsCount={heldBills.length}
        onOpenHeldBills={() => setIsHeldBillsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'pos' && (
          <PosView
            products={products}
            customers={customers}
            promotions={promotions}
            storeInfo={storeInfo}
            cart={cart}
            setCart={setCart}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            selectedPromotion={selectedPromotion}
            setSelectedPromotion={setSelectedPromotion}
            onHoldBill={handleHoldBill}
            onCompleteSale={handleCompleteSale}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            products={products}
            onAddProduct={(newProd) => setProducts((prev) => [newProd, ...prev])}
            onUpdateProduct={(updated) =>
              setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
            }
            onDeleteProduct={(id) => setProducts((prev) => prev.filter((p) => p.id !== id))}
            onAdjustStock={(productId, newStock) =>
              setProducts((prev) =>
                prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
              )
            }
          />
        )}

        {activeTab === 'barcode-tags' && (
          <BarcodeGeneratorView products={products} storeInfo={storeInfo} />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            transactions={transactions}
            products={products}
            storeInfo={storeInfo}
            googleUser={googleUser}
            onGoogleSignIn={handleGoogleSignIn}
            onViewReceipt={(tx) => setActiveReceipt(tx)}
            onRefundTransaction={handleRefundTransaction}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersView
            customers={customers}
            promotions={promotions}
            onAddCustomer={(newCust) => setCustomers((prev) => [newCust, ...prev])}
            onUpdateCustomer={(updated) =>
              setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
            }
            onDeleteCustomer={(id) => setCustomers((prev) => prev.filter((c) => c.id !== id))}
            onAddPromotion={(newPromo) => setPromotions((prev) => [newPromo, ...prev])}
            onTogglePromotion={(id) =>
              setPromotions((prev) =>
                prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
              )
            }
            onDeletePromotion={(id) => setPromotions((prev) => prev.filter((p) => p.id !== id))}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            storeInfo={storeInfo}
            onUpdateStoreInfo={(info) => setStoreInfo(info)}
            onResetSampleData={handleResetSampleData}
          />
        )}
      </main>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(activeReceipt)}
        transaction={activeReceipt}
        storeInfo={storeInfo}
        onClose={() => setActiveReceipt(null)}
        onToggleReceiptType={(newType) => {
          if (activeReceipt) {
            setActiveReceipt({ ...activeReceipt, receiptType: newType });
          }
        }}
      />

      {/* Held Bills Queue Modal */}
      <HeldBillsModal
        isOpen={isHeldBillsOpen}
        onClose={() => setIsHeldBillsOpen(false)}
        heldBills={heldBills}
        onResumeBill={handleResumeBill}
        onDeleteBill={handleDeleteHeldBill}
      />
    </div>
  );
}
