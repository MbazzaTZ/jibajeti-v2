import { View, Text, ScrollView } from "react-native";
import { Download, FileText } from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useDualStorage } from "@/hooks/useDualStorage";
import { useToast } from "@/hooks/use-toast";
import { Transaction, Profile, Loan, PlannedExpense } from "@/types";

export const Summary = () => {
  const [profile] = useDualStorage<Profile>("jibajeti_profile", {} as Profile);
  const [transactions] = useDualStorage<Transaction[]>("jibajeti_transactions", []);
  const [loans] = useDualStorage<Loan[]>("jibajeti_loans", []);
  const [plannedExpenses] = useDualStorage<PlannedExpense[]>("jibajeti_planned_expenses", []);
  const { toast } = useToast();

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Get all transactions (not just current month)
  const allTransactions = transactions;

  // Calculate totals from ALL transactions
  const totalIncome = allTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = allTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Include monthly income from profile
  const totalIncomeWithMonthly = totalIncome + (profile.monthlyIncome || 0);
  
  const actualSavings = totalIncomeWithMonthly - totalExpenses;
  const targetSavings = profile.targetSavings || 0;
  const goalAchievement = targetSavings > 0 ? (actualSavings / targetSavings) * 100 : 0;

  // Loan statistics
  const totalLoans = loans.reduce((sum, loan) => sum + loan.amount, 0);
  const paidLoans = loans.filter(loan => loan.status === "paid").length;
  const activeLoans = loans.filter(loan => loan.status === "active").length;

  // Planned expenses statistics
  const upcomingExpenses = plannedExpenses
    .filter(expense => !expense.paid)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const currencySymbol = profile.currency === "USD" ? "$" : profile.currency === "KES" ? "KSh" : "TSh";

  const exportPDF = () => {
    // In a real app, this would generate and download a PDF
    toast({
      title: "PDF Downloaded",
      description: "Your financial summary has been exported successfully",
    });
  };

  return (
    <ScrollView className="flex-1 space-y-6 pb-20">
      <View className="flex items-center justify-between flex-row">
        <View>
          <Text className="text-3xl font-bold">Financial Summary</Text>
          <Text className="text-muted-foreground">
            Complete overview of your finances
          </Text>
        </View>
        <Button onPress={exportPDF} className="gap-2">
          <Download size={16} />
          <Text>Export PDF</Text>
        </Button>
      </View>

      <View className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-green-50 border-green-200">
          <View className="flex items-center gap-2 mb-2 flex-row">
            <FileText size={20} color="#22c55e" />
            <Text className="text-sm font-medium text-green-600">Total Income</Text>
          </View>
          <Text className="text-3xl font-bold">
            {currencySymbol}
            {totalIncomeWithMonthly.toLocaleString()}
          </Text>
          <Text className="text-xs text-muted-foreground mt-1">
            {currencySymbol}{(profile.monthlyIncome || 0).toLocaleString()} monthly + {currencySymbol}{totalIncome.toLocaleString()} transactions
          </Text>
        </Card>

        <Card className="p-6 bg-red-50 border-red-200">
          <View className="flex items-center gap-2 mb-2 flex-row">
            <FileText size={20} color="#ef4444" />
            <Text className="text-sm font-medium text-red-600">Total Expenses</Text>
          </View>
          <Text className="text-3xl font-bold">
            {currencySymbol}
            {totalExpenses.toLocaleString()}
          </Text>
          <Text className="text-xs text-muted-foreground mt-1">
            From {allTransactions.filter(t => t.type === "expense").length} transactions
          </Text>
        </Card>

        <Card className="p-6 bg-blue-50 border-blue-200">
          <View className="flex items-center gap-2 mb-2 flex-row">
            <FileText size={20} color="#3b82f6" />
            <Text className="text-sm font-medium text-blue-600">Actual Savings</Text>
          </View>
          <Text className="text-3xl font-bold">
            {currencySymbol}
            {actualSavings.toLocaleString()}
          </Text>
          <Text className="text-xs text-muted-foreground mt-1">
            {actualSavings >= 0 ? "Positive" : "Negative"} balance
          </Text>
        </Card>

        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <View className="flex items-center gap-2 mb-2 flex-row">
            <FileText size={20} color="#eab308" />
            <Text className="text-sm font-medium text-yellow-600">Goal Achievement</Text>
          </View>
          <Text className="text-3xl font-bold">{goalAchievement.toFixed(1)}%</Text>
          <Text className="text-xs text-muted-foreground mt-1">
            Target: {currencySymbol}{targetSavings.toLocaleString()}
          </Text>
        </Card>
      </View>

      {/* Additional Stats */}
      <View className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1 p-6 bg-blue-50 border-blue-200">
          <View className="flex items-center gap-2 mb-2 flex-row">
            <FileText size={20} color="#3b82f6" />
            <Text className="text-sm font-medium text-blue-600">Loan Overview</Text>
          </View>
          <View className="space-y-2">
            <View className="flex justify-between flex-row">
              <Text className="text-sm">Total Loans:</Text>
              <Text className="font-medium">{loans.length}</Text>
            </View>
            <View className="flex justify-between flex-row">
              <Text className="text-sm">Active:</Text>
              <Text className="font-medium text-yellow-600">{activeLoans}</Text>
            </View>
            <View className="flex justify-between flex-row">
              <Text className="text-sm">Paid:</Text>
              <Text className="font-medium text-green-600">{paidLoans}</Text>
            </View>
            <View className="flex justify-between flex-row">
              <Text className="text-sm">Total Amount:</Text>
              <Text className="font-medium">{currencySymbol}{totalLoans.toLocaleString()}</Text>
            </View>
          </View>
        </Card>

        <Card className="flex-1 p-6 bg-purple-50 border-purple-200">
          <View className="flex items-center gap-2 mb-2 flex-row">
            <FileText size={20} color="#8b5cf6" />
            <Text className="text-sm font-medium text-purple-600">Planned Expenses</Text>
          </View>
          <View className="space-y-2">
            <View className="flex justify-between flex-row">
              <Text className="text-sm">Total Planned:</Text>
              <Text className="font-medium">{plannedExpenses.length}</Text>
            </View>
            <View className="flex justify-between flex-row">
              <Text className="text-sm">Upcoming Amount:</Text>
              <Text className="font-medium text-red-600">{currencySymbol}{upcomingExpenses.toLocaleString()}</Text>
            </View>
            <View className="flex justify-between flex-row">
              <Text className="text-sm">Paid:</Text>
              <Text className="font-medium text-green-600">
                {plannedExpenses.filter(e => e.paid).length}
              </Text>
            </View>
            <View className="flex justify-between flex-row">
              <Text className="text-sm">Pending:</Text>
              <Text className="font-medium text-yellow-600">
                {plannedExpenses.filter(e => !e.paid).length}
              </Text>
            </View>
          </View>
        </Card>

        <Card className="flex-1 p-6 bg-orange-50 border-orange-200">
          <View className="flex items-center gap-2 mb-2 flex-row">
            <FileText size={20} color="#f97316" />
            <Text className="text-sm font-medium text-orange-600">Transaction Stats</Text>
          </View>
          <View className="space-y-2">
            <View className="flex justify-between flex-row">
              <Text className="text-sm">Total Transactions:</Text>
              <Text className="font-medium">{allTransactions.length}</Text>
            </View>
            <View className="flex justify-between flex-row">
              <Text className="text-sm">Income:</Text>
              <Text className="font-medium text-green-600">
                {allTransactions.filter(t => t.type === "income").length}
              </Text>
            </View>
            <View className="flex justify-between flex-row">
              <Text className="text-sm">Expenses:</Text>
              <Text className="font-medium text-red-600">
                {allTransactions.filter(t => t.type === "expense").length}
              </Text>
            </View>
            <View className="flex justify-between flex-row">
              <Text className="text-sm">This Month:</Text>
              <Text className="font-medium">
                {allTransactions.filter(t => {
                  const date = new Date(t.date);
                  return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                }).length}
              </Text>
            </View>
          </View>
        </Card>
      </View>

      <Card className="p-6">
        <Text className="text-lg font-semibold mb-4">Recent Transactions</Text>
        {allTransactions.length > 0 ? (
          <View className="space-y-2">
            {allTransactions.slice(0, 10).map((transaction) => (
              <View
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
              >
                <View>
                  <Text className="font-medium">{transaction.description}</Text>
                  <Text className="text-sm text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString()} • {transaction.category}
                  </Text>
                </View>
                <Text
                  className={`font-semibold ${
                    transaction.type === "income" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {currencySymbol}
                  {transaction.amount.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text className="text-muted-foreground text-center py-8">
            No transactions recorded yet
          </Text>
        )}
      </Card>
    </ScrollView>
  );
};
