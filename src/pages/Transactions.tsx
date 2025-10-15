import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Plus, Minus, Calendar, Search, Download } from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { useDualStorage } from "@/hooks/useDualStorage";
import { Transaction, Profile } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const Transactions = () => {
  const [transactions, setTransactions] = useDualStorage<Transaction[]>(
    "jibajeti_transactions",
    []
  );
  const [profile] = useDualStorage<Profile>(
    "jibajeti_profile",
    { currency: "USD" } as Profile
  );
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  // State for filters
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const handleSubmit = () => {
    if (!formData.amount || !formData.category || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: formData.type,
      amount: Number(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
    };

    setTransactions([...transactions, newTransaction]);
    setFormData({
      type: "expense",
      amount: "",
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
    setShowForm(false);
    toast({
      title: "Success",
      description: "Transaction added successfully",
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
    toast({
      title: "Deleted",
      description: "Transaction removed",
    });
  };

  const resetFilters = () => {
    setDateFilter({
      startDate: "",
      endDate: "",
    });
    setSearchTerm("");
    setCategoryFilter("");
  };

  // Filter and sort transactions
  const filteredTransactions = transactions.filter((transaction) => {
    // Date filtering
    const transactionDate = new Date(transaction.date).getTime();
    let passesDateFilter = true;
    
    if (dateFilter.startDate && dateFilter.endDate) {
      const startDate = new Date(dateFilter.startDate).getTime();
      const endDate = new Date(dateFilter.endDate).getTime();
      passesDateFilter = transactionDate >= startDate && transactionDate <= endDate;
    } else if (dateFilter.startDate) {
      const startDate = new Date(dateFilter.startDate).getTime();
      passesDateFilter = transactionDate >= startDate;
    } else if (dateFilter.endDate) {
      const endDate = new Date(dateFilter.endDate).getTime();
      passesDateFilter = transactionDate <= endDate;
    }

    // Search filtering
    const searchLower = searchTerm.toLowerCase();
    const passesSearchFilter = !searchTerm || 
      transaction.description.toLowerCase().includes(searchLower) || 
      transaction.category.toLowerCase().includes(searchLower);

    // Category filtering
    const passesCategoryFilter = !categoryFilter || 
      transaction.category === categoryFilter;

    return passesDateFilter && passesSearchFilter && passesCategoryFilter;
  });

  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const currencySymbol = profile.currency === "USD" ? "$" : profile.currency === "KES" ? "KSh" : "TSh";

  const incomeCategories = [
    "salary",
    "business",
    "investment",
    "freelance",
    "bonus",
    "other-income"
  ];

  const expenseCategories = [
    "food",
    "transport",
    "entertainment",
    "bills",
    "healthcare",
    "education",
    "shopping",
    "other"
  ];

  const allCategories = [...new Set([...incomeCategories, ...expenseCategories])];

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      "salary": "Salary",
      "business": "Business",
      "investment": "Investment",
      "freelance": "Freelance",
      "bonus": "Bonus",
      "other-income": "Other Income",
      "food": "Food",
      "transport": "Transport",
      "entertainment": "Entertainment",
      "bills": "Bills",
      "healthcare": "Healthcare",
      "education": "Education",
      "shopping": "Shopping",
      "other": "Other"
    };
    return labels[category] || category;
  };

  return (
    <ScrollView className="flex-1 space-y-6 pb-20">
      <View className="flex items-center justify-between flex-row">
        <View>
          <Text className="text-3xl font-bold">Transactions</Text>
          <Text className="text-muted-foreground">Manage your income and expenses</Text>
        </View>
        <View className="flex gap-2 flex-row">
          <Button onPress={() => {}} className="gap-2">
            <Download size={16} />
            <Text>Export CSV</Text>
          </Button>
          <Button onPress={() => setShowForm(!showForm)} className="gap-2">
            <Plus size={16} />
            <Text>Add Transaction</Text>
          </Button>
        </View>
      </View>

      {/* Filter Section */}
      <Card className="p-6">
        <Text className="text-lg font-semibold mb-4">Filter Transactions</Text>
        <View className="space-y-4">
          <View className="space-y-2">
            <Label>Search</Label>
            <View className="relative">
              <Search size={16} color="#6b7280" className="absolute left-2 top-2.5" />
              <Input
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholder="Search by description or category"
                className="pl-8"
              />
            </View>
          </View>
          <View className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <View className="space-y-2">
              <Label>Category</Label>
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {allCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {getCategoryLabel(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </View>
            <View className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={dateFilter.startDate}
                onChangeText={(value) => setDateFilter({ ...dateFilter, startDate: value })}
              />
            </View>
            <View className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={dateFilter.endDate}
                onChangeText={(value) => setDateFilter({ ...dateFilter, endDate: value })}
              />
            </View>
            <View className="flex items-end">
              <Button
                variant="outline"
                onPress={resetFilters}
                className="w-full gap-2"
                disabled={!dateFilter.startDate && !dateFilter.endDate && !categoryFilter && !searchTerm}
              >
                <Text>Reset Filters</Text>
              </Button>
            </View>
          </View>
        </View>
      </Card>

      {showForm && (
        <Card className="p-6">
          <Text className="text-lg font-semibold mb-4">New Transaction</Text>
          <View className="space-y-4">
            <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <View className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "income" | "expense") => setFormData({ ...formData, type: value, category: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </View>
              <View className="space-y-2">
                <Label>Amount</Label>
                <Input
                  value={formData.amount}
                  onChangeText={(value) => setFormData({ ...formData, amount: value })}
                  placeholder="Enter amount"
                  keyboardType="numeric"
                />
              </View>
              <View className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.type === "income" ? (
                      incomeCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {getCategoryLabel(category)}
                        </SelectItem>
                      ))
                    ) : (
                      expenseCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {getCategoryLabel(category)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </View>
              <View className="space-y-2">
                <Label>Date</Label>
                <Input
                  value={formData.date}
                  onChangeText={(value) => setFormData({ ...formData, date: value })}
                  required
                />
              </View>
            </View>
            <View className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChangeText={(value) => setFormData({ ...formData, description: value })}
                placeholder="Enter description"
                rows={3}
              />
            </View>
            <View className="flex gap-2 flex-row">
              <Button onPress={handleSubmit} className="gap-2">
                {formData.type === "income" ? (
                  <>
                    <Plus size={16} />
                    <Text>Add Income</Text>
                  </>
                ) : (
                  <>
                    <Minus size={16} />
                    <Text>Add Expense</Text>
                  </>
                )}
              </Button>
              <Button variant="outline" onPress={() => setShowForm(false)}>
                <Text>Cancel</Text>
              </Button>
            </View>
          </View>
        </Card>
      )}

      <Card className="p-6">
        <Text className="text-lg font-semibold mb-4">
          All Transactions ({sortedTransactions.length})
        </Text>
        {sortedTransactions.length > 0 ? (
          <View className="space-y-3">
            {sortedTransactions.map((transaction) => (
              <View
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <View className="flex items-center gap-4 flex-row">
                  <View
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      transaction.type === "income" 
                        ? "bg-green-100" 
                        : "bg-red-100"
                    }`}
                  >
                    {transaction.type === "income" ? (
                      <Plus size={20} color="#22c55e" />
                    ) : (
                      <Minus size={20} color="#ef4444" />
                    )}
                  </View>
                  <View>
                    <Text className="font-medium">{transaction.description}</Text>
                    <View className="flex items-center gap-2 flex-row">
                      <Calendar size={12} color="#6b7280" />
                      <Text className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </Text>
                      <Text>•</Text>
                      <Text className="text-sm text-muted-foreground capitalize">
                        {getCategoryLabel(transaction.category)}
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="flex items-center gap-4 flex-row">
                  <Text
                    className={`font-semibold text-lg ${
                      transaction.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {currencySymbol}
                    {transaction.amount.toLocaleString()}
                  </Text>
                  <Button
                    size="icon"
                    variant="outline"
                    onPress={() => deleteTransaction(transaction.id)}
                  >
                    <Minus size={16} />
                  </Button>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="text-center py-12">
            <View className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Calendar size={32} color="#6b7280" />
            </View>
            <Text className="text-lg font-semibold mb-2">No Transactions</Text>
            <Text className="text-muted-foreground mb-4">
              {dateFilter.startDate || dateFilter.endDate || searchTerm || categoryFilter
                ? "No transactions match the selected filters"
                : "Start tracking your income and expenses"}
            </Text>
            <Button onPress={() => setShowForm(true)} className="gap-2">
              <Plus size={16} />
              <Text>Add Your First Transaction</Text>
            </Button>
          </View>
        )}
      </Card>
    </ScrollView>
  );
};
