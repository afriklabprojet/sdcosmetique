<?php

declare(strict_types=1);

namespace App\Modules\Testimonials\Providers;

use App\Modules\Testimonials\Models\Testimonial;
use App\Modules\Testimonials\Policies\TestimonialPolicy;
use App\Shared\Modules\ModuleServiceProvider as BaseModuleServiceProvider;

class ModuleServiceProvider extends BaseModuleServiceProvider
{
    public function name(): string
    {
        return 'testimonials';
    }

    /**
     * @return array<class-string, class-string>
     */
    public function policies(): array
    {
        return [
            Testimonial::class => TestimonialPolicy::class,
        ];
    }
}
