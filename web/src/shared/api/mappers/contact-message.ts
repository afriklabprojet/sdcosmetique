import type { LaravelContactMessage } from '@/shared/api/types';
import type { ContactMessageRow } from '@/features/admin/admin.type';

export function mapContactMessage(dto: LaravelContactMessage): ContactMessageRow {
  return {
    id: String(dto.id),
    name: dto.name,
    email: dto.email,
    subject: dto.subject,
    message: dto.message,
    open: dto.open,
    created_at: dto.created_at,
  };
}
