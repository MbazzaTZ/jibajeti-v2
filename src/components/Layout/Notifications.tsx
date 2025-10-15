import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { Bell, Calendar, AlertTriangle, CheckCircle } from "lucide-react-native";
import { useDualStorage } from "@/hooks/useDualStorage";
import { Loan, PlannedExpense } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface AppNotification {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export const Notifications = () => {
  const [loans] = useDualStorage<Loan[]>("jibajeti_loans", []);
  const [plannedExpenses] = useDualStorage<PlannedExpense[]>("jibajeti_planned_expenses", []);
  const [notifications, setNotifications] = useDualStorage<AppNotification[]>("jibajeti_notifications", []);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    checkForNotifications();
  }, [loans, plannedExpenses]);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.isRead).length);
  }, [notifications]);

  const checkForNotifications = () => {
    const newNotifications: AppNotification[] = [];
    const today = new Date();
    
    // Check for upcoming loan payments
    loans.forEach(loan => {
      if (loan.status === "active") {
        const dueDate = new Date(loan.startDate);
        dueDate.setMonth(dueDate.getMonth() + 1);
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue <= 3 && daysUntilDue >= 0) {
          newNotifications.push({
            id: `loan-${loan.id}-${dueDate.toISOString()}`,
            type: "warning",
            title: "Loan Payment Due",
            message: `Payment for ${loan.title} is due in ${daysUntilDue} days`,
            timestamp: new Date().toISOString(),
            isRead: false,
            actionUrl: "/(tabs)/loans"
          });
        }
      }
    });

    // Check for upcoming planned expenses
    plannedExpenses.forEach(expense => {
      if (!expense.paid) {
        const dueDate = new Date(expense.dueDate);
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue <= 3 && daysUntilDue >= 0) {
          newNotifications.push({
            id: `expense-${expense.id}-${dueDate.toISOString()}`,
            type: "info",
            title: "Upcoming Expense",
            message: `${expense.title} is due in ${daysUntilDue} days`,
            timestamp: new Date().toISOString(),
            isRead: false,
            actionUrl: "/(tabs)/planner"
          });
        }
      }
    });

    // Add new notifications that don''t already exist
    newNotifications.forEach(newNotif => {
      if (!notifications.find(n => n.id === newNotif.id)) {
        setNotifications(prev => [newNotif, ...prev]);
      }
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => notif.id === id ? { ...notif, isRead: true } : notif)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle size={16} color="#d97706" />;
      case "info":
        return <Calendar size={16} color="#3b82f6" />;
      case "error":
        return <AlertTriangle size={16} color="#ef4444" />;
      case "success":
        return <CheckCircle size={16} color="#22c55e" />;
      default:
        return <CheckCircle size={16} color="#6b7280" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "warning": return "border-l-yellow-500";
      case "info": return "border-l-blue-500";
      case "error": return "border-l-red-500";
      case "success": return "border-l-green-500";
      default: return "border-l-gray-500";
    }
  };

  return (
    <View className="relative">
      <Button
        variant="ghost"
        size="icon"
        onPress={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <View className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
            <Text className="text-destructive-foreground text-xs">{unreadCount}</Text>
          </View>
        )}
      </Button>

      <Modal
        visible={showNotifications}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <Card className="mx-4 mb-4 max-h-96">
            <View className="p-4 border-b bg-muted/50">
              <View className="flex items-center justify-between">
                <Text className="font-semibold text-lg">Notifications</Text>
                <View className="flex gap-1">
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onPress={markAllAsRead}
                      className="h-8"
                    >
                      <Text className="text-xs">Mark all read</Text>
                    </Button>
                  )}
                  {notifications.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onPress={clearAll}
                      className="h-8"
                    >
                      <Text className="text-xs">Clear all</Text>
                    </Button>
                  )}
                </View>
              </View>
              {unreadCount > 0 && (
                <Text className="text-xs text-muted-foreground mt-1">
                  {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                </Text>
              )}
            </View>

            <ScrollView className="p-2 max-h-80">
              {notifications.length > 0 ? (
                notifications.slice(0, 10).map(notification => (
                  <TouchableOpacity
                    key={notification.id}
                    className={`p-3 rounded-lg mb-2 border-l-4 ${
                      getNotificationColor(notification.type)
                    } ${
                      !notification.isRead ? "bg-blue-50/50 border border-blue-200" : "bg-background"
                    }`}
                    onPress={() => markAsRead(notification.id)}
                  >
                    <View className="flex items-start gap-3">
                      <View className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </View>
                      <View className="flex-1">
                        <Text className="font-medium text-sm">{notification.title}</Text>
                        <Text className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </Text>
                        <Text className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.timestamp).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </Text>
                        {notification.actionUrl && (
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto mt-1"
                            onPress={() => {
                              // Handle navigation to actionUrl
                              setShowNotifications(false);
                            }}
                          >
                            <Text className="text-xs text-primary">View details →</Text>
                          </Button>
                        )}
                      </View>
                      {!notification.isRead && (
                        <View className="w-2 h-2 bg-blue-500 rounded-full mt-1" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View className="text-center py-8">
                  <Bell size={48} color="#6b7280" className="opacity-50 mx-auto mb-3" />
                  <Text className="text-sm text-muted-foreground font-medium">No notifications</Text>
                  <Text className="text-xs text-muted-foreground mt-1">
                    You''re all caught up!
                  </Text>
                </View>
              )}
            </ScrollView>

            {notifications.length > 10 && (
              <View className="p-3 border-t bg-muted/30">
                <Text className="text-xs text-muted-foreground text-center">
                  Showing 10 of {notifications.length} notifications
                </Text>
              </View>
            )}
          </Card>
        </View>
      </Modal>
    </View>
  );
};

export default Notifications;
