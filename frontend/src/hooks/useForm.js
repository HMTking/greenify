import { useState, useCallback, useRef } from 'react';
import { ValidationUtils } from '../utils/validation';
import { UtilityHelpers, ErrorUtils } from '../utils/helpers';
import { DEBOUNCE_DELAYS } from '../utils/constants';

/**
 * Enhanced form hook with validation, loading states, and error handling
 */
export const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Debounced validation
  const debouncedValidation = useRef(
    UtilityHelpers.debounce((fieldName, value) => {
      validateField(fieldName, value);
    }, DEBOUNCE_DELAYS.INPUT_VALIDATION)
  ).current;

  /**
   * Validate a single field
   */
  const validateField = useCallback((fieldName, value) => {
    const rule = validationRules[fieldName];
    if (!rule) return '';

    let error = '';

    // Required validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      error = rule.required === true ? `${fieldName} is required` : rule.required;
    }

    // Min length validation
    if (!error && rule.minLength && value && value.length < rule.minLength) {
      error = `${fieldName} must be at least ${rule.minLength} characters`;
    }

    // Max length validation
    if (!error && rule.maxLength && value && value.length > rule.maxLength) {
      error = `${fieldName} cannot exceed ${rule.maxLength} characters`;
    }

    // Pattern validation
    if (!error && rule.pattern && value && !rule.pattern.test(value)) {
      error = rule.patternMessage || `Invalid ${fieldName} format`;
    }

    // Custom validation
    if (!error && rule.validate && value) {
      const customError = rule.validate(value, values);
      if (customError) {
        error = customError;
      }
    }

    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));

    return error;
  }, [validationRules, values]);

  /**
   * Validate all fields
   */
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    return isValid;
  }, [validateField, validationRules, values]);

  /**
   * Handle field value change
   */
  const handleChange = useCallback((fieldName, value) => {
    setValues(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear submit messages when user starts typing
    setSubmitError('');
    setSubmitSuccess('');

    // Validate field after change (debounced)
    if (touched[fieldName]) {
      debouncedValidation(fieldName, value);
    }
  }, [touched, debouncedValidation]);

  /**
   * Handle field blur (when user leaves field)
   */
  const handleBlur = useCallback((fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));

    // Validate immediately on blur
    validateField(fieldName, values[fieldName]);
  }, [validateField, values]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (onSubmit) => {
    // Mark all fields as touched
    const allFields = Object.keys(validationRules);
    setTouched(allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));

    // Validate form
    if (!validateForm()) {
      setSubmitError('Please fix the errors above');
      return { success: false, error: 'Validation failed' };
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const result = await onSubmit(values);
      
      if (result && result.success === false) {
        setSubmitError(result.message || 'Submission failed');
        return result;
      }

      setSubmitSuccess(result?.message || 'Success!');
      return { success: true, data: result };

    } catch (error) {
      const errorMessage = ErrorUtils.getErrorMessage(error);
      setSubmitError(errorMessage);
      return { success: false, error: errorMessage };

    } finally {
      setIsSubmitting(false);
    }
  }, [validationRules, validateForm, values]);

  /**
   * Reset form to initial values
   */
  const reset = useCallback((newInitialValues = initialValues) => {
    setValues(newInitialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setSubmitError('');
    setSubmitSuccess('');
  }, [initialValues]);

  /**
   * Set field value manually
   */
  const setValue = useCallback((fieldName, value) => {
    setValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  }, []);

  /**
   * Set multiple field values
   */
  const setMultipleValues = useCallback((newValues) => {
    setValues(prev => ({
      ...prev,
      ...newValues
    }));
  }, []);

  /**
   * Clear field error
   */
  const clearError = useCallback((fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Clear submit messages
   */
  const clearMessages = useCallback(() => {
    setSubmitError('');
    setSubmitSuccess('');
  }, []);

  return {
    // Form state
    values,
    errors,
    touched,
    isSubmitting,
    submitError,
    submitSuccess,
    
    // Validation
    isValid: Object.keys(errors).length === 0,
    hasErrors: Object.keys(errors).length > 0,
    
    // Methods
    handleChange,
    handleBlur,
    handleSubmit,
    validateField,
    validateForm,
    reset,
    setValue,
    setMultipleValues,
    clearError,
    clearErrors,
    clearMessages,
  };
};

/**
 * Hook for handling async operations with loading states
 */
export const useAsyncOperation = (initialLoading = false) => {
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const execute = useCallback(async (asyncFunction, successMessage = '') => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await asyncFunction();
      
      if (result && result.success === false) {
        setError(result.message || 'Operation failed');
        return result;
      }

      if (successMessage) {
        setSuccess(successMessage);
      }

      return { success: true, data: result };

    } catch (err) {
      const errorMessage = ErrorUtils.getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };

    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError('');
    setSuccess('');
  }, []);

  return {
    loading,
    error,
    success,
    execute,
    reset,
    setError,
    setSuccess,
  };
};

/**
 * Hook for handling pagination
 */
export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = Math.ceil(totalItems / limit);
  const offset = (currentPage - 1) * limit;

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const changeLimit = useCallback((newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  }, []);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setLimit(initialLimit);
    setTotalItems(0);
  }, [initialPage, initialLimit]);

  return {
    currentPage,
    limit,
    totalItems,
    totalPages,
    offset,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    goToPage,
    nextPage,
    previousPage,
    changeLimit,
    setTotalItems,
    reset,
  };
};

/**
 * Hook for handling local storage state
 */
export const useLocalStorage = (key, initialValue = null) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      ErrorUtils.logError(error, 'useLocalStorage');
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      ErrorUtils.logError(error, 'useLocalStorage.setValue');
    }
  }, [key]);

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      localStorage.removeItem(key);
    } catch (error) {
      ErrorUtils.logError(error, 'useLocalStorage.removeValue');
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

/**
 * Hook for handling modal state
 */
export const useModal = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};

/**
 * Hook for handling confirmation dialogs
 */
export const useConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});
  const resolveRef = useRef();

  const confirm = useCallback((options = {}) => {
    setConfig({
      title: 'Confirm Action',
      message: 'Are you sure?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      ...options
    });
    setIsOpen(true);

    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (resolveRef.current) {
      resolveRef.current(true);
    }
  }, []);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    if (resolveRef.current) {
      resolveRef.current(false);
    }
  }, []);

  return {
    isOpen,
    config,
    confirm,
    handleConfirm,
    handleCancel,
  };
};
