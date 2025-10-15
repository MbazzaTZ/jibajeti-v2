export interface Profile {
  currency: "USD" | "KES" | "TZS";
  fullName: string;
  email: string;
  phone?: string;
  monthlyIncome: number;
  targetSavings: number;
  profilePicture?: string;
}

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
  time?: string;
  paymentMethod?: "cash" | "mobile" | "bank";
  status?: "pending" | "completed" | "failed";
  createdAt?: string;
}

export interface Loan {
  id: string;
  title: string;
  amount: number;
  interestRate: number;
  term: number;
  startDate: string;
  lender: string;
  status: "active" | "paid" | "defaulted" | "overdue";
  notes?: string;
  remainingBalance?: number;
  createdAt: string;
  installmentFrequency: "daily" | "weekly" | "monthly";
  installmentAmount: number;
  purpose?: string;
  penaltyRate?: number;
  gracePeriod?: number;
  totalAmount?: number;
}

export interface LoanPayment {
  id: string;
  loanId: string;
  amount: number;
  transactionFee: number;
  penaltyAmount: number;
  totalAmount: number;
  paymentMethod: "cash" | "mobile" | "bank";
  paymentDate: string;
  paymentTime: string;
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  mobileNumber?: string;
  mobileUserName?: string;
  mobileProvider?: string;
  merchantName?: string;
  merchantNumber?: string;
  status: "completed" | "pending" | "failed";
  createdAt: string;
  isPenalty: boolean;
  isLatePayment: boolean;
}

export interface PlannedExpense {
  id: string;
  title: string;
  category: string;
  amount: number;
  dueDate: string;
  frequency: "one-time" | "daily" | "weekly" | "monthly";
  priority: "high" | "medium" | "low";
  notes?: string;
  paid: boolean;
  status?: "pending" | "paid" | "overdue";
}

export interface Investment {
  id: string;
  title: string;
  type: "stocks" | "bonds" | "real-estate" | "business" | "crypto" | "mutual-funds" | "other";
  initialAmount: number;
  currentValue: number;
  purchaseDate: string;
  returnRate: number;
  profitLoss: number;
  status: "active" | "sold" | "closed";
  notes?: string;
  createdAt: string;
  isBusiness?: boolean;
  operationCosts?: number;
  profitMargin?: number;
  monthlyRevenue?: number;
  businessType?: string;
  riskLevel?: "low" | "medium" | "high";
}

export interface InvestmentTransaction {
  id: string;
  investmentId: string;
  type: "investment" | "profit" | "expense" | "withdrawal";
  amount: number;
  description: string;
  date: string;
  category: string;
  notes?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export function isValidLoanStatus(status: string): status is Loan["status"] {
  return ["active", "paid", "defaulted", "overdue"].includes(status);
}
