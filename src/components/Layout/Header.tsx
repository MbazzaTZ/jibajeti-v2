import { View, Text, TouchableOpacity } from "react-native";
import { Moon, Sun } from "lucide-react-native";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useRouter, usePathname } from "expo-router";
import Notifications from "./Notifications";
import { Button } from "@/components/ui/Button";

const navItems = [
  { label: "Dashboard", path: "/(tabs)" },
  { label: "Transactions", path: "/(tabs)/transactions" },
  { label: "Loans", path: "/(tabs)/loans" },
  { label: "Investment", path: "/(tabs)/investment" },
  { label: "Planner", path: "/(tabs)/planner" },
  { label: "Summary", path: "/(tabs)/summary" },
  { label: "Profile", path: "/(tabs)/profile" },
];

export const Header = () => {
  const [darkMode, setDarkMode] = useDarkMode();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View className="hidden md:flex sticky top-0 z-50 w-full border-b border-border bg-card/95">
      <View className="container flex h-16 items-center justify-between">
        <View className="flex items-center gap-8">
          <Text className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Ji-bajeti Pro
          </Text>
          <View className="flex gap-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={pathname === item.path ? "default" : "ghost"}
                onPress={() => router.push(item.path as any)}
              >
                {item.label}
              </Button>
            ))}
          </View>
        </View>

        <View className="flex items-center gap-2">
          <Notifications />
          <Button
            variant="ghost"
            size="icon"
            onPress={() => setDarkMode(!darkMode)}
            className="rounded-full"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        </View>
      </View>
    </View>
  );
};
