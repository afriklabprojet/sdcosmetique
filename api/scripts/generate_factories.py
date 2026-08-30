#!/usr/bin/env python3
"""Factories, policies, seeders, console command, and MM/unit tests for M3."""

from pathlib import Path

API = Path(__file__).resolve().parents[1]


def w(rel: str, contents: str) -> None:
    path = API / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(contents)
    print(rel)


def factory(ns: str, class_name: str, model: str, definition: str, extras: str = "") -> str:
    return f"""<?php

declare(strict_types=1);

namespace Database\\Factories\\{ns};

use {model};
use Illuminate\\Database\\Eloquent\\Factories\\Factory;

/**
 * @extends Factory<{class_name if False else model.split(chr(92))[-1]}>
 */
class {class_name} extends Factory
{{
    protected $model = {model.split(chr(92))[-1]}::class;

    public function definition(): array
    {{
        return [
{definition}
        ];
    }}
{extras}}}
"""


def policy(ns: str, class_name: str, model: str, view_public: bool = False, owner: bool = False) -> str:
    model_short = model.split("\\")[-1]
    view = "true" if view_public else "$user->administrator()"
    extra = ""
    if owner:
        extra = """
    public function view(User $user, %s $record): bool
    {
        return $user->administrator()
            || $user->client?->id === $record->client_id;
    }
""" % model_short
        view_any = "$user->administrator()"
        methods = f"""    public function viewAny(User $user): bool
    {{
        return {view_any};
    }}
{extra}
    public function create(User $user): bool
    {{
        return $user->administrator() || $user->client !== null;
    }}

    public function update(User $user, {model_short} $record): bool
    {{
        return $user->administrator()
            || $user->client?->id === $record->client_id;
    }}

    public function delete(User $user, {model_short} $record): bool
    {{
        return $user->administrator()
            || $user->client?->id === $record->client_id;
    }}
"""
    else:
        methods = f"""    public function viewAny(User $user): bool
    {{
        return {view};
    }}

    public function view(?User $user, {model_short} $record): bool
    {{
        return {'true' if view_public else '$user?->administrator() ?? false'};
    }}

    public function create(User $user): bool
    {{
        return $user->administrator();
    }}

    public function update(User $user, {model_short} $record): bool
    {{
        return $user->administrator();
    }}

    public function delete(User $user, {model_short} $record): bool
    {{
        return $user->administrator();
    }}
"""
    return f"""<?php

declare(strict_types=1);

namespace App\\Modules\\{ns}\\Policies;

use App\\Models\\User;
use {model};

class {class_name}
{{
{methods}}}
"""


