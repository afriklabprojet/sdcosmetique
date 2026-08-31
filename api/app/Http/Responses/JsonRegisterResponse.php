<?php

declare(strict_types=1);

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Symfony\Component\HttpFoundation\Response;

final class JsonRegisterResponse implements RegisterResponseContract
{
    public function toResponse($request): Response
    {
        return new JsonResponse('', 201);
    }
}
