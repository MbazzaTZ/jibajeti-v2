import { View, Text } from "react-native";
import { cn } from "@/utils/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <View className={cn("bg-card rounded-lg border border-border shadow-sm", className)}>
      {children}
    </View>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <View className={cn("p-6 pb-4", className)}>
      {children}
    </View>
  );
}

export function CardTitle({ children, className }: CardProps) {
  return (
    <Text className={cn("text-lg font-semibold text-card-foreground", className)}>
      {children}
    </Text>
  );
}

export function CardDescription({ children, className }: CardProps) {
  return (
    <Text className={cn("text-sm text-muted-foreground mt-1", className)}>
      {children}
    </Text>
  );
}

export function CardContent({ children, className }: CardProps) {
  return (
    <View className={cn("p-6 pt-0", className)}>
      {children}
    </View>
  );
}
