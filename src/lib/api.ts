import { supabase } from './supabase';
import { Transaction, PlannedExpense, Investment, Loan, Profile } from '@/types';

// Profile API
export const profileApi = {
  // Get user profile
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update user profile
  updateProfile: async (userId: string, updates: Partial<Profile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        last_updated: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Upload profile picture
  uploadProfilePicture: async (userId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = \\/\.\\;
    const filePath = \profile-pictures/\\;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update profile with new picture URL
    const { data, error } = await supabase
      .from('profiles')
      .update({ profile_picture_url: publicUrl })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete profile picture
  deleteProfilePicture: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ profile_picture_url: null })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Transactions API
export const transactionsApi = {
  // Get all transactions for user
  getTransactions: async (userId: string, filters?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    type?: 'income' | 'expense';
  }) => {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (filters?.startDate) {
      query = query.gte('date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('date', filters.endDate);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Add new transaction
  addTransaction: async (userId: string, transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...transaction, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update transaction
  updateTransaction: async (transactionId: string, updates: Partial<Transaction>) => {
    const { data, error } = await supabase
      .from('transactions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete transaction
  deleteTransaction: async (transactionId: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (error) throw error;
  },

  // Get transaction statistics
  getTransactionStats: async (userId: string, period?: { startDate: string; endDate: string }) => {
    let query = supabase
      .from('transactions')
      .select('type, amount, category, date')
      .eq('user_id', userId);

    if (period) {
      query = query
        .gte('date', period.startDate)
        .lte('date', period.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    const income = data
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = data
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categories = data.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netSavings: income - expenses,
      categoryBreakdown: categories,
      transactionCount: data.length,
    };
  },
};

// Planned Expenses API
export const plannedExpensesApi = {
  getPlannedExpenses: async (userId: string) => {
    const { data, error } = await supabase
      .from('planned_expenses')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  addPlannedExpense: async (userId: string, expense: Omit<PlannedExpense, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('planned_expenses')
      .insert([{ ...expense, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updatePlannedExpense: async (expenseId: string, updates: Partial<PlannedExpense>) => {
    const { data, error } = await supabase
      .from('planned_expenses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', expenseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deletePlannedExpense: async (expenseId: string) => {
    const { error } = await supabase
      .from('planned_expenses')
      .delete()
      .eq('id', expenseId);

    if (error) throw error;
  },

  markAsPaid: async (expenseId: string) => {
    const { data, error } = await supabase
      .from('planned_expenses')
      .update({ paid: true, status: 'paid', updated_at: new Date().toISOString() })
      .eq('id', expenseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Investments API
export const investmentsApi = {
  getInvestments: async (userId: string) => {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  addInvestment: async (userId: string, investment: Omit<Investment, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('investments')
      .insert([{ ...investment, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateInvestment: async (investmentId: string, updates: Partial<Investment>) => {
    const { data, error } = await supabase
      .from('investments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', investmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteInvestment: async (investmentId: string) => {
    const { error } = await supabase
      .from('investments')
      .delete()
      .eq('id', investmentId);

    if (error) throw error;
  },

  updateInvestmentValue: async (investmentId: string, currentValue: number) => {
    const investment = await investmentsApi.getInvestment(investmentId);
    const profitLoss = currentValue - investment.initial_amount;
    const returnRate = investment.initial_amount > 0 ? (profitLoss / investment.initial_amount) * 100 : 0;

    const { data, error } = await supabase
      .from('investments')
      .update({
        current_value: currentValue,
        profit_loss: profitLoss,
        return_rate: returnRate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', investmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getInvestment: async (investmentId: string) => {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('id', investmentId)
      .single();

    if (error) throw error;
    return data;
  },
};

// Loans API
export const loansApi = {
  getLoans: async (userId: string) => {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  addLoan: async (userId: string, loan: Omit<Loan, 'id' | 'created_at' | 'updated_at'>) => {
    const totalAmount = loan.amount + (loan.amount * (loan.interest_rate / 100));
    
    const { data, error } = await supabase
      .from('loans')
      .insert([{ 
        ...loan, 
        user_id: userId,
        remaining_balance: loan.amount,
        total_amount: totalAmount,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateLoan: async (loanId: string, updates: Partial<Loan>) => {
    const { data, error } = await supabase
      .from('loans')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', loanId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteLoan: async (loanId: string) => {
    const { error } = await supabase
      .from('loans')
      .delete()
      .eq('id', loanId);

    if (error) throw error;
  },

  addLoanPayment: async (loanId: string, payment: {
    amount: number;
    paymentMethod: string;
    paymentDate: string;
    transactionFee?: number;
    penaltyAmount?: number;
    isPenalty?: boolean;
  }) => {
    // First get the current loan
    const loan = await loansApi.getLoan(loanId);
    
    // Calculate new balance
    const newBalance = Math.max((loan.remaining_balance || loan.amount) - payment.amount, 0);
    const newStatus = newBalance <= 0 ? 'paid' : loan.status;

    // Update loan balance and status
    await supabase
      .from('loans')
      .update({ 
        remaining_balance: newBalance,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', loanId);

    // Record payment (you would have a separate loan_payments table)
    // This is a simplified version
    return { success: true, newBalance, newStatus };
  },

  getLoan: async (loanId: string) => {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('id', loanId)
      .single();

    if (error) throw error;
    return data;
  },
};

// Export data utilities
export const exportApi = {
  generateTransactionReport: async (userId: string, format: 'pdf' | 'csv' | 'excel', filters?: any) => {
    const transactions = await transactionsApi.getTransactions(userId, filters);
    
    // This would generate the report based on format
    // For now, return the data
    return {
      format,
      data: transactions,
      generatedAt: new Date().toISOString(),
      recordCount: transactions.length,
    };
  },

  exportProfileData: async (userId: string) => {
    const [profile, transactions, plannedExpenses, investments, loans] = await Promise.all([
      profileApi.getProfile(userId),
      transactionsApi.getTransactions(userId),
      plannedExpensesApi.getPlannedExpenses(userId),
      investmentsApi.getInvestments(userId),
      loansApi.getLoans(userId),
    ]);

    return {
      profile,
      transactions,
      plannedExpenses,
      investments,
      loans,
      exportedAt: new Date().toISOString(),
    };
  },
};

// Utility functions
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  });

  return formatter.format(amount);
};

export const formatDate = (date: string | Date, locale: string = 'en-US'): string => {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const calculateDaysUntil = (dueDate: string): number => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isOverdue = (dueDate: string): boolean => {
  return calculateDaysUntil(dueDate) < 0;
};

export const generateId = (): string => {
  return \\-\\;
};
