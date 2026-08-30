<?php

declare(strict_types=1);

namespace App\Modules\Identity\Providers;

use App\Modules\Identity\Models\Admin;
use App\Modules\Identity\Policies\AdminPolicy;
use App\Shared\Modules\ModuleServiceProvider as BaseModuleServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\URL;

class ModuleServiceProvider extends BaseModuleServiceProvider
{
    public function name(): string
    {
        return 'identity';
    }

    /**
     * @return array<class-string, class-string>
     */
    public function policies(): array
    {
        return [
            Admin::class => AdminPolicy::class,
        ];
    }

    public function boot(): void
    {
        parent::boot();

        ResetPassword::createUrlUsing(function (object $user, string $token): string {
            $email = urlencode($user->email);

            return config('app.frontend_url').'/reset-password?token='.$token.'&email='.$email;
        });

        VerifyEmail::createUrlUsing(function (object $notifiable): string {
            $id = $notifiable->getKey();
            $hash = sha1($notifiable->getEmailForVerification());
            $signed = URL::temporarySignedRoute(
                'verification.verify',
                now()->addMinutes(60),
                ['id' => $id, 'hash' => $hash],
            );

            return config('app.frontend_url').'/email/verify/'.$id.'/'.$hash.'?signed='.rawurlencode($signed);
        });
    }
}
