export type LaravelAdminSession = {
  user: { id: number; name: string; email: string };
  admin: { role: string; root: boolean };
};

export type LaravelStorefrontProduct = {
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  usage: string | null;
  ingredients: string[] | string | null;
  category: { slug: string; name: string } | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  in_stock: boolean;
  recent: boolean;
  featured: boolean;
  images: string[];
  badges: string[];
};

export type LaravelAdminProduct = {
  id: number;
  category_id: number | null;
  category_slug?: string | null;
  parent_id: number | null;
  slug: string;
  title: string | null;
  summary: string | null;
  description: string | null;
  usage: string | null;
  ingredients: string[] | string | null;
  sku: string | null;
  label: string | null;
  regular_price: number | null;
  sale_price: number | null;
  stock: number;
  visible_at: string | null;
  published_at: string | null;
  images?: { id: number; url: string }[];
  badges?: { id: number; label: string; type: string }[];
};

export type LaravelAdminProductWrite = {
  category_id: number;
  parent_id?: number | null;
  slug: string;
  title: string;
  summary?: string | null;
  description?: string | null;
  usage?: string | null;
  ingredients?: string[];
  sku?: string | null;
  label?: string | null;
  regular_price?: number | null;
  sale_price?: number | null;
  stock?: number;
  visible_at?: string | null;
  published_at?: string | null;
};

export type LaravelStorefrontCategory = {
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  banner: string | null;
  order: number;
  product_count?: number;
};

export type LaravelAdminCategory = {
  id: number;
  parent_id: number | null;
  slug: string;
  name: string | null;
  description: string | null;
  image: string | null;
  banner: string | null;
  order: number;
  product_count?: number;
  created_at: string;
};

export type LaravelOrderDestination = {
  first_name?: string;
  last_name?: string;
  recipient?: string;
  line_1?: string;
  line_2?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  company?: string;
};

export type LaravelOrderStatus = 'draft' | 'placed' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export type LaravelOrder = {
  id?: number;
  reference: string;
  status: LaravelOrderStatus;
  email: string | null;
  gateway: string | null;
  currency: string;
  subtotal: number;
  total: number;
  destination: LaravelOrderDestination | null;
  delivery_method: { id: number; slug: string; name: string; amount: number } | null;
  items: {
    title: string;
    label: string | null;
    quantity: number;
    unit_price: number;
    total: number;
  }[];
  placed_at: string | null;
  paid_at: string | null;
};

export type LaravelCustomer = {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  orders_count?: number;
  total_value: number;
  created_at: string;
  updated_at: string;
};

export type LaravelCoupon = {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  threshold: number | null;
  limit: number | null;
  quota: number | null;
  starts_at: string;
  ends_at: string;
  active: boolean;
  redemptions_count?: number;
};

export type LaravelDeliveryMethod = {
  id: number;
  slug: string;
  name: string;
  zone: string;
  carrier: string;
  amount: number;
  cost: number;
  position: number;
  visible_at: string | null;
  visible: boolean;
};

export type LaravelNewsletterSub = {
  id: number;
  email: string;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
  active: boolean;
  created_at: string;
};

export type LaravelSessionUser = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at?: string;
};

export type LaravelSession = {
  user: LaravelSessionUser | null;
};

export type LaravelAccount = {
  name: string;
  email: string;
  phone: string | null;
  email_verified_at: string | null;
};

export type LaravelAddress = {
  id: number;
  first_name: string;
  last_name: string;
  company: string | null;
  line_1: string;
  line_2: string | null;
  city: string;
  postal_code: string | null;
  country: string;
  phone: string | null;
};

export type LaravelAddressWrite = {
  first_name: string;
  last_name: string;
  company?: string | null;
  line_1: string;
  line_2?: string | null;
  city: string;
  postal_code?: string | null;
  country: string;
  phone?: string | null;
};

export type LaravelMetricsOverview = {
  revenue: {
    today: number;
    last_7_days: number;
    last_30_days: number;
    currency: string;
  };
  orders_per_day: { date: string; count: number }[];
  low_stock: { id: number; title: string; sku: string | null; stock: number; product: string | null }[];
  pending_payments: number;
  unhandled_notifications: number;
};
