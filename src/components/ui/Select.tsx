import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { cn } from "@/utils/utils";

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  placeholder?: string;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function Select({ value, onValueChange, children, placeholder }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    onValueChange?.(value);
    setIsOpen(false);
  };

  const childrenArray = React.Children.toArray(children);
  const trigger = childrenArray.find((child: any) => child.type === SelectTrigger);
  const content = childrenArray.find((child: any) => child.type === SelectContent);

  const selectedItem = content?.props.children.find((item: any) => item.props.value === selectedValue);
  const displayValue = selectedItem?.props.children || placeholder || "Select...";

  return (
    <View>
      <TouchableOpacity onPress={() => setIsOpen(true)}>
        {React.cloneElement(trigger as React.ReactElement, {
          children: (
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground">{displayValue}</Text>
              <ChevronDown size={16} color="#6b7280" />
            </View>
          )
        })}
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-card rounded-t-2xl max-h-1/2">
            <View className="p-4 border-b border-border">
              <Text className="text-lg font-semibold text-card-foreground">Select an option</Text>
            </View>
            <ScrollView className="p-2">
              {React.Children.map(content?.props.children, (child: React.ReactElement) =>
                React.cloneElement(child, {
                  onPress: () => handleSelect(child.props.value),
                  isSelected: child.props.value === selectedValue,
                })
              )}
            </ScrollView>
            <TouchableOpacity
              className="p-4 border-t border-border"
              onPress={() => setIsOpen(false)}
            >
              <Text className="text-center text-destructive font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export function SelectTrigger({ children, className }: SelectTriggerProps) {
  return (
    <View className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2",
      className
    )}>
      {children}
    </View>
  );
}

export function SelectContent({ children, className }: SelectContentProps) {
  return <View className={className}>{children}</View>;
}

export function SelectItem({ value, children, className, onPress, isSelected }: SelectItemProps & { onPress?: () => void; isSelected?: boolean }) {
  return (
    <TouchableOpacity
      className={cn(
        "p-3 rounded-lg mx-2 my-1",
        isSelected ? "bg-primary/10 border border-primary/20" : "bg-transparent",
        className
      )}
      onPress={onPress}
    >
      <Text className={cn("text-foreground", isSelected && "text-primary font-medium")}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

export { SelectValue } from "./Select";
