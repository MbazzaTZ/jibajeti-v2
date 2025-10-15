import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Link, useRouter } from "expo-router";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    // Validation
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return;
    }

    if (!formData.username.trim()) {
      setError("Username is required");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      console.log("Attempting registration for:", formData.email);
      const success = await register({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      if (success) {
        console.log("Registration successful");
        setSuccess("Registration successful! Please check your email to verify your account.");
        setFormData({
          fullName: "",
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.replace("/login");
        }, 2000);
      } else {
        console.log("Registration failed: Email already exists or invalid");
        setError("Email already exists or registration failed. Please try with a different email.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An error occurred during registration. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center p-4 min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <View className="space-y-4">
              {error ? (
                <View className="bg-destructive/15 border border-destructive/50 rounded-lg p-3">
                  <Text className="text-destructive text-sm">{error}</Text>
                </View>
              ) : null}
              
              {success ? (
                <View className="bg-success/15 border border-success/50 rounded-lg p-3">
                  <Text className="text-success text-sm">{success}</Text>
                </View>
              ) : null}

              <View className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChangeText={(value) => handleChange("fullName", value)}
                  disabled={loading}
                />
              </View>

              <View className="space-y-2">
                <Label>Username</Label>
                <Input
                  placeholder="Choose a username"
                  value={formData.username}
                  onChangeText={(value) => handleChange("username", value)}
                  disabled={loading}
                />
              </View>

              <View className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  placeholder="Enter your email"
                  value={formData.email}
                  onChangeText={(value) => handleChange("email", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  disabled={loading}
                />
              </View>

              <View className="space-y-2">
                <Label>Password</Label>
                <Input
                  placeholder="Create a password (min 6 characters)"
                  value={formData.password}
                  onChangeText={(value) => handleChange("password", value)}
                  secureTextEntry
                  disabled={loading}
                />
              </View>

              <View className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleChange("confirmPassword", value)}
                  secureTextEntry
                  disabled={loading}
                />
              </View>

              <Button 
                onPress={handleSubmit}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>

              <View className="text-center">
                <Text className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary">
                    Login here
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

export default Register;
