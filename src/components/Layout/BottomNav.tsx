import { View, TouchableOpacity, Text } from "react-native";
import { LayoutDashboard, Calendar, FileText, User, CreditCard, HandCoins, TrendingUp } from "lucide-react-native";
import { usePathname, useRouter } from "expo-router";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/(tabs)" },
  { icon: CreditCard, label: "Transactions", path: "/(tabs)/transactions" },
  { icon: HandCoins, label: "Loans", path: "/(tabs)/loans" },
  { icon: TrendingUp, label: "Investment", path: "/(tabs)/investment" },
  { icon: Calendar, label: "Planner", path: "/(tabs)/planner" },
  { icon: FileText, label: "Summary", path: "/(tabs)/summary" },
  { icon: User, label: "Profile", path: "/(tabs)/profile" },
];

export const BottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <View className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <View className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <TouchableOpacity
              key={item.path}
              onPress={() => router.push(item.path as any)}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Icon size={20} color={isActive ? "#3b82f6" : "#6b7280"} />
              <Text className={`text-xs mt-1 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
