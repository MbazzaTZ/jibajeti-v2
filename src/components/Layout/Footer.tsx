import { View, Text } from "react-native";
import { Mail, Github, Linkedin } from "lucide-react-native";

export const Footer = () => {
  return (
    <View className="border-t border-border bg-card mt-12">
      <View className="container py-8">
        <View className="flex flex-col md:flex-row justify-between items-center gap-4">
          <View className="text-center md:text-left">
            <Text className="text-sm text-muted-foreground">
              © 2025 Ji-bajeti Pro. All rights reserved.
            </Text>
            <Text className="text-sm text-muted-foreground">
              Developed by David Mbazza
            </Text>
          </View>
          
          <View className="flex items-center gap-4">
            <View className="flex items-center gap-2">
              <Mail size={16} color="#6b7280" />
              <Text className="text-sm text-muted-foreground">davidmbazza@gmail.com</Text>
            </View>
            
            <View className="flex gap-2">
              <Github size={16} color="#6b7280" />
              <Linkedin size={16} color="#6b7280" />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
