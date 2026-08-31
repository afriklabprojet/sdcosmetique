<?php

declare(strict_types=1);

namespace App\Modules\Testimonials\Policies;

use App\Models\User;
use App\Modules\Testimonials\Models\Testimonial;

class TestimonialPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Testimonial $testimonial): bool
    {
        return $testimonial->approved() || ($user?->administrator() ?? false);
    }

    public function create(?User $user): bool
    {
        return true;
    }

    public function update(User $user, Testimonial $testimonial): bool
    {
        return $user->administrator();
    }

    public function delete(User $user, Testimonial $testimonial): bool
    {
        return $user->administrator();
    }
}
