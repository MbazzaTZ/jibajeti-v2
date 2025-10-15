import { View, Text } from "react-native";
import { cn } from "@/utils/utils";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react-native";

interface AlertProps {
  children: React.ReactNode;
  variant?: "default" | "destructive" | "success" | "warning";
  className?: string;
}

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function Alert({ children, variant = "default", className }: AlertProps) {
  const variantClasses = {
    default: "bg-blue-50 border-blue-200",
    destructive: "bg-red-50 border-red-200",
    success: "bg-green-50 border-green-200",
    warning: "bg-yellow-50 border-yellow-200"
  };

  const icon = {
    default: <Info size={16} color="#3b82f6" />,
    destructive: <XCircle size={16} color="#ef4444" />,
    success: <CheckCircle size={16} color="#22c55e" />,
    warning: <AlertCircle size={16} color="#eab308" />
  };

  return (
    <View className={cn(
      "relative w-full rounded-lg border p-4",
      variantClasses[variant],
      className
    )}>
      <View className="flex-row items-start gap-3">
        <View className="mt-0.5">{icon[variant]}</View>
        <View className="flex-1">{children}</View>
      </View>
    </View>
  );
}

export function AlertDescription({ children, className }: AlertDescriptionProps) {
  return (
    <Text className={cn("text-sm", className)}>
      {children}
    </Text>
  );
}