def main() -> None:
    factories = {
        "database/factories/Identity/AdminFactory.php": """<?php

declare(strict_types=1);

namespace Database\\Factories\\Identity;

use App\\Models\\User;
use App\\Modules\\Identity\\Models\\Admin;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;

/**
 * @extends Factory<Admin>
 */
class AdminFactory extends Factory
{
    protected $model = Admin::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'role' => 'admin',
            'root_at' => now(),
            'revoked_at' => null,
        ];
    }

    public function revoked(): static
    {
        return $this->state(fn (array $attributes): array => [
            'revoked_at' => now(),
        ]);
    }
}
""",
        "database/factories/Accounts/ClientFactory.php": """<?php

declare(strict_types=1);

namespace Database\\Factories\\Accounts;

use App\\Models\\User;
use App\\Modules\\Accounts\\Models\\Client;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;

/**
 * @extends Factory<Client>
 */
class ClientFactory extends Factory
{
    protected $model = Client::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'phone' => fake()->numerify('+225########'),
        ];
    }
}
""",
        "database/factories/Accounts/AddressFactory.php": """<?php

declare(strict_types=1);

namespace Database\\Factories\\Accounts;

use App\\Modules\\Accounts\\Models\\Address;
use App\\Modules\\Accounts\\Models\\Client;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;

/**
 * @extends Factory<Address>
 */
class AddressFactory extends Factory
{
    protected $model = Address::class;

    public function definition(): array
    {
        return [
            'client_id' => Client::factory(),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'line_1' => fake()->streetAddress(),
            'city' => 'Abidjan',
            'country' => 'CI',
            'phone' => fake()->numerify('+225########'),
        ];
    }
}
""",
        "database/factories/Catalog/CategoryFactory.php": """<?php

declare(strict_types=1);

namespace Database\\Factories\\Catalog;

use App\\Modules\\Catalog\\Models\\Category;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;
use Illuminate\\Support\\Str;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'slug' => Str::slug($name),
            'name' => $name,
            'description' => fake()->sentence(),
            'order' => 0,
        ];
    }
}
""",
        "database/factories/Catalog/ProductFactory.php": """<?php

declare(strict_types=1);

namespace Database\\Factories\\Catalog;

use App\\Modules\\Catalog\\Models\\Category;
use App\\Modules\\Catalog\\Models\\Product;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;
use Illuminate\\Support\\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $title = fake()->unique()->words(3, true);

        return [
            'category_id' => Category::factory(),
            'slug' => Str::slug($title).'-'.fake()->unique()->numerify('###'),
            'title' => $title,
            'summary' => fake()->sentence(),
            'sku' => strtoupper(fake()->unique()->bothify('SKU-####')),
            'regular_price' => 25000,
            'stock' => 10,
            'visible_at' => now(),
            'published_at' => now(),
        ];
    }

    public function child(?Product $parent = null): static
    {
        return $this->state(function (array $attributes) use ($parent): array {
            $parent ??= Product::factory()->create(['parent_id' => null, 'regular_price' => null, 'stock' => 0]);

            return [
                'category_id' => $parent->category_id,
                'parent_id' => $parent->id,
                'label' => '50ml',
                'regular_price' => 25000,
                'stock' => 8,
            ];
        });
    }

    public function parentProduct(): static
    {
        return $this->state(fn (array $attributes): array => [
            'parent_id' => null,
            'regular_price' => null,
            'stock' => 0,
        ]);
    }
}
""",
        "database/factories/Catalog/ProductBadgeFactory.php": """<?php

declare(strict_types=1);

namespace Database\\Factories\\Catalog;

use App\\Modules\\Catalog\\Models\\Product;
use App\\Modules\\Catalog\\Models\\Badge;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;

/**
 * @extends Factory<Badge>
 */
class ProductBadgeFactory extends Factory
{
    protected $model = Badge::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'label' => 'BEST SELLER',
            'type' => 'sale',
        ];
    }
}
""",
        "database/factories/Catalog/FileFactory.php": """<?php

declare(strict_types=1);

namespace Database\\Factories\\Catalog;

use App\\Modules\\Catalog\\Models\\File;
use App\\Modules\\Catalog\\Models\\Product;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;

/**
 * @extends Factory<File>
 */
class FileFactory extends Factory
{
    protected $model = File::class;

    public function definition(): array
    {
        $path = '/assets/images/product/square/product-1.jpg';

        return [
            'fileable_type' => Product::class,
            'fileable_id' => Product::factory(),
            'disk' => 'public',
            'path' => $path,
            'url' => $path,
            'mime_type' => 'image/jpeg',
            'size' => 1024,
        ];
    }
}
""",
        "database/factories/Shopping/CouponFactory.php": """<?php

declare(strict_types=1);

namespace Database\\Factories\\Shopping;

use App\\Modules\\Shopping\\Enums\\CouponType;
use App\\Modules\\Shopping\\Models\\Coupon;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;

/**
 * @extends Factory<Coupon>
 */
class CouponFactory extends Factory
{
    protected $model = Coupon::class;

    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->unique()->bothify('SAVE##')),
            'type' => CouponType::Percentage,
            'value' => 15,
            'min_spend' => null,
            'max_uses' => null,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addMonth(),
        ];
    }

    public function fixed(int $amount = 5000): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => CouponType::Fixed,
            'value' => $amount,
        ]);
    }
}
""",
        "database/factories/Shopping/CartFactory.php": """<?php

declare(strict_types=1);

namespace Database\\Factories\\Shopping;

use App\\Modules\\Shopping\\Models\\Cart;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;
use Illuminate\\Support\\Str;

/**
 * @extends Factory<Cart>
 */
class CartFactory extends Factory
{
    protected $model = Cart::class;

    public function definition(): array
    {
        return [
            'guest_token' => Str::uuid()->toString(),
        ];
    }
}
""",
        "database/factories/Shopping/CartItemFactory.php": """<?php

declare(strict_types=1);

namespace Database\\Factories\\Shopping;

use App\\Modules\\Catalog\\Models\\Product;
use App\\Modules\\Shopping\\Models\\Cart;
use App\\Modules\\Shopping\\Models\\Item;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;

/**
 * @extends Factory<Item>
 */
class CartItemFactory extends Factory
{
    protected $model = Item::class;

    public function definition(): array
    {
        return [
            'cart_id' => Cart::factory(),
            'product_id' => Product::factory(),
            'quantity' => 1,
        ];
    }
}
""",
        "database/factories/Shopping/WishlistItemFactory.php": """<?php

declare(strict_types=1);

namespace Database\\Factories\\Shopping;

use App\\Modules\\Accounts\\Models\\Client;
use App\\Modules\\Catalog\\Models\\Product;
use App\\Modules\\Shopping\\Models\\Item;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;

/**
 * @extends Factory<Item>
 */
class WishlistItemFactory extends Factory
{
    protected $model = Item::class;

    public function definition(): array
    {
        return [
            'client_id' => Client::factory(),
            'product_id' => Product::factory(),
        ];
    }
}
""",
        "database/factories/Shopping/ComparisonItemFactory.php": """<?php

declare(strict_types=1);

namespace Database\\Factories\\Shopping;

use App\\Modules\\Accounts\\Models\\Client;
use App\\Modules\\Catalog\\Models\\Product;
use App\\Modules\\Shopping\\Models\\Item;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;

/**
 * @extends Factory<Item>
 */
class ComparisonItemFactory extends Factory
{
    protected $model = Item::class;

    public function definition(): array
    {
        return [
            'client_id' => Client::factory(),
            'product_id' => Product::factory(),
        ];
    }
}
""",
        "database/factories/Orders/DeliveryMethodFactory.php": """<?php

declare(strict_types=1);

namespace Database\\Factories\\Orders;

use App\\Modules\\Orders\\Models\\Method;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;
use Illuminate\\Support\\Str;

/**
 * @extends Factory<Method>
 */
class DeliveryMethodFactory extends Factory
{
    protected $model = Method::class;

    public function definition(): array
    {
        $name = 'Standard delivery (placeholder tariff)';

        return [
            'slug' => Str::slug($name).'-'.fake()->unique()->numerify('##'),
            'name' => $name,
            'zone' => 'Abidjan',
            'carrier' => 'placeholder',
            'amount' => 2000,
            'cost' => 1500,
            'position' => 0,
            'visible_at' => now(),
        ];
    }
}
""",
        "database/factories/Orders/OrderFactory.php": """<?php

declare(strict_types=1);

namespace Database\\Factories\\Orders;

use App\\Modules\\Orders\\Models\\Order;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;
use Illuminate\\Support\\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'email' => fake()->safeEmail(),
            'gateway' => 'null',
            'reference' => strtoupper((string) Str::ulid()),
            'currency' => 'XOF',
            'subtotal' => 0,
            'total' => 0,
            'destination' => [
                'first_name' => 'Awa',
                'last_name' => 'Kone',
                'line_1' => 'Cocody',
                'city' => 'Abidjan',
                'country' => 'CI',
                'phone' => '+22500000000',
            ],
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes): array => [
            'placed_at' => null,
        ]);
    }

    public function placed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'placed_at' => now(),
            'subtotal' => 25000,
            'total' => 27000,
        ]);
    }

    public function paid(): static
    {
        return $this->placed()->state(fn (array $attributes): array => [
            'paid_at' => now(),
        ]);
    }
}
""",
        "database/factories/Orders/OrderItemFactory.php": """<?php

declare(strict_types=1);

namespace Database\\Factories\\Orders;

use App\\Modules\\Catalog\\Models\\Product;
use App\\Modules\\Orders\\Models\\Order;
use App\\Modules\\Orders\\Models\\Item;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;

/**
 * @extends Factory<Item>
 */
class OrderItemFactory extends Factory
{
    protected $model = Item::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'product_id' => Product::factory(),
            'title' => 'Hydraglow Daily Gel Cleanser',
            'label' => '30ml',
            'unit_price' => 25,
            'quantity' => 1,
            'total' => 25,
        ];
    }
}
""",
        "database/factories/Orders/OrderAdjustmentFactory.php": """<?php

declare(strict_types=1);

namespace Database\\Factories\\Orders;

use App\\Modules\\Orders\\Enums\\AdjustmentType;
use App\\Modules\\Orders\\Enums\\Operation;
use App\\Modules\\Orders\\Models\\Order;
use App\\Modules\\Orders\\Models\\Adjustment;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;

/**
 * @extends Factory<Adjustment>
 */
class OrderAdjustmentFactory extends Factory
{
    protected $model = Adjustment::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'type' => AdjustmentType::Shipping,
            'operation' => Operation::Add,
            'amount' => 2000,
            'label' => 'Standard delivery',
        ];
    }
}
""",
        "database/factories/Orders/DeliveryFactory.php": """<?php

declare(strict_types=1);

namespace Database\\Factories\\Orders;

use App\\Modules\\Orders\\Models\\Delivery;
use App\\Modules\\Orders\\Models\\Order;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;

/**
 * @extends Factory<Delivery>
 */
class DeliveryFactory extends Factory
{
    protected $model = Delivery::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory()->placed(),
            'carrier' => 'placeholder',
            'cost' => 1500,
        ];
    }
}
""",
        "database/factories/Payments/PaymentFactory.php": """<?php

declare(strict_types=1);

namespace Database\\Factories\\Payments;

use App\\Modules\\Orders\\Models\\Order;
use App\\Modules\\Payments\\Models\\Payment;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory()->placed(),
            'amount' => 27000,
            'currency' => 'XOF',
        ];
    }
}
""",
        "database/factories/Payments/AttemptFactory.php": """<?php

declare(strict_types=1);

namespace Database\\Factories\\Payments;

use App\\Modules\\Payments\\Models\\Payment;
use App\\Modules\\Payments\\Models\\Payment\\Attempt;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;
use Illuminate\\Support\\Str;

/**
 * @extends Factory<Attempt>
 */
class AttemptFactory extends Factory
{
    protected $model = Attempt::class;

    public function definition(): array
    {
        return [
            'payment_id' => Payment::factory(),
            'gateway' => 'null',
            'reference' => strtoupper((string) Str::ulid()),
            'amount' => 27000,
            'currency' => 'XOF',
            'initiated_at' => now(),
        ];
    }
}
""",
        "database/factories/Payments/NotificationFactory.php": """<?php

declare(strict_types=1);

namespace Database\\Factories\\Payments;

use App\\Modules\\Payments\\Models\\Payment\\Notification;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;
use Illuminate\\Support\\Str;

/**
 * @extends Factory<Notification>
 */
class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    public function definition(): array
    {
        return [
            'gateway' => 'null',
            'reference' => strtoupper((string) Str::ulid()),
            'payload' => ['raw' => true],
        ];
    }
}
""",
        "database/factories/Content/PageFactory.php": """<?php

declare(strict_types=1);

namespace Database\\Factories\\Content;

use App\\Modules\\Content\\Models\\Page;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;
use Illuminate\\Support\\Str;

/**
 * @extends Factory<Page>
 */
class PageFactory extends Factory
{
    protected $model = Page::class;

    public function definition(): array
    {
        $title = fake()->unique()->sentence(3);

        return [
            'slug' => Str::slug($title),
            'title' => $title,
            'content' => '<p>'.fake()->paragraph().'</p>',
            'published_at' => now(),
        ];
    }
}
""",
        "database/factories/Content/BannerFactory.php": """<?php

declare(strict_types=1);

namespace Database\\Factories\\Content;

use App\\Modules\\Content\\Models\\Banner;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;
use Illuminate\\Support\\Str;

/**
 * @extends Factory<Banner>
 */
class BannerFactory extends Factory
{
    protected $model = Banner::class;

    public function definition(): array
    {
        return [
            'key' => Str::slug(fake()->unique()->words(2, true)),
            'title' => fake()->sentence(4),
            'image_url' => '/assets/images/slider/slider-2.jpg',
            'link_url' => '/shop',
            'order' => 0,
            'visible_at' => now(),
        ];
    }
}
""",
        "database/factories/Leads/NewsletterSubscriptionFactory.php": """<?php

declare(strict_types=1);

namespace Database\\Factories\\Leads;

use App\\Modules\\Leads\\Models\\Subscription;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;

/**
 * @extends Factory<Subscription>
 */
class NewsletterSubscriptionFactory extends Factory
{
    protected $model = Subscription::class;

    public function definition(): array
    {
        return [
            'email' => fake()->unique()->safeEmail(),
            'confirmed_at' => now(),
        ];
    }
}
""",
        "database/factories/Leads/ContactMessageFactory.php": """<?php

declare(strict_types=1);

namespace Database\\Factories\\Leads;

use App\\Modules\\Leads\\Models\\Message;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;

/**
 * @extends Factory<Message>
 */
class ContactMessageFactory extends Factory
{
    protected $model = Message::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'subject' => fake()->sentence(4),
            'message' => fake()->paragraph(),
        ];
    }
}
""",
        "database/factories/Shared/TranslationFactory.php": """<?php

declare(strict_types=1);

namespace Database\\Factories\\Shared;

use App\\Modules\\Catalog\\Models\\Product;
use App\\Shared\\Translations\\Translation;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;

/**
 * @extends Factory<Translation>
 */
class TranslationFactory extends Factory
{
    protected $model = Translation::class;

    public function definition(): array
    {
        return [
            'translatable_type' => Product::class,
            'translatable_id' => Product::factory(),
            'locale' => 'fr',
            'field' => 'title',
            'value' => 'Titre traduit',
        ];
    }
}
""",
    }

    for rel, body in factories.items():
        w(rel, body)

    print("factories done")


if __name__ == "__main__":
    main()
