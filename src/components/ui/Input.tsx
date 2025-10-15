import { TextInput, TextInputProps } from "react-native";
import { cn } from "@/utils/utils";

interface InputProps extends TextInputProps {
  className?: string;
}

export function Input({ className, ...props }: InputProps) {
  return (
    <TextInput
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground",
        "focus:border-primary focus:ring-2 focus:ring-primary/20",
        className
      )}
      placeholderTextColor="#6b7280"
      {...props}
    />
  );
}
