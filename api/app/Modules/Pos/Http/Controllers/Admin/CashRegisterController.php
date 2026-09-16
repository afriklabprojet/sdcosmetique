<?php

declare(strict_types=1);

namespace App\Modules\Pos\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Identity\Enums\AdminRole;
use App\Modules\Pos\Http\Requests\Admin\CloseCashSessionRequest;
use App\Modules\Pos\Http\Requests\Admin\OpenCashSessionRequest;
use App\Modules\Pos\Models\AuditLog;
use App\Modules\Pos\Models\CashRegister;
use App\Modules\Pos\Models\CashRegisterSession;
use App\Shared\Money;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CashRegisterController extends Controller
{
    public function index(): JsonResponse
    {
        $registers = CashRegister::query()->where('active', true)->orderBy('name')->get();

        return response()->json(['data' => $registers->map(fn (CashRegister $register): array => [
            'id' => $register->id,
            'name' => $register->name,
            'location' => $register->location,
            'has_open_session' => $register->currentSession() !== null,
        ])->values()]);
    }

    /** Session ouverte par le vendeur connecté, toutes caisses confondues — pour reprendre l'écran de caisse là où il l'a laissé. */
    public function current(Request $request): JsonResponse
    {
        $admin = $request->user()?->admin;
        abort_unless($admin !== null, 403);

        $session = CashRegisterSession::query()
            ->where('admin_id', $admin->id)
            ->where('status', 'open')
            ->latest('opened_at')
            ->first();

        return response()->json(['data' => $session === null ? null : $this->sessionPayload($session)]);
    }

    public function open(OpenCashSessionRequest $request): JsonResponse
    {
        $admin = $request->user()?->admin;
        abort_unless($admin !== null, 403);

        $register = CashRegister::query()->findOrFail($request->validated('cash_register_id'));

        try {
            $session = CashRegisterSession::openFor(
                $register,
                $admin,
                new Money((int) $request->validated('opening_balance')),
            );
        } catch (DomainException $e) {
            abort(422, $e->getMessage());
        }

        AuditLog::record(AuditLog::CASH_SESSION_OPENED, $session, $request->user(), new_values: [
            'cash_register_id' => $register->id,
            'opening_balance' => $session->opening_balance->value,
        ], request: $request);

        return response()->json(['data' => $this->sessionPayload($session)], 201);
    }

    /** Fermer la session d'un autre vendeur est réservé aux paliers Manager/SuperAdmin — un caissier ne ferme que la sienne (VULN-02). */
    public function close(CloseCashSessionRequest $request, CashRegisterSession $session): JsonResponse
    {
        $admin = $request->user()?->admin;
        abort_unless($admin !== null, 403);
        abort_unless($session->admin_id === $admin->id || $admin->tier() !== AdminRole::Cashier, 403);

        try {
            $session->close(
                new Money((int) $request->validated('actual_cash')),
                $request->validated('notes'),
            );
        } catch (DomainException $e) {
            abort(422, $e->getMessage());
        }

        AuditLog::record(AuditLog::CASH_SESSION_CLOSED, $session, $request->user(), new_values: [
            'expected_cash' => $session->expected_cash->value,
            'actual_cash' => $session->actual_cash->value,
            'difference' => $session->difference,
        ], request: $request);

        return response()->json(['data' => $this->sessionPayload($session)]);
    }

    /**
     * @return array<string, mixed>
     */
    private function sessionPayload(CashRegisterSession $session): array
    {
        return [
            'id' => $session->id,
            'cash_register_id' => $session->cash_register_id,
            'status' => $session->status,
            'opening_balance' => $session->opening_balance->value,
            'expected_cash' => $session->expected_cash?->value,
            'actual_cash' => $session->actual_cash?->value,
            'difference' => $session->difference,
            'totals_by_method' => $session->totalsByMethod(),
            'opened_at' => $session->opened_at,
            'closed_at' => $session->closed_at,
        ];
    }
}
