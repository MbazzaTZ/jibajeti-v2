import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { TrendingUp, TrendingDown, Plus, Trash2, Building, BarChart3, DollarSign, Calendar, Target } from "lucide-react-native";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { useDualStorage } from "@/hooks/useDualStorage";
import { useToast } from "@/hooks/use-toast";
import { Investment as InvestmentType, InvestmentTransaction, Profile, Transaction } from "@/types";

interface InvestmentFormData {
  title: string;
  type: "stocks" | "bonds" | "real-estate" | "business" | "crypto" | "mutual-funds" | "other";
  initialAmount: string;
  currentValue: string;
  purchaseDate: string;
  notes: string;
  isBusiness: boolean;
  operationCosts: string;
  profitMargin: string;
  monthlyRevenue: string;
  businessType: string;
  riskLevel: "low" | "medium" | "high";
}

export const InvestmentPage = () => {
  const [investments, setInvestments] = useDualStorage<InvestmentType[]>("jibajeti_investments", []);
  const [investmentTransactions, setInvestmentTransactions] = useDualStorage<InvestmentTransaction[]>("jibajeti_investment_transactions", []);
  const [transactions, setTransactions] = useDualStorage<Transaction[]>("jibajeti_transactions", []);
  const [profile] = useDualStorage<Profile>("jibajeti_profile", { currency: "USD" } as Profile);
  const { toast } = useToast();

  const [showInvestmentForm, setShowInvestmentForm] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentType | null>(null);

  const [investmentFormData, setInvestmentFormData] = useState<InvestmentFormData>({
    title: "",
    type: "stocks",
    initialAmount: "",
    currentValue: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    notes: "",
    isBusiness: false,
    operationCosts: "0",
    profitMargin: "0",
    monthlyRevenue: "0",
    businessType: "",
    riskLevel: "medium",
  });

  const currencySymbol = profile.currency === "USD" ? "$" : profile.currency === "KES" ? "KSh" : "TSh";

  // Calculate investment statistics
  const investmentStats = {
    totalInvested: investments.reduce((sum, inv) => sum + inv.initialAmount, 0),
    currentValue: investments.reduce((sum, inv) => sum + inv.currentValue, 0),
    totalProfit: investments.reduce((sum, inv) => sum + inv.profitLoss, 0),
    activeInvestments: investments.filter(inv => inv.status === "active").length,
    averageReturn: investments.length > 0 
      ? (investments.reduce((sum, inv) => sum + (inv.profitLoss / inv.initialAmount * 100), 0) / investments.length)
      : 0,
  };

  const handleInvestmentSubmit = () => {
    if (!investmentFormData.title || !investmentFormData.initialAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const initialAmount = Number(investmentFormData.initialAmount);
    const currentValue = Number(investmentFormData.currentValue || investmentFormData.initialAmount);
    const profitLoss = currentValue - initialAmount;

    const newInvestment: InvestmentType = {
      id: Date.now().toString(),
      title: investmentFormData.title,
      type: investmentFormData.type,
      initialAmount,
      currentValue,
      purchaseDate: investmentFormData.purchaseDate,
      returnRate: initialAmount > 0 ? (profitLoss / initialAmount) * 100 : 0,
      profitLoss,
      status: "active",
      notes: investmentFormData.notes,
      createdAt: new Date().toISOString(),
      
      // Business specific fields
      isBusiness: investmentFormData.isBusiness,
      operationCosts: Number(investmentFormData.operationCosts),
      profitMargin: Number(investmentFormData.profitMargin),
      monthlyRevenue: Number(investmentFormData.monthlyRevenue),
      businessType: investmentFormData.businessType,
      riskLevel: investmentFormData.riskLevel,
    };

    setInvestments([...investments, newInvestment]);
    setInvestmentFormData({
      title: "",
      type: "stocks",
      initialAmount: "",
      currentValue: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      notes: "",
      isBusiness: false,
      operationCosts: "0",
      profitMargin: "0",
      monthlyRevenue: "0",
      businessType: "",
      riskLevel: "medium",
    });
    setShowInvestmentForm(false);
    
    toast({
      title: "Investment Added",
      description: "New investment has been added successfully",
    });
  };

  const deleteInvestment = (id: string) => {
    setInvestments(investments.filter(inv => inv.id !== id));
    setInvestmentTransactions(investmentTransactions.filter(t => t.investmentId !== id));
    toast({
      title: "Investment Deleted",
      description: "Investment and related transactions removed",
    });
  };

  const updateInvestmentValue = (id: string, newValue: number) => {
    const investment = investments.find(inv => inv.id === id);
    if (!investment) return;

    const updatedInvestment = {
      ...investment,
      currentValue: newValue,
      profitLoss: newValue - investment.initialAmount,
      returnRate: investment.initialAmount > 0 ? ((newValue - investment.initialAmount) / investment.initialAmount) * 100 : 0,
    };

    setInvestments(investments.map(inv => inv.id === id ? updatedInvestment : inv));
    
    toast({
      title: "Value Updated",
      description: `Investment value updated to ${currencySymbol}${newValue.toLocaleString()}`,
    });
  };

  const getInvestmentTransactions = (investmentId: string) => {
    return investmentTransactions.filter(t => t.investmentId === investmentId);
  };

  const getReturnColor = (returnRate: number) => {
    if (returnRate > 0) return "text-green-600";
    if (returnRate < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <ScrollView className="flex-1 space-y-6 pb-20">
      <View className="flex items-center justify-between flex-row">
        <View>
          <Text className="text-3xl font-bold">Investments</Text>
          <Text className="text-muted-foreground">Track your investments and business ventures</Text>
        </View>
        <Button onPress={() => setShowInvestmentForm(true)} className="gap-2">
          <Plus size={16} />
          <Text>Add Investment</Text>
        </Button>
      </View>

      {/* Investment Statistics */}
      <View className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign size={16} color="#6b7280" />
          </CardHeader>
          <CardContent>
            <Text className="text-2xl font-bold">{currencySymbol}{investmentStats.totalInvested.toLocaleString()}</Text>
            <Text className="text-xs text-muted-foreground">Total capital invested</Text>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <BarChart3 size={16} color="#6b7280" />
          </CardHeader>
          <CardContent>
            <Text className="text-2xl font-bold">{currencySymbol}{investmentStats.currentValue.toLocaleString()}</Text>
            <Text className="text-xs text-muted-foreground">
              {investmentStats.totalProfit >= 0 ? (
                <Text className="text-green-600">+{currencySymbol}{investmentStats.totalProfit.toLocaleString()}</Text>
              ) : (
                <Text className="text-red-600">-{currencySymbol}{Math.abs(investmentStats.totalProfit).toLocaleString()}</Text>
              )}
            </Text>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <Target size={16} color="#6b7280" />
          </CardHeader>
          <CardContent>
            <Text className="text-2xl font-bold">{investmentStats.activeInvestments}</Text>
            <Text className="text-xs text-muted-foreground">Active ventures</Text>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Return</CardTitle>
            <TrendingUp size={16} color="#6b7280" />
          </CardHeader>
          <CardContent>
            <Text className={`text-2xl font-bold ${getReturnColor(investmentStats.averageReturn)}`}>
              {investmentStats.averageReturn.toFixed(1)}%
            </Text>
            <Text className="text-xs text-muted-foreground">Average return rate</Text>
          </CardContent>
        </Card>
      </View>

      {/* Investment Form */}
      {showInvestmentForm && (
        <Card className="p-6">
          <Text className="text-lg font-semibold mb-4">New Investment</Text>
          <View className="space-y-4">
            <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <View className="space-y-2">
                <Label>Investment Name *</Label>
                <Input
                  value={investmentFormData.title}
                  onChangeText={(value) => setInvestmentFormData({ ...investmentFormData, title: value })}
                  placeholder="e.g., Tech Startup, Stock Portfolio"
                />
              </View>
              
              <View className="space-y-2">
                <Label>Investment Type *</Label>
                <Select
                  value={investmentFormData.type}
                  onValueChange={(value: any) => setInvestmentFormData({ ...investmentFormData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stocks">Stocks</SelectItem>
                    <SelectItem value="bonds">Bonds</SelectItem>
                    <SelectItem value="real-estate">Real Estate</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    <SelectItem value="mutual-funds">Mutual Funds</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </View>

              <View className="space-y-2">
                <Label>Initial Investment *</Label>
                <Input
                  value={investmentFormData.initialAmount}
                  onChangeText={(value) => setInvestmentFormData({ ...investmentFormData, initialAmount: value })}
                  placeholder="Amount invested"
                  keyboardType="numeric"
                />
              </View>

              <View className="space-y-2">
                <Label>Current Value</Label>
                <Input
                  value={investmentFormData.currentValue}
                  onChangeText={(value) => setInvestmentFormData({ ...investmentFormData, currentValue: value })}
                  placeholder="Current market value"
                  keyboardType="numeric"
                />
              </View>

              <View className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  value={investmentFormData.purchaseDate}
                  onChangeText={(value) => setInvestmentFormData({ ...investmentFormData, purchaseDate: value })}
                />
              </View>

              <View className="space-y-2">
                <Label>Risk Level</Label>
                <Select
                  value={investmentFormData.riskLevel}
                  onValueChange={(value: "low" | "medium" | "high") => setInvestmentFormData({ ...investmentFormData, riskLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </View>

              {/* Business Specific Fields */}
              <View className="flex items-center space-x-2 md:col-span-2 flex-row">
                <TouchableOpacity
                  onPress={() => setInvestmentFormData({ ...investmentFormData, isBusiness: !investmentFormData.isBusiness })}
                  className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center"
                >
                  {investmentFormData.isBusiness && <View className="w-2 h-2 bg-primary rounded" />}
                </TouchableOpacity>
                <Label>This is a business venture</Label>
              </View>

              {investmentFormData.isBusiness && (
                <>
                  <View className="space-y-2">
                    <Label>Business Type</Label>
                    <Input
                      value={investmentFormData.businessType}
                      onChangeText={(value) => setInvestmentFormData({ ...investmentFormData, businessType: value })}
                      placeholder="e.g., Retail, Service, Manufacturing"
                    />
                  </View>

                  <View className="space-y-2">
                    <Label>Monthly Revenue</Label>
                    <Input
                      value={investmentFormData.monthlyRevenue}
                      onChangeText={(value) => setInvestmentFormData({ ...investmentFormData, monthlyRevenue: value })}
                      placeholder="Estimated monthly revenue"
                      keyboardType="numeric"
                    />
                  </View>

                  <View className="space-y-2">
                    <Label>Monthly Operation Costs</Label>
                    <Input
                      value={investmentFormData.operationCosts}
                      onChangeText={(value) => setInvestmentFormData({ ...investmentFormData, operationCosts: value })}
                      placeholder="Monthly operating expenses"
                      keyboardType="numeric"
                    />
                  </View>

                  <View className="space-y-2">
                    <Label>Profit Margin (%)</Label>
                    <Input
                      value={investmentFormData.profitMargin}
                      onChangeText={(value) => setInvestmentFormData({ ...investmentFormData, profitMargin: value })}
                      placeholder="Estimated profit margin"
                      keyboardType="numeric"
                    />
                  </View>
                </>
              )}
            </View>

            <View className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={investmentFormData.notes}
                onChangeText={(value) => setInvestmentFormData({ ...investmentFormData, notes: value })}
                placeholder="Additional notes about the investment..."
              />
            </View>

            <View className="flex gap-2 flex-row">
              <Button onPress={handleInvestmentSubmit}>
                <Text>Add Investment</Text>
              </Button>
              <Button variant="outline" onPress={() => setShowInvestmentForm(false)}>
                <Text>Cancel</Text>
              </Button>
            </View>
          </View>
        </Card>
      )}

      {/* Investments List */}
      <View className="space-y-4">
        {investments.length > 0 ? (
          investments.map((investment) => {
            const investmentTrans = getInvestmentTransactions(investment.id);
            
            return (
              <Card key={investment.id} className="p-6">
                <View className="flex items-start justify-between flex-row">
                  <View className="flex-1">
                    <View className="flex items-center gap-2 mb-2 flex-row">
                      <Text className="text-lg font-semibold">{investment.title}</Text>
                      <Badge variant="outline">
                        <Text className="text-xs">{investment.type.replace("-", " ")}</Text>
                      </Badge>
                      {investment.isBusiness && (
                        <Badge className="bg-blue-100">
                          <View className="flex items-center gap-1 flex-row">
                            <Building size={12} color="#1d4ed8" />
                            <Text className="text-blue-800 text-xs">Business</Text>
                          </View>
                        </Badge>
                      )}
                      <Badge className={getRiskColor(investment.riskLevel || "medium")}>
                        <Text className="text-xs">{investment.riskLevel} Risk</Text>
                      </Badge>
                    </View>
                    
                    <View className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <View>
                        <Text className="text-muted-foreground text-sm">Initial Investment</Text>
                        <Text className="font-medium">{currencySymbol}{investment.initialAmount.toLocaleString()}</Text>
                      </View>
                      <View>
                        <Text className="text-muted-foreground text-sm">Current Value</Text>
                        <Text className="font-medium">{currencySymbol}{investment.currentValue.toLocaleString()}</Text>
                      </View>
                      <View>
                        <Text className="text-muted-foreground text-sm">Profit/Loss</Text>
                        <Text className={`font-medium ${getReturnColor(investment.profitLoss)}`}>
                          {investment.profitLoss >= 0 ? "+" : ""}{currencySymbol}{investment.profitLoss.toLocaleString()}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-muted-foreground text-sm">Return</Text>
                        <Text className={`font-medium ${getReturnColor(investment.returnRate || 0)}`}>
                          {investment.returnRate ? investment.returnRate.toFixed(1) : 0}%
                        </Text>
                      </View>
                    </View>

                    {investment.isBusiness && (
                      <View className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4 p-3 bg-blue-50 rounded-lg">
                        <View>
                          <Text className="text-muted-foreground text-sm">Monthly Revenue</Text>
                          <Text className="font-medium">{currencySymbol}{investment.monthlyRevenue?.toLocaleString()}</Text>
                        </View>
                        <View>
                          <Text className="text-muted-foreground text-sm">Operation Costs</Text>
                          <Text className="font-medium">{currencySymbol}{investment.operationCosts?.toLocaleString()}</Text>
                        </View>
                        <View>
                          <Text className="text-muted-foreground text-sm">Profit Margin</Text>
                          <Text className="font-medium">{investment.profitMargin}%</Text>
                        </View>
                      </View>
                    )}

                    {/* Update Value Form */}
                    <View className="flex items-center gap-2 mb-4 flex-row">
                      <Input
                        placeholder="Update current value"
                        className="flex-1"
                        keyboardType="numeric"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                      >
                        <Text>Update Value</Text>
                      </Button>
                    </View>

                    {investmentTrans.length > 0 && (
                      <View className="mt-4">
                        <Text className="font-semibold mb-2">Transaction History</Text>
                        <View className="space-y-2">
                          {investmentTrans.map(transaction => (
                            <View key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <View>
                                <Text className="font-medium">
                                  {transaction.description}
                                </Text>
                                <Text className="text-sm text-muted-foreground">
                                  {new Date(transaction.date).toLocaleDateString()} • {transaction.category}
                                  {transaction.notes && ` • ${transaction.notes}`}
                                </Text>
                              </View>
                              <View className="text-right">
                                <Text className={`font-medium ${
                                  transaction.type === "profit" ? "text-green-600" : 
                                  transaction.type === "expense" ? "text-red-600" : "text-gray-600"
                                }`}>
                                  {transaction.type === "profit" ? "+" : 
                                   transaction.type === "expense" ? "-" : ""}
                                  {currencySymbol}{transaction.amount.toLocaleString()}
                                </Text>
                                <Badge variant="outline">
                                  <Text className="text-xs capitalize">{transaction.type}</Text>
                                </Badge>
                              </View>
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
                    >
                      <Text>Add Transaction</Text>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onPress={() => deleteInvestment(investment.id)}
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
              <TrendingUp size={48} color="#6b7280" className="mx-auto mb-4" />
              <Text className="text-lg font-semibold mb-2">No Investments</Text>
              <Text className="text-muted-foreground mb-4">
                Start tracking your investments and business ventures
              </Text>
              <Button onPress={() => setShowInvestmentForm(true)} className="gap-2">
                <Plus size={16} />
                <Text>Add Your First Investment</Text>
              </Button>
            </View>
          </Card>
        )}
      </View>
    </ScrollView>
  );
};
