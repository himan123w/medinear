/**
 * Form Validation Utilities
 * Provides common validation patterns and error messages
 */

export const ValidationRules = {
  required: (value) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return 'This field is required';
    }
    return null;
  },

  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  phone: (value) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (value && !phoneRegex.test(value.replace(/\D/g, ''))) {
      return 'Please enter a valid 10-digit phone number';
    }
    return null;
  },

  minLength: (min) => (value) => {
    if (value && value.length < min) {
      return `Minimum ${min} characters required`;
    }
    return null;
  },

  maxLength: (max) => (value) => {
    if (value && value.length > max) {
      return `Maximum ${max} characters allowed`;
    }
    return null;
  },

  passwordStrength: (value) => {
    if (!value) return null;
    
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*]/.test(value);
    const minLength = value.length >= 8;

    const strength = [hasUpper, hasLower, hasNumber, hasSpecial, minLength].filter(Boolean).length;

    if (strength < 3) {
      return 'Password must contain uppercase, lowercase, number, and special character';
    }
    return null;
  },

  match: (fieldValue) => (value) => {
    if (value && value !== fieldValue) {
      return 'Passwords do not match';
    }
    return null;
  },

  number: (value) => {
    if (value && isNaN(value)) {
      return 'Please enter a valid number';
    }
    return null;
  },

  positiveNumber: (value) => {
    if (value && (isNaN(value) || Number(value) <= 0)) {
      return 'Please enter a positive number';
    }
    return null;
  },

  date: (value) => {
    if (value && isNaN(new Date(value).getTime())) {
      return 'Please enter a valid date';
    }
    return null;
  },

  url: (value) => {
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (value && !urlRegex.test(value)) {
      return 'Please enter a valid URL';
    }
    return null;
  },
};

/**
 * Validate form data against rules
 * @param {Object} formData - The form data to validate
 * @param {Object} validationRules - Rules object with field: [ruleFunctions] format
 * @returns {Object} Errors object with field: errorMessage format
 */
export function validateForm(formData, validationRules) {
  const errors = {};

  Object.keys(validationRules).forEach((field) => {
    const rules = validationRules[field];
    const value = formData[field];

    // If rules is an array, validate against each rule
    if (Array.isArray(rules)) {
      for (const rule of rules) {
        const error = rule(value);
        if (error) {
          errors[field] = error;
          break;
        }
      }
    } else if (typeof rules === 'function') {
      // Single rule function
      const error = rules(value);
      if (error) {
        errors[field] = error;
      }
    }
  });

  return errors;
}

/**
 * Check if form has errors
 */
export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}

/**
 * Get error message for a field
 */
export function getFieldError(errors, field) {
  return errors[field] || '';
}

/**
 * Common form validation rules templates
 */
export const FormValidationTemplates = {
  pharmacy: {
    name: [ValidationRules.required, ValidationRules.minLength(3)],
    owner: [ValidationRules.required, ValidationRules.minLength(2)],
    phone: [ValidationRules.required, ValidationRules.phone],
    password: [ValidationRules.required, ValidationRules.passwordStrength],
    confirmPassword: [ValidationRules.required],
    email: [ValidationRules.email],
    licenseNumber: [ValidationRules.required, ValidationRules.minLength(5)],
  },

  subscription: {
    phone: [ValidationRules.required, ValidationRules.phone],
    email: [ValidationRules.email],
    address: [ValidationRules.required, ValidationRules.minLength(5)],
    city: [ValidationRules.required],
  },

  medicine: {
    name: [ValidationRules.required, ValidationRules.minLength(2)],
    price: [ValidationRules.required, ValidationRules.positiveNumber],
    stock: [ValidationRules.positiveNumber],
  },

  prescription: {
    phone: [ValidationRules.required, ValidationRules.phone],
    notes: [ValidationRules.minLength(10)],
  },
};
