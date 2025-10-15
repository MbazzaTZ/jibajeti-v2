import { TextInput, TextInputProps } from "react-native";
import { cn } from "@/utils/utils";

interface TextareaProps extends TextInputProps {
  className?: string;
  rows?: number;
}

export function Textarea({ className, rows = 3, ...props }: TextareaProps) {
  return (
    <TextInput
      className={cn(
        "flex w-full rounded-md border border-input bg-background px-3 py-2 text-foreground",
        "focus:border-primary focus:ring-2 focus:ring-primary/20",
        className
      )}
      placeholderTextColor="#6b7280"
      multiline
      numberOfLines={rows}
      textAlignVertical="top"
      {...props}
    />
  );
}
