<?php

declare(strict_types=1);

namespace App\Modules\Messaging\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Accounts\Models\Client;
use Illuminate\View\View;

/**
 * Lien de désabonnement (§9) présent dans chaque e-mail marketing — route
 * signée (`middleware('signed')`), donc infalsifiable sans qu'un compte ou
 * un token de session ne soit nécessaire : un simple clic depuis le client
 * mail suffit. N'affecte jamais les e-mails transactionnels.
 */
class UnsubscribeController extends Controller
{
    public function show(Client $client): View
    {
        $client->forceFill(['marketing_opt_in' => false])->save();

        return view('marketing.unsubscribed', ['email' => $client->user?->email]);
    }
}
