/**
 * Email validation function
 * Validates email format using regex pattern
 */
export const isValidEmail = (email: string | null | undefined): boolean => {
  if (isNullOrUndefined(email) || typeof email !== 'string') {
    return false;
  }
  
  // Email regex pattern that covers most common email formats
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

/**
 * Phone number validation function
 * Validates Vietnamese phone numbers and international formats
 */
export const isValidPhone = (phone: string | null | undefined): boolean => {
  if (isNullOrUndefined(phone) || typeof phone !== 'string') {
    return false;
  }
  
  // Remove all spaces, dashes, parentheses, and plus signs for validation
  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
  
  // Vietnamese phone number patterns:
  // - Mobile: 10 digits starting with 03, 05, 07, 08, 09
  // - Landline: 10 digits starting with 02
  // - International: 11-15 digits
  const phoneRegex = /^(?:84|0)?(?:3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-46-9])[0-9]{7}$|^(?:84|0)?2[0-9]{9}$|^[1-9][0-9]{7,14}$/;
  
  return phoneRegex.test(cleanPhone);
};

/**
 * Null or undefined check function
 * Returns true if value is null or undefined
 */
export const isNullOrUndefined = (value: any): value is null | undefined => {
  return value === null || value === undefined;
};

/**
 * Additional utility functions for common validation needs
 */

/**
 * Check if string is empty, null, or undefined
 */
export const isEmpty = (value: string | null | undefined): boolean => {
  return isNullOrUndefined(value) || value.trim() === '';
};

/**
 * Check if value is a valid non-empty string
 */
export const isValidString = (value: any): value is string => {
  return typeof value === 'string' && !isEmpty(value);
};

/**
 * URL validation function
 * Validates URL format including http, https, and common protocols
 */
export const isValidUrl = (url: string | null | undefined): boolean => {
  if (isNullOrUndefined(url) || typeof url !== 'string') {
    return false;
  }
  
  try {
    // Use URL constructor to validate
    const urlObj = new URL(url.trim());
    
    // Check if protocol is valid (http, https, ftp, etc.)
    const validProtocols = ['http:', 'https:', 'ftp:', 'ftps:'];
    return validProtocols.includes(urlObj.protocol);
  } catch {
    // If URL constructor throws an error, it's not a valid URL
    return false;
  }
};

/**
 * Validate phone number with more flexible international format
 */
export const isValidInternationalPhone = (phone: string | null | undefined): boolean => {
  if (isNullOrUndefined(phone) || typeof phone !== 'string') {
    return false;
  }
  
  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
  // International format: 7-15 digits
  const internationalPhoneRegex = /^[0-9]{7,15}$/;
  
  return internationalPhoneRegex.test(cleanPhone);
};