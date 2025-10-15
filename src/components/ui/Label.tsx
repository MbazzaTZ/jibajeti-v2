import { Text } from "react-native";
import { cn } from "@/utils/utils";

interface LabelProps {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

export function Label({ children, className, htmlFor }: LabelProps) {
  return (
    <Text className={cn("text-sm font-medium text-foreground mb-2", className)}>
      {children}
    </Text>
  );
}
