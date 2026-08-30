#!/usr/bin/env python3
"""Emit the 26 domain migrations (slots 02–27). Users remain the Laravel default."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "database" / "migrations"

HEADER = """<?php

declare(strict_types=1);

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
"""

FOOTER_DROP = """    public function down(): void
    {
        Schema::dropIfExists('%s');
    }
};
"""


def create(filename: str, table: str, body: str) -> None:
    up = HEADER + body + "    }\n\n" + (FOOTER_DROP % table)
    (ROOT / filename).write_text(up)
    print(filename)


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)

    create(
        "2026_01_01_000002_create_clients_table.php",
        "clients",
        """        Schema::create('clients', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('phone', 50)->nullable();
            $table->unsignedBigInteger('shipping_id')->nullable()->index();
            $table->unsignedBigInteger('billing_id')->nullable()->index();
            $table->timestamps();
        });
""",
    )

    create(
        "2026_01_01_000003_create_admins_table.php",
        "admins",
        """        Schema::create('admins', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role', 50)->default('admin');
            $table->timestamp('root_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();
        });
""",
    )

    create(
        "2026_01_01_000004_create_categories_table.php",
        "categories",
        """        Schema::create('categories', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('slug')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->string('banner')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
        });
""",
    )

    create(
        "2026_01_01_000005_create_products_table.php",
        "products",
        """        Schema::create('products', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('parent_id')->nullable()->index();
            $table->string('slug')->unique();
            $table->string('title');
            $table->text('summary')->nullable();
            $table->longText('description')->nullable();
            $table->json('ingredients')->nullable();
            $table->text('usage')->nullable();
            $table->string('sku', 100)->nullable()->unique();
            $table->string('label')->nullable();
            $table->unsignedBigInteger('regular_price')->nullable();
            $table->unsignedBigInteger('sale_price')->nullable();
            $table->unsignedInteger('stock')->default(0);
            $table->timestamp('visible_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
""",
    )

    create(
        "2026_01_01_000006_create_delivery_methods_table.php",
        "delivery_methods",
        """        Schema::create('delivery_methods', function (Blueprint $table): void {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('zone');
            $table->string('carrier', 100);
            $table->unsignedBigInteger('amount');
            $table->unsignedBigInteger('cost')->default(0);
            $table->unsignedInteger('position')->default(0);
            $table->timestamp('visible_at')->nullable();
            $table->timestamps();
        });
""",
    )

    create(
        "2026_01_01_000007_create_product_badges_table.php",
        "product_badges",
        """        Schema::create('product_badges', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('label', 100);
            $table->string('type', 50)->default('sale');
            $table->timestamps();
        });
""",
    )

    create(
        "2026_01_01_000008_create_files_table.php",
        "files",
        """        Schema::create('files', function (Blueprint $table): void {
            $table->id();
            $table->morphs('fileable');
            $table->string('disk', 50)->default('public');
            $table->string('path');
            $table->string('url');
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('size');
            $table->timestamps();
        });
""",
    )

    create(
        "2026_01_01_000009_create_banners_table.php",
        "banners",
        """        Schema::create('banners', function (Blueprint $table): void {
            $table->id();
            $table->string('key', 100)->unique();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->string('image_url');
            $table->string('link_url')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->timestamp('visible_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
""",
    )

    create(
        "2026_01_01_000010_create_coupons_table.php",
        "coupons",
        """        Schema::create('coupons', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 50)->unique();
            $table->enum('type', ['percentage', 'fixed']);
            $table->unsignedBigInteger('value');
            $table->unsignedBigInteger('min_spend')->nullable();
            $table->unsignedInteger('max_uses')->nullable();
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->timestamps();
        });
""",
    )

    create(
        "2026_01_01_000011_create_addresses_table.php",
        "addresses",
        """        Schema::create('addresses', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('company', 150)->nullable();
            $table->string('line_1');
            $table->string('line_2')->nullable();
            $table->string('city', 100);
            $table->string('postal_code', 30)->nullable();
            $table->string('country', 100)->default('CI');
            $table->string('phone', 50);
            $table->timestamps();
        });
""",
    )

    create(
        "2026_01_01_000012_create_carts_table.php",
        "carts",
        """        Schema::create('carts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('client_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('coupon_id')->nullable()->constrained()->nullOnDelete();
            $table->string('guest_token', 100)->nullable()->index();
            $table->timestamps();
        });
""",
    )

    create(
        "2026_01_01_000013_create_cart_items_table.php",
        "cart_items",
        """        Schema::create('cart_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cart_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('quantity')->default(1);
            $table->timestamps();
            $table->unique(['cart_id', 'product_id']);
        });
""",
    )

    create(
        "2026_01_01_000014_create_wishlists_table.php",
        "wishlists",
        """        Schema::create('wishlists', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['client_id', 'product_id']);
        });
""",
    )

    create(
        "2026_01_01_000015_create_comparisons_table.php",
        "comparisons",
        """        Schema::create('comparisons', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['client_id', 'product_id']);
        });
