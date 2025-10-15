import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff, Shield, Clock, Key } from 'lucide-react-native';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [isValidSession, setIsValidSession] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  // Password strength calculator
  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 25;
    return strength;
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  useEffect(() => {
    // Validate reset session
    const validateSession = async () => {
      try {
        // Simulate session validation
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In a real app, this would check Supabase session
        const hasValidSession = true; // This would come from actual validation
        
        if (hasValidSession) {
          setIsValidSession(true);
          console.log('Valid reset session found');
        } else {
          setError('Invalid or expired reset link. Please request a new password reset.');
          console.log('No valid reset session');
        }
      } catch (err) {
        console.error('Session validation error:', err);
        setError('An error occurred. Please try requesting a password reset again.');
      } finally {
        setValidating(false);
      }
    };

    validateSession();
  }, []);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    // Enhanced validation
    if (!password.trim()) {
      setError('Please enter a new password');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (passwordStrength < 75) {
      setError('Please choose a stronger password with uppercase letters, numbers, and symbols');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting to reset password');
      const result = await resetPassword(password);

      if (result.success) {
        console.log('Password reset successfully');
        setSuccess(result.message);
        setPassword('');
        setConfirmPassword('');
        
        toast({
          title: 'Password Reset',
          description: 'Your password has been updated successfully',
        });

        // Redirect after success
        setTimeout(() => {
          // Navigation would go here
          console.log('Redirecting to login...');
        }, 3000);
      } else {
        console.log('Password reset failed:', result.message);
        setError(result.message);
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength >= 75) return 'bg-green-500';
    if (passwordStrength >= 50) return 'bg-yellow-500';
    if (passwordStrength >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength >= 75) return 'Strong';
    if (passwordStrength >= 50) return 'Good';
    if (passwordStrength >= 25) return 'Weak';
    return 'Very Weak';
  };

  if (validating) {
    return (
      <ScrollView className="flex-1 bg-background">
        <View className="min-h-screen flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <View className="flex items-center justify-center py-12">
                <View className="text-center space-y-4">
                  <View className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></View>
                  <View className="space-y-2">
                    <Text className="text-lg font-medium">Validating Reset Link</Text>
                    <Text className="text-muted-foreground">
                      Please wait while we verify your reset link...
                    </Text>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    );
  }

  if (!isValidSession) {
    return (
      <ScrollView className="flex-1 bg-background">
        <View className="min-h-screen flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
              <View className="flex justify-center mb-4">
                <AlertCircle size={48} color="#ef4444" />
              </View>
              <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <View className="bg-red-50 border border-red-200 rounded-lg p-4">
                <Text className="text-red-800 text-center">
                  {error || 'The password reset link is invalid or has expired.'}
                </Text>
              </View>

              <View className="space-y-3">
                <Text className="text-sm text-muted-foreground text-center">
                  Password reset links expire after 24 hours for security reasons.
                </Text>
                
                <Button onPress={() => {/* Navigate to forgot password */}} className="w-full">
                  <Text>Request New Reset Link</Text>
                </Button>

                <Button variant="outline" onPress={() => {/* Navigate to login */}} className="w-full">
                  <Text>Back to Login</Text>
                </Button>
              </View>

              <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <View className="flex items-start gap-2 flex-row">
                  <Shield size={16} color="#3b82f6" className="mt-0.5" />
                  <View className="flex-1">
                    <Text className="text-blue-800 font-medium text-sm">Security Notice</Text>
                    <Text className="text-blue-700 text-xs">
                      For your security, password reset links are only valid for 24 hours and can be used once.
                    </Text>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    );
  }

  if (success) {
    return (
      <ScrollView className="flex-1 bg-background">
        <View className="min-h-screen flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
              <View className="flex justify-center mb-4">
                <CheckCircle size={48} color="#22c55e" />
              </View>
              <CardTitle className="text-2xl">Password Reset Successful</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <View className="bg-green-50 border border-green-200 rounded-lg p-4">
                <Text className="text-green-800 text-center">
                  {success}
                </Text>
              </View>

              <View className="space-y-2">
                <Text className="text-sm text-muted-foreground text-center">
                  You will be redirected to the login page shortly.
                </Text>
                <Text className="text-sm text-muted-foreground text-center">
                  If not redirected automatically, click the button below.
                </Text>
              </View>

              <Button onPress={() => {/* Navigate to login */}} className="w-full">
                <Text>Go to Login</Text>
              </Button>

              <View className="bg-green-50 border border-green-200 rounded-lg p-4">
                <View className="flex items-center gap-2 flex-row">
                  <Shield size={16} color="#22c55e" />
                  <Text className="text-green-800 text-sm">
                    Your password has been updated successfully. You can now log in with your new password.
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <View className="flex justify-center mb-2">
              <Key size={32} color="#3b82f6" />
            </View>
            <CardTitle className="text-2xl text-center">Set New Password</CardTitle>
            <CardDescription className="text-center">
              Create a strong new password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <View className="space-y-4">
              {error && (
                <View className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <View className="flex items-center gap-2 flex-row">
                    <AlertCircle size={16} color="#ef4444" />
                    <Text className="text-red-800 flex-1">{error}</Text>
                  </View>
                </View>
              )}

              <View className="space-y-2">
                <Label>New Password</Label>
                <View className="relative">
                  <Input
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your new password"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password-new"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3"
                  >
                    {showPassword ? (
                      <EyeOff size={16} color="#6b7280" />
                    ) : (
                      <Eye size={16} color="#6b7280" />
                    )}
                  </TouchableOpacity>
                </View>
                
                {/* Password Strength Meter */}
                {password.length > 0 && (
                  <View className="space-y-2">
                    <View className="flex justify-between flex-row">
                      <Text className="text-xs text-muted-foreground">Password Strength</Text>
                      <Text className={\	ext-xs font-medium \\}>
                        {getPasswordStrengthText()}
                      </Text>
                    </View>
                    <View className="w-full bg-gray-200 rounded-full h-2">
                      <View 
                        className={\h-2 rounded-full \\}
                        style={{ width: \\%\ }}
                      />
                    </View>
                  </View>
                )}
              </View>

              <View className="space-y-2">
                <Label>Confirm Password</Label>
                <View className="relative">
                  <Input
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Re-enter your password"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} color="#6b7280" />
                    ) : (
                      <Eye size={16} color="#6b7280" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <View className="flex items-start gap-2 flex-row">
                  <Shield size={16} color="#3b82f6" className="mt-0.5" />
                  <View className="flex-1">
                    <Text className="text-blue-800 font-medium text-sm">Password Requirements</Text>
                    <View className="mt-1 space-y-1">
                      <Text className="text-blue-700 text-xs">• At least 8 characters long</Text>
                      <Text className="text-blue-700 text-xs">• Include uppercase and lowercase letters</Text>
                      <Text className="text-blue-700 text-xs">• Include at least one number</Text>
                      <Text className="text-blue-700 text-xs">• Include special characters for better security</Text>
                    </View>
                  </View>
                </View>
              </View>

              <Button 
                onPress={handleSubmit}
                disabled={loading}
                className="w-full"
              >
                <Text>{loading ? 'Resetting Password...' : 'Reset Password'}</Text>
              </Button>

              <View className="text-center">
                <TouchableOpacity onPress={() => {/* Navigate to login */}}>
                  <Text className="text-primary">Back to Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
};

export default ResetPassword;
