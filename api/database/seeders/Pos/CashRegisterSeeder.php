<?php

declare(strict_types=1);

namespace Database\Seeders\Pos;

use App\Modules\Pos\Models\CashRegister;
use Illuminate\Database\Seeder;

class CashRegisterSeeder extends Seeder
{
    public function run(): void
    {
        CashRegister::query()->updateOrCreate(
            ['name' => 'Caisse principale'],
            [
                'location' => 'Boutique',
                'active' => true,
            ],
        );
    }
}
