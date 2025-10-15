// Storage utilities for local and Supabase storage

import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Local storage keys
const STORAGE_KEYS = {
  PROFILE: 'jibajeti_profile',
  TRANSACTIONS: 'jibajeti_transactions',
  PLANNED_EXPENSES: 'jibajeti_planned_expenses',
  INVESTMENTS: 'jibajeti_investments',
  LOANS: 'jibajeti_loans',
  SETTINGS: 'jibajeti_settings',
  BACKUP_METADATA: 'jibajeti_backup_metadata',
};

// Local storage utilities
export const localStorage = {
  // Get item from local storage
  getItem: async <T>(key: string, defaultValue?: T): Promise<T | null> => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue || null;
    } catch (error) {
      console.error('Error reading from local storage:', error);
      return defaultValue || null;
    }
  },

  // Set item in local storage
  setItem: async <T>(key: string, value: T): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to local storage:', error);
      throw error;
    }
  },

  // Remove item from local storage
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from local storage:', error);
      throw error;
    }
  },

  // Clear all app data
  clearAll: async (): Promise<void> => {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error clearing local storage:', error);
      throw error;
    }
  },

  // Get multiple items
  multiGet: async <T>(keys: string[]): Promise<[string, T | null][]> => {
    try {
      const values = await AsyncStorage.multiGet(keys);
      return values.map(([key, value]) => [key, value ? JSON.parse(value) : null]);
    } catch (error) {
      console.error('Error reading multiple from local storage:', error);
      return keys.map(key => [key, null]);
    }
  },

  // Set multiple items
  multiSet: async <T>(keyValuePairs: [string, T][]): Promise<void> => {
    try {
      const pairs = keyValuePairs.map(([key, value]) => [key, JSON.stringify(value)]);
      await AsyncStorage.multiSet(pairs as [string, string][]);
    } catch (error) {
      console.error('Error writing multiple to local storage:', error);
      throw error;
    }
  },
};

// Supabase storage utilities for files
export const fileStorage = {
  // Upload file to Supabase storage
  uploadFile: async (
    bucket: string,
    filePath: string,
    file: File | Blob,
    options?: {
      upsert?: boolean;
      cacheControl?: string;
    }
  ) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, options);

    if (error) throw error;
    return data;
  },

  // Get public URL for file
  getPublicUrl: (bucket: string, filePath: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  // Download file
  downloadFile: async (bucket: string, filePath: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (error) throw error;
    return data;
  },

  // Delete file
  deleteFile: async (bucket: string, filePaths: string[]) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(filePaths);

    if (error) throw error;
    return data;
  },

  // List files in bucket
  listFiles: async (bucket: string, path?: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path);

    if (error) throw error;
    return data;
  },
};

// Backup and sync utilities
export const backupSync = {
  // Create backup of all local data
  createBackup: async (userId: string) => {
    const [profile, transactions, plannedExpenses, investments, loans] = await Promise.all([
      localStorage.getItem(STORAGE_KEYS.PROFILE),
      localStorage.getItem(STORAGE_KEYS.TRANSACTIONS, []),
      localStorage.getItem(STORAGE_KEYS.PLANNED_EXPENSES, []),
      localStorage.getItem(STORAGE_KEYS.INVESTMENTS, []),
      localStorage.getItem(STORAGE_KEYS.LOANS, []),
    ]);

    const backupData = {
      profile,
      transactions,
      plannedExpenses,
      investments,
      loans,
      metadata: {
        userId,
        backupCreated: new Date().toISOString(),
        version: '1.0',
        recordCounts: {
          transactions: transactions?.length || 0,
          plannedExpenses: plannedExpenses?.length || 0,
          investments: investments?.length || 0,
          loans: loans?.length || 0,
        },
      },
    };

    // Store backup metadata
    await localStorage.setItem(STORAGE_KEYS.BACKUP_METADATA, {
      lastBackup: new Date().toISOString(),
      backupSize: JSON.stringify(backupData).length,
    });

    return backupData;
  },

  // Export backup as JSON file
  exportBackup: async (userId: string) => {
    const backupData = await backupSync.createBackup(userId);
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \jibajeti-backup-\.json\;
    a.click();
    
    URL.revokeObjectURL(url);
    
    return backupData;
  },

  // Import backup from JSON file
  importBackup: async (file: File): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> => {
    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      // Validate backup structure
      if (!backupData.metadata || !backupData.metadata.userId) {
        throw new Error('Invalid backup file format');
      }

      // Restore data to local storage
      await Promise.all([
        localStorage.setItem(STORAGE_KEYS.PROFILE, backupData.profile),
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, backupData.transactions || []),
        localStorage.setItem(STORAGE_KEYS.PLANNED_EXPENSES, backupData.plannedExpenses || []),
        localStorage.setItem(STORAGE_KEYS.INVESTMENTS, backupData.investments || []),
        localStorage.setItem(STORAGE_KEYS.LOANS, backupData.loans || []),
        localStorage.setItem(STORAGE_KEYS.BACKUP_METADATA, {
          lastRestore: new Date().toISOString(),
          restoreSize: text.length,
        }),
      ]);

      return { success: true, data: backupData };
    } catch (error) {
      console.error('Error importing backup:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to import backup' 
      };
    }
  },

  // Sync local data with Supabase
  syncWithCloud: async (userId: string) => {
    try {
      const backupData = await backupSync.createBackup(userId);
      
      // Upload backup to Supabase storage
      const blob = new Blob([JSON.stringify(backupData)], {
        type: 'application/json',
      });
      
      const filePath = \ackups/\/\.json\;
      await fileStorage.uploadFile('backups', filePath, blob, {
        upsert: false,
        cacheControl: '3600',
      });

      // Update sync metadata
      await localStorage.setItem(\\_sync\, {
        lastSync: new Date().toISOString(),
        syncStatus: 'success',
        cloudBackupPath: filePath,
      });

      return { success: true, filePath };
    } catch (error) {
      console.error('Error syncing with cloud:', error);
      
      await localStorage.setItem(\\_sync\, {
        lastSync: new Date().toISOString(),
        syncStatus: 'failed',
        error: error instanceof Error ? error.message : 'Sync failed',
      });

      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sync failed' 
      };
    }
  },

  // Get sync status
  getSyncStatus: async () => {
    return await localStorage.getItem(\\_sync\);
  },
};

