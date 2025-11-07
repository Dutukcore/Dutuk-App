/**
 * Authentication Hooks & Utilities Index
 * Central export point for all authentication-related functionality
 */

// Core authentication functions
export { default as registerUser } from './useRegisterUser';
export { default as loginUser } from './useLoginUser';
export { default as verifyOTP } from './useVerifyOTP';
export { default as googleLogin } from './useGoogleAuth';
export { default as setRole } from './setVendorAsRoleOnRegister';
export { default as getUser } from './getUser';
export { default as checkUserExists } from './useCheckUserExists';

// Authentication state management
export { default as useAuthenticationState } from './useAuthenticationState';
export type { AuthState } from './useAuthenticationState';

// Helper utilities
export {
  isValidEmail,
  validatePassword,
  sanitizeEmail,
  parseAuthError,
  isAuthError,
  maskEmail,
  validateRegistrationForm,
  validateLoginForm,
  isDevelopment,
} from './authHelpers';
export type { ValidationResult } from './authHelpers';

// Other user-related hooks
export { default as useLogoutUser } from './useLogoutUser';
export { default as useSendOTP } from './useSendOTP';
export { default as usePasswordChange } from './usePasswordChange';
export { default as useGetUserEmail } from './useGetUserEmail';
