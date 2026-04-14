/**
 * Authentication Hooks & Utilities Index
 * Central export point for all authentication-related functionality
 * MVP: OTP verification removed for simplicity
 */

// Core authentication functions
export { default as setRole } from '../services/setVendorAsRoleOnRegister';
export { default as checkUserExists } from './useCheckUserExists';
export { default as googleLogin } from './useGoogleAuth';
export { default as loginUser } from './useLoginUser';
export { default as registerUser } from './useRegisterUser';

// Authentication state management
export { default as useAuthenticationState } from './useAuthenticationState';
export type { AuthState } from './useAuthenticationState';

// Helper utilities
export {
  isAuthError, isDevelopment, isValidEmail, maskEmail, parseAuthError, sanitizeEmail, validateLoginForm, validatePassword, validateRegistrationForm
} from './authHelpers';
export type { ValidationResult } from './authHelpers';

// Other user-related hooks
export { default as useGetUserEmail } from '@/features/profile/hooks/useGetUserEmail';
export { default as useLogoutUser } from './useLogoutUser';
export { default as usePasswordChange } from './usePasswordChange';

