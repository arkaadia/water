import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AuditLog,
  Category,
  Customer,
  CustomerLedgerEntry,
  DeliveryZone,
  Driver,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  UserRole,
  Visitor,
  WarehouseTransaction
} from '../types';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_CATEGORIES,
  INITIAL_CUSTOMERS,
  INITIAL_DELIVERY_ZONES,
  INITIAL_DRIVERS,
  INITIAL_LEDGER,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  INITIAL_VISITORS
} from '../data/initialData';

export interface CartItem {
  product: Product;
  quantityBoxes: number;
}

interface AppContextType {
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  currentCustomer: Customer | null;
  setCurrentCustomer: (c: Customer | null) => void;
  currentVisitor: Visitor | null;
  setCurrentVisitor: (v: Visitor | null) => void;
  
  products: Product[];
  categories: Category[];
  customers: Customer[];
  visitors: Visitor[];
  orders: Order[];
  warehouseTransactions: WarehouseTransaction[];
  ledgerEntries: CustomerLedgerEntry[];
  deliveryZones: DeliveryZone[];
  drivers: Driver[];
  auditLogs: AuditLog[];
  cart: CartItem[];
  
  selectedInvoiceOrder: Order | null;
  setSelectedInvoiceOrder: (order: Order | null) => void;
  
  dedicatedCustomerCode: string | null;
  setDedicatedCustomerCode: (code: string | null) => void;

  // Cart operations
  addToCart: (productId: string, quantityBoxes?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantityBoxes: number) => void;
  clearCart: () => void;
  getEffectivePrice: (product: Product, quantityBoxes: number) => { unitPrice: number; discountPerBox: number };
  
