// next.config.jsはtsファイルにするとnpm run build時にエラーになるため、jsファイルで定義する必要があり、
// next.config.jsファイルから読み込んでいる本ファイルもjsファイルとして定義する必要があるため、tsファイルではなくjsファイルとして定義している。
module.exports = {
  // Endpoints
  backendUrl: process.env.NEXT_PUBLIC_API_URL,
  frontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL,

  payjpPKey: process.env.NEXT_PUBLIC_PAYJP_PUBLIC_KEY,

  basePath: process.env.NODE_ENV == 'development' ? '/development' : '',

  tokenType: 'Token ',
  storageAdminTokenKeyName: 'adminAccessToken',
  storageAgencyTokenKeyName: 'agencyAccessToken',

  // API URL
  loginEndpointUrl: '/api/login',
  adminSignUpUrl: '/admin/signup',
  adminLoginUrl: '/admin/login',
  getAdminsUrl: '/admins',
  getAdminUrl: '/admin/{id}',
  adminUpdateUrl: '/admin/update',
  createAdminAgencyUrl: '/admin/agency/signup',
  getAgenciesUrl: '/agencies',
  adminSalesUrl: '/admin/sales',
  adminDeliveriesUrl: '/admin/deliveries',
  createRewardUrl: '/admin/add/reward',
  getRewardsUrl: '/admin/rewards',
  updateRewardUrl: '/admin/update/reward',

  agencyLoginUrl: '/agency/login',
  getAgencyUrl: '/agency/{id}',
  createAgencyUrl: '/agency/signup',
  updateAgencyUrl: '/agency/update',
  resetPasswordUrl: '/agency/reset/password',
  getAgencySalesUrl: '/agency/sales',
  getAgencyRewardsUrl: '/agency/rewards',
  getPlacesUrl: '/agency/places',
  exitAgencyUrl: '/agency/exit',

  addSaleUrl: '/users/sale',
  updateSaleCompleteUrl: '/users/sale/update/complete',
  checkCouponCodeUrl: '/users/check/coupon-code',

  getBanksUrl: '/banks',

  payjpPaymentUrl: '/payment/card',
  paypayPaymentUrl: '/payment/paypay',

  addInDataUrl: '/add/in',
  getInDataUrl: '/get/in',

  getPlaceByKeyUrl: '/out/place',
  getAgencyByKeyUrl: '/out/agency',
  sendContactByMailUrl: '/contact/mail',

  // Frontend URL
  frontPrivacyUrl: '/privacy',
  frontTokushohouUrl: '/tokushohou',
  frontContactUrl: '/contact',
  frontContactCompleteUrl: '/contact-complete',

  frontInUrl: '/in/{place-url-key}',
  frontInCompletedUrl: '/in-completed/{place-url-key}',

  frontOutUrl: '/out/{place-url-key}',
  frontOutConfirmdUrl: '/out-confirm/{place-url-key}',
  frontOutCompletedUrl: '/out-completed/{place-url-key}',

  frontAdminIndexUrl: '/admin',
  frontAdminLoginUrl: '/admin/login',
  frontAdminLogoutUrl: '/admin/logout',
  frontAdminUserListUrl: '/admin/user-list',
  frontAdminAddUserUrl: '/admin/add-user',
  frontAdminEditUserUrl: '/admin/edit-user',
  frontAdminSaleListUrl: '/admin/sale-list',
  frontAdminPaymentListUrl: '/admin/payment-list',
  frontAdminAgencyIndexUrl: '/admin/agencys/agency',
  frontAdminAgencyListUrl: '/admin/agencys/agency-list',
  frontAdminAgencyAddAgencyUrl: '/admin/agencys/add-agency',
  frontAdminAgencyRegistryUrl: '/admin/agencys/admin-agency-registry',
  frontAdminAgencyHistoryUrl: '/admin/agencys/admin-agency-history',
  frontAdminAgencySalesUrl: '/admin/agencys/admin-agency-sales',
  frontAdminAgencyRewardsUrl: '/admin/agencys/admin-agency-rewards',

  frontAgencyIndexUrl: '/agency',
  frontAgencyLoginUrl: '/agency/agency-login',
  frontAgencyLogoutUrl: '/agency/logout',
  frontAgencyUserListUrl: '/agency/user-list',
  frontAgencySaleListUrl: '/agency/sale-list',
  frontAgencySalesUrl: '/agency/agency-sales',
  frontAgencyRewardsUrl: '/agency/agency-rewards',
  frontAgencyNewAgencyUrl: '/agency/new-agency',
  frontAgencyHistoryUrl: '/agency/agency-history',
  frontAgencyRegistryUrl: '/agency/agency-registry',
  frontAgencyResetPasswordUrl: '/agency/reset-password',
};
