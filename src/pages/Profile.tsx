import { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { User, Camera, Lock, Mail, Share2, Download, Clipboard, Bell, Globe, CreditCard, Building, Trash2, Check, X } from 'lucide-react-native';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useDualStorage } from '@/hooks/useDualStorage';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Profile, Transaction } from '@/types';

interface ProfileFormData {
  fullName: string;
  email: string;
  phone: string;
  monthlyIncome: string;
  targetSavings: string;
  currency: 'USD' | 'KES' | 'TZS';
  language: 'en' | 'sw';
  budgetCategories: string[];
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  address?: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
  twoFactorEnabled: boolean;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useDualStorage<Profile>('jibajeti_profile', {
    currency: 'USD',
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    monthlyIncome: 0,
    targetSavings: 0,
    language: 'en',
    budgetCategories: ['Food', 'Transport', 'Entertainment', 'Bills', 'Healthcare'],
    notificationPreferences: {
      email: true,
      sms: false,
      push: true,
    },
    twoFactorEnabled: false,
    accountCreated: new Date().toISOString(),
  } as Profile);
  
  const [transactions] = useDualStorage<Transaction[]>('jibajeti_transactions', []);
  const { toast } = useToast();

  const [isEditMode, setIsEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: profile.fullName || '',
    email: profile.email || '',
    phone: profile.phone || '',
    monthlyIncome: profile.monthlyIncome?.toString() || '0',
    targetSavings: profile.targetSavings?.toString() || '0',
    currency: profile.currency || 'USD',
    language: profile.language || 'en',
    budgetCategories: profile.budgetCategories || [],
    notificationPreferences: profile.notificationPreferences || {
      email: true,
      sms: false,
      push: true,
    },
    address: profile.address,
    twoFactorEnabled: profile.twoFactorEnabled || false,
  });

  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Phone number validation regex
  const phoneRegex = /^(\+1-\d{3}-\d{3}-\d{4}|\+255-\d{3}-\d{3}-\d{3}|\+254-\d{3}-\d{3}-\d{3})$/;

  const handleProfileUpdate = () => {
    // Validation
    if (!formData.fullName || !formData.email) {
      toast({
        title: 'Error',
        description: 'Please provide a valid name and email address',
        variant: 'destructive',
      });
      return;
    }

    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
      toast({
        title: 'Error',
        description: 'Please provide a valid email address',
        variant: 'destructive',
      });
      return;
    }

    if (formData.phone && !phoneRegex.test(formData.phone)) {
      toast({
        title: 'Error',
        description: 'Please provide a valid phone number format (e.g., +1-XXX-XXX-XXXX, +255-XXX-XXX-XXX)',
        variant: 'destructive',
      });
      return;
    }

    if (isNaN(Number(formData.monthlyIncome)) || isNaN(Number(formData.targetSavings))) {
      toast({
        title: 'Error',
        description: 'Monthly income and target savings must be valid numbers',
        variant: 'destructive',
      });
      return;
    }

    const monthlyIncome = Number(formData.monthlyIncome);
    const targetSavings = Number(formData.targetSavings);

    if (monthlyIncome < 0 || monthlyIncome > 1000000) {
      toast({
        title: 'Error',
        description: 'Monthly income must be between 0 and 1,000,000',
        variant: 'destructive',
      });
      return;
    }

    if (targetSavings < 0 || targetSavings > monthlyIncome) {
      toast({
        title: 'Error',
        description: 'Target savings must be between 0 and monthly income',
        variant: 'destructive',
      });
      return;
    }

    const updatedProfile = {
      ...profile,
      ...formData,
      monthlyIncome,
      targetSavings,
      lastUpdated: new Date().toISOString(),
    };

    setProfile(updatedProfile);
    setIsEditMode(false);
    
    toast({
      title: 'Success',
      description: 'Profile updated successfully',
    });
  };

  const handlePasswordChange = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'All password fields are required',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Error',
        description: 'New password must be at least 8 characters long',
        variant: 'destructive',
      });
      return;
    }

    if (!/[A-Z]/.test(passwordData.newPassword) || !/[0-9]/.test(passwordData.newPassword)) {
      toast({
        title: 'Error',
        description: 'New password must include at least one uppercase letter and one number',
        variant: 'destructive',
      });
      return;
    }

    // In a real app, this would call an API to update the password
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setShowPasswordForm(false);
    
    toast({
      title: 'Success',
      description: 'Password updated successfully',
    });
  };

  const addBudgetCategory = () => {
    if (newCategory.trim() && !formData.budgetCategories.includes(newCategory.trim())) {
      setFormData({
        ...formData,
        budgetCategories: [...formData.budgetCategories, newCategory.trim()],
      });
      setNewCategory('');
    }
  };

  const removeBudgetCategory = (category: string) => {
    setFormData({
      ...formData,
      budgetCategories: formData.budgetCategories.filter(c => c !== category),
    });
  };

  const generateTransactionReport = () => {
    // In a real app, this would generate a PDF report
    toast({
      title: 'Report Generated',
      description: 'Transaction report downloaded successfully',
    });
  };

  const emailReport = () => {
    if (!emailRecipient || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(emailRecipient)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    // In a real app, this would send email via API
    toast({
      title: 'Email Sent',
      description: \Transaction report sent to \\,
    });
    setEmailRecipient('');
    setShowEmailInput(false);
  };

  const toggleTwoFactorAuth = () => {
    setFormData({
      ...formData,
      twoFactorEnabled: !formData.twoFactorEnabled,
    });
    
    toast({
      title: formData.twoFactorEnabled ? '2FA Disabled' : '2FA Enabled',
      description: formData.twoFactorEnabled ? 'Two-factor authentication has been disabled' : 'Two-factor authentication has been enabled',
    });
  };

  const copyToClipboard = async () => {
    // In a real app, this would copy profile summary to clipboard
    toast({
      title: 'Copied',
      description: 'Profile summary copied to clipboard',
    });
  };

  const shareProfile = async () => {
    // In a real app, this would use the Web Share API
    toast({
      title: 'Share',
      description: 'Profile sharing dialog opened',
    });
  };

  const deleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // In a real app, this would call an API to delete the account
            toast({
              title: 'Account Deleted',
              description: 'Your account has been permanently deleted',
              variant: 'destructive',
            });
          },
        },
      ]
    );
  };

  const currencySymbol = formData.currency === 'USD' ? '$' : formData.currency === 'KES' ? 'KSh' : 'TSh';

  return (
    <ScrollView className="flex-1 space-y-6 pb-20">
      {/* Header */}
      <View className="flex items-center justify-between flex-row">
        <View>
          <Text className="text-3xl font-bold">Profile</Text>
          <Text className="text-muted-foreground">Manage your account settings and preferences</Text>
        </View>
        <Button 
          onPress={() => setIsEditMode(!isEditMode)} 
          variant={isEditMode ? "outline" : "default"}
        >
          <Text>{isEditMode ? 'Cancel' : 'Edit Profile'}</Text>
        </Button>
      </View>

      {/* Profile Information */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <View className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={formData.fullName}
                onChangeText={(value) => setFormData({ ...formData, fullName: value })}
                placeholder="Enter your full name"
                editable={isEditMode}
              />
            </View>
            <View className="space-y-2">
              <Label>Email *</Label>
              <Input
                value={formData.email}
                onChangeText={(value) => setFormData({ ...formData, email: value })}
                placeholder="Enter your email"
                keyboardType="email-address"
                editable={isEditMode}
              />
            </View>
            <View className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={formData.phone}
                onChangeText={(value) => setFormData({ ...formData, phone: value })}
                placeholder="+1-234-567-8900"
                keyboardType="phone-pad"
                editable={isEditMode}
              />
            </View>
            <View className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value: 'USD' | 'KES' | 'TZS') => 
                  setFormData({ ...formData, currency: value })
                }
                disabled={!isEditMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="KES">KES (KSh)</SelectItem>
                  <SelectItem value="TZS">TZS (TSh)</SelectItem>
                </SelectContent>
              </Select>
            </View>
            <View className="space-y-2">
              <Label>Monthly Income</Label>
              <Input
                value={formData.monthlyIncome}
                onChangeText={(value) => setFormData({ ...formData, monthlyIncome: value })}
                placeholder="0"
                keyboardType="numeric"
                editable={isEditMode}
              />
            </View>
            <View className="space-y-2">
              <Label>Target Savings</Label>
              <Input
                value={formData.targetSavings}
                onChangeText={(value) => setFormData({ ...formData, targetSavings: value })}
                placeholder="0"
                keyboardType="numeric"
                editable={isEditMode}
              />
            </View>
            <View className="space-y-2">
              <Label>Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value: 'en' | 'sw') => 
                  setFormData({ ...formData, language: value })
                }
                disabled={!isEditMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="sw">Swahili</SelectItem>
                </SelectContent>
              </Select>
            </View>
          </View>

          {/* Budget Categories */}
          <View className="space-y-2">
            <Label>Budget Categories</Label>
            <View className="flex flex-wrap gap-2 mb-2">
              {formData.budgetCategories.map((category) => (
                <Badge key={category} variant="secondary" className="flex items-center gap-1">
                  <Text>{category}</Text>
                  {isEditMode && (
                    <TouchableOpacity onPress={() => removeBudgetCategory(category)}>
                      <X size={12} />
                    </TouchableOpacity>
                  )}
                </Badge>
              ))}
            </View>
            {isEditMode && (
              <View className="flex gap-2 flex-row">
                <Input
                  value={newCategory}
                  onChangeText={setNewCategory}
                  placeholder="Add new category"
                  className="flex-1"
                />
                <Button onPress={addBudgetCategory} variant="outline">
                  <Text>Add</Text>
                </Button>
              </View>
            )}
          </View>

          {isEditMode && (
            <Button onPress={handleProfileUpdate}>
              <Text>Update Profile</Text>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose how you want to receive alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <View className="flex items-center justify-between flex-row">
            <View>
              <Text className="font-medium">Email Notifications</Text>
              <Text className="text-sm text-muted-foreground">Receive budget alerts via email</Text>
            </View>
            <TouchableOpacity
              onPress={() => setFormData({
                ...formData,
                notificationPreferences: {
                  ...formData.notificationPreferences,
                  email: !formData.notificationPreferences.email
                }
              })}
              className="w-12 h-6 bg-gray-300 rounded-full p-1"
            >
              <View className={w-4 h-4 bg-white rounded-full transform } />
            </TouchableOpacity>
          </View>
          <View className="flex items-center justify-between flex-row">
            <View>
              <Text className="font-medium">SMS Notifications</Text>
              <Text className="text-sm text-muted-foreground">Receive budget alerts via SMS</Text>
            </View>
            <TouchableOpacity
              onPress={() => setFormData({
                ...formData,
                notificationPreferences: {
                  ...formData.notificationPreferences,
                  sms: !formData.notificationPreferences.sms
                }
              })}
              className="w-12 h-6 bg-gray-300 rounded-full p-1"
            >
              <View className={w-4 h-4 bg-white rounded-full transform } />
            </TouchableOpacity>
          </View>
          <View className="flex items-center justify-between flex-row">
            <View>
              <Text className="font-medium">Push Notifications</Text>
              <Text className="text-sm text-muted-foreground">Receive in-app notifications</Text>
            </View>
            <TouchableOpacity
              onPress={() => setFormData({
                ...formData,
                notificationPreferences: {
                  ...formData.notificationPreferences,
                  push: !formData.notificationPreferences.push
                }
              })}
              className="w-12 h-6 bg-gray-300 rounded-full p-1"
            >
              <View className={w-4 h-4 bg-white rounded-full transform } />
            </TouchableOpacity>
          </View>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Two-Factor Authentication */}
          <View className="flex items-center justify-between flex-row">
            <View>
              <Text className="font-medium">Two-Factor Authentication</Text>
              <Text className="text-sm text-muted-foreground">Add an extra layer of security</Text>
            </View>
            <TouchableOpacity
              onPress={toggleTwoFactorAuth}
              className="w-12 h-6 bg-gray-300 rounded-full p-1"
            >
              <View className={w-4 h-4 bg-white rounded-full transform } />
            </TouchableOpacity>
          </View>

          {/* Password Change */}
          {showPasswordForm ? (
            <View className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <View className="space-y-2">
                <Label>Current Password</Label>
                <Input
                  value={passwordData.currentPassword}
                  onChangeText={(value) => setPasswordData({ ...passwordData, currentPassword: value })}
                  placeholder="Enter current password"
                  secureTextEntry
                />
              </View>
              <View className="space-y-2">
                <Label>New Password</Label>
                <Input
                  value={passwordData.newPassword}
                  onChangeText={(value) => setPasswordData({ ...passwordData, newPassword: value })}
                  placeholder="Enter new password"
                  secureTextEntry
                />
              </View>
              <View className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input
                  value={passwordData.confirmPassword}
                  onChangeText={(value) => setPasswordData({ ...passwordData, confirmPassword: value })}
                  placeholder="Confirm new password"
                  secureTextEntry
                />
              </View>
              <View className="flex gap-2 flex-row">
                <Button onPress={handlePasswordChange}>
                  <Text>Update Password</Text>
                </Button>
                <Button variant="outline" onPress={() => setShowPasswordForm(false)}>
                  <Text>Cancel</Text>
                </Button>
              </View>
            </View>
          ) : (
            <Button variant="outline" onPress={() => setShowPasswordForm(true)}>
              <Lock size={16} className="mr-2" />
              <Text>Change Password</Text>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Reports & Sharing */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Reports & Sharing</CardTitle>
          <CardDescription>Export and share your financial data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onPress={generateTransactionReport} className="gap-2">
              <Download size={16} />
              <Text>Download PDF Report</Text>
            </Button>
            <Button onPress={() => setShowEmailInput(true)} className="gap-2">
              <Mail size={16} />
              <Text>Email Report</Text>
            </Button>
            <Button variant="outline" onPress={copyToClipboard} className="gap-2">
              <Clipboard size={16} />
              <Text>Copy to Clipboard</Text>
            </Button>
            <Button variant="outline" onPress={shareProfile} className="gap-2">
              <Share2 size={16} />
              <Text>Share Profile</Text>
            </Button>
          </View>

          {showEmailInput && (
            <View className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <View className="space-y-2">
                <Label>Recipient Email</Label>
                <Input
                  value={emailRecipient}
                  onChangeText={setEmailRecipient}
                  placeholder="Enter recipient email address"
                  keyboardType="email-address"
                />
              </View>
              <View className="flex gap-2 flex-row">
                <Button onPress={emailReport} className="gap-2">
                  <Mail size={16} />
                  <Text>Send Email</Text>
                </Button>
                <Button variant="outline" onPress={() => {
                  setEmailRecipient('');
                  setShowEmailInput(false);
                }}>
                  <Text>Cancel</Text>
                </Button>
              </View>
            </View>
          )}
        </CardContent>
      </Card>

      {/* Account Management */}
      <Card className="p-6 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Account Management</CardTitle>
          <CardDescription>Danger zone - irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="destructive" onPress={deleteAccount}>
            <Trash2 size={16} className="mr-2" />
            <Text>Delete Account</Text>
          </Button>
        </CardContent>
      </Card>
    </ScrollView>
  );
};
