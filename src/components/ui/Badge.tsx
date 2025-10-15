import { Text, View } from "react-native";
import { cn } from "@/utils/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variantClasses = {
    default: "bg-primary border-transparent text-primary-foreground",
    secondary: "bg-secondary border-transparent text-secondary-foreground",
    destructive: "bg-destructive border-transparent text-destructive-foreground",
    outline: "text-foreground border-border"
  };

  return (
    <View
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        variantClasses[variant],
        className
      )}
    >
      <Text className="text-xs font-medium">{children}</Text>
    </View>
  );
}