  // Order actions
  placeOrder: (params: {
    customerId: string;
    deliveryZone: string;
    deliveryAddress: string;
    paymentMethod: 'cash' | 'card' | 'online' | 'cheque' | 'credit';
    notes?: string;
    createdByType: 'customer' | 'visitor' | 'admin';
    itemsOverride?: CartItem[];
  }) => Order | null;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, note?: string) => void;
  assignDriverToOrder: (orderId: string, driverId: string) => void;
  
  // Warehouse actions
  recordWarehouseTransaction: (params: {
    type: 'inbound' | 'outbound' | 'damaged' | 'returned' | 'reconciliation';
    productId: string;
    quantityBoxes: number;
    referenceNo: string;
    notes?: string;
  }) => void;

  // Accounting actions
  recordLedgerPayment: (params: {
    customerId: string;
    type: 'cash' | 'card' | 'online' | 'cheque';
    amount: number;
    referenceId: string;
    chequeNumber?: string;
    chequeDueDate?: string;
    notes?: string;
  }) => void;

  // Product & Category actions
  addProduct: (product: Omit<Product, 'id' | 'sku'> & { sku?: string }) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  addCategory: (category: Category) => void;

  // Customer actions
  addCustomer: (customerData: Omit<Customer, 'id' | 'currentBalance' | 'totalPurchases' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  
  // Settings & Utilities
  updateDeliveryZone: (id: string, updates: Partial<DeliveryZone>) => void;
  exportToCsv: (rows: Record<string, any>[], filename: string) => void;
  resetAllData: () => void;
  switchRole: (role: UserRole, targetId?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'gowarano_products_v1',
  CATEGORIES: 'gowarano_categories_v1',
  CUSTOMERS: 'gowarano_customers_v1',
  VISITORS: 'gowarano_visitors_v1',
  ORDERS: 'gowarano_orders_v1',
  TRANSACTIONS: 'gowarano_transactions_v1',
  LEDGER: 'gowarano_ledger_v1',
  ZONES: 'gowarano_zones_v1',
  DRIVERS: 'gowarano_drivers_v1',
  LOGS: 'gowarano_logs_v1',
  ROLE: 'gowarano_role_v1',
  CURRENT_CUS: 'gowarano_current_cus_v1',
  CURRENT_SAL: 'gowarano_current_sal_v1',
};

function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Storage read error for key:', key, e);
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write error for key:', key, e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => getStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS));
  const [categories, setCategories] = useState<Category[]>(() => getStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES));
  const [customers, setCustomers] = useState<Customer[]>(() => getStorage(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS));
  const [visitors, setVisitors] = useState<Visitor[]>(() => getStorage(STORAGE_KEYS.VISITORS, INITIAL_VISITORS));
  const [orders, setOrders] = useState<Order[]>(() => getStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS));
  const [warehouseTransactions, setWarehouseTransactions] = useState<WarehouseTransaction[]>(() => getStorage(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS));
  const [ledgerEntries, setLedgerEntries] = useState<CustomerLedgerEntry[]>(() => getStorage(STORAGE_KEYS.LEDGER, INITIAL_LEDGER));
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(() => getStorage(STORAGE_KEYS.ZONES, INITIAL_DELIVERY_ZONES));
  const [drivers, setDrivers] = useState<Driver[]>(() => getStorage(STORAGE_KEYS.DRIVERS, INITIAL_DRIVERS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getStorage(STORAGE_KEYS.LOGS, INITIAL_AUDIT_LOGS));

  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => getStorage(STORAGE_KEYS.ROLE, 'public'));
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(() => {
    const saved = getStorage<Customer | null>(STORAGE_KEYS.CURRENT_CUS, null);
    return saved || INITIAL_CUSTOMERS[0];
  });
  const [currentVisitor, setCurrentVisitor] = useState<Visitor | null>(() => {
    const saved = getStorage<Visitor | null>(STORAGE_KEYS.CURRENT_SAL, null);
    return saved || INITIAL_VISITORS[0];
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [dedicatedCustomerCode, setDedicatedCustomerCode] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => setStorage(STORAGE_KEYS.PRODUCTS, products), [products]);
  useEffect(() => setStorage(STORAGE_KEYS.CATEGORIES, categories), [categories]);
  useEffect(() => setStorage(STORAGE_KEYS.CUSTOMERS, customers), [customers]);
  useEffect(() => setStorage(STORAGE_KEYS.VISITORS, visitors), [visitors]);
  useEffect(() => setStorage(STORAGE_KEYS.ORDERS, orders), [orders]);
  useEffect(() => setStorage(STORAGE_KEYS.TRANSACTIONS, warehouseTransactions), [warehouseTransactions]);
  useEffect(() => setStorage(STORAGE_KEYS.LEDGER, ledgerEntries), [ledgerEntries]);
  useEffect(() => setStorage(STORAGE_KEYS.ZONES, deliveryZones), [deliveryZones]);
  useEffect(() => setStorage(STORAGE_KEYS.DRIVERS, drivers), [drivers]);
  useEffect(() => setStorage(STORAGE_KEYS.LOGS, auditLogs), [auditLogs]);
  useEffect(() => setStorage(STORAGE_KEYS.ROLE, currentUserRole), [currentUserRole]);
  useEffect(() => setStorage(STORAGE_KEYS.CURRENT_CUS, currentCustomer), [currentCustomer]);
  useEffect(() => setStorage(STORAGE_KEYS.CURRENT_SAL, currentVisitor), [currentVisitor]);

  const addAuditLog = (action: string, details: string) => {
    let userName = 'کاربر عمومی';
    if (currentUserRole === 'admin') userName = 'مدیر ارشد';
    else if (currentUserRole === 'visitor') userName = currentVisitor ? `ویزیتور ${currentVisitor.name}` : 'ویزیتور';
    else if (currentUserRole === 'customer') userName = currentCustomer ? `${currentCustomer.storeName}` : 'مشتری';
    else if (currentUserRole === 'warehouse') userName = 'مسئول انبار';
    else if (currentUserRole === 'delivery') userName = 'واحد توزیع و لجستیک';
    else if (currentUserRole === 'accounting') userName = 'واحد مالی و حسابداری';

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      role: currentUserRole,
      userName,
      action,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const getEffectivePrice = (product: Product, quantityBoxes: number) => {
    let effective = product.wholesalePricePerBox;
    let base = product.basePricePerBox;

    // Check tiers (sorted descending by minQtyBoxes)
    const sortedTiers = [...(product.tiers || [])].sort((a, b) => b.minQtyBoxes - a.minQtyBoxes);
    for (const tier of sortedTiers) {
      if (quantityBoxes >= tier.minQtyBoxes) {
        effective = tier.pricePerBox;
        break;
      }
    }

    const discountPerBox = Math.max(0, base - effective);
    return { unitPrice: effective, discountPerBox };
  };

  const addToCart = (productId: string, quantityBoxes: number = 1) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const initialQty = Math.max(product.minOrderQtyBoxes || 1, quantityBoxes);

    setCart(prev => {
      const existing = prev.find(item => item.product.id === productId);
      if (existing) {
        return prev.map(item =>
          item.product.id === productId
            ? { ...item, quantityBoxes: item.quantityBoxes + quantityBoxes }
            : item
        );
      }
      return [...prev, { product, quantityBoxes: initialQty }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantityBoxes: number) => {
    if (quantityBoxes <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantityBoxes } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const placeOrder = ({
    customerId,
    deliveryZone,
    deliveryAddress,
    paymentMethod,
    notes,
    createdByType,
    itemsOverride
  }: {
    customerId: string;
    deliveryZone: string;
    deliveryAddress: string;
    paymentMethod: 'cash' | 'card' | 'online' | 'cheque' | 'credit';
    notes?: string;
    createdByType: 'customer' | 'visitor' | 'admin';
    itemsOverride?: CartItem[];
  }): Order | null => {
    const targetItems = itemsOverride || cart;
    if (targetItems.length === 0) return null;

    const customer = customers.find(c => c.id === customerId) || currentCustomer;
    if (!customer) return null;

    // Automatic visitor linking (Section 8 of brief)
    const visitor = visitors.find(v => v.id === customer.assignedVisitorId) || visitors[0];

    const orderItems: OrderItem[] = targetItems.map(item => {
      const { unitPrice, discountPerBox } = getEffectivePrice(item.product, item.quantityBoxes);
      const totalPrice = unitPrice * item.quantityBoxes;
      const commissionPerBox = item.product.commissionPerBox || 5000;

      return {
        productId: item.product.id,
        productName: item.product.name,
        brand: item.product.brand,
        volume: item.product.volume,
        unitsPerBox: item.product.unitsPerBox,
        quantityBoxes: item.quantityBoxes,
        unitPricePerBox: unitPrice,
        totalPrice,
        discountPerBox,
        finalPrice: totalPrice,
        commissionPerBox
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const tierDiscount = orderItems.reduce((sum, item) => sum + (item.discountPerBox * item.quantityBoxes), 0);
    const totalBoxes = orderItems.reduce((sum, item) => sum + item.quantityBoxes, 0);
    const totalVisitorCommission = orderItems.reduce((sum, item) => sum + (item.commissionPerBox * item.quantityBoxes), 0);

    const zoneObj = deliveryZones.find(z => z.name === deliveryZone || z.id === deliveryZone);
    const shippingCost = zoneObj && subtotal >= zoneObj.freeShippingMinOrder ? 0 : (zoneObj?.shippingFee || 0);
    const totalAmount = subtotal + shippingCost;

    const newOrderNumber = `ORD-1403-${String(orders.length + 101).padStart(4, '0')}`;
    const invoiceId = `INV-1403-${String(orders.length + 1001).padStart(4, '0')}`;
    const nowPersian = new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: newOrderNumber,
      customerId: customer.id,
      customerName: customer.storeName,
      customerCode: customer.id,
      customerPhone: customer.phone,
      visitorId: visitor ? visitor.id : 'SAL-0001',
      visitorName: visitor ? visitor.name : 'ویزیتور مرکزی',
      createdByType,
      items: orderItems,
      subtotal,
      tierDiscount,
      shippingCost,
      totalAmount,
      totalBoxes,
      totalVisitorCommission,
      paymentMethod,
      paymentStatus: paymentMethod === 'online' ? 'paid' : paymentMethod === 'credit' ? 'unpaid' : 'partial',
      paidAmount: paymentMethod === 'online' ? totalAmount : 0,
      status: 'registered',
      statusHistory: [
        {
          status: 'registered',
          timestamp: nowPersian,
          note: `ثبت سفارش توسط ${createdByType === 'customer' ? 'مشتری' : createdByType === 'visitor' ? 'ویزیتور' : 'مدیریت'}`,
          byRole: createdByType
        }
      ],
      deliveryZone,
      deliveryAddress,
      notes,
      createdAt: nowPersian,
      invoiceId
    };

    // 1. Reserve stock in warehouse
    setProducts(prevProducts =>
      prevProducts.map(p => {
        const item = orderItems.find(oi => oi.productId === p.id);
        if (item) {
          return {
            ...p,
            reservedStock: p.reservedStock + item.quantityBoxes
          };
        }
        return p;
      })
    );

    // 2. Update visitor monthly and daily sales + commission automatically
    if (visitor) {
      setVisitors(prevVisitors =>
        prevVisitors.map(v =>
          v.id === visitor.id
            ? {
                ...v,
                todaySales: v.todaySales + totalAmount,
                currentMonthSales: v.currentMonthSales + totalAmount,
                totalOrdersCount: v.totalOrdersCount + 1,
                totalCommissionEarned: v.totalCommissionEarned + totalVisitorCommission
              }
            : v
        )
      );
    }

    // 3. Update customer stats
    const updatedCustomerBalance = customer.currentBalance + (paymentMethod === 'online' ? 0 : totalAmount);
    setCustomers(prevCustomers =>
      prevCustomers.map(c =>
        c.id === customer.id
          ? {
              ...c,
              totalPurchases: c.totalPurchases + totalAmount,
              lastOrderDate: new Date().toLocaleDateString('fa-IR'),
              currentBalance: updatedCustomerBalance
            }
          : c
      )
    );

    // 4. Create Ledger entry for invoice debit
    const ledgerEntry: CustomerLedgerEntry = {
      id: `led-${Date.now()}`,
      date: new Date().toLocaleDateString('fa-IR'),
      customerId: customer.id,
      customerCode: customer.id,
      type: 'invoice',
      title: `فاکتور فروش شماره ${invoiceId} (${totalBoxes} باکس)`,
      debit: totalAmount,
      credit: paymentMethod === 'online' ? totalAmount : 0,
      balance: updatedCustomerBalance,
      referenceId: invoiceId,
      notes: `روش پرداخت: ${paymentMethod === 'online' ? 'آنلاین موفق' : paymentMethod === 'cheque' ? 'چک صیادی' : paymentMethod === 'credit' ? 'اعتباری' : 'نقدی/کارتخوان'}`
    };
    setLedgerEntries(prev => [ledgerEntry, ...prev]);

    // 5. Add order & log
    setOrders(prev => [newOrder, ...prev]);
    if (!itemsOverride) clearCart();

    addAuditLog(
      'ثبت سفارش جدید',
      `سفارش ${newOrderNumber} به ارزش ${totalAmount.toLocaleString('fa-IR')} تومان به نام ${customer.storeName} ثبت شد. پورسانت ویزیتور ${visitor?.name}: ${totalVisitorCommission.toLocaleString('fa-IR')} تومان`
    );

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, note?: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const nowPersian = new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    // Handle warehouse inventory shifts
    if (newStatus === 'delivered' && order.status !== 'delivered' && order.status !== 'settled') {
      // Actually deduct from totalStock and reservedStock
      setProducts(prev =>
        prev.map(p => {
          const item = order.items.find(oi => oi.productId === p.id);
          if (item) {
            return {
              ...p,
              totalStock: Math.max(0, p.totalStock - item.quantityBoxes),
              reservedStock: Math.max(0, p.reservedStock - item.quantityBoxes)
            };
          }
          return p;
        })
      );
    } else if (newStatus === 'cancelled' && order.status !== 'cancelled') {
      // Release reserved stock
      setProducts(prev =>
        prev.map(p => {
          const item = order.items.find(oi => oi.productId === p.id);
          if (item) {
            return {
              ...p,
              reservedStock: Math.max(0, p.reservedStock - item.quantityBoxes)
            };
          }
          return p;
        })
      );
    }

    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            status: newStatus,
            paymentStatus: newStatus === 'settled' ? 'paid' : o.paymentStatus,
            statusHistory: [
              ...o.statusHistory,
              {
                status: newStatus,
                timestamp: nowPersian,
                note: note || `تغییر وضعیت به ${newStatus}`,
                byRole: currentUserRole
              }
            ]
          };
        }
        return o;
      })
    );

    addAuditLog('تغییر وضعیت سفارش', `سفارش ${order.orderNumber} به وضعیت "${newStatus}" تغییر یافت.`);
  };

  const assignDriverToOrder = (orderId: string, driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;

    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const nowPersian = new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
          return {
            ...o,
            driverId: driver.id,
            driverName: driver.name,
            status: 'handed_to_driver',
            statusHistory: [
              ...o.statusHistory,
              {
                status: 'handed_to_driver',
                timestamp: nowPersian,
                note: `تخصیص به راننده ${driver.name} (${driver.vehicle})`,
                byRole: currentUserRole
              }
            ]
          };
        }
        return o;
      })
    );

    setDrivers(prev =>
      prev.map(d => (d.id === driverId ? { ...d, activeOrders: d.activeOrders + 1 } : d))
    );

    addAuditLog('تخصیص راننده', `سفارش به راننده ${driver.name} تخصیص داده شد.`);
  };

  const recordWarehouseTransaction = ({
    type,
    productId,
    quantityBoxes,
    referenceNo,
    notes
  }: {
    type: 'inbound' | 'outbound' | 'damaged' | 'returned' | 'reconciliation';
    productId: string;
    quantityBoxes: number;
    referenceNo: string;
    notes?: string;
  }) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const nowPersian = new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    const newTx: WarehouseTransaction = {
      id: `tx-${Date.now()}`,
      date: nowPersian,
      type,
      productId,
      productName: product.name,
      quantityBoxes,
      referenceNo,
      recordedBy: 'انباردار گوارانو',
      notes
    };

    setWarehouseTransactions(prev => [newTx, ...prev]);

    setProducts(prev =>
      prev.map(p => {
        if (p.id !== productId) return p;
        if (type === 'inbound') {
          return { ...p, totalStock: p.totalStock + quantityBoxes };
        } else if (type === 'outbound') {
          return { ...p, totalStock: Math.max(0, p.totalStock - quantityBoxes) };
        } else if (type === 'damaged') {
          return {
            ...p,
            totalStock: Math.max(0, p.totalStock - quantityBoxes),
            damagedStock: p.damagedStock + quantityBoxes
          };
        } else if (type === 'returned') {
          return { ...p, totalStock: p.totalStock + quantityBoxes };
        } else if (type === 'reconciliation') {
          return { ...p, totalStock: quantityBoxes };
        }
        return p;
      })
    );

    addAuditLog('تراکنش انبارداری', `ثبت ${type} برای ${product.name} به تعداد ${quantityBoxes} باکس (سند: ${referenceNo})`);
  };

  const recordLedgerPayment = ({
    customerId,
    type,
    amount,
    referenceId,
    chequeNumber,
    chequeDueDate,
    notes
  }: {
    customerId: string;
    type: 'cash' | 'card' | 'online' | 'cheque';
    amount: number;
    referenceId: string;
    chequeNumber?: string;
    chequeDueDate?: string;
    notes?: string;
  }) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const newBalance = Math.max(0, customer.currentBalance - amount);
    const nowPersian = new Date().toLocaleDateString('fa-IR');

    const entry: CustomerLedgerEntry = {
      id: `led-${Date.now()}`,
      date: nowPersian,
      customerId: customer.id,
      customerCode: customer.id,
      type,
      title: `دریافت ${type === 'cash' ? 'نقدی' : type === 'card' ? 'کارتخوان' : type === 'online' ? 'آنلاین' : 'چک صیادی'} ${chequeNumber ? `به شماره ${chequeNumber}` : ''}`,
      debit: 0,
      credit: amount,
      balance: newBalance,
      referenceId,
      chequeNumber,
      chequeDueDate,
      notes
    };

    setLedgerEntries(prev => [entry, ...prev]);

    setCustomers(prev =>
      prev.map(c => (c.id === customerId ? { ...c, currentBalance: newBalance } : c))
    );

    addAuditLog('ثبت دریافت مالی', `دریافت مبلغ ${amount.toLocaleString('fa-IR')} تومان از مشتری ${customer.storeName} (${customer.id}) ثبت شد.`);
  };

  const addProduct = (prodData: Omit<Product, 'id' | 'sku'> & { sku?: string }) => {
    const newSku = prodData.sku || `PRD-${Date.now().toString().slice(-6)}`;
    const newProd: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
      sku: newSku,
      damagedStock: 0,
      reservedStock: 0
    };
    setProducts(prev => [newProd, ...prev]);
    addAuditLog('افزودن محصول جدید', `محصول ${newProd.name} با کد ${newSku} اضافه شد.`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    addAuditLog('ویرایش محصول', `محصول ${id} به‌روزرسانی شد.`);
  };

  const addCategory = (cat: Category) => {
    setCategories(prev => [...prev, cat]);
    addAuditLog('افزودن دسته‌بندی', `دسته‌بندی جدید "${cat.name}" ایجاد شد.`);
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'currentBalance' | 'totalPurchases' | 'createdAt'>): Customer => {
    const newCode = `CUS-${String(customers.length + 130).padStart(6, '0')}`;
    const newCust: Customer = {
      ...customerData,
      id: newCode,
      currentBalance: 0,
      totalPurchases: 0,
      createdAt: new Date().toLocaleDateString('fa-IR')
    };
    setCustomers(prev => [newCust, ...prev]);

    // Update assigned visitor count
    setVisitors(prev =>
      prev.map(v =>
        v.id === customerData.assignedVisitorId
          ? { ...v, activeCustomersCount: v.activeCustomersCount + 1, newCustomersCount: v.newCustomersCount + 1 }
          : v
      )
    );

    addAuditLog('ثبت مشتری جدید', `مشتری جدید ${newCust.storeName} با کد ${newCode} ثبت شد.`);
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
    addAuditLog('ویرایش مشتری', `اطلاعات مشتری با کد ${id} به‌روزرسانی شد.`);
  };

  const updateDeliveryZone = (id: string, updates: Partial<DeliveryZone>) => {
    setDeliveryZones(prev => prev.map(z => (z.id === id ? { ...z, ...updates } : z)));
  };

  const switchRole = (role: UserRole, targetId?: string) => {
    setCurrentUserRole(role);
    if (role === 'customer') {
      const targetCustomer = (targetId ? customers.find(c => c.id === targetId) : null) || currentCustomer || customers[0];
      setCurrentCustomer(targetCustomer);
    } else if (role === 'visitor') {
      const targetVisitor = (targetId ? visitors.find(v => v.id === targetId) : null) || currentVisitor || visitors[0];
      setCurrentVisitor(targetVisitor);
    }
  };

  const exportToCsv = (rows: Record<string, any>[], filename: string) => {
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csvContent =
      '\uFEFF' + // UTF-8 BOM for Persian excel support
      headers.join(',') +
      '\n' +
      rows
        .map(row =>
          headers
            .map(h => {
              const val = row[h] ?? '';
              const escaped = String(val).replace(/"/g, '""');
              return `"${escaped}"`;
            })
            .join(',')
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAllData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setCustomers(INITIAL_CUSTOMERS);
    setVisitors(INITIAL_VISITORS);
    setOrders(INITIAL_ORDERS);
    setWarehouseTransactions(INITIAL_TRANSACTIONS);
    setLedgerEntries(INITIAL_LEDGER);
    setDeliveryZones(INITIAL_DELIVERY_ZONES);
    setDrivers(INITIAL_DRIVERS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCart([]);
    setCurrentUserRole('public');
    setCurrentCustomer(INITIAL_CUSTOMERS[0]);
    setCurrentVisitor(INITIAL_VISITORS[0]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUserRole,
        setCurrentUserRole,
        currentCustomer,
        setCurrentCustomer,
        currentVisitor,
        setCurrentVisitor,
        products,
        categories,
        customers,
        visitors,
        orders,
        warehouseTransactions,
        ledgerEntries,
        deliveryZones,
        drivers,
        auditLogs,
        cart,
        selectedInvoiceOrder,
        setSelectedInvoiceOrder,
        dedicatedCustomerCode,
        setDedicatedCustomerCode,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getEffectivePrice,
        placeOrder,
        updateOrderStatus,
        assignDriverToOrder,
        recordWarehouseTransaction,
        recordLedgerPayment,
        addProduct,
        updateProduct,
        addCategory,
        addCustomer,
        updateCustomer,
        updateDeliveryZone,
        exportToCsv,
        resetAllData,
        switchRole
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
