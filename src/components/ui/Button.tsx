import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { cn } from "@/utils/utils";

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function Button({ 
  children, 
  onPress, 
  variant = "default", 
  size = "default", 
  disabled = false,
  loading = false,
  className 
}: ButtonProps) {
  const baseClasses = "flex-row items-center justify-center rounded-lg";
  
  const variantClasses = {
    default: "bg-primary",
    destructive: "bg-destructive",
    outline: "border border-border bg-transparent",
    secondary: "bg-secondary",
    ghost: "bg-transparent",
    link: "bg-transparent"
  };

  const sizeClasses = {
    default: "px-4 py-2",
    sm: "px-3 py-1",
    lg: "px-6 py-3",
    icon: "p-2"
  };

  const textClasses = {
    default: "text-primary-foreground",
    destructive: "text-destructive-foreground",
    outline: "text-foreground",
    secondary: "text-secondary-foreground",
    ghost: "text-foreground",
    link: "text-primary"
  };

  return (
    <TouchableOpacity
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && "opacity-50",
        className
      )}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading && <ActivityIndicator size="small" className="mr-2" />}
      <Text className={cn("font-medium", textClasses[variant])}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}
