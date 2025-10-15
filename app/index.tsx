import { Link } from 'expo-router';
import { View, Text, ScrollView } from 'react-native';

export default function Index() {
  return (
    <ScrollView className=\"flex-1 bg-white\">
      <View className=\"flex-1 items-center justify-center p-8\">
        <Text className=\"text-3xl font-bold text-center mb-4\">
          Welcome to Jibajeti v2
        </Text>
        <Text className=\"text-lg text-center text-gray-600 mb-8\">
          Your personal finance management app
        </Text>
        
        <View className=\"w-full max-w-sm space-y-4\">
          <Link href=\"/(auth)/login\" asChild>
            <View className=\"bg-blue-500 p-4 rounded-lg\">
              <Text className=\"text-white text-center font-semibold\">
                Sign In
              </Text>
            </View>
          </Link>
          
          <Link href=\"/(auth)/register\" asChild>
            <View className=\"bg-green-500 p-4 rounded-lg\">
              <Text className=\"text-white text-center font-semibold\">
                Create Account
              </Text>
            </View>
          </Link>
        </View>
        
        <View className=\"mt-12\">
          <Text className=\"text-sm text-gray-500 text-center\">
            Take control of your finances
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
