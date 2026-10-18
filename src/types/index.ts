export interface StoreInfo {
  name: string;
  ownerName: string;
  phone1: string;
  phone2: string;
  email: string;
  village: string;
  district: string;
  province: string;
  fullAddress: string;
  bankAccount: string;
  bankName: string;
  accountHolder: string;
  taxNumber: string;
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  nameEn?: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  minStockAlert: number;
  unit: string;
  imageUrl: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discountPerUnit?: number; // Discount in Kip per unit
  note?: string;
}

export interface HeldBill {
  id: string;
  customerName?: string;
  note?: string;
  items: CartItem[];
  savedAt: string;
  subtotal: number;
  discount: number;
  total: number;
  memberId?: string;
}

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CARD';

export interface SaleTransaction {
  id: string;
  receiptNumber: string;
  timestamp: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  changeGiven?: number;
  bankAccount?: string;
  customerId?: string;
  customerName?: string;
  pointsEarned?: number;
  pointsUsed?: number;
  cashierName: string;
  receiptType: 'simplified' | 'tax_invoice';
  status: 'COMPLETED' | 'REFUNDED';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  points: number;
  totalSpent: number;
  tier: 'General' | 'Silver' | 'Gold' | 'VIP';
  registeredDate: string;
  notes?: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  type: 'PERCENT_DISCOUNT' | 'FIXED_DISCOUNT' | 'POINTS_MULTIPLIER';
  value: number; // e.g., 10 for 10%, or 5000 for 5,000 Kip discount
  minSpend: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export type ActiveTab = 'pos' | 'inventory' | 'barcode-tags' | 'reports' | 'customers' | 'settings';
