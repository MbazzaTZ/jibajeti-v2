import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Home, Search, AlertTriangle, ArrowLeft } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks/use-toast';

const NotFound = () => {
  const { toast } = useToast();

  const handleGoHome = () => {
    // Navigation would go here in a real app
    toast({
      title: 'Redirecting',
      description: 'Taking you back to the home page',
    });
  };

  const handleSearch = () => {
    toast({
      title: 'Search',
      description: 'Search functionality would open here',
    });
  };

  const handleGoBack = () => {
    // Navigation would go here in a real app
    toast({
      title: 'Going Back',
      description: 'Returning to previous page',
    });
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8">
          <View className="flex items-center space-y-6">
            {/* Icon */}
            <View className="relative">
              <View className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={48} color="#eab308" />
              </View>
              <View className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <Text className="text-white font-bold text-sm">404</Text>
              </View>
            </View>

            {/* Message */}
            <View className="space-y-3 text-center">
              <Text className="text-3xl font-bold text-gray-900">Page Not Found</Text>
              <Text className="text-lg text-muted-foreground">
                Oops! The page you're looking for doesn't exist or has been moved.
              </Text>
            </View>

            {/* Quick Actions */}
            <View className="w-full space-y-3">
              <Button onPress={handleGoHome} className="w-full gap-2">
                <Home size={16} />
                <Text>Go to Homepage</Text>
              </Button>
              
              <Button variant="outline" onPress={handleGoBack} className="w-full gap-2">
                <ArrowLeft size={16} />
                <Text>Go Back</Text>
              </Button>

              <Button variant="outline" onPress={handleSearch} className="w-full gap-2">
                <Search size={16} />
                <Text>Search</Text>
              </Button>
            </View>

            {/* Help Section */}
            <View className="w-full pt-6 border-t border-gray-200">
              <Text className="text-sm font-medium text-center mb-3">
                Need Help?
              </Text>
              <View className="space-y-2">
                <TouchableOpacity className="py-2">
                  <Text className="text-primary text-center">Contact Support</Text>
                </TouchableOpacity>
                <TouchableOpacity className="py-2">
                  <Text className="text-primary text-center">View Documentation</Text>
                </TouchableOpacity>
                <TouchableOpacity className="py-2">
                  <Text className="text-primary text-center">Report Issue</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Code for Debugging */}
            <View className="mt-6 p-3 bg-gray-100 rounded-lg">
              <Text className="text-xs text-muted-foreground text-center">
                Error Code: 404 • Resource Not Found
              </Text>
            </View>
          </View>
        </Card>

        {/* Additional Helpful Links */}
        <View className="mt-8 max-w-md w-full">
          <Text className="text-sm font-medium text-center mb-4">
            Popular Pages
          </Text>
          <View className="flex flex-wrap justify-center gap-3">
            <TouchableOpacity className="px-4 py-2 bg-gray-100 rounded-lg">
              <Text className="text-sm">Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity className="px-4 py-2 bg-gray-100 rounded-lg">
              <Text className="text-sm">Transactions</Text>
            </TouchableOpacity>
            <TouchableOpacity className="px-4 py-2 bg-gray-100 rounded-lg">
              <Text className="text-sm">Budget</Text>
            </TouchableOpacity>
            <TouchableOpacity className="px-4 py-2 bg-gray-100 rounded-lg">
              <Text className="text-sm">Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default NotFound;
