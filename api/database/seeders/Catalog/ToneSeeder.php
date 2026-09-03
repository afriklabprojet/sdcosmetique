<?php

declare(strict_types=1);

namespace Database\Seeders\Catalog;

use App\Modules\Catalog\Models\Tone;
use Illuminate\Database\Seeder;

class ToneSeeder extends Seeder
{
    public function run(): void
    {
        $tones = [
            'noir' => 'Noir',
            'marron' => 'Marron',
            'marron-clair' => 'Marron clair',
            'clair' => 'Clair',
            'metisse' => 'Métisse',
        ];

        foreach ($tones as $slug => $label) {
            Tone::updateOrCreate(['slug' => $slug], ['label' => $label]);
        }
    }
}
