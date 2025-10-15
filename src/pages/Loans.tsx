import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Calendar, CreditCard, CheckCircle, XCircle, AlertTriangle, Plus, Trash2, Clock, TrendingUp, TrendingDown } from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { useDualStorage } from "@/hooks/useDualStorage";
import { useToast } from "@/hooks/use-toast";
import { Loan, LoanPayment, Profile, Transaction } from "@/types";

interface LoanFormData {
  title: string;
  amount: string;
  interestRate: string;
  term: string;
  startDate: string;
  lender: string;
  status: "active" | "paid" | "defaulted" | "overdue";
  notes: string;
  installmentFrequency: "daily" | "weekly" | "monthly";
  installmentAmount: string;
  purpose: string;
  penaltyRate: string;
  gracePeriod: string;
}

interface PaymentFormData {
  loanId: string;
  amount: string;
  paymentMethod: "cash" | "mobile" | "bank";
  paymentDate: string;
  paymentTime: string;
  transactionFee: string;
  isPenalty: boolean;
  penaltyAmount: string;
}

export const Loans = () => {
  const [loans, setLoans] = useDualStorage<Loan[]>("jibajeti_loans", []);
  const [payments, setPayments] = useDualStorage<LoanPayment[]>("jibajeti_loan_payments", []);
  const [transactions, setTransactions] = useDualStorage<Transaction[]>("jibajeti_transactions", []);
  const [profile] = useDualStorage<Profile>("jibajeti_profile", { currency: "USD" } as Profile);
  const { toast } = useToast();

  const [showLoanForm, setShowLoanForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  
  const [loanFormData, setLoanFormData] = useState<LoanFormData>({
    title: "",
    amount: "",
    interestRate: "",
    term: "",
    startDate: new Date().toISOString().split("T")[0],
    lender: "",
    status: "active",
    notes: "",
    installmentFrequency: "monthly",
    installmentAmount: "",
    purpose: "",
    penaltyRate: "2",
    gracePeriod: "3",
  });

  const [paymentFormData, setPaymentFormData] = useState<PaymentFormData>({
    loanId: "",
    amount: "",
    paymentMethod: "cash",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentTime: new Date().toTimeString().slice(0, 5),
    transactionFee: "0",
    isPenalty: false,
    penaltyAmount: "0",
  });

  const currencySymbol = profile?.currency === "USD" ? "$" : profile?.currency === "KES" ? "KSh" : "TSh";

  const handleLoanSubmit = () => {
    if (!loanFormData.title || !loanFormData.amount || !loanFormData.lender || !loanFormData.installmentAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const totalAmount = Number(loanFormData.amount) + (Number(loanFormData.amount) * (Number(loanFormData.interestRate) / 100));

    const newLoan: Loan = {
      id: `loan-${Date.now()}`,
      title: loanFormData.title,
      amount: Number(loanFormData.amount),
      interestRate: Number(loanFormData.interestRate),
      term: Number(loanFormData.term),
      startDate: loanFormData.startDate,
      lender: loanFormData.lender,
      status: loanFormData.status,
      notes: loanFormData.notes,
      remainingBalance: Number(loanFormData.amount),
      createdAt: new Date().toISOString(),
      installmentFrequency: loanFormData.installmentFrequency,
      installmentAmount: Number(loanFormData.installmentAmount),
      purpose: loanFormData.purpose,
      penaltyRate: Number(loanFormData.penaltyRate),
      gracePeriod: Number(loanFormData.gracePeriod),
      totalAmount,
    };

    setLoans([...loans, newLoan]);
    setLoanFormData({
      title: "",
      amount: "",
      interestRate: "",
      term: "",
      startDate: new Date().toISOString().split("T")[0],
      lender: "",
      status: "active",
      notes: "",
      installmentFrequency: "monthly",
      installmentAmount: "",
      purpose: "",
      penaltyRate: "2",
      gracePeriod: "3",
    });
    setShowLoanForm(false);
    
    toast({
      title: "Loan Added",
      description: "New loan has been added successfully",
    });
  };

  const handlePaymentSubmit = () => {
    if (!paymentFormData.loanId || !paymentFormData.amount) {
      toast({
        title: "Error",
        description: "Please select a loan and enter amount",
        variant: "destructive",
      });
      return;
    }

    const loan = loans.find(l => l.id === paymentFormData.loanId);
    if (!loan) return;

    const paymentAmount = Number(paymentFormData.amount);
    const transactionFee = Number(paymentFormData.transactionFee);
    const penaltyAmount = Number(paymentFormData.penaltyAmount);
    const totalAmount = paymentAmount + transactionFee + penaltyAmount;

    const newPayment: LoanPayment = {
      id: `payment-${Date.now()}`,
      loanId: paymentFormData.loanId,
      amount: paymentAmount,
      transactionFee,
      penaltyAmount,
      totalAmount,
      paymentMethod: paymentFormData.paymentMethod,
      paymentDate: paymentFormData.paymentDate,
      paymentTime: paymentFormData.paymentTime,
      status: "completed",
      createdAt: new Date().toISOString(),
      isPenalty: paymentFormData.isPenalty,
      isLatePayment: false,
    };

    // Update loan remaining balance
    const updatedLoans = loans.map(loan => {
      if (loan.id === paymentFormData.loanId) {
        const newBalance = (loan.remainingBalance || loan.amount) - paymentAmount;
        const newStatus = newBalance <= 0 ? "paid" : loan.status;
        return { 
          ...loan, 
          remainingBalance: Math.max(newBalance, 0), 
          status: newStatus 
        };
      }
      return loan;
    });

    setLoans(updatedLoans);
    setPayments([...payments, newPayment]);
    setPaymentFormData({
      loanId: "",
      amount: "",
      paymentMethod: "cash",
      paymentDate: new Date().toISOString().split("T")[0],
      paymentTime: new Date().toTimeString().slice(0, 5),
      transactionFee: "0",
      isPenalty: false,
      penaltyAmount: "0",
    });
    setShowPaymentForm(false);
    setSelectedLoan(null);
    
    toast({
      title: "Payment Recorded",
      description: "Loan payment has been added successfully",
    });
  };

  const deleteLoan = (id: string) => {
    setLoans(loans.filter(loan => loan.id !== id));
    setPayments(payments.filter(payment => payment.loanId !== id));
    toast({
      title: "Loan Deleted",
      description: "Loan and related payments removed",
    });
  };

  const loanPayments = (loanId: string) => payments.filter(p => p.loanId === loanId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-100 text-blue-800";
      case "paid": return "bg-green-100 text-green-800";
      case "defaulted": return "bg-red-100 text-red-800";
      case "overdue": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle size={12} />;
      case "paid": return <CheckCircle size={12} />;
      case "defaulted": return <XCircle size={12} />;
      case "overdue": return <AlertTriangle size={12} />;
      default: return null;
    }
  };

  return (
    <ScrollView className="flex-1 space-y-6 pb-20">
      <View className="flex items-center justify-between flex-row">
        <View>
          <Text className="text-3xl font-bold">Loans</Text>
          <Text className="text-muted-foreground">Track and manage your loans with installment plans</Text>
        </View>
        <Button onPress={() => setShowLoanForm(true)} className="gap-2">
          <Plus size={16} />
          <Text>Add Loan</Text>
        </Button>
      </View>

      {/* Loan Form */}
      {showLoanForm && (
        <Card className="p-6">
          <Text className="text-lg font-semibold mb-4">New Loan</Text>
          <View className="space-y-4">
            <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <View className="space-y-2">
                <Label>Loan Title *</Label>
                <Input
                  value={loanFormData.title}
                  onChangeText={(value) => setLoanFormData({ ...loanFormData, title: value })}
                  placeholder="e.g., Car Loan, Personal Loan"
                />
              </View>
              <View className="space-y-2">
                <Label>Lender *</Label>
                <Input
                  value={loanFormData.lender}
                  onChangeText={(value) => setLoanFormData({ ...loanFormData, lender: value })}
                  placeholder="e.g., Bank, Family, Friend"
                />
              </View>
              <View className="space-y-2">
                <Label>Loan Amount *</Label>
                <Input
                  value={loanFormData.amount}
                  onChangeText={(value) => setLoanFormData({ ...loanFormData, amount: value })}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>
              <View className="space-y-2">
                <Label>Interest Rate (%)</Label>
                <Input
                  value={loanFormData.interestRate}
                  onChangeText={(value) => setLoanFormData({ ...loanFormData, interestRate: value })}
                  placeholder="0.0"
                  keyboardType="numeric"
                />
              </View>
              <View className="space-y-2">
                <Label>Loan Term (Months)</Label>
                <Input
                  value={loanFormData.term}
                  onChangeText={(value) => setLoanFormData({ ...loanFormData, term: value })}
                  placeholder="12"
                  keyboardType="numeric"
                />
              </View>
              <View className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  value={loanFormData.startDate}
                  onChangeText={(value) => setLoanFormData({ ...loanFormData, startDate: value })}
                />
              </View>
              <View className="space-y-2">
                <Label>Payment Frequency</Label>
                <Select
                  value={loanFormData.installmentFrequency}
                  onValueChange={(value: "daily" | "weekly" | "monthly") => 
                    setLoanFormData({ ...loanFormData, installmentFrequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </View>
              <View className="space-y-2">
                <Label>Installment Amount *</Label>
                <Input
                  value={loanFormData.installmentAmount}
                  onChangeText={(value) => setLoanFormData({ ...loanFormData, installmentAmount: value })}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>
              <View className="space-y-2">
                <Label>Purpose</Label>
                <Input
                  value={loanFormData.purpose}
                  onChangeText={(value) => setLoanFormData({ ...loanFormData, purpose: value })}
                  placeholder="e.g., Education, Vehicle, Home"
                />
              </View>
              <View className="space-y-2">
                <Label>Penalty Rate (%)</Label>
                <Input
                  value={loanFormData.penaltyRate}
                  onChangeText={(value) => setLoanFormData({ ...loanFormData, penaltyRate: value })}
                  placeholder="2.0"
                  keyboardType="numeric"
                />
              </View>
              <View className="space-y-2">
                <Label>Grace Period (Days)</Label>
                <Input
                  value={loanFormData.gracePeriod}
                  onChangeText={(value) => setLoanFormData({ ...loanFormData, gracePeriod: value })}
                  placeholder="3"
                  keyboardType="numeric"
                />
              </View>
              <View className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={loanFormData.status}
                  onValueChange={(value: "active" | "paid" | "defaulted" | "overdue") => 
                    setLoanFormData({ ...loanFormData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="defaulted">Defaulted</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </View>
            </View>
            <View className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={loanFormData.notes}
                onChangeText={(value) => setLoanFormData({ ...loanFormData, notes: value })}
                placeholder="Additional notes about the loan..."
                rows={3}
              />
            </View>
            <View className="flex gap-2 flex-row">
              <Button onPress={handleLoanSubmit}>
                <Text>Add Loan</Text>
              </Button>
              <Button variant="outline" onPress={() => setShowLoanForm(false)}>
                <Text>Cancel</Text>
              </Button>
            </View>
          </View>
        </Card>
      )}

      {/* Payment Form */}
      {showPaymentForm && selectedLoan && (
        <Card className="p-6">
          <Text className="text-lg font-semibold mb-4">Record Payment for {selectedLoan.title}</Text>
          <View className="space-y-4">
            <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <View className="space-y-2">
                <Label>Payment Amount *</Label>
                <Input
                  value={paymentFormData.amount}
                  onChangeText={(value) => setPaymentFormData({ ...paymentFormData, amount: value })}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>
              <View className="space-y-2">
                <Label>Payment Method</Label>
                <Select
                  value={paymentFormData.paymentMethod}
                  onValueChange={(value: "cash" | "mobile" | "bank") => 
                    setPaymentFormData({ ...paymentFormData, paymentMethod: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="mobile">Mobile Money</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </View>
              <View className="space-y-2">
                <Label>Payment Date</Label>
                <Input
                  value={paymentFormData.paymentDate}
                  onChangeText={(value) => setPaymentFormData({ ...paymentFormData, paymentDate: value })}
                />
              </View>
              <View className="space-y-2">
                <Label>Transaction Fee</Label>
                <Input
                  value={paymentFormData.transactionFee}
                  onChangeText={(value) => setPaymentFormData({ ...paymentFormData, transactionFee: value })}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>
              <View className="space-y-2">
                <Label>Penalty Amount</Label>
                <Input
                  value={paymentFormData.penaltyAmount}
                  onChangeText={(value) => setPaymentFormData({ ...paymentFormData, penaltyAmount: value })}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>
              <View className="flex items-center space-x-2 flex-row">
                <TouchableOpacity
                  onPress={() => setPaymentFormData({ ...paymentFormData, isPenalty: !paymentFormData.isPenalty })}
                  className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center"
                >
                  {paymentFormData.isPenalty && <View className="w-2 h-2 bg-primary rounded" />}
                </TouchableOpacity>
                <Label>This is a penalty payment</Label>
              </View>
            </View>
            <View className="flex gap-2 flex-row">
              <Button onPress={handlePaymentSubmit}>
                <Text>Record Payment</Text>
              </Button>
              <Button variant="outline" onPress={() => {
                setShowPaymentForm(false);
                setSelectedLoan(null);
              }}>
                <Text>Cancel</Text>
              </Button>
            </View>
          </View>
        </Card>
      )}

      <View className="space-y-4">
        {loans.length > 0 ? (
          loans.map((loan) => {
            const paymentsForLoan = loanPayments(loan.id);
            
            return (
              <Card key={loan.id} className="p-6">
                <View className="flex items-start justify-between flex-row">
                  <View className="flex-1">
                    <View className="flex items-center gap-2 mb-2 flex-row">
                      <Text className="text-lg font-semibold">{loan.title}</Text>
                      <Badge className={getStatusColor(loan.status)}>
                        <View className="flex items-center gap-1 flex-row">
                          {getStatusIcon(loan.status)}
                          <Text className="text-xs">
                            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                          </Text>
                        </View>
                      </Badge>
                      {loan.purpose && (
                        <Badge variant="outline">
                          <Text className="text-xs">{loan.purpose}</Text>
                        </Badge>
                      )}
                    </View>
                    
                    <View className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                      <View>
                        <Text className="text-muted-foreground text-sm">Lender</Text>
                        <Text className="font-medium">{loan.lender}</Text>
                      </View>
                      <View>
                        <Text className="text-muted-foreground text-sm">Principal</Text>
                        <Text className="font-medium">{currencySymbol}{(loan.amount || 0).toLocaleString()}</Text>
                      </View>
                      <View>
                        <Text className="text-muted-foreground text-sm">Total Amount</Text>
                        <Text className="font-medium">{currencySymbol}{((loan.amount || 0) + (loan.amount || 0) * ((loan.interestRate || 0) / 100)).toLocaleString()}</Text>
                      </View>
                      <View>
                        <Text className="text-muted-foreground text-sm">Remaining</Text>
                        <Text className="font-medium">{currencySymbol}{((loan.remainingBalance || 0) || 0).toLocaleString()}</Text>
                      </View>
                      <View>
                        <Text className="text-muted-foreground text-sm">Installment</Text>
                        <Text className="font-medium">{currencySymbol}{(loan.installmentAmount || 0).toLocaleString()} {loan.installmentFrequency}</Text>
                      </View>
                      <View>
                        <Text className="text-muted-foreground text-sm">Interest</Text>
                        <Text className="font-medium">{(loan.interestRate || 0)}%</Text>
                      </View>
                    </View>

                    {paymentsForLoan.length > 0 && (
                      <View className="mt-4">
                        <Text className="font-semibold mb-2">Payment History</Text>
                        <View className="space-y-2">
                          {paymentsForLoan.map(payment => (
                            <View key={payment.id} className={`flex items-center justify-between p-3 rounded-lg ${
                              payment.isPenalty ? "bg-orange-100 border border-orange-200" : 
                              payment.isLatePayment ? "bg-red-100 border border-red-200" : "bg-gray-50"
                            }`}>
                              <View>
                                <Text className="font-medium">
                                  {currencySymbol}{(payment.amount || 0).toLocaleString()} 
                                  {payment.isPenalty && " (Penalty)"}
                                  {payment.isLatePayment && " (Late Payment)"}
                                  {(payment.transactionFee || 0) > 0 && ` + ${currencySymbol}${payment.transactionFee} fee`}
                                  {(payment.penaltyAmount || 0) > 0 && ` + ${currencySymbol}${payment.penaltyAmount} penalty`}
                                </Text>
                                <Text className="text-sm text-muted-foreground">
                                  {new Date(payment.paymentDate).toLocaleDateString()} at {payment.paymentTime}
                                  {payment.paymentMethod !== "cash" && ` • ${payment.paymentMethod}`}
                                  {payment.isLatePayment && (
                                    <Text className="text-red-600 ml-2">Late Payment</Text>
                                  )}
                                </Text>
                              </View>
                              <CheckCircle size={16} color="#22c55e" />
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                  
                  <View className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onPress={() => {
                        setSelectedLoan(loan);
                        setPaymentFormData(prev => ({ ...prev, loanId: loan.id }));
                        setShowPaymentForm(true);
                      }}
                      disabled={loan.status === "paid"}
                    >
                      <Text>Add Payment</Text>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onPress={() => deleteLoan(loan.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </View>
                </View>
              </Card>
            );
          })
        ) : (
          <Card className="p-12">
            <View className="text-center">
              <CreditCard size={48} color="#6b7280" className="mx-auto mb-4" />
              <Text className="text-lg font-semibold mb-2">No Loans</Text>
              <Text className="text-muted-foreground mb-4">
                Start tracking your loans and installment payments
              </Text>
              <Button onPress={() => setShowLoanForm(true)} className="gap-2">
                <Plus size={16} />
                <Text>Add Your First Loan</Text>
              </Button>
            </View>
          </Card>
        )}
      </View>
    </ScrollView>
  );
};
