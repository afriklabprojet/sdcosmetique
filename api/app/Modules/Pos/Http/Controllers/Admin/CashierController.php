<?php

declare(strict_types=1);

namespace App\Modules\Pos\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Identity\Enums\AdminRole;
use App\Modules\Identity\Models\Admin;
use App\Modules\Pos\Http\Requests\Admin\CashierRequest;
use App\Modules\Pos\Models\CashRegisterSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class CashierController extends Controller
{
    public function index(): JsonResponse
    {
        abort_unless(request()->user()?->admin?->tier() === AdminRole::SuperAdmin, 403);

        $cashiers = Admin::query()
            ->where('role', AdminRole::Cashier->value)
            ->with('user:id,name,email')
            ->latest()
            ->get();

        return response()->json(['data' => $cashiers->map($this->payload(...))->values()]);
    }

    public function store(CashierRequest $request): JsonResponse
    {
        $cashier = DB::transaction(function () use ($request): Admin {
            $user = User::query()->create([
                'name' => $request->validated('name'),
                'email' => $request->validated('email'),
                'password' => $request->validated('password'),
                'email_verified_at' => now(),
            ]);

            return Admin::query()->create([
                'user_id' => $user->id,
                'role' => AdminRole::Cashier->value,
                'root_at' => null,
                'revoked_at' => null,
            ]);
        });

        return response()->json(['data' => $this->payload($cashier->load('user'))], 201);
    }

    public function update(CashierRequest $request, Admin $cashier): JsonResponse
    {
        $this->ensureCashier($cashier);
        $active = (bool) $request->validated('active', $cashier->active());

        if (! $active) {
            $this->ensureNoOpenSession($cashier);
        }

        DB::transaction(function () use ($request, $cashier, $active): void {
            $attributes = [
                'name' => $request->validated('name'),
                'email' => $request->validated('email'),
            ];

            if ($request->filled('password')) {
                $attributes['password'] = $request->validated('password');
            }

            $cashier->user->update($attributes);
            $cashier->forceFill(['revoked_at' => $active ? null : now()])->save();
        });

        return response()->json(['data' => $this->payload($cashier->refresh()->load('user'))]);
    }

    public function destroy(Admin $cashier): Response
    {
        abort_unless(request()->user()?->admin?->tier() === AdminRole::SuperAdmin, 403);
        $this->ensureCashier($cashier);
        $this->ensureNoOpenSession($cashier);
        $cashier->revoke();

        return response()->noContent();
    }

    private function ensureCashier(Admin $cashier): void
    {
        abort_unless($cashier->tier() === AdminRole::Cashier && ! $cashier->root(), 404);
    }

    private function ensureNoOpenSession(Admin $cashier): void
    {
        abort_if(
            CashRegisterSession::query()->where('admin_id', $cashier->id)->where('status', 'open')->exists(),
            422,
            'Fermez la session de caisse de cette caissière avant de désactiver son compte.',
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Admin $cashier): array
    {
        return [
            'id' => $cashier->id,
            'name' => $cashier->user->name,
            'email' => $cashier->user->email,
            'active' => $cashier->active(),
            'has_open_session' => CashRegisterSession::query()
                ->where('admin_id', $cashier->id)
                ->where('status', 'open')
                ->exists(),
            'created_at' => $cashier->created_at,
        ];
    }
}
