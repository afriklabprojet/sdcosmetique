import type { LaravelAdminPayment, LaravelAdminPaymentNotification } from '@/shared/api/types';
import type { AdminPaymentRow, AdminPaymentNotificationRow } from '@/features/admin/admin.type';

export function mapAdminPayment(dto: LaravelAdminPayment): AdminPaymentRow {
  return {
    id: String(dto.id),
    orderReference: dto.order_reference,
    amount: dto.amount,
    currency: dto.currency,
    status: dto.status,
    paidAt: dto.paid_at,
    failedAt: dto.failed_at,
    created_at: dto.created_at,
  };
}

export function mapAdminPaymentNotification(dto: LaravelAdminPaymentNotification): AdminPaymentNotificationRow {
  return {
    id: String(dto.id),
    gateway: dto.gateway,
    reference: dto.reference,
    paymentAttemptId: dto.payment_attempt_id === null ? null : String(dto.payment_attempt_id),
    failureReason: dto.failure_reason,
    handledAt: dto.handled_at,
    done: dto.done,
    payload: dto.payload,
    created_at: dto.created_at,
  };
}
