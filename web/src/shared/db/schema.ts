import { mysqlTable, varchar, text, int, decimal, boolean, timestamp, json } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import type { SkinTone, Category } from '@/shared/types/domain.type';

// ── USERS & SESSIONS ─────────────────────────────────────────────────────────
export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  role: varchar('role', { length: 32 }).notNull().default('customer'), // 'admin' | 'customer'
  prenom: varchar('prenom', { length: 128 }),
  nom: varchar('nom', { length: 128 }),
  telephone: varchar('telephone', { length: 64 }),
  avatarUrl: text('avatar_url'),
  newsletter: boolean('newsletter').notNull().default(true),
  points: int('points').notNull().default(0),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const sessions = mysqlTable('sessions', {
  id: varchar('id', { length: 128 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ── PRODUCTS ─────────────────────────────────────────────────────────────────
export const products = mysqlTable('products', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  category: varchar('category', { length: 64 }).$type<Category>().notNull(),
  price: int('price').notNull(),
  originalPrice: int('original_price'),
  images: json('images').$type<string[]>().default([]),
  skinTones: json('skin_tones').$type<SkinTone[]>().default([]),
  badges: json('badges').$type<string[]>().default([]),
  rating: decimal('rating', { precision: 3, scale: 1 }).default('0.0'),
  reviewCount: int('review_count').default(0),
  shortDescription: text('short_description'),
  description: text('description'),
  benefits: json('benefits').$type<string[]>().default([]),
  usage: text('usage'),
  ingredients: text('ingredients'),
  inStock: boolean('in_stock').default(true),
  stockQty: int('stock_qty'),
  lowStockThreshold: int('low_stock_threshold').default(5),
  resultsTitle: text('results_title'),
  resultsSubtitle: text('results_subtitle'),
  isNew: boolean('is_new').default(false),
  isBestseller: boolean('is_bestseller').default(false),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ── ORDERS & ORDER ITEMS ─────────────────────────────────────────────────────
export const orders = mysqlTable('orders', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar('user_id', { length: 36 }).references(() => users.id, { onDelete: 'set null' }),
  orderNumber: varchar('order_number', { length: 64 }).notNull().unique(),
  status: varchar('status', { length: 32 }).notNull().default('confirmed'),
  subtotal: int('subtotal').notNull(),
  shippingCost: int('shipping_cost').notNull().default(0),
  total: int('total').notNull(),
  paymentMethod: varchar('payment_method', { length: 64 }),
  paymentStatus: varchar('payment_status', { length: 32 }).notNull().default('pending'),
  paymentReference: varchar('payment_reference', { length: 128 }),
  paymentProvider: varchar('payment_provider', { length: 64 }),
  paymentProviderTxnId: varchar('payment_provider_txn_id', { length: 128 }),
  paymentRequestId: varchar('payment_request_id', { length: 128 }),
  paymentPaidAt: timestamp('payment_paid_at'),
  deliveryFirstName: varchar('delivery_first_name', { length: 128 }),
  deliveryLastName: varchar('delivery_last_name', { length: 128 }),
  deliveryEmail: varchar('delivery_email', { length: 255 }),
  deliveryPhone: varchar('delivery_phone', { length: 64 }),
  deliveryAddress: text('delivery_address'),
  deliveryCity: varchar('delivery_city', { length: 128 }),
  deliveryCountry: varchar('delivery_country', { length: 128 }),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const orderItems = mysqlTable('order_items', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: varchar('order_id', { length: 36 }).notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: varchar('product_id', { length: 64 }).notNull(),
  productSlug: varchar('product_slug', { length: 255 }),
  name: varchar('name', { length: 255 }).notNull(),
  price: int('price').notNull(),
  quantity: int('quantity').notNull(),
  imageUrl: text('image_url'),
  shade: varchar('shade', { length: 64 }),
});

// ── REVIEWS & TESTIMONIALS ───────────────────────────────────────────────────
export const reviews = mysqlTable('reviews', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: varchar('product_id', { length: 64 }),
  author: varchar('author', { length: 128 }).notNull(),
  city: varchar('city', { length: 128 }).default(''),
  product: varchar('product', { length: 255 }).default(''),
  productSlug: varchar('product_slug', { length: 255 }).default(''),
  rating: int('rating').notNull(),
  title: varchar('title', { length: 255 }).default(''),
  text: text('text').notNull(),
  verified: boolean('verified').notNull().default(false),
  skinTone: varchar('skin_tone', { length: 64 }).$type<SkinTone>(),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const testimonials = mysqlTable('testimonials', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 128 }).notNull(),
  text: text('text').notNull(),
  avatarUrl: text('avatar_url').default(''),
  approved: boolean('approved').notNull().default(false),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ── CATEGORIES ───────────────────────────────────────────────────────────────
export const categories = mysqlTable('categories', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: varchar('slug', { length: 64 }).notNull().unique(),
  label: varchar('label', { length: 128 }).notNull(),
  subLabel: varchar('sub_label', { length: 255 }).notNull().default(''),
  image: text('image').notNull(),
  href: varchar('href', { length: 255 }).notNull().default(''),
  icon: varchar('icon', { length: 64 }).notNull().default(''),
  isQuiz: boolean('is_quiz').default(false),
  orderIndex: int('order_index').default(0),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ── SITE CONFIG & JEKO LOYALTY ───────────────────────────────────────────────
export const siteConfig = mysqlTable('site_config', {
  key: varchar('key', { length: 128 }).primaryKey(),
  value: json('value').notNull(),
  updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const jekoTransactions = mysqlTable('jeko_transactions', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  points: int('points').notNull(),
  reason: varchar('reason', { length: 64 }).notNull(),
  label: varchar('label', { length: 255 }),
  referenceId: varchar('reference_id', { length: 128 }),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const jekoConfig = mysqlTable('jeko_config', {
  key: varchar('key', { length: 128 }).primaryKey(),
  value: json('value').notNull(),
  updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// ── NEWSLETTER & QUIZ ────────────────────────────────────────────────────────
export const newsletterSubscribers = mysqlTable('newsletter_subscribers', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  source: varchar('source', { length: 64 }).default('footer'),
  unsubscribed: boolean('unsubscribed').default(false),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const quizSubmissions = mysqlTable('quiz_submissions', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  skinTone: varchar('skin_tone', { length: 64 }),
  concern: varchar('concern', { length: 128 }),
  routine: varchar('routine', { length: 128 }),
  userEmail: varchar('user_email', { length: 255 }),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const quizConcerns = mysqlTable('quiz_concerns', {
  id: varchar('id', { length: 64 }).primaryKey(),
  label: varchar('label', { length: 255 }).notNull(),
  meta: varchar('meta', { length: 255 }).notNull().default(''),
  glyph: varchar('glyph', { length: 16 }).notNull().default('◯'),
  sortOrder: int('sort_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const quizRoutines = mysqlTable('quiz_routines', {
  id: varchar('id', { length: 64 }).primaryKey(),
  label: varchar('label', { length: 255 }).notNull(),
  meta: varchar('meta', { length: 255 }).notNull().default(''),
  glyph: varchar('glyph', { length: 16 }).notNull().default('◇'),
  sortOrder: int('sort_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Types inferred from schema
export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type SessionRow = typeof sessions.$inferSelect;
export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;
export type OrderRow = typeof orders.$inferSelect;
export type NewOrderRow = typeof orders.$inferInsert;
export type OrderItemRow = typeof orderItems.$inferSelect;
export type NewOrderItemRow = typeof orderItems.$inferInsert;
export type ReviewRow = typeof reviews.$inferSelect;
export type NewReviewRow = typeof reviews.$inferInsert;
export type CategoryRow = typeof categories.$inferSelect;
export type SiteConfigRow = typeof siteConfig.$inferSelect;
export type JekoTransactionRow = typeof jekoTransactions.$inferSelect;
export type JekoConfigRow = typeof jekoConfig.$inferSelect;
