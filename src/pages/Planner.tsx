import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Calendar, Plus, Trash2, Check, AlertCircle } from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { useDualStorage } from "@/hooks/useDualStorage";
import { useToast } from "@/hooks/use-toast";
import { PlannedExpense, Profile, Transaction } from "@/types";

export const Planner = () => {
  const [plannedExpenses, setPlannedExpenses] = useDualStorage<PlannedExpense[]>(
    "jibajeti_planned_expenses",
    []
  );
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
    title: "",
    category: "",
    amount: "",
    dueDate: "",
    frequency: "one-time" as "one-time" | "daily" | "weekly" | "monthly",
    priority: "medium" as "high" | "medium" | "low",
    notes: "",
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.amount || !formData.dueDate || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newExpense: PlannedExpense = {
      id: Date.now().toString(),
      title: formData.title,
      category: formData.category,
      amount: Number(formData.amount),
      dueDate: formData.dueDate,
      frequency: formData.frequency,
      priority: formData.priority,
      notes: formData.notes,
      paid: false,
      status: "pending",
    };

    setPlannedExpenses([...plannedExpenses, newExpense]);
    setFormData({
      title: "",
      category: "",
      amount: "",
      dueDate: "",
      frequency: "one-time",
      priority: "medium",
      notes: "",
    });
    setShowForm(false);
    toast({
      title: "Success",
      description: "Planned expense added successfully",
    });
  };

  const markAsPaid = (expense: PlannedExpense) => {
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: "expense",
      category: expense.category,
      amount: expense.amount,
      description: `${expense.title}${expense.frequency !== "one-time" ? ` (${expense.frequency})` : ""}`,
      date: new Date().toISOString().split("T")[0],
    };

    setTransactions([...transactions, transaction]);
    setPlannedExpenses(
      plannedExpenses.map((e) => (e.id === expense.id ? { ...e, paid: true, status: "paid" } : e))
    );
    toast({
      title: "Marked as Paid",
      description: "Expense moved to transactions",
    });
  };

  const deleteExpense = (id: string) => {
    setPlannedExpenses(plannedExpenses.filter((e) => e.id !== id));
    toast({
      title: "Deleted",
      description: "Planned expense removed",
    });
  };

  const sortedExpenses = [...plannedExpenses]
    .filter((e) => !e.paid)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const currencySymbol = profile.currency === "USD" ? "$" : profile.currency === "KES" ? "KSh" : "TSh";

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();
  const isDueSoon = (dueDate: string) => {
    const diff = new Date(dueDate).getTime() - new Date().getTime();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "daily": return "Daily";
      case "weekly": return "Weekly";
      case "monthly": return "Monthly";
      default: return "One-time";
    }
  };

  return (
    <ScrollView className="flex-1 space-y-6 pb-20">
      <View className="flex items-center justify-between flex-row">
        <View>
          <Text className="text-3xl font-bold">Expense Planner</Text>
          <Text className="text-muted-foreground">Plan and track future expenses</Text>
        </View>
        <Button onPress={() => setShowForm(!showForm)} className="gap-2">
          <Plus size={16} />
          <Text>Add Expense</Text>
        </Button>
      </View>

      {showForm && (
        <Card className="p-6">
          <Text className="text-lg font-semibold mb-4">New Planned Expense</Text>
          <View className="space-y-4">
            <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <View className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChangeText={(value) => setFormData({ ...formData, title: value })}
                  placeholder="e.g., Rent Payment"
                />
              </View>
              <View className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={formData.category}
                  onChangeText={(value) => setFormData({ ...formData, category: value })}
                  placeholder="e.g., Housing"
                />
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
                <Label>Due Date</Label>
                <Input
                  value={formData.dueDate}
                  onChangeText={(value) => setFormData({ ...formData, dueDate: value })}
                />
              </View>
              <View className="space-y-2">
                <Label>Frequency</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value: "one-time" | "daily" | "weekly" | "monthly") => setFormData({ ...formData, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One-time</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </View>
              <View className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: "high" | "medium" | "low") => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </View>
            </View>
            <View className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChangeText={(value) => setFormData({ ...formData, notes: value })}
                rows={3}
              />
            </View>
            <View className="flex gap-2 flex-row">
              <Button onPress={handleSubmit}>
                <Text>Save Expense</Text>
              </Button>
              <Button variant="outline" onPress={() => setShowForm(false)}>
                <Text>Cancel</Text>
              </Button>
            </View>
          </View>
        </Card>
      )}

      <View className="space-y-4">
        {sortedExpenses.length > 0 ? (
          sortedExpenses.map((expense) => {
            const overdue = isOverdue(expense.dueDate);
            const dueSoon = isDueSoon(expense.dueDate);

            return (
              <Card
                key={expense.id}
                className={`p-6 ${overdue ? "border-red-200" : dueSoon ? "border-yellow-200" : ""}`}
              >
                <View className="flex items-start justify-between flex-row">
                  <View className="flex-1">
                    <View className="flex items-center gap-2 mb-2 flex-row">
                      <Text className="text-lg font-semibold">{expense.title}</Text>
                      {expense.frequency !== "one-time" && (
                        <View className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100">
                          <Text className="text-blue-800 text-xs">
                            {getFrequencyLabel(expense.frequency)}
                          </Text>
                        </View>
                      )}
                      {overdue && (
                        <View className="flex items-center gap-1 flex-row">
                          <AlertCircle size={12} color="#ef4444" />
                          <Text className="text-red-600 text-xs">Overdue</Text>
                        </View>
                      )}
                      {dueSoon && (
                        <View className="flex items-center gap-1 flex-row">
                          <Calendar size={12} color="#eab308" />
                          <Text className="text-yellow-600 text-xs">Due Soon</Text>
                        </View>
                      )}
                    </View>
                    <View className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <View>
                        <Text className="text-muted-foreground text-sm">Category</Text>
                        <Text className="font-medium capitalize">{expense.category}</Text>
                      </View>
                      <View>
                        <Text className="text-muted-foreground text-sm">Amount</Text>
                        <Text className="font-medium text-red-600">
                          {currencySymbol}
                          {expense.amount.toLocaleString()}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-muted-foreground text-sm">Due Date</Text>
                        <Text className="font-medium">
                          {new Date(expense.dueDate).toLocaleDateString()}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-muted-foreground text-sm">Priority</Text>
                        <Text className="font-medium capitalize">{expense.priority}</Text>
                      </View>
                    </View>
                    {expense.notes && (
                      <Text className="text-sm text-muted-foreground mt-2">{expense.notes}</Text>
                    )}
                  </View>
                  <View className="flex gap-2 ml-4">
                    <Button
                      size="icon"
                      variant="outline"
                      onPress={() => markAsPaid(expense)}
                    >
                      <Check size={16} />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onPress={() => deleteExpense(expense.id)}
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
              <Calendar size={48} color="#6b7280" className="mx-auto mb-4" />
              <Text className="text-lg font-semibold mb-2">No Planned Expenses</Text>
              <Text className="text-muted-foreground mb-4">
                Start planning your future expenses to stay on track
              </Text>
              <Button onPress={() => setShowForm(true)} className="gap-2">
                <Plus size={16} />
                <Text>Add Your First Expense</Text>
              </Button>
            </View>
          </Card>
        )}
      </View>
    </ScrollView>
  );
};
