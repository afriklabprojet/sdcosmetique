<?php

declare(strict_types=1);

namespace Database\Seeders\Identity;

use App\Models\User;
use App\Modules\Identity\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::query()->updateOrCreate(
            ['email' => 'admin@ka.ci'],
            [
                'name' => 'Root Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        );

        Admin::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'role' => 'admin',
                'root_at' => now(),
                'revoked_at' => null,
            ],
        );
    }
}
