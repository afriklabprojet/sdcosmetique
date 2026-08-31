/* eslint-disable @typescript-eslint/no-namespace */
import { PaymentGateway, PaymentMethod } from '@/shared/types/domain.type';

export namespace Gateway {
  export function resolve(method: PaymentMethod): PaymentGateway {
    return method === PaymentMethod.CASH_ON_DELIVERY
      ? PaymentGateway.NULL
      : PaymentGateway.JEKO;
  }
}
