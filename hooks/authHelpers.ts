/**
 * Authentication Helper Utilities
 * Provides validation and error handling for authentication flows
 */

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns boolean - True if valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns {valid: boolean, message: string}
 */
export const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }

  // Optional: Add more strength requirements
  // if (!/[A-Z]/.test(password)) {
  //   return { valid: false, message: 'Password must contain at least one uppercase letter' };
  // }

  return { valid: true, message: 'Password is valid' };
};

/**
 * Sanitize email by trimming and converting to lowercase
 * @param email - Email to sanitize
 * @returns string - Sanitized email
 */
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
};

/**
 * Parse Supabase auth error messages into user-friendly text
 * @param error - Error object from Supabase
 * @returns string - User-friendly error message
 */
export const parseAuthError = (error: any): string => {
  if (!error) return 'An unknown error occurred';

  const message = error.message?.toLowerCase() || '';

  // Registration errors
  if (message.includes('user already registered') || message.includes('already registered')) {
    return 'An account with this email already exists. Please log in instead.';
  }

  // Login errors
  if (message.includes('invalid login credentials') || message.includes('invalid password')) {
    return 'Incorrect email or password. Please try again.';
  }

  if (message.includes('user not found')) {
    return 'No account found with this email. Please sign up first.';
  }

  // Email verification errors
  if (message.includes('email not confirmed') || message.includes('not verified')) {
    return 'Please verify your email before logging in.';
  }

  // Rate limiting
  if (message.includes('too many requests') || message.includes('rate limit')) {
    return 'Too many attempts. Please wait a few minutes before trying again.';
  }

  // OTP errors
  if (message.includes('expired') || message.includes('invalid token')) {
    return 'This verification code has expired or is invalid. Please request a new one.';
  }

  // Validation errors
  if (message.includes('password')) {
    return 'Password must be at least 6 characters long.';
  }

  if (message.includes('email') || message.includes('invalid')) {
    return 'Please enter a valid email address.';
  }

  // Network errors
  if (message.includes('network') || message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Default to original message if no match
  return error.message || 'An unexpected error occurred. Please try again.';
};

/**
 * Check if error is a known authentication error
 * @param error - Error to check
 * @returns boolean - True if it's an auth error
 */
export const isAuthError = (error: any): boolean => {
  if (!error) return false;
  
  const message = error.message?.toLowerCase() || '';
  const authKeywords = [
    'auth',
    'login',
    'password',
    'email',
    'credentials',
    'token',
    'session',
    'user',
  ];

  return authKeywords.some(keyword => message.includes(keyword));
};

/**
 * Generate a random OTP for testing purposes (development only)
 * @param length - Length of OTP
 * @returns string - Random numeric OTP
 */
export const generateTestOTP = (length: number = 6): string => {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
};

/**
 * Check if the current environment is development
 * @returns boolean
 */
export const isDevelopment = (): boolean => {
  return __DEV__ || process.env.NODE_ENV === 'development';
};

/**
 * Mask email for privacy (e.g., john@example.com -> j***@example.com)
 * @param email - Email to mask
 * @returns string - Masked email
 */
export const maskEmail = (email: string): string => {
  if (!email || !isValidEmail(email)) return email;

  const [username, domain] = email.split('@');
  if (username.length <= 2) {
    return `${username[0]}***@${domain}`;
  }

  return `${username[0]}${'*'.repeat(username.length - 1)}@${domain}`;
};

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate registration form data
 * @param email - Email address
 * @param password - Password
 * @param confirmPassword - Password confirmation (optional)
 * @returns ValidationResult
 */
export const validateRegistrationForm = (
  email: string,
  password: string,
  confirmPassword?: string
): ValidationResult => {
  const errors: string[] = [];

  // Validate email
  if (!email) {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Please enter a valid email address');
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    errors.push(passwordValidation.message);
  }

  // Validate password confirmation if provided
  if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate login form data
 * @param email - Email address
 * @param password - Password
 * @returns ValidationResult
 */
export const validateLoginForm = (
  email: string,
  password: string
): ValidationResult => {
  const errors: string[] = [];

  if (!email) {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Please enter a valid email address');
  }

  if (!password) {
    errors.push('Password is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
