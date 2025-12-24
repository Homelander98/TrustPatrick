export const authEndpoints = {
  login: () => '/api/homeowners/login',
  register: () => '/api/homeowners/create',
  forgotPassword: () => '/api/homeowners/forgot-password',
  verifyResetOtp: () => '/api/homeowners/verify-reset-otp',
  resetPassword: () => '/api/homeowners/reset-password',
  sendEmailOtp: () => '/api/homeowners/send-email-otp',
  verifyEmailOtp: () => '/api/homeowners/verify-email-otp',
  updateProfile: () => '/api/homeowners/update-profile',
} as const;
