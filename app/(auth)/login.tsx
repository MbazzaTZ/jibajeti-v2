import { View, Text, ScrollView } from 'react-native';
import { Link } from 'expo-router';

export default function LoginScreen() {
  return (
    <ScrollView className=\"flex-1 bg-white p-6\">
      <View className=\"flex-1 justify-center max-w-sm mx-auto w-full\">
        <Text className=\"text-2xl font-bold text-center mb-2\">
          Welcome Back
        </Text>
        <Text className=\"text-gray-600 text-center mb-8\">
          Sign in to your account
        </Text>
        
        <View className=\"space-y-4\">
          <Text className=\"text-center text-gray-500\">
            Login form will be implemented here
          </Text>
          
          <Link href=\"/\" className=\"text-center text-blue-500 mt-4\">
            <Text>Back to Home</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
