// Validation utilities for forms and data

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

  if (!email.trim()) {
    errors.push('Email is required');
  } else if (!emailRegex.test(email)) {
    errors.push('Please enter a valid email address');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Phone number validation for different formats
export const validatePhone = (phone: string): ValidationResult => {
  const errors: string[] = [];
  
  // Supports US, Kenya, Tanzania formats
  const phoneRegex = /^(\+1-\d{3}-\d{3}-\d{4}|\+255-\d{3}-\d{3}-\d{3}|\+254-\d{3}-\d{3}-\d{3})$/;

  if (!phone.trim()) {
    errors.push('Phone number is required');
  } else if (!phoneRegex.test(phone)) {
    errors.push('Please enter a valid phone number (e.g., +1-234-567-8900, +255-123-456-789)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Password validation with strength check
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Password strength meter
export const getPasswordStrength = (password: string): {
  score: number; // 0-100
  strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) score += 25;
  else feedback.push('Use at least 8 characters');

  // Uppercase check
  if (/[A-Z]/.test(password)) score += 25;
  else feedback.push('Add uppercase letters');

  // Numbers check
  if (/[0-9]/.test(password)) score += 25;
  else feedback.push('Include numbers');

  // Special characters check
  if (/[^A-Za-z0-9]/.test(password)) score += 25;
  else feedback.push('Add special characters');

  // Determine strength level
  let strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
  if (score >= 90) strength = 'strong';
  else if (score >= 70) strength = 'good';
  else if (score >= 50) strength = 'fair';
  else if (score >= 25) strength = 'weak';
  else strength = 'very-weak';

  return { score, strength, feedback };
};

// Amount validation
export const validateAmount = (amount: string | number): ValidationResult => {
  const errors: string[] = [];
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    errors.push('Please enter a valid number');
  } else if (numAmount < 0) {
    errors.push('Amount cannot be negative');
  } else if (numAmount > 1000000000) { // 1 billion limit
    errors.push('Amount is too large');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Date validation
export const validateDate = (date: string): ValidationResult => {
  const errors: string[] = [];
  const inputDate = new Date(date);
  const today = new Date();

  if (!date.trim()) {
    errors.push('Date is required');
  } else if (isNaN(inputDate.getTime())) {
    errors.push('Please enter a valid date');
  } else if (inputDate > new Date(today.getFullYear() + 10, today.getMonth(), today.getDate())) {
    errors.push('Date cannot be more than 10 years in the future');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Transaction validation
export const validateTransaction = (transaction: {
  type: string;
  amount: string | number;
  category: string;
  description: string;
  date: string;
}): ValidationResult => {
  const errors: string[] = [];

  if (!transaction.type) {
    errors.push('Transaction type is required');
  }

  const amountValidation = validateAmount(transaction.amount);
  if (!amountValidation.isValid) {
    errors.push(...amountValidation.errors);
  }

  if (!transaction.category.trim()) {
    errors.push('Category is required');
  }

  if (!transaction.description.trim()) {
    errors.push('Description is required');
  } else if (transaction.description.length > 200) {
    errors.push('Description must be less than 200 characters');
  }

  const dateValidation = validateDate(transaction.date);
  if (!dateValidation.isValid) {
    errors.push(...dateValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Profile validation
export const validateProfile = (profile: {
  fullName: string;
  email: string;
  phone: string;
  monthlyIncome: string | number;
  targetSavings: string | number;
}): ValidationResult => {
  const errors: string[] = [];

  if (!profile.fullName.trim()) {
    errors.push('Full name is required');
  } else if (profile.fullName.length < 2) {
    errors.push('Full name must be at least 2 characters long');
  }

  const emailValidation = validateEmail(profile.email);
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors);
  }

  if (profile.phone) {
    const phoneValidation = validatePhone(profile.phone);
    if (!phoneValidation.isValid) {
      errors.push(...phoneValidation.errors);
    }
  }

  const incomeValidation = validateAmount(profile.monthlyIncome);
  if (!incomeValidation.isValid) {
    errors.push(...incomeValidation.errors);
  }

  const savingsValidation = validateAmount(profile.targetSavings);
  if (!savingsValidation.isValid) {
    errors.push(...savingsValidation.errors);
  }

  const monthlyIncome = typeof profile.monthlyIncome === 'string' 
    ? parseFloat(profile.monthlyIncome) 
    : profile.monthlyIncome;
  const targetSavings = typeof profile.targetSavings === 'string'
    ? parseFloat(profile.targetSavings)
    : profile.targetSavings;

  if (targetSavings > monthlyIncome) {
    errors.push('Target savings cannot exceed monthly income');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Budget category validation
export const validateBudgetCategory = (category: string): ValidationResult => {
  const errors: string[] = [];

  if (!category.trim()) {
    errors.push('Category name is required');
  } else if (category.length < 2) {
    errors.push('Category name must be at least 2 characters long');
  } else if (category.length > 50) {
    errors.push('Category name must be less than 50 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Investment validation
export const validateInvestment = (investment: {
  title: string;
  type: string;
  initialAmount: string | number;
  currentValue: string | number;
  purchaseDate: string;
}): ValidationResult => {
  const errors: string[] = [];

  if (!investment.title.trim()) {
    errors.push('Investment title is required');
  }

  if (!investment.type) {
    errors.push('Investment type is required');
  }

  const initialAmountValidation = validateAmount(investment.initialAmount);
  if (!initialAmountValidation.isValid) {
    errors.push(...initialAmountValidation.errors);
  }

  const currentValueValidation = validateAmount(investment.currentValue);
  if (!currentValueValidation.isValid) {
    errors.push(...currentValueValidation.errors);
  }

  const dateValidation = validateDate(investment.purchaseDate);
  if (!dateValidation.isValid) {
    errors.push(...dateValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Loan validation
export const validateLoan = (loan: {
  title: string;
  amount: string | number;
  interestRate: string | number;
  term: string | number;
  lender: string;
  installmentAmount: string | number;
}): ValidationResult => {
  const errors: string[] = [];

  if (!loan.title.trim()) {
    errors.push('Loan title is required');
  }

  const amountValidation = validateAmount(loan.amount);
  if (!amountValidation.isValid) {
    errors.push(...amountValidation.errors);
  }

  const interestRate = typeof loan.interestRate === 'string' 
    ? parseFloat(loan.interestRate) 
    : loan.interestRate;
  
  if (isNaN(interestRate)) {
    errors.push('Interest rate must be a valid number');
  } else if (interestRate < 0) {
    errors.push('Interest rate cannot be negative');
  } else if (interestRate > 100) {
    errors.push('Interest rate cannot exceed 100%');
  }

  const term = typeof loan.term === 'string' ? parseInt(loan.term) : loan.term;
  if (isNaN(term) || term <= 0) {
    errors.push('Loan term must be a positive number');
  }

  if (!loan.lender.trim()) {
    errors.push('Lender name is required');
  }

  const installmentValidation = validateAmount(loan.installmentAmount);
  if (!installmentValidation.isValid) {
    errors.push(...installmentValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Form validation helper
export const validateForm = (fields: Record<string, any>, validations: Record<string, (value: any) => ValidationResult>): ValidationResult => {
  const allErrors: string[] = [];

  for (const [fieldName, value] of Object.entries(fields)) {
    if (validations[fieldName]) {
      const validation = validations[fieldName](value);
      if (!validation.isValid) {
        allErrors.push(...validation.errors);
      }
    }
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

// Sanitize input data
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .substring(0, 1000); // Limit length
};

// Validate file upload
export const validateFile = (file: File, options: {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
} = {}): ValidationResult => {
  const errors: string[] = [];
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'] } = options;

  if (file.size > maxSize) {
    errors.push(\File size must be less than \MB\);
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push(\File type must be one of: \\);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
