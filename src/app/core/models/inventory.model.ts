export interface Product {
  id: string;
  code: string;
  name: string;
  category_id?: string;
  brand?: string;
  unit_id?: string;
  description?: string;
  barcode?: string;
  purchase_price: number;
  selling_price: number;
  tax_percentage: number;
  reorder_level: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  category?: { id: string; name: string };
  unit?: { id: string; name: string; abbreviation: string };
}

export interface Category {
  id: string;
  name: string;
  code: string;
  description?: string;
  parent_id?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  parent?: { id: string; name: string };
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contact_person?: string;
  email?: string;
  mobile?: string;
  gst_number?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  code: string;
  email?: string;
  mobile?: string;
  gst_number?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  credit_limit: number;
  is_active: boolean;
  created_at: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
}

export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  warehouse_id: string;
  current_stock: number;
  reserved_stock: number;
  damaged_stock: number;
  available_stock: number;
  minimum_stock_level: number;
  product?: Product;
  warehouse?: Warehouse;
}

export interface PurchaseItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_percentage?: number;
  tax_percentage?: number;
  tax_amount?: number;
  total_price: number;
  product?: { id: string; name: string; code: string; unit?: { abbreviation: string } };
}

export interface Purchase {
  id: string;
  purchase_number: string;
  supplier_id: string;
  warehouse_id: string;
  purchase_date: string;
  due_date?: string;
  status: 'pending' | 'partial' | 'received' | 'cancelled';
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  notes?: string;
  created_at: string;
  supplier?: Supplier;
  warehouse?: Warehouse;
  purchase_items?: PurchaseItem[];
}

export interface SaleItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_percentage?: number;
  tax_percentage?: number;
  tax_amount?: number;
  total_price: number;
  product?: { id: string; name: string; code: string; unit?: { abbreviation: string } };
}

export interface Sale {
  id: string;
  sale_number: string;
  customer_id?: string;
  warehouse_id: string;
  sale_date: string;
  due_date?: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  payment_status: 'unpaid' | 'partial' | 'paid';
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  notes?: string;
  created_at: string;
  customer?: Customer;
  warehouse?: Warehouse;
  sale_items?: SaleItem[];
}

export interface Notification {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'expiry' | 'pending_payment' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  module: string;
  record_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
  user?: { id: string; first_name: string; last_name: string; email: string };
}

export interface ReturnItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  tax_percentage?: number;
  tax_amount?: number;
  total_price: number;
  product?: { id: string; name: string; code: string; unit?: { abbreviation: string } };
}

export interface PurchaseReturn {
  id: string;
  return_number: string;
  purchase_id: string;
  supplier_id?: string;
  warehouse_id?: string;
  return_date: string;
  reason?: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  created_at: string;
  purchase?: { id: string; purchase_number: string };
  supplier?: { id: string; name: string };
  warehouse?: { id: string; name: string };
  return_items?: ReturnItem[];
}

export interface SaleReturn {
  id: string;
  return_number: string;
  sale_id: string;
  customer_id?: string;
  warehouse_id?: string;
  return_date: string;
  reason?: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  created_at: string;
  sale?: { id: string; sale_number: string };
  customer?: { id: string; name: string };
  warehouse?: { id: string; name: string };
  return_items?: ReturnItem[];
}

export interface DashboardData {
  totalProducts: number;
  totalCategories: number;
  availableStock: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalPurchaseAmount: number;
  totalSalesAmount: number;
  totalProfit: number;
  recentTransactions: { product: { name: string } | null; transaction_type: string; quantity: number; created_at: string }[];
  monthlyChart: { month: string; purchases: number; sales: number }[];
  topSellingProducts: { name: string; total_quantity: number; total_amount: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
