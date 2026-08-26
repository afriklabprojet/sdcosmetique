# Schéma Cible Drizzle ORM — 37 Tables (TypeScript 100% snake_case)

> **Source de vérité canonique** du schéma visé par le [plan d'implémentation](../implementation-plan/README.md).
> Le contenu de `src/shared/db/schema.ts` doit être strictement identique à la section 1 ci-dessous à l'issue du Milestone 02.

Dans cette version finale, les propriétés TypeScript et les colonnes de tables SQL sont **strictement identiques en `snake_case`**. Cela supprime toute friction cognitive et garantit un alignement total avec les conventions de données Laravel et les modèles d'APIs.

## Inventaire des 37 Tables par Module

| # | Module | Tables |
| :--- | :--- | :--- |
| 1 | Identité, Clients & Sécurité | `users`, `clients`, `admins`, `sessions` |
| 2 | Adresses Polymorphes | `addresses` |
| 3 | Catalogue, Variantes & Attributs | `categories`, `products`, `product_categories`, `product_variants`, `attributes`, `attribute_values`, `variant_attribute_values` |
| 4 | Tables Polymorphes Transverses | `tags`, `taggables`, `media`, `seo`, `audit_logs`, `notifications` |
| 5 | Inventaire & Traçabilité | `inventory_items`, `stock_movements` |
| 6 | Commandes & Logistique | `orders`, `order_items`, `shipments`, `shipment_items`, `order_status_history` |
| 7 | Passerelles & Transactions | `payment_gateways`, `payment_transactions`, `payment_webhook_logs` |
| 8 | Fidélité Jeko | `loyalty_accounts`, `loyalty_ledger` |
| 9 | Promotions & UGC | `coupons`, `product_reviews` |
| 10 | Diagnostic de Peau (Quiz) | `quiz_questions`, `quiz_options`, `quiz_rules`, `quiz_submissions`, `quiz_answers` |

## Journal des Décisions de Nommage (Module 10)

Le module Quiz applique la règle des **2 mots maximum par identifiant** :

| Nom initialement esquissé | Nom retenu | Motif |
| :--- | :--- | :--- |
| `quiz_recommendation_rules` | `quiz_rules` | 3 mots ➔ 2 mots |
| `quiz_submission_answers` | `quiz_answers` | 3 mots ➔ 2 mots |
| `quiz_options.glyph_or_icon` | `quiz_options.glyph` | 3 mots ➔ 1 mot ; aligné sur l'existant `quiz_concerns.glyph` |
| `quiz_options.image_url` | *(supprimé)* | Remplacé par la table polymorphe `media` (`attachable_type: 'quiz_option'`) |
| `quiz_submissions.user_id` | `quiz_submissions.client_id` | Cohérence avec la séparation `users` / `clients` |
| `quiz_recommendation_rules.condition_expression` | `quiz_rules.conditions` | 2 mots ➔ 1 mot |
| `quiz_recommendation_rules.recommendation_tier` | `quiz_rules.tier` | 2 mots ➔ 1 mot |
| `quiz_recommendation_rules.match_priority` | `quiz_rules.priority` | 2 mots ➔ 1 mot |

---

## 1. Code Source TypeScript Drizzle ORM (`@/shared/db/schema.ts`)

```typescript
import { 
  mysqlTable, 
  varchar, 
  text, 
  mediumtext, 
  int, 
  decimal, 
  boolean, 
  timestamp, 
  json, 
  mysqlEnum, 
  primaryKey, 
  uniqueIndex, 
  index 
} from 'drizzle-orm/mysql-core';
import { relations, sql } from 'drizzle-orm';

// ═════════════════════════════════════════════════════════════════════════════
// 1. IDENTITÉ, CLIENTS & SÉCURITÉ (USERS / CLIENTS / ADMINS)
// ═════════════════════════════════════════════════════════════════════════════

export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  first_name: varchar('first_name', { length: 128 }).notNull(),
  last_name: varchar('last_name', { length: 128 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 64 }).unique(),
  password: varchar('password', { length: 255 }),
  
  verified_at: timestamp('verified_at'),
  phone_at: timestamp('phone_at'),
  logout_at: timestamp('logout_at'),
  archived_at: timestamp('archived_at'),
  
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const clients = mysqlTable('clients', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: varchar('user_id', { length: 36 }).notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  skin_tone: varchar('skin_tone', { length: 64 }),
  skin_type: varchar('skin_type', { length: 64 }),
  skin_concern: varchar('skin_concern', { length: 128 }),
  birth_date: varchar('birth_date', { length: 32 }),
  subscribed_at: timestamp('subscribed_at'),
  unsubscribed_at: timestamp('unsubscribed_at'),
  sms_at: timestamp('sms_at'),
  currency: varchar('currency', { length: 8 }).notNull().default('XOF'),
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const admin_role_enum = mysqlEnum('admin_role', [
  'super_admin',
  'store_manager',
  'support_operator',
  'warehouse_operator'
]);

export const admins = mysqlTable('admins', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: varchar('user_id', { length: 36 }).notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  role: admin_role_enum.notNull().default('support_operator'),
  root_at: timestamp('root_at'),
  revoked_at: timestamp('revoked_at'),
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const sessions = mysqlTable('sessions', {
  id: varchar('id', { length: 128 }).primaryKey(),
  user_id: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  ip_address: varchar('ip_address', { length: 64 }),
  user_agent: text('user_agent'),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ═════════════════════════════════════════════════════════════════════════════
// 2. ADRESSES POLYMORPHES (CLIENTS, COMMANDES, POINTS RELAIS)
// ═════════════════════════════════════════════════════════════════════════════

export const address_role_enum = mysqlEnum('address_role', ['shipping', 'billing', 'origin', 'pickup']);

export const addresses = mysqlTable('addresses', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  addressable_type: varchar('addressable_type', { length: 64 }).notNull(),
  addressable_id: varchar('addressable_id', { length: 36 }).notNull(),
  role: address_role_enum.notNull().default('shipping'),
  first_name: varchar('first_name', { length: 128 }).notNull(),
  last_name: varchar('last_name', { length: 128 }).notNull(),
  phone: varchar('phone', { length: 64 }).notNull(),
  alt_phone: varchar('alt_phone', { length: 64 }),
  line_one: text('line_one').notNull(),
  line_two: text('line_two'),
  city: varchar('city', { length: 128 }).notNull(),
  district: varchar('district', { length: 128 }),
  landmark: varchar('landmark', { length: 255 }),
  country: varchar('country', { length: 8 }).notNull().default('CI'),
  is_default: boolean('is_default').notNull().default(false),
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (t) => ({
  idx_attachable: index('idx_address_attachable').on(t.addressable_type, t.addressable_id),
}));

// ═════════════════════════════════════════════════════════════════════════════
// 3. CATALOGUE, VARIANTES, TAXONOMIE & ATTRIBUTS
// ═════════════════════════════════════════════════════════════════════════════

export const product_status_enum = mysqlEnum('product_status', ['draft', 'published', 'archived']);
export const media_type_enum = mysqlEnum('media_type', ['image', 'video', 'document', 'audio']);
export const tag_kind_enum = mysqlEnum('tag_kind', ['badge', 'skin_concern', 'ingredient_highlight', 'promotion']);

export const categories = mysqlTable('categories', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  parent_id: varchar('parent_id', { length: 36 }),
  name: varchar('name', { length: 128 }).notNull(),
  slug: varchar('slug', { length: 128 }).notNull().unique(),
  description: text('description'),
  icon: varchar('icon', { length: 64 }),
  sort_order: int('sort_order').notNull().default(0),
  archived_at: timestamp('archived_at'),
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const products = mysqlTable('products', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  summary: text('summary'),
  description: mediumtext('description'),
  instructions: text('instructions'),
  ingredients: text('ingredients'),
  status: product_status_enum.notNull().default('draft'),
  
  published_at: timestamp('published_at'),
  featured_at: timestamp('featured_at'),
  bestseller_at: timestamp('bestseller_at'),
  new_until: timestamp('new_until'),
  archived_at: timestamp('archived_at'),
  
  rating: decimal('rating', { precision: 3, scale: 2 }).notNull().default('0.00'),
  review_count: int('review_count').notNull().default(0),
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const product_categories = mysqlTable('product_categories', {
  product_id: varchar('product_id', { length: 36 }).notNull().references(() => products.id, { onDelete: 'cascade' }),
  category_id: varchar('category_id', { length: 36 }).notNull().references(() => categories.id, { onDelete: 'cascade' }),
  is_primary: boolean('is_primary').notNull().default(false),
  assigned_at: timestamp('assigned_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  pk: primaryKey({ columns: [t.product_id, t.category_id] }),
}));

export const product_variants = mysqlTable('product_variants', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  product_id: varchar('product_id', { length: 36 }).notNull().references(() => products.id, { onDelete: 'cascade' }),
  sku: varchar('sku', { length: 64 }).notNull().unique(),
  barcode: varchar('barcode', { length: 64 }).unique(),
  name: varchar('name', { length: 255 }).notNull(),
  price: int('price').notNull(), // XOF
  compare_price: int('compare_price'),
  cost_price: int('cost_price'),
  weight: int('weight').notNull().default(0),
  is_default: boolean('is_default').notNull().default(false),
  archived_at: timestamp('archived_at'),
  sort_order: int('sort_order').notNull().default(0),
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const attributes = mysqlTable('attributes', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: varchar('code', { length: 64 }).notNull().unique(),
  name: varchar('name', { length: 128 }).notNull(),
  type: varchar('type', { length: 32 }).notNull().default('select'),
  sort_order: int('sort_order').notNull().default(0),
  archived_at: timestamp('archived_at'),
});

export const attribute_values = mysqlTable('attribute_values', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  attribute_id: varchar('attribute_id', { length: 36 }).notNull().references(() => attributes.id, { onDelete: 'cascade' }),
  value: varchar('value', { length: 128 }).notNull(),
  label: varchar('label', { length: 128 }).notNull(),
  hex_color: varchar('hex_color', { length: 16 }),
  sort_order: int('sort_order').notNull().default(0),
  archived_at: timestamp('archived_at'),
});

export const variant_attribute_values = mysqlTable('variant_attribute_values', {
  variant_id: varchar('variant_id', { length: 36 }).notNull().references(() => product_variants.id, { onDelete: 'cascade' }),
  attribute_value_id: varchar('attribute_value_id', { length: 36 }).notNull().references(() => attribute_values.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.variant_id, t.attribute_value_id] }),
}));

// ═════════════════════════════════════════════════════════════════════════════
// 4. TABLES POLYMORPHES (TAGS, MÉDIAS, SEO, AUDIT, NOTIFICATIONS)
// ═════════════════════════════════════════════════════════════════════════════

export const tags = mysqlTable('tags', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: varchar('slug', { length: 64 }).notNull().unique(),
  name: varchar('name', { length: 128 }).notNull(),
  color: varchar('color', { length: 16 }),
  kind: tag_kind_enum.notNull().default('badge'),
  sort_order: int('sort_order').notNull().default(0),
  archived_at: timestamp('archived_at'),
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const taggables = mysqlTable('taggables', {
  tag_id: varchar('tag_id', { length: 36 }).notNull().references(() => tags.id, { onDelete: 'cascade' }),
  taggable_type: varchar('taggable_type', { length: 64 }).notNull(),
  taggable_id: varchar('taggable_id', { length: 36 }).notNull(),
  sort_order: int('sort_order').notNull().default(0),
}, (t) => ({
  pk: primaryKey({ columns: [t.tag_id, t.taggable_type, t.taggable_id] }),
  idx_target: index('idx_taggables_target').on(t.taggable_type, t.taggable_id),
}));

export const media = mysqlTable('media', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  attachable_type: varchar('attachable_type', { length: 64 }).notNull(),
  attachable_id: varchar('attachable_id', { length: 36 }).notNull(),
  collection: varchar('collection', { length: 64 }).notNull().default('default'),
  type: media_type_enum.notNull().default('image'),
  disk: varchar('disk', { length: 32 }).notNull().default('public'),
  path: text('path').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  file_name: varchar('file_name', { length: 255 }).notNull(),
  mime_type: varchar('mime_type', { length: 128 }).notNull(),
  extension: varchar('extension', { length: 16 }).notNull(),
  size: int('size').notNull(),
  hash: varchar('hash', { length: 64 }),
  metadata: json('metadata'),
  sort_order: int('sort_order').notNull().default(0),
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (t) => ({
  idx_attachable: index('idx_media_attachable').on(t.attachable_type, t.attachable_id),
  idx_collection: index('idx_media_collection').on(t.collection),
  idx_hash: index('idx_media_hash').on(t.hash),
}));

export const twitter_card_enum = mysqlEnum('twitter_card', ['summary', 'summary_large_image']);
export const change_freq_enum = mysqlEnum('change_frequency', ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']);

export const seo = mysqlTable('seo', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  attachable_type: varchar('attachable_type', { length: 64 }).notNull(),
  attachable_id: varchar('attachable_id', { length: 36 }).notNull(),
  title: varchar('title', { length: 255 }),
  description: text('description'),
  keywords: varchar('keywords', { length: 255 }),
  canonical_url: text('canonical_url'),
  robots: varchar('robots', { length: 64 }).notNull().default('index, follow'),
  og_title: varchar('og_title', { length: 255 }),
  og_description: text('og_description'),
  og_image: text('og_image'),
  twitter_card: twitter_card_enum.notNull().default('summary_large_image'),
  schema_type: varchar('schema_type', { length: 64 }),
  json_ld: json('json_ld'),
  priority: decimal('priority', { precision: 2, scale: 1 }).notNull().default('0.8'),
  frequency: change_freq_enum.notNull().default('weekly'),
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (t) => ({
  uq_attachable: uniqueIndex('uq_seo_attachable').on(t.attachable_type, t.attachable_id),
}));

export const audit_logs = mysqlTable('audit_logs', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  actor_id: varchar('actor_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 64 }).notNull(),
  auditable_type: varchar('auditable_type', { length: 64 }).notNull(),
  auditable_id: varchar('auditable_id', { length: 36 }).notNull(),
  old_values: json('old_values'),
  new_values: json('new_values'),
  ip_address: varchar('ip_address', { length: 64 }),
  user_agent: text('user_agent'),
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  idx_auditable: index('idx_audit_target').on(t.auditable_type, t.auditable_id),
  idx_actor: index('idx_audit_actor').on(t.actor_id),
}));

export const notification_channel_enum = mysqlEnum('notification_channel', ['whatsapp', 'sms', 'email']);
export const notification_status_enum = mysqlEnum('notification_status', ['queued', 'sent', 'delivered', 'failed']);

export const notifications = mysqlTable('notifications', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  notifiable_type: varchar('notifiable_type', { length: 64 }).notNull(),
  notifiable_id: varchar('notifiable_id', { length: 36 }).notNull(),
  channel: notification_channel_enum.notNull(),
  template: varchar('template', { length: 64 }).notNull(),
  recipient: varchar('recipient', { length: 255 }).notNull(),
  payload: json('payload'),
  provider_id: varchar('provider_id', { length: 128 }),
  status: notification_status_enum.notNull().default('queued'),
  sent_at: timestamp('sent_at'),
  delivered_at: timestamp('delivered_at'),
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  idx_notif_target: index('idx_notif_target').on(t.notifiable_type, t.notifiable_id),
}));

// ═════════════════════════════════════════════════════════════════════════════
// 5. INVENTAIRE & TRAÇABILITÉ DES STOCKS
// ═════════════════════════════════════════════════════════════════════════════

export const stock_movement_reason_enum = mysqlEnum('stock_movement_reason', [
  'purchase_receipt',
  'order_fulfillment',
  'order_cancellation',
  'inventory_audit',
  'damaged_expired',
  'marketing_sample'
]);

export const inventory_items = mysqlTable('inventory_items', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  variant_id: varchar('variant_id', { length: 36 }).notNull().unique().references(() => product_variants.id, { onDelete: 'cascade' }),
  on_hand: int('on_hand').notNull().default(0),
  reserved: int('reserved').notNull().default(0),
  threshold: int('threshold').notNull().default(5),
  backorder_at: timestamp('backorder_at'),
  updated_at: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const stock_movements = mysqlTable('stock_movements', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  inventory_id: varchar('inventory_id', { length: 36 }).notNull().references(() => inventory_items.id, { onDelete: 'cascade' }),
  quantity_change: int('quantity_change').notNull(),
  balance_after: int('balance_after').notNull(),
  reason: stock_movement_reason_enum.notNull(),
  reference_id: varchar('reference_id', { length: 128 }),
  note: text('note'),
  user_id: varchar('user_id', { length: 36 }).references(() => users.id, { onDelete: 'set null' }),
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ═════════════════════════════════════════════════════════════════════════════
// 6. COMMANDES, EXPÉDITIONS & LOGISTIQUE
// ═════════════════════════════════════════════════════════════════════════════

export const order_status_enum = mysqlEnum('order_status', [
  'pending_payment',
  'paid',
  'processing',
  'partially_shipped',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
]);

export const shipment_status_enum = mysqlEnum('shipment_status', [
  'preparing',
  'dispatched',
  'in_transit',
  'delivered',
  'failed_returned'
]);

export const orders = mysqlTable('orders', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  order_number: varchar('order_number', { length: 64 }).notNull().unique(),
  client_id: varchar('client_id', { length: 36 }).references(() => clients.id, { onDelete: 'set null' }),
  guest_email: varchar('guest_email', { length: 255 }),
  guest_phone: varchar('guest_phone', { length: 64 }),
  status: order_status_enum.notNull().default('pending_payment'),
  
  currency: varchar('currency', { length: 8 }).notNull().default('XOF'),
  subtotal: int('subtotal').notNull(),
  discount: int('discount').notNull().default(0),
  shipping: int('shipping').notNull().default(0),
  tax: int('tax').notNull().default(0),
  total: int('total').notNull(),
  
  coupon_code: varchar('coupon_code', { length: 64 }),
  notes: text('notes'),
  memo: text('memo'),
  
  paid_at: timestamp('paid_at'),
  cancelled_at: timestamp('cancelled_at'),
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const order_items = mysqlTable('order_items', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  order_id: varchar('order_id', { length: 36 }).notNull().references(() => orders.id, { onDelete: 'cascade' }),
  product_id: varchar('product_id', { length: 36 }).references(() => products.id, { onDelete: 'set null' }),
  variant_id: varchar('variant_id', { length: 36 }).references(() => product_variants.id, { onDelete: 'set null' }),
  
  sku: varchar('sku', { length: 64 }).notNull(),
  product_name: varchar('product_name', { length: 255 }).notNull(),
  variant_name: varchar('variant_name', { length: 255 }).notNull(),
  snapshot: json('snapshot'),
  
  unit_price: int('unit_price').notNull(),
  compare_price: int('compare_price'),
  quantity: int('quantity').notNull(),
  discount: int('discount').notNull().default(0),
  line_total: int('line_total').notNull(),
  
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const shipments = mysqlTable('shipments', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  order_id: varchar('order_id', { length: 36 }).notNull().references(() => orders.id, { onDelete: 'cascade' }),
  tracking_code: varchar('tracking_code', { length: 128 }),
  carrier: varchar('carrier', { length: 128 }).notNull(),
  driver_name: varchar('driver_name', { length: 128 }),
  driver_phone: varchar('driver_phone', { length: 64 }),
  status: shipment_status_enum.notNull().default('preparing'),
  failure_reason: varchar('failure_reason', { length: 255 }),
  dispatched_at: timestamp('dispatched_at'),
  delivered_at: timestamp('delivered_at'),
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const shipment_items = mysqlTable('shipment_items', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  shipment_id: varchar('shipment_id', { length: 36 }).notNull().references(() => shipments.id, { onDelete: 'cascade' }),
  item_id: varchar('item_id', { length: 36 }).notNull().references(() => order_items.id, { onDelete: 'cascade' }),
  quantity: int('quantity').notNull(),
});

export const order_status_history = mysqlTable('order_status_history', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  order_id: varchar('order_id', { length: 36 }).notNull().references(() => orders.id, { onDelete: 'cascade' }),
  from_status: varchar('from_status', { length: 64 }),
  to_status: varchar('to_status', { length: 64 }).notNull(),
  comment: text('comment'),
  notified_at: timestamp('notified_at'),
  user_id: varchar('user_id', { length: 36 }).references(() => users.id, { onDelete: 'set null' }),
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ═════════════════════════════════════════════════════════════════════════════
// 7. PASSERELLES & TRANSACTIONS DE PAIEMENT
// ═════════════════════════════════════════════════════════════════════════════

export const gateway_mode_enum = mysqlEnum('gateway_mode', ['live', 'test']);
export const gateway_fee_type_enum = mysqlEnum('gateway_fee_type', ['none', 'percentage', 'fixed']);
export const payment_txn_status_enum = mysqlEnum('payment_txn_status', ['initiated', 'pending', 'successful', 'failed', 'cancelled']);

export const payment_gateways = mysqlTable('payment_gateways', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: varchar('code', { length: 64 }).notNull().unique(),
  name: varchar('name', { length: 128 }).notNull(),
  description: varchar('description', { length: 255 }),
  instructions: text('instructions'),
  fee_type: gateway_fee_type_enum.notNull().default('none'),
  fee_value: int('fee_value').notNull().default(0),
  min_amount: int('min_amount').notNull().default(100),
  max_amount: int('max_amount'),
  mode: gateway_mode_enum.notNull().default('live'),
  config: json('config'),
  sort_order: int('sort_order').notNull().default(0),
  archived_at: timestamp('archived_at'),
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const payment_transactions = mysqlTable('payment_transactions', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  order_id: varchar('order_id', { length: 36 }).notNull().references(() => orders.id, { onDelete: 'cascade' }),
  gateway_id: varchar('gateway_id', { length: 36 }).notNull().references(() => payment_gateways.id, { onDelete: 'restrict' }),
  gateway_code: varchar('gateway_code', { length: 64 }).notNull(),
  status: payment_txn_status_enum.notNull().default('initiated'),
  amount: int('amount').notNull(),
  fee_amount: int('fee_amount').notNull().default(0),
  currency: varchar('currency', { length: 8 }).notNull().default('XOF'),
  session_id: varchar('session_id', { length: 255 }),
  gateway_ref: varchar('gateway_ref', { length: 255 }),
  idempotency_key: varchar('idempotency_key', { length: 128 }).unique(),
  failure_reason: text('failure_reason'),
  paid_at: timestamp('paid_at'),
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const payment_webhook_logs = mysqlTable('payment_webhook_logs', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  gateway_id: varchar('gateway_id', { length: 36 }).references(() => payment_gateways.id, { onDelete: 'set null' }),
  gateway_code: varchar('gateway_code', { length: 64 }).notNull(),
  event_type: varchar('event_type', { length: 128 }),
  payload: json('payload').notNull(),
  headers: json('headers'),
  ip_address: varchar('ip_address', { length: 64 }),
  status: varchar('status', { length: 32 }).notNull().default('received'),
  error_message: text('error_message'),
  processed_at: timestamp('processed_at'),
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ═════════════════════════════════════════════════════════════════════════════
// 8. PROGRAMME DE FIDÉLITÉ (JEKO LEDGER)
// ═════════════════════════════════════════════════════════════════════════════

export const loyalty_tier_enum = mysqlEnum('loyalty_tier', ['bronze', 'argent', 'or', 'diamant']);
export const loyalty_reason_enum = mysqlEnum('loyalty_reason', [
  'order_reward',
  'signup_bonus',
  'quiz_completion',
  'product_review',
  'points_redemption',
  'tier_bonus',
  'admin_adjustment',
  'expiration'
]);

export const loyalty_accounts = mysqlTable('loyalty_accounts', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  client_id: varchar('client_id', { length: 36 }).notNull().unique().references(() => clients.id, { onDelete: 'cascade' }),
  current_points: int('current_points').notNull().default(0),
  lifetime_points: int('lifetime_points').notNull().default(0),
  tier: loyalty_tier_enum.notNull().default('bronze'),
  tier_at: timestamp('tier_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const loyalty_ledger = mysqlTable('loyalty_ledger', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  account_id: varchar('account_id', { length: 36 }).notNull().references(() => loyalty_accounts.id, { onDelete: 'cascade' }),
  points_delta: int('points_delta').notNull(),
  balance_after: int('balance_after').notNull(),
  reason: loyalty_reason_enum.notNull(),
  reference_type: varchar('reference_type', { length: 64 }),
  reference_id: varchar('reference_id', { length: 128 }),
  description: varchar('description', { length: 255 }),
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ═════════════════════════════════════════════════════════════════════════════
// 9. PROMOTIONS, COUPONS & UGC REVIEWS
// ═════════════════════════════════════════════════════════════════════════════

export const discount_kind_enum = mysqlEnum('discount_kind', ['percentage', 'fixed', 'free_shipping']);

export const coupons = mysqlTable('coupons', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: varchar('code', { length: 64 }).notNull().unique(),
  kind: discount_kind_enum.notNull(),
  value: int('value').notNull(),
  minimum: int('minimum').notNull().default(0),
  cap: int('cap'),
  starts_at: timestamp('starts_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  expires_at: timestamp('expires_at'),
  total_limit: int('total_limit'),
  user_limit: int('user_limit').notNull().default(1),
  used_count: int('used_count').notNull().default(0),
  archived_at: timestamp('archived_at'),
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const product_reviews = mysqlTable('product_reviews', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  product_id: varchar('product_id', { length: 36 }).notNull().references(() => products.id, { onDelete: 'cascade' }),
  variant_id: varchar('variant_id', { length: 36 }).references(() => product_variants.id, { onDelete: 'set null' }),
  client_id: varchar('client_id', { length: 36 }).references(() => clients.id, { onDelete: 'set null' }),
  item_id: varchar('item_id', { length: 36 }).references(() => order_items.id, { onDelete: 'set null' }),
  author_name: varchar('author_name', { length: 128 }).notNull(),
  author_city: varchar('author_city', { length: 128 }),
  skin_tone: varchar('skin_tone', { length: 64 }),
  rating: int('rating').notNull(),
  title: varchar('title', { length: 255 }),
  content: text('content').notNull(),
  verified_at: timestamp('verified_at'),
  approved_at: timestamp('approved_at'),
  rejected_at: timestamp('rejected_at'),
  votes_count: int('votes_count').notNull().default(0),
  reply_content: text('reply_content'),
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ═════════════════════════════════════════════════════════════════════════════
// 10. DIAGNOSTIC DE PEAU (QUIZ DYNAMIQUE & RECOMMANDATIONS)
// ═════════════════════════════════════════════════════════════════════════════

export const quiz_question_type_enum = mysqlEnum('quiz_question_type', ['single_choice', 'multi_choice', 'color_picker']);
export const quiz_tier_enum = mysqlEnum('quiz_tier', ['essential', 'complementary', 'routine_kit']);

export const quiz_questions = mysqlTable('quiz_questions', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: varchar('slug', { length: 64 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  subtitle: text('subtitle'),
  question_type: quiz_question_type_enum.notNull().default('single_choice'),
  sort_order: int('sort_order').notNull().default(0),
  archived_at: timestamp('archived_at'),
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const quiz_options = mysqlTable('quiz_options', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  question_id: varchar('question_id', { length: 36 }).notNull().references(() => quiz_questions.id, { onDelete: 'cascade' }),
  label: varchar('label', { length: 128 }).notNull(),
  description: varchar('description', { length: 255 }),
  value_code: varchar('value_code', { length: 64 }).notNull(),
  glyph: varchar('glyph', { length: 64 }),
  sort_order: int('sort_order').notNull().default(0),
  archived_at: timestamp('archived_at'),
}, (t) => ({
  idx_question: index('idx_quiz_opt_question').on(t.question_id),
  uniq_value: uniqueIndex('uniq_quiz_opt_value').on(t.question_id, t.value_code),
}));

export const quiz_rules = mysqlTable('quiz_rules', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  conditions: json('conditions').notNull(),
  product_id: varchar('product_id', { length: 36 }).notNull().references(() => products.id, { onDelete: 'cascade' }),
  tier: quiz_tier_enum.notNull().default('essential'),
  priority: int('priority').notNull().default(0),
  archived_at: timestamp('archived_at'),
}, (t) => ({
  idx_product: index('idx_quiz_rules_product').on(t.product_id),
}));

export const quiz_submissions = mysqlTable('quiz_submissions', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  client_id: varchar('client_id', { length: 36 }).references(() => clients.id, { onDelete: 'set null' }),
  email: varchar('email', { length: 255 }),
  first_name: varchar('first_name', { length: 128 }),
  phone: varchar('phone', { length: 64 }),
  completed_at: timestamp('completed_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  idx_email: index('idx_quiz_sub_email').on(t.email),
}));

export const quiz_answers = mysqlTable('quiz_answers', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  submission_id: varchar('submission_id', { length: 36 }).notNull().references(() => quiz_submissions.id, { onDelete: 'cascade' }),
  question_id: varchar('question_id', { length: 36 }).notNull().references(() => quiz_questions.id, { onDelete: 'cascade' }),
  option_id: varchar('option_id', { length: 36 }).notNull().references(() => quiz_options.id, { onDelete: 'cascade' }),
}, (t) => ({
  idx_submission: index('idx_quiz_answers_submission').on(t.submission_id),
}));

// ═════════════════════════════════════════════════════════════════════════════
// 11. DRIZZLE RELATIONS GRAPH
// ═════════════════════════════════════════════════════════════════════════════

export const users_relations = relations(users, ({ one }) => ({
  client: one(clients, { fields: [users.id], references: [clients.user_id] }),
  admin: one(admins, { fields: [users.id], references: [admins.user_id] }),
}));

export const clients_relations = relations(clients, ({ one, many }) => ({
  user: one(users, { fields: [clients.user_id], references: [users.id] }),
  orders: many(orders),
  loyalty_account: one(loyalty_accounts, { fields: [clients.id], references: [loyalty_accounts.client_id] }),
}));

export const products_relations = relations(products, ({ many }) => ({
  variants: many(product_variants),
  categories: many(product_categories),
  reviews: many(product_reviews),
}));

export const product_variants_relations = relations(product_variants, ({ one }) => ({
  product: one(products, { fields: [product_variants.product_id], references: [products.id] }),
  inventory: one(inventory_items, { fields: [product_variants.id], references: [inventory_items.variant_id] }),
}));

export const orders_relations = relations(orders, ({ one, many }) => ({
  client: one(clients, { fields: [orders.client_id], references: [clients.id] }),
  items: many(order_items),
  shipments: many(shipments),
  transactions: many(payment_transactions),
}));

export const shipments_relations = relations(shipments, ({ one, many }) => ({
  order: one(orders, { fields: [shipments.order_id], references: [orders.id] }),
  items: many(shipment_items),
}));

export const payment_gateways_relations = relations(payment_gateways, ({ many }) => ({
  transactions: many(payment_transactions),
}));

export const payment_transactions_relations = relations(payment_transactions, ({ one }) => ({
  order: one(orders, { fields: [payment_transactions.order_id], references: [orders.id] }),
  gateway: one(payment_gateways, { fields: [payment_transactions.gateway_id], references: [payment_gateways.id] }),
}));

export const quiz_questions_relations = relations(quiz_questions, ({ many }) => ({
  options: many(quiz_options),
}));

export const quiz_options_relations = relations(quiz_options, ({ one }) => ({
  question: one(quiz_questions, { fields: [quiz_options.question_id], references: [quiz_questions.id] }),
}));

export const quiz_submissions_relations = relations(quiz_submissions, ({ one, many }) => ({
  client: one(clients, { fields: [quiz_submissions.client_id], references: [clients.id] }),
  answers: many(quiz_answers),
}));

export const quiz_answers_relations = relations(quiz_answers, ({ one }) => ({
  submission: one(quiz_submissions, { fields: [quiz_answers.submission_id], references: [quiz_submissions.id] }),
  question: one(quiz_questions, { fields: [quiz_answers.question_id], references: [quiz_questions.id] }),
  option: one(quiz_options, { fields: [quiz_answers.option_id], references: [quiz_options.id] }),
}));
```

---

## 2. Typage Inférentiel Automatique (100% snake_case)

```typescript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type ProductVariant = typeof product_variants.$inferSelect;
export type NewProductVariant = typeof product_variants.$inferInsert;

export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;

export type Seo = typeof seo.$inferSelect;
export type NewSeo = typeof seo.$inferInsert;

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export type Address = typeof addresses.$inferSelect;
export type NewAddress = typeof addresses.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof order_items.$inferSelect;
export type NewOrderItem = typeof order_items.$inferInsert;

export type Shipment = typeof shipments.$inferSelect;
export type NewShipment = typeof shipments.$inferInsert;

export type PaymentGateway = typeof payment_gateways.$inferSelect;
export type NewPaymentGateway = typeof payment_gateways.$inferInsert;

export type PaymentTransaction = typeof payment_transactions.$inferSelect;
export type NewPaymentTransaction = typeof payment_transactions.$inferInsert;

export type LoyaltyAccount = typeof loyalty_accounts.$inferSelect;
export type LoyaltyLedger = typeof loyalty_ledger.$inferSelect;

export type AuditLog = typeof audit_logs.$inferSelect;
export type NewAuditLog = typeof audit_logs.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export type QuizQuestion = typeof quiz_questions.$inferSelect;
export type NewQuizQuestion = typeof quiz_questions.$inferInsert;

export type QuizOption = typeof quiz_options.$inferSelect;
export type NewQuizOption = typeof quiz_options.$inferInsert;

export type QuizSubmission = typeof quiz_submissions.$inferSelect;
export type NewQuizSubmission = typeof quiz_submissions.$inferInsert;

export type QuizAnswer = typeof quiz_answers.$inferSelect;
export type NewQuizAnswer = typeof quiz_answers.$inferInsert;
```