""",
    )

    create(
        "2026_01_01_000016_create_orders_table.php",
        "orders",
        """        Schema::create('orders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            $table->string('email')->nullable();
            $table->foreignId('cart_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->foreignId('delivery_method_id')->nullable()->constrained('delivery_methods')->restrictOnDelete();
            $table->string('gateway', 50)->nullable();
            $table->string('reference', 50)->unique();
            $table->char('currency', 3)->default('XOF');
            $table->unsignedBigInteger('subtotal');
            $table->unsignedBigInteger('total');
            $table->json('destination')->nullable();
            $table->text('note')->nullable();
            $table->timestamp('placed_at')->nullable()->index();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
        });
""",
    )

    create(
        "2026_01_01_000017_create_order_items_table.php",
        "order_items",
        """        Schema::create('order_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->string('title');
            $table->string('label')->nullable();
            $table->unsignedBigInteger('unit_price');
            $table->unsignedInteger('quantity');
            $table->unsignedBigInteger('total');
            $table->timestamps();
        });
""",
    )

    create(
        "2026_01_01_000018_create_order_adjustments_table.php",
        "order_adjustments",
        """        Schema::create('order_adjustments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['shipping', 'discount', 'shipping_discount']);
            $table->enum('operation', ['add', 'subtract']);
            $table->unsignedBigInteger('amount');
            $table->string('label');
            $table->timestamps();
        });
""",
    )

    create(
        "2026_01_01_000019_create_deliveries_table.php",
        "deliveries",
        """        Schema::create('deliveries', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('carrier', 100);
            $table->string('tracking_number', 100)->nullable();
            $table->unsignedBigInteger('cost')->default(0);
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
        });
""",
    )

    create(
        "2026_01_01_000020_create_payments_table.php",
        "payments",
        """        Schema::create('payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('amount');
            $table->char('currency', 3)->default('XOF');
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamps();
        });
""",
    )

    create(
        "2026_01_01_000021_create_payment_attempts_table.php",
        "payment_attempts",
        """        Schema::create('payment_attempts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('payment_id')->constrained()->cascadeOnDelete();
            $table->string('gateway', 50);
            $table->string('reference', 100);
            $table->unsignedBigInteger('amount');
            $table->char('currency', 3)->default('XOF');
            $table->string('redirect_url', 2048)->nullable();
            $table->json('request_payload')->nullable();
            $table->string('failure_reason')->nullable();
            $table->timestamp('initiated_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamp('expired_at')->nullable();
            $table->timestamps();
            $table->unique(['gateway', 'reference']);
        });
""",
    )

    create(
        "2026_01_01_000022_create_payment_notifications_table.php",
        "payment_notifications",
        """        Schema::create('payment_notifications', function (Blueprint $table): void {
            $table->id();
            $table->string('gateway', 50);
            $table->string('reference', 100);
            $table->foreignId('payment_attempt_id')->nullable()->constrained('payment_attempts')->nullOnDelete();
            $table->json('payload');
            $table->string('failure_reason')->nullable();
            $table->timestamp('handled_at')->nullable();
            $table->timestamps();
            $table->unique(['gateway', 'reference']);
        });
""",
    )

    create(
        "2026_01_01_000023_create_newsletter_subscriptions_table.php",
        "newsletter_subscriptions",
        """        Schema::create('newsletter_subscriptions', function (Blueprint $table): void {
            $table->id();
            $table->string('email')->unique();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('unsubscribed_at')->nullable();
            $table->timestamps();
        });
""",
    )

    create(
        "2026_01_01_000024_create_contact_messages_table.php",
        "contact_messages",
        """        Schema::create('contact_messages', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('subject')->nullable();
            $table->text('message');
            $table->timestamp('handled_at')->nullable();
            $table->timestamps();
        });
""",
    )

    create(
        "2026_01_01_000025_create_pages_table.php",
        "pages",
        """        Schema::create('pages', function (Blueprint $table): void {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->longText('content')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
""",
    )

    create(
        "2026_01_01_000026_create_translations_table.php",
        "translations",
        """        Schema::create('translations', function (Blueprint $table): void {
            $table->id();
            $table->morphs('translatable');
            $table->string('locale', 10);
            $table->string('field', 100);
            $table->longText('value');
            $table->timestamps();
            $table->unique(['translatable_type', 'translatable_id', 'locale', 'field'], 'translations_unique');
        });
""",
    )

    (ROOT / "2026_01_01_000027_add_circular_foreign_keys.php").write_text(
        """<?php

declare(strict_types=1);

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('products', function (Blueprint $table): void {
            $table->foreign('parent_id')->references('id')->on('products')->nullOnDelete();
        });

        Schema::table('clients', function (Blueprint $table): void {
            $table->foreign('shipping_id')->references('id')->on('addresses')->nullOnDelete();
            $table->foreign('billing_id')->references('id')->on('addresses')->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('products', function (Blueprint $table): void {
            $table->dropForeign(['parent_id']);
        });

        Schema::table('clients', function (Blueprint $table): void {
            $table->dropForeign(['shipping_id']);
            $table->dropForeign(['billing_id']);
        });
    }
};
"""
    )
    print("2026_01_01_000027_add_circular_foreign_keys.php")


if __name__ == "__main__":
    main()
