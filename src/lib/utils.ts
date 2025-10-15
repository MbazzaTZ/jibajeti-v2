// General utility functions for the application

import { format, formatDistance, formatRelative, subDays } from 'date-fns';

// Date utilities
export const dateUtils = {
  // Format date for display
  formatDate: (date: string | Date, formatStr: string = 'MMM dd, yyyy'): string => {
    return format(new Date(date), formatStr);
  },

  // Format date with time
  formatDateTime: (date: string | Date): string => {
    return format(new Date(date), 'MMM dd, yyyy • HH:mm');
  },

  // Get relative time (e.g., "2 days ago")
  getRelativeTime: (date: string | Date): string => {
    return formatDistance(new Date(date), new Date(), { addSuffix: true });
  },

  // Check if date is today
  isToday: (date: string | Date): boolean => {
    const today = new Date();
    const checkDate = new Date(date);
    return (
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear()
    );
  },

  // Check if date is in the past
  isPast: (date: string | Date): boolean => {
    return new Date(date) < new Date();
  },

  // Check if date is in the future
  isFuture: (date: string | Date): boolean => {
    return new Date(date) > new Date();
  },

  // Get start and end of month
  getMonthRange: (date: string | Date = new Date()) => {
    const d = new Date(date);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return { start, end };
  },

  // Add days to date
  addDays: (date: string | Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  // Get difference in days between two dates
  getDaysDifference: (date1: string | Date, date2: string | Date): number => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },
};

// Number and currency utilities
export const numberUtils = {
  // Format currency based on user's currency preference
  formatCurrency: (
    amount: number, 
    currency: string = 'USD', 
    locale: string = 'en-US'
  ): string => {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    });

    return formatter.format(amount);
  },

  // Format number with commas
  formatNumber: (num: number, locale: string = 'en-US'): string => {
    return new Intl.NumberFormat(locale).format(num);
  },

  // Calculate percentage
  calculatePercentage: (part: number, total: number): number => {
    if (total === 0) return 0;
    return (part / total) * 100;
  },

  // Round to specified decimal places
  round: (num: number, decimals: number = 2): number => {
    const factor = Math.pow(10, decimals);
    return Math.round((num + Number.EPSILON) * factor) / factor;
  },

  // Generate random number in range
  randomInRange: (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Calculate compound interest
  calculateCompoundInterest: (
    principal: number,
    rate: number,
    time: number,
    compoundFrequency: number = 1
  ): number => {
    const amount = principal * Math.pow(
      1 + (rate / 100) / compoundFrequency,
      compoundFrequency * time
    );
    return numberUtils.round(amount - principal, 2); // Return interest only
  },
};

// String utilities
export const stringUtils = {
  // Capitalize first letter
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // Convert to title case
  toTitleCase: (str: string): string => {
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  },

  // Truncate string with ellipsis
  truncate: (str: string, length: number): string => {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  },

  // Generate initials from name
  getInitials: (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  },

  // Generate random string
  generateRandomString: (length: number = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Remove special characters
  removeSpecialChars: (str: string): string => {
    return str.replace(/[^a-zA-Z0-9 ]/g, '');
  },

  // Convert camelCase to kebab-case
  camelToKebab: (str: string): string => {
    return str.replace(/([a-z])([A-Z])/g, '-').toLowerCase();
  },
};

// Array utilities
export const arrayUtils = {
  // Remove duplicates from array
  removeDuplicates: <T>(array: T[], key?: keyof T): T[] => {
    if (key) {
      return array.filter((item, index, self) => 
        index === self.findIndex(t => t[key] === item[key])
      );
    }
    return [...new Set(array)];
  },

  // Group array by key
  groupBy: <T>(array: T[], key: keyof T): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },

  // Sort array by key
  sortBy: <T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  },

  // Chunk array into smaller arrays
  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  // Flatten nested arrays
  flatten: <T>(arrays: T[][]): T[] => {
    return arrays.reduce((flat, array) => flat.concat(array), []);
  },

  // Find item by property
  findBy: <T>(array: T[], key: keyof T, value: any): T | undefined => {
    return array.find(item => item[key] === value);
  },

  // Filter array by multiple criteria
  filterBy: <T>(array: T[], criteria: Partial<T>): T[] => {
    return array.filter(item => {
      return Object.entries(criteria).every(([key, value]) => 
        item[key as keyof T] === value
      );
    });
  },
};

