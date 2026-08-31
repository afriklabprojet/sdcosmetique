export { ApiError, api, apiRoot, apiErrorMessage, unwrapData, type Paginated } from '@/shared/api/client';
export type * from '@/shared/api/types';
export { mapStorefrontProduct, mapAdminProduct, toAdminProductPayload, asCategory } from '@/shared/api/mappers/product';
export { mapOrder, mapOrderStatus, toLaravelOrderStatus, type MappedOrder } from '@/shared/api/mappers/order';
export { mapAdminCategory, mapStorefrontCategory, toAdminCategoryPayload } from '@/shared/api/mappers/category';
export { mapCoupon, toCouponPayload, type MappedCoupon } from '@/shared/api/mappers/coupon';
export { mapDeliveryMethod, toDeliveryMethodPayload } from '@/shared/api/mappers/delivery';
export { mapCustomer, mapNewsletterSub } from '@/shared/api/mappers/customer';
export { mapSessionUser, mapAddress, toAddressPayload, joinPersonName, type StorefrontIdentity } from '@/shared/api/mappers/account';
export {
  loginStorefront,
  registerStorefront,
  forgotPassword,
  resetPassword,
  logoutStorefront,
  fetchSession,
  fetchAccount,
  fetchStorefrontIdentity,
  updateAccount,
  updatePassword,
  fetchAddresses,
  saveAddress,
  deleteAddress,
  fetchAccountOrders,
  mirrorNextLogin,
  mirrorNextRegister,
} from '@/shared/api/auth';
