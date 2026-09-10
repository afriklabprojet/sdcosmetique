<?php

declare(strict_types=1);

namespace App\Modules\Messaging\Http\Requests\Admin;

use App\Modules\Messaging\Enums\CampaignAudience;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMarketingCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'subject' => ['required', 'string', 'max:200'],
            'sender_name' => ['required', 'string', 'max:150'],
            // "rfc,dns" : format valide ET domaine capable de recevoir du courrier —
            // bloque les fautes de frappe grossières avant même d'enregistrer la campagne (§ check anti-spam).
            'sender_email' => ['required', 'email:rfc,dns', 'max:150'],
            'content' => ['required', 'string', 'max:50000'],
            'audience_type' => ['required', Rule::enum(CampaignAudience::class)],
            'audience_client_ids' => ['required_if:audience_type,manual', 'array'],
            'audience_client_ids.*' => ['integer', 'exists:clients,id'],
        ];
    }
}
