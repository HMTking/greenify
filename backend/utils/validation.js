const { VALIDATION_PATTERNS, VALIDATION_LIMITS, MESSAGES } = require('./constants');
const mongoose = require('mongoose');

/**
 * Centralized validation utility functions
 */
class ValidationUtils {
  /**
   * Validate email format and security
   * @param {string} email - Email to validate
   * @returns {object} - { isValid: boolean, message: string }
   */
  static validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return { isValid: false, message: 'Email is required' };
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedEmail.length < VALIDATION_LIMITS.EMAIL_MIN_LENGTH) {
      return { isValid: false, message: `Email must be at least ${VALIDATION_LIMITS.EMAIL_MIN_LENGTH} characters long` };
    }

    if (trimmedEmail.length > VALIDATION_LIMITS.EMAIL_MAX_LENGTH) {
      return { isValid: false, message: `Email cannot exceed ${VALIDATION_LIMITS.EMAIL_MAX_LENGTH} characters` };
    }

    if (!VALIDATION_PATTERNS.EMAIL.test(trimmedEmail)) {
      return { isValid: false, message: 'Please enter a valid email address with proper domain format' };
    }

    if (trimmedEmail.includes('..')) {
      return { isValid: false, message: 'Email cannot contain consecutive dots' };
    }

    if (/\s/.test(trimmedEmail)) {
      return { isValid: false, message: 'Email cannot contain spaces' };
    }

    const domain = trimmedEmail.split('@')[1];
    if (domain && (domain.startsWith('.') || domain.endsWith('.'))) {
      return { isValid: false, message: 'Invalid email domain format' };
    }

    return { isValid: true, message: '', value: trimmedEmail };
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {object} - { isValid: boolean, message: string }
   */
  static validatePassword(password) {
    if (!password || typeof password !== 'string') {
      return { isValid: false, message: 'Password is required' };
    }

    if (password.length < VALIDATION_LIMITS.PASSWORD_MIN_LENGTH) {
      return { isValid: false, message: `Password must be at least ${VALIDATION_LIMITS.PASSWORD_MIN_LENGTH} characters long` };
    }

    if (password.length > VALIDATION_LIMITS.PASSWORD_MAX_LENGTH) {
      return { isValid: false, message: `Password cannot exceed ${VALIDATION_LIMITS.PASSWORD_MAX_LENGTH} characters` };
    }

    if (!VALIDATION_PATTERNS.PASSWORD.test(password)) {
      return { 
        isValid: false, 
        message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 special character' 
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

    if (trimmedName.length < VALIDATION_LIMITS.NAME_MIN_LENGTH) {
      return { isValid: false, message: `Name must be at least ${VALIDATION_LIMITS.NAME_MIN_LENGTH} characters long` };
    }

    if (trimmedName.length > VALIDATION_LIMITS.NAME_MAX_LENGTH) {
      return { isValid: false, message: `Name cannot exceed ${VALIDATION_LIMITS.NAME_MAX_LENGTH} characters` };
    }

    if (!VALIDATION_PATTERNS.NAME.test(trimmedName)) {
      return { 
        isValid: false, 
        message: 'Name can only contain letters, spaces, hyphens, and apostrophes' 
      };
    }

    if (trimmedName !== name || name.includes('  ')) {
      return { 
        isValid: false, 
        message: 'Name cannot have leading/trailing spaces or multiple consecutive spaces' 
      };
    }

    return { isValid: true, message: '', value: trimmedName };
  }

  /**
   * Validate Indian phone number
   * @param {string} phone - Phone number to validate
   * @returns {object} - { isValid: boolean, message: string }
   */
  static validatePhone(phone) {
    if (!phone || typeof phone !== 'string') {
      return { isValid: false, message: 'Phone number is required' };
    }

    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length !== VALIDATION_LIMITS.PHONE.LENGTH) {
      return { isValid: false, message: `Phone number must be exactly ${VALIDATION_LIMITS.PHONE.LENGTH} digits` };
    }

    if (!VALIDATION_PATTERNS.PHONE_INDIAN.test(cleanPhone)) {
      return { isValid: false, message: 'Please enter a valid Indian mobile number starting with 6-9' };
    }

    return { isValid: true, message: '', value: cleanPhone };
  }

  /**
   * Validate Indian ZIP code
   * @param {string} zipCode - ZIP code to validate
   * @returns {object} - { isValid: boolean, message: string }
   */
  static validateZipCode(zipCode) {
    if (!zipCode || typeof zipCode !== 'string') {
      return { isValid: false, message: 'ZIP code is required' };
    }

    const cleanZip = zipCode.replace(/\D/g, '');

    if (cleanZip.length !== VALIDATION_LIMITS.ZIP_CODE.LENGTH) {
      return { isValid: false, message: `ZIP code must be exactly ${VALIDATION_LIMITS.ZIP_CODE.LENGTH} digits` };
    }

    if (!VALIDATION_PATTERNS.ZIP_CODE_INDIAN.test(cleanZip)) {
      return { isValid: false, message: 'Please enter a valid 6-digit ZIP code' };
    }

    return { isValid: true, message: '', value: cleanZip };
  }

  /**
   * Validate city/state name
   * @param {string} cityOrState - City or state name to validate
   * @param {string} type - 'city' or 'state'
   * @returns {object} - { isValid: boolean, message: string }
   */
  static validateCityOrState(cityOrState, type = 'city') {
    if (!cityOrState || typeof cityOrState !== 'string') {
      return { isValid: false, message: `${type.charAt(0).toUpperCase() + type.slice(1)} is required` };
    }

    const trimmed = cityOrState.trim();

    if (trimmed.length < 2) {
      return { isValid: false, message: `${type.charAt(0).toUpperCase() + type.slice(1)} name must be at least 2 characters` };
    }

    if (trimmed.length > 50) {
      return { isValid: false, message: `${type.charAt(0).toUpperCase() + type.slice(1)} name cannot exceed 50 characters` };
    }

    if (!VALIDATION_PATTERNS.CITY_STATE.test(trimmed)) {
      return { 
        isValid: false, 
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} name can only contain letters and spaces` 
      };
    }

    return { isValid: true, message: '', value: trimmed };
  }

  /**
   * Validate MongoDB ObjectId
   * @param {string} id - ID to validate
   * @param {string} type - Type of object (e.g., 'Plant', 'User', 'Order')
   * @returns {object} - { isValid: boolean, message: string }
   */
  static validateObjectId(id, type = 'Object') {
    if (!id) {
      return { isValid: false, message: `${type} ID is required` };
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { isValid: false, message: `Invalid ${type.toLowerCase()} ID` };
    }

    return { isValid: true, message: '' };
  }

  /**
   * Validate rating value
   * @param {number} rating - Rating to validate
   * @returns {object} - { isValid: boolean, message: string }
   */
  static validateRating(rating) {
    if (rating === undefined || rating === null) {
      return { isValid: false, message: 'Rating is required' };
    }

    const numRating = Number(rating);

    if (isNaN(numRating) || !Number.isInteger(numRating)) {
      return { isValid: false, message: 'Rating must be a whole number' };
    }

    if (numRating < VALIDATION_LIMITS.RATING.MIN || numRating > VALIDATION_LIMITS.RATING.MAX) {
      return { 
        isValid: false, 
        message: `Rating must be between ${VALIDATION_LIMITS.RATING.MIN} and ${VALIDATION_LIMITS.RATING.MAX}` 
      };
    }

    return { isValid: true, message: '', value: numRating };
  }

  /**
   * Validate price value
   * @param {number} price - Price to validate
   * @param {boolean} required - Whether price is required
   * @returns {object} - { isValid: boolean, message: string }
   */
  static validatePrice(price, required = true) {
    if (price === undefined || price === null) {
      if (required) {
        return { isValid: false, message: 'Price is required' };
      }
      return { isValid: true, message: '' };
    }

    const numPrice = Number(price);

    if (isNaN(numPrice) || !Number.isInteger(numPrice)) {
      return { isValid: false, message: 'Price must be a whole number (no decimals)' };
    }

    if (numPrice < VALIDATION_LIMITS.PRICE.MIN) {
      return { isValid: false, message: `Price must be at least ₹${VALIDATION_LIMITS.PRICE.MIN}` };
    }

    if (numPrice > VALIDATION_LIMITS.PRICE.MAX) {
      return { isValid: false, message: `Price cannot exceed ₹${VALIDATION_LIMITS.PRICE.MAX}` };
    }

    return { isValid: true, message: '', value: numPrice };
  }

  /**
   * Validate stock quantity
   * @param {number} stock - Stock quantity to validate
   * @returns {object} - { isValid: boolean, message: string }
   */
  static validateStock(stock) {
    if (stock === undefined || stock === null) {
      return { isValid: false, message: 'Stock quantity is required' };
    }

    const numStock = Number(stock);

    if (isNaN(numStock) || !Number.isInteger(numStock)) {
      return { isValid: false, message: 'Stock must be a whole number' };
    }

    if (numStock < VALIDATION_LIMITS.STOCK.MIN) {
      return { isValid: false, message: `Stock cannot be negative` };
    }

    if (numStock > VALIDATION_LIMITS.STOCK.MAX) {
      return { isValid: false, message: `Stock cannot exceed ${VALIDATION_LIMITS.STOCK.MAX}` };
    }

    return { isValid: true, message: '', value: numStock };
  }

  /**
   * Validate delivery address object
   * @param {object} address - Address object to validate
   * @returns {object} - { isValid: boolean, message: string, errors: object }
   */
  static validateAddress(address) {
    if (!address || typeof address !== 'object') {
      return { isValid: false, message: 'Delivery address is required' };
    }

    const errors = {};
    let isValid = true;

    // Validate street
    if (!address.street || typeof address.street !== 'string' || !address.street.trim()) {
      errors.street = 'Street address is required';
      isValid = false;
    } else if (address.street.trim().length < 5) {
      errors.street = 'Street address must be at least 5 characters';
      isValid = false;
    }

    // Validate city
    const cityValidation = this.validateCityOrState(address.city, 'city');
    if (!cityValidation.isValid) {
      errors.city = cityValidation.message;
      isValid = false;
    }

    // Validate state
    const stateValidation = this.validateCityOrState(address.state, 'state');
    if (!stateValidation.isValid) {
      errors.state = stateValidation.message;
      isValid = false;
    }

    // Validate ZIP code
    const zipValidation = this.validateZipCode(address.zipCode);
    if (!zipValidation.isValid) {
      errors.zipCode = zipValidation.message;
      isValid = false;
    }

    // Validate phone
    const phoneValidation = this.validatePhone(address.phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.message;
      isValid = false;
    }

    return { 
      isValid, 
      message: isValid ? '' : 'Address validation failed',
      errors: isValid ? {} : errors,
      value: isValid ? {
        street: address.street.trim(),
        city: cityValidation.value || address.city,
        state: stateValidation.value || address.state,
        zipCode: zipValidation.value || address.zipCode,
        phone: phoneValidation.value || address.phone,
      } : null
    };
  }

  /**
   * Validate plant data for creation/update
   * @param {object} plantData - Plant data object
   * @returns {object} Validation result with isValid flag and errors array
   */
  static validatePlantData(plantData) {
    const errors = [];
    const { name, description, price, originalPrice, stock, categories } = plantData;

    // Validate name
    const nameValidation = this.validateName(name);
    if (!nameValidation.isValid) {
      errors.push(nameValidation.message);
    }

    // Validate description
    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      errors.push('Plant description must be at least 10 characters long');
    } else if (description.trim().length > 1000) {
      errors.push('Plant description cannot exceed 1000 characters');
    }

    // Validate price
    const priceValidation = this.validatePrice(price);
    if (!priceValidation.isValid) {
      errors.push(priceValidation.message);
    }

    // Validate original price if provided
    if (originalPrice) {
      const originalPriceValidation = this.validatePrice(originalPrice, false);
      if (!originalPriceValidation.isValid) {
        errors.push(`Original ${originalPriceValidation.message.toLowerCase()}`);
      } else if (originalPriceValidation.value < priceValidation.value) {
        errors.push('Original price must be greater than or equal to the current price');
      }
    }

    // Validate stock
    const stockValidation = this.validateStock(stock);
    if (!stockValidation.isValid) {
      errors.push(stockValidation.message);
    }

    // Validate categories
    if (!categories || (Array.isArray(categories) && categories.length === 0)) {
      errors.push('At least one category must be selected');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = ValidationUtils;
