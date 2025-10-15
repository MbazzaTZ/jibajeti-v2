import React, { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Link, useRouter } from "expo-router";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      console.log("Attempting login with email:", email);
      const success = await login(email, password);
      console.log("Login result:", success);
      
      if (success) {
        console.log("Login successful, redirecting to dashboard...");
        router.replace("/(tabs)");
      } else {
        console.log("Login failed: Invalid credentials");
        setError("Invalid email or password. Please check your credentials and try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center p-4 min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Login to Ji-bajeti Pro</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your financial dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <View className="bg-destructive/15 border border-destructive/50 rounded-lg p-3 mb-4">
                <Text className="text-destructive text-sm">{error}</Text>
              </View>
            ) : null}
            
            <View className="space-y-4">
              <View className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  required
                  disabled={loading}
                />
              </View>
              
              <View className="space-y-2">
                <Label>Password</Label>
                <Input
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  required
                  disabled={loading}
                />
              </View>
              
              <Button 
                onPress={handleSubmit}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>

              <View className="text-center">
                <Text className="text-sm text-muted-foreground">
                  Don''t have an account?{" "}
                  <Link href="/register" className="text-primary">
                    Register here
                  </Link>
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
};

export default Login;
