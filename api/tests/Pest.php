<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Identity\Models\Admin;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Unit');

/**
 * Create an active admin user and return the underlying User.
 */
function admin(array $attributes = []): User
{
    return Admin::factory()->create($attributes)->user;
}
