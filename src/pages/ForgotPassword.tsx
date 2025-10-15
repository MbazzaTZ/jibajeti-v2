import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Mail, CheckCircle, AlertCircle, ArrowLeft, Shield, Clock } from 'lucide-react-native';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const { requestPasswordReset } = useAuth();
  const { toast } = useToast();

  const MAX_ATTEMPTS = 5;
  const COOLDOWN_MINUTES = 15;

  const handleSubmit = async () => {
    if (attemptCount >= MAX_ATTEMPTS) {
      setError(\Too many attempts. Please try again in \ minutes.\);
      return;
    }

    if (!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      console.log('Requesting password reset for:', email);
      const result = await requestPasswordReset(email);

      if (result.success) {
        console.log('Password reset email sent successfully');
        setSuccess(result.message);
        setSubmitted(true);
        setAttemptCount(prev => prev + 1);
        setEmail('');
        
        toast({
          title: 'Reset Link Sent',
          description: 'Check your email for password reset instructions',
        });
      } else {
        console.log('Password reset failed:', result.message);
        setError(result.message);
        setAttemptCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('An unexpected error occurred. Please try again later.');
      setAttemptCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setSubmitted(false);
    setError('');
    setSuccess('');
  };

  if (submitted) {
    return (
      <ScrollView className="flex-1 bg-background">
        <View className="min-h-screen flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
              <View className="flex justify-center mb-4">
                <CheckCircle size={48} color="#22c55e" />
              </View>
              <CardTitle className="text-2xl">Check Your Email</CardTitle>
              <CardDescription>
                Password reset instructions have been sent to your email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <View className="bg-green-50 border border-green-200 rounded-lg p-4">
                <Text className="text-green-800 text-center">
                  {success || 'If an account exists with this email, you will receive password reset instructions shortly.'}
                </Text>
              </View>

              <View className="space-y-4">
                <Text className="text-lg font-semibold text-center">Next Steps</Text>
                <View className="space-y-3">
                  <View className="flex items-center gap-3 flex-row">
                    <View className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <Text className="text-blue-600 font-bold text-xs">1</Text>
                    </View>
                    <Text className="flex-1 text-muted-foreground">
                      Check your email inbox (and spam folder)
                    </Text>
                  </View>
                  <View className="flex items-center gap-3 flex-row">
                    <View className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <Text className="text-blue-600 font-bold text-xs">2</Text>
                    </View>
                    <Text className="flex-1 text-muted-foreground">
                      Look for an email from Ji-bajeti Pro
                    </Text>
                  </View>
                  <View className="flex items-center gap-3 flex-row">
                    <View className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <Text className="text-blue-600 font-bold text-xs">3</Text>
                    </View>
                    <Text className="flex-1 text-muted-foreground">
                      Click the password reset link in the email
                    </Text>
                  </View>
                  <View className="flex items-center gap-3 flex-row">
                    <View className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <Text className="text-blue-600 font-bold text-xs">4</Text>
                    </View>
                    <Text className="flex-1 text-muted-foreground">
                      Create your new password
                    </Text>
                  </View>
                </View>
              </View>

              <View className="space-y-4">
                <Text className="text-sm text-muted-foreground text-center">
                  Didn't receive the email? Check your spam folder or try again.
                </Text>
                
                <View className="space-y-2">
                  <Button 
                    variant="outline" 
                    onPress={handleResend}
                    className="w-full"
                  >
                    <Text>Send Again</Text>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    onPress={() => {/* Navigate to login */}}
                    className="w-full"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    <Text>Back to Login</Text>
                  </Button>
                </View>
              </View>

              <View className="pt-4 border-t border-gray-200">
                <View className="flex items-center gap-2 flex-row justify-center">
                  <Shield size={16} color="#6b7280" />
                  <Text className="text-sm text-muted-foreground text-center">
                    For security reasons, reset links expire after 24 hours
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
              <Mail size={32} color="#3b82f6" />
            </View>
            <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              Enter your email address and we'll send you a link to reset your password
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

              {attemptCount > 0 && attemptCount < MAX_ATTEMPTS && (
                <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <View className="flex items-center gap-2 flex-row">
                    <Clock size={16} color="#eab308" />
                    <Text className="text-yellow-800 text-sm">
                      Attempt {attemptCount} of {MAX_ATTEMPTS}
                    </Text>
                  </View>
                </View>
              )}

              {attemptCount >= MAX_ATTEMPTS && (
                <View className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <View className="flex items-center gap-2 flex-row">
                    <AlertCircle size={16} color="#f97316" />
                    <Text className="text-orange-800 text-sm">
                      Too many attempts. Please try again in {COOLDOWN_MINUTES} minutes.
                    </Text>
                  </View>
                </View>
              )}

              <View className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your registered email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!loading && attemptCount < MAX_ATTEMPTS}
                />
                <Text className="text-xs text-muted-foreground">
                  Make sure you enter the email address associated with your account
                </Text>
              </View>

              <Button 
                onPress={handleSubmit}
                disabled={loading || attemptCount >= MAX_ATTEMPTS}
                className="w-full"
              >
                <Text>{loading ? 'Sending Reset Link...' : 'Send Reset Link'}</Text>
              </Button>

              <View className="pt-4 border-t border-gray-200">
                <View className="flex gap-2 justify-center text-sm flex-row">
                  <TouchableOpacity onPress={() => {/* Navigate to login */}}>
                    <Text className="text-primary">Back to Login</Text>
                  </TouchableOpacity>
                  <Text className="text-muted-foreground">•</Text>
                  <TouchableOpacity onPress={() => {/* Navigate to register */}}>
                    <Text className="text-primary">Create Account</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <View className="flex items-start gap-2 flex-row">
                  <Shield size={16} color="#3b82f6" className="mt-0.5" />
                  <View className="flex-1">
                    <Text className="text-blue-800 font-medium text-sm">Security Notice</Text>
                    <Text className="text-blue-700 text-xs">
                      Password reset links are valid for 24 hours and can only be used once.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
};

export default ForgotPassword;
