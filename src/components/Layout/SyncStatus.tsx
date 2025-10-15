import { View, Text } from "react-native";
import { Cloud, CloudOff, RefreshCw, CheckCircle } from "lucide-react-native";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/use-toast";

interface SyncStatusProps {
  lastSync?: Date | null;
  syncNow?: () => Promise<boolean>;
  syncProgress?: number;
}

export const SyncStatus = ({ lastSync, syncNow, syncProgress = 0 }: SyncStatusProps) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setIsSyncing(syncProgress > 0 && syncProgress < 100);
  }, [syncProgress]);

  const handleManualSync = async () => {
    if (!syncNow || isSyncing) return;

    setIsSyncing(true);
    const success = await syncNow();
    setIsSyncing(false);

    toast({
      title: success ? "Sync Successful" : "Sync Failed",
      description: success
        ? "Data has been synced to the cloud."
        : "Failed to sync data. Please try again.",
      variant: success ? "default" : "destructive",
    });
  };

  if (!user) return null;

  return (
    <View className="flex flex-col items-center gap-2">
      {isOnline ? (
        <>
          {lastSync && syncProgress === 0 ? (
            <View className="flex items-center gap-1">
              <CheckCircle size={12} color="#22c55e" />
              <Text className="text-green-600 text-xs">
                Synced {lastSync.toLocaleTimeString()}
              </Text>
            </View>
          ) : (
            <View className="flex items-center gap-1">
              <RefreshCw size={12} color="#3b82f6" className={isSyncing ? "animate-spin" : ""} />
              <Text className="text-blue-600 text-xs">
                {isSyncing ? "Syncing..." : "Pending Sync"}
              </Text>
            </View>
          )}
          {syncProgress > 0 && (
            <View className="w-32 h-2 bg-gray-200 rounded-full">
              <View
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${syncProgress}%` }}
              />
            </View>
          )}
          {syncNow && (
            <Button
              size="sm"
              variant="ghost"
              onPress={handleManualSync}
              disabled={isSyncing || !isOnline}
              className="p-1 h-6"
            >
              <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
              <Text className="ml-1 text-xs">Sync Now</Text>
            </Button>
          )}
        </>
      ) : (
        <View className="flex items-center gap-1">
          <CloudOff size={12} color="#f97316" />
          <Text className="text-orange-600 text-xs">Offline</Text>
        </View>
      )}
    </View>
  );
};