// Cache management
export const cacheManager = {
  // Set cache with expiration
  setWithExpiry: async <T>(key: string, value: T, ttl: number = 5 * 60 * 1000): Promise<void> => {
    const item = {
      value,
      expiry: Date.now() + ttl,
    };
    await localStorage.setItem(\cache_\\, item);
  },

  // Get cache item
  getWithExpiry: async <T>(key: string): Promise<T | null> => {
    const item = await localStorage.getItem<{ value: T; expiry: number }>(\cache_\\);
    
    if (!item) return null;

    if (Date.now() > item.expiry) {
      // Cache expired
      await localStorage.removeItem(\cache_\\);
      return null;
    }

    return item.value;
  },

  // Clear expired cache
  clearExpired: async (): Promise<void> => {
    // This would need to iterate through all cache keys
    // For simplicity, we'll just clear cache on app start
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith('cache_'));
    
    for (const key of cacheKeys) {
      const item = await localStorage.getItem<{ expiry: number }>(key);
      if (item && Date.now() > item.expiry) {
        await localStorage.removeItem(key);
      }
    }
  },

  // Clear all cache
  clearAll: async (): Promise<void> => {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith('cache_'));
    await AsyncStorage.multiRemove(cacheKeys);
  },
};

// Storage constants and helpers
export const STORAGE_CONSTANTS = {
  ...STORAGE_KEYS,
  MAX_LOCAL_STORAGE_SIZE: 5 * 1024 * 1024, // 5MB
  BACKUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  SYNC_INTERVAL: 2 * 60 * 60 * 1000, // 2 hours
};

// Initialize storage with default values
export const initializeStorage = async (userId: string) => {
  const defaults = {
    [STORAGE_KEYS.PROFILE]: {
      id: userId,
      currency: 'USD',
      language: 'en',
      budgetCategories: ['Food', 'Transport', 'Entertainment', 'Bills', 'Healthcare'],
      notificationPreferences: {
        email: true,
        sms: false,
        push: true,
      },
      accountCreated: new Date().toISOString(),
    },
    [STORAGE_KEYS.TRANSACTIONS]: [],
    [STORAGE_KEYS.PLANNED_EXPENSES]: [],
    [STORAGE_KEYS.INVESTMENTS]: [],
    [STORAGE_KEYS.LOANS]: [],
    [STORAGE_KEYS.SETTINGS]: {
      theme: 'light',
      autoBackup: true,
      autoSync: false,
      currency: 'USD',
      language: 'en',
    },
  };

  for (const [key, defaultValue] of Object.entries(defaults)) {
    const currentValue = await localStorage.getItem(key);
    if (!currentValue) {
      await localStorage.setItem(key, defaultValue);
    }
  }

  // Clear expired cache on startup
  await cacheManager.clearExpired();
};
