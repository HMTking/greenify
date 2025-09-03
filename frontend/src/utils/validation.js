import { VALIDATION_PATTERNS, VALIDATION_LIMITS, ERROR_MESSAGES } from './constants';

/**
 * Frontend validation utility functions
 */
export class ValidationUtils {
  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {object} - { isValid: boolean, message: string }
   */
  static validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return { isValid: false, message: 'Email is required' };
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedEmail.length < VALIDATION_LIMITS.EMAIL.MIN) {
      return { isValid: false, message: `Email must be at least ${VALIDATION_LIMITS.EMAIL.MIN} characters` };
    }

    if (!VALIDATION_PATTERNS.EMAIL.test(trimmedEmail)) {
      return { isValid: false, message: 'Enter a valid email address' };
    }

    if (trimmedEmail.includes('..')) {
      return { isValid: false, message: 'Email cannot contain consecutive dots' };
    }

    return { isValid: true, message: '' };
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {object} - { isValid: boolean, message: string }
   */
  static validatePassword(password) {
    if (!password) {
      return { isValid: false, message: 'Password is required' };
    }

    if (password.length < VALIDATION_LIMITS.PASSWORD.MIN) {
      return { 
        isValid: false, 
        message: `Password must be at least ${VALIDATION_LIMITS.PASSWORD.MIN} characters long` 
      };
    }

    if (!VALIDATION_PATTERNS.PASSWORD.test(password)) {
      return { 
        isValid: false, 
        message: 'Password must contain uppercase, lowercase, and special characters' 
      };
    }

    return { isValid: true, message: '' };
  }

  /**
   * Validate name format
   * @param {string} name - Name to validate
   * @returns {object} - { isValid: boolean, message: string }
   */
  static validateName(name) {
    if (!name || typeof name !== 'string') {
      return { isValid: false, message: 'Name is required' };
    }

    const trimmedName = name.trim();

    if (trimmedName.length < VALIDATION_LIMITS.NAME.MIN) {
      return { 
        isValid: false, 
        message: `Name must be at least ${VALIDATION_LIMITS.NAME.MIN} characters long` 
      };
    }

    if (trimmedName.length > VALIDATION_LIMITS.NAME.MAX) {
      return { 
        isValid: false, 
        message: `Name cannot exceed ${VALIDATION_LIMITS.NAME.MAX} characters` 
      };
    }

    if (!VALIDATION_PATTERNS.NAME.test(trimmedName)) {
      return { 
        isValid: false, 
        message: 'Name can only contain letters, spaces, hyphens, and apostrophes' 
      };
    }

    return { isValid: true, message: '' };
  }

  /**
   * Validate phone number
   * @param {string} phone - Phone number to validate
   * @returns {object} - { isValid: boolean, message: string }
   */
  static validatePhone(phone) {
    if (!phone) {
      return { isValid: false, message: 'Phone number is required' };
    }

    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length !== VALIDATION_LIMITS.PHONE.LENGTH) {
      return { 
        isValid: false, 
        message: `Phone number must be exactly ${VALIDATION_LIMITS.PHONE.LENGTH} digits` 
      };
    }

    if (!VALIDATION_PATTERNS.PHONE_INDIAN.test(cleanPhone)) {
      return { 
        isValid: false, 
        message: 'Please enter a valid Indian mobile number starting with 6-9' 
      };
    }

    return { isValid: true, message: '' };
  }

  /**
   * Validate ZIP code
   * @param {string} zipCode - ZIP code to validate
   * @returns {object} - { isValid: boolean, message: string }
   */
  static validateZipCode(zipCode) {
    if (!zipCode) {
      return { isValid: false, message: 'ZIP code is required' };
    }

    const cleanZip = zipCode.replace(/\D/g, '');

    if (cleanZip.length !== VALIDATION_LIMITS.ZIP_CODE.LENGTH) {
      return { 
        isValid: false, 
        message: `ZIP code must be exactly ${VALIDATION_LIMITS.ZIP_CODE.LENGTH} digits` 
      };
    }

    return { isValid: true, message: '' };
  }

  /**
   * Validate city or state
   * @param {string} value - City or state name
   * @param {string} type - 'city' or 'state'
   * @returns {object} - { isValid: boolean, message: string }
   */
  static validateCityOrState(value, type = 'city') {
    if (!value || typeof value !== 'string') {
      return { 
        isValid: false, 
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} is required` 
      };
    }

    const trimmed = value.trim();

    if (trimmed.length < 2) {
      return { 
        isValid: false, 
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} name must be at least 2 characters` 
      };
    }

    if (!VALIDATION_PATTERNS.CITY_STATE.test(trimmed)) {
      return { 
        isValid: false, 
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} name can only contain letters and spaces` 
      };
    }

    return { isValid: true, message: '' };
  }

  /**
   * Validate rating
   * @param {number} rating - Rating to validate
   * @returns {object} - { isValid: boolean, message: string }
   */
  static validateRating(rating) {
    if (!rating) {
      return { isValid: false, message: 'Rating is required' };
    }

    const numRating = Number(rating);

    if (numRating < VALIDATION_LIMITS.RATING.MIN || numRating > VALIDATION_LIMITS.RATING.MAX) {
      return { 
        isValid: false, 
        message: `Rating must be between ${VALIDATION_LIMITS.RATING.MIN} and ${VALIDATION_LIMITS.RATING.MAX}` 
      };
    }

    return { isValid: true, message: '' };
  }

  /**
   * React Hook Form validation rules
   */
  static formValidationRules = {
    email: {
      required: ERROR_MESSAGES.VALIDATION.EMAIL_REQUIRED,
      pattern: {
        value: VALIDATION_PATTERNS.EMAIL,
        message: ERROR_MESSAGES.VALIDATION.EMAIL_INVALID,
      },
      minLength: {
        value: VALIDATION_LIMITS.EMAIL.MIN,
        message: `Email must be at least ${VALIDATION_LIMITS.EMAIL.MIN} characters`,
      },
      validate: {
        noConsecutiveDots: (value) =>
          !value.includes("..") ||
          "Email cannot contain consecutive dots",
        validDomain: (value) => {
          const domain = value.split("@")[1];
          return (
            !domain ||
            (!domain.startsWith(".") && !domain.endsWith(".")) ||
            "Invalid domain format"
          );
        },
        noSpaces: (value) =>
          !/\s/.test(value) || "Email cannot contain spaces",
      },
    },
    
    password: {
      required: ERROR_MESSAGES.VALIDATION.PASSWORD_REQUIRED,
      minLength: {
        value: VALIDATION_LIMITS.PASSWORD.MIN,
        message: `Password must be at least ${VALIDATION_LIMITS.PASSWORD.MIN} characters`,
      },
      pattern: {
        value: VALIDATION_PATTERNS.PASSWORD,
        message: ERROR_MESSAGES.VALIDATION.PASSWORD_INVALID,
      },
    },

    confirmPassword: {
      required: "Please confirm your password",
    },
    
    name: {
      required: ERROR_MESSAGES.VALIDATION.NAME_REQUIRED,
      minLength: {
        value: VALIDATION_LIMITS.NAME.MIN,
        message: `Name must be at least ${VALIDATION_LIMITS.NAME.MIN} characters`,
      },
      maxLength: {
        value: VALIDATION_LIMITS.NAME.MAX,
        message: `Name cannot exceed ${VALIDATION_LIMITS.NAME.MAX} characters`,
      },
      pattern: {
        value: VALIDATION_PATTERNS.NAME,
        message: "Name can only contain letters, spaces, hyphens, and apostrophes",
      },
      validate: {
        noExtraSpaces: (value) =>
          (value.trim() === value && !value.includes("  ")) ||
          "Name cannot have leading/trailing spaces or multiple consecutive spaces",
        notOnlySpaces: (value) =>
          value.trim().length > 0 || "Name cannot be only spaces",
      },
    },
    
    phone: {
      required: ERROR_MESSAGES.VALIDATION.PHONE_REQUIRED,
      pattern: {
        value: VALIDATION_PATTERNS.PHONE,
        message: ERROR_MESSAGES.VALIDATION.PHONE_INVALID,
      },
    },
    
    address: {
      required: ERROR_MESSAGES.VALIDATION.ADDRESS_REQUIRED,
      minLength: {
        value: VALIDATION_LIMITS.DESCRIPTION.MIN,
        message: `Address must be at least ${VALIDATION_LIMITS.DESCRIPTION.MIN} characters`,
      },
      maxLength: {
        value: VALIDATION_LIMITS.DESCRIPTION.MAX,
        message: `Address cannot exceed ${VALIDATION_LIMITS.DESCRIPTION.MAX} characters`,
      },
    },
  };
}