// Object utilities
export const objectUtils = {
  // Deep clone object
  deepClone: <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
  },

  // Merge objects deeply
  deepMerge: <T extends Record<string, any>>(target: T, source: Partial<T>): T => {
    const output = { ...target };
    
    if (objectUtils.isObject(target) && objectUtils.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (objectUtils.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key as keyof T] = objectUtils.deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    
    return output;
  },

  // Check if value is an object
  isObject: (item: any): boolean => {
    return item && typeof item === 'object' && !Array.isArray(item);
  },

  // Remove null/undefined values
  removeEmpty: <T extends Record<string, any>>(obj: T): Partial<T> => {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v != null)
    ) as Partial<T>;
  },

  // Pick specific properties from object
  pick: <T extends Record<string, any>, K extends keyof T>(
    obj: T, 
    keys: K[]
  ): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  },

  // Omit specific properties from object
  omit: <T extends Record<string, any>, K extends keyof T>(
    obj: T, 
    keys: K[]
  ): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  },
};

// Color utilities
export const colorUtils = {
  // Generate random color
  generateRandomColor: (): string => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  // Get color based on transaction type
  getTransactionColor: (type: 'income' | 'expense'): string => {
    return type === 'income' ? '#10B981' : '#EF4444';
  },

  // Get color based on priority
  getPriorityColor: (priority: 'high' | 'medium' | 'low'): string => {
    const colors = {
      high: '#EF4444',
      medium: '#F59E0B',
      low: '#10B981',
    };
    return colors[priority];
  },

  // Get color based on risk level
  getRiskColor: (risk: 'low' | 'medium' | 'high'): string => {
    const colors = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
    };
    return colors[risk];
  },

  // Lighten color (simple implementation)
  lighten: (color: string, percent: number): string => {
    // This is a simplified version - in real app, use a proper color library
    return color + Math.round(percent * 2.55).toString(16).padStart(2, '0');
  },
};

// Export utilities
export const exportUtils = {
  // Convert data to CSV
  toCSV: (data: any[], headers?: string[]): string => {
    const csvHeaders = headers || Object.keys(data[0] || {});
    const csvRows = data.map(row => 
      csvHeaders.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return \\"\\"\;
        }
        return value;
      }).join(',')
    );

    return [csvHeaders.join(','), ...csvRows].join('\\n');
  },

  // Download data as file
  downloadFile: (content: string, filename: string, type: string = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Generate PDF content (simplified)
  generatePDFContent: (data: any, title: string): string => {
    // In a real app, this would use a PDF library like jsPDF
    return \
      <!DOCTYPE html>
      <html>
        <head>
          <title>\</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>\</h1>
          <p>Generated on \</p>
          <!-- PDF content would be generated here -->
        </body>
      </html>
    \;
  },
};

// Performance utilities
export const performanceUtils = {
  // Debounce function
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    };
  },

  // Throttle function
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Measure function execution time
  measureTime = <T extends (...args: any[]) => any>(
    func: T,
    ...args: Parameters<T>
  ): { result: ReturnType<T>; time: number } => {
    const start = performance.now();
    const result = func(...args);
    const end = performance.now();
    return { result, time: end - start };
  },
};

// Error handling utilities
export const errorUtils = {
  // Safe JSON parse
  safeJsonParse: <T>(json: string, fallback: T): T => {
    try {
      return JSON.parse(json);
    } catch {
      return fallback;
    }
  },

  // Safe function execution
  safeExecute: <T>(func: () => T, fallback: T, errorCallback?: (error: Error) => void): T => {
    try {
      return func();
    } catch (error) {
      if (errorCallback) {
        errorCallback(error as Error);
      }
      return fallback;
    }
  },

  // Format error message
  formatError: (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  },
};

// Export all utilities as a single object for easy importing
export const utils = {
  date: dateUtils,
  number: numberUtils,
  string: stringUtils,
  array: arrayUtils,
  object: objectUtils,
  color: colorUtils,
  export: exportUtils,
  performance: performanceUtils,
  error: errorUtils,
};

// Default export for convenience
export default utils;
