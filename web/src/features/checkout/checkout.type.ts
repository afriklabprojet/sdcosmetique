export type CheckoutStep = 'cart' | 'delivery' | 'payment' | 'review' | 'confirmation';

export interface DeliveryInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}
