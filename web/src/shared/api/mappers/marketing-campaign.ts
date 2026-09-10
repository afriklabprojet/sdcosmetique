import type { MarketingCampaignRecipientRow, MarketingCampaignRow } from '@/features/admin/admin.type';
import type { LaravelMarketingCampaign, LaravelMarketingCampaignRecipient } from '@/shared/api/types';

export function mapMarketingCampaign(dto: LaravelMarketingCampaign): MarketingCampaignRow {
  return {
    id: String(dto.id),
    name: dto.name,
    subject: dto.subject,
    senderName: dto.sender_name,
    senderEmail: dto.sender_email,
    content: dto.content,
    audienceType: dto.audience_type,
    audienceClientIds: dto.audience_client_ids?.map(String) ?? null,
    status: dto.status,
    sendable: dto.sendable,
    recipientsCount: dto.recipients_count,
    sentCount: dto.sent_count,
    failedCount: dto.failed_count,
    createdBy: dto.created_by,
    startedAt: dto.started_at,
    completedAt: dto.completed_at,
    createdAt: dto.created_at,
  };
}

export function mapMarketingCampaignRecipient(dto: LaravelMarketingCampaignRecipient): MarketingCampaignRecipientRow {
  return {
    id: String(dto.id),
    clientId: String(dto.client_id),
    clientName: dto.client_name,
    email: dto.email,
    status: dto.status,
    error: dto.error,
    sentAt: dto.sent_at,
  };
}
