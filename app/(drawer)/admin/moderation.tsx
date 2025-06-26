import React, { useState, useEffect } from 'react';
import { View, Text } from '@tamagui/core';
import {
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors, OpacityColors } from '@/theme';
import { reportService, ReportWithDetails, ActionTaken } from '@/services/moderation/reportService';
import { toastService } from '@/services/toastService';
import { useAuthStore } from '@/stores/authStore';
import { router } from 'expo-router';

// Admin check utility
const isAdmin = (userId: string): boolean => {
  const adminIds = process.env.EXPO_PUBLIC_ADMIN_USER_IDS?.split(',') || [];
  return adminIds.includes(userId);
};

export default function ModerationPanelScreen() {
  const { user } = useAuthStore();
  const [reports, setReports] = useState<ReportWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingReportId, setProcessingReportId] = useState<string | null>(null);

  // Check admin access
  useEffect(() => {
    if (!user || !isAdmin(user.id)) {
      toastService.showError('Unauthorized access');
      router.replace('/');
    }
  }, [user]);

  const loadReports = async () => {
    try {
      const unreviewedReports = await reportService.getUnreviewedReports();
      setReports(unreviewedReports);
    } catch (error) {
      console.error('Error loading reports:', error);
      toastService.showError('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const handleAction = async (reportId: string, action: ActionTaken) => {
    setProcessingReportId(reportId);

    const result = await reportService.reviewReport(reportId, action);

    if (result.success) {
      toastService.showSuccess(`Report ${action.replace('_', ' ')}`);
      // Remove from list
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } else {
      toastService.showError(result.error || 'Failed to process report');
    }

    setProcessingReportId(null);
  };

  const getContentLabel = (report: ReportWithDetails) => {
    switch (report.content_type) {
      case 'post':
        return 'Post';
      case 'story':
        return 'Story';
      case 'comment':
        return 'Comment';
      case 'user':
        return 'User Profile';
      default:
        return 'Content';
    }
  };

  if (!user || !isAdmin(user.id)) {
    return null;
  }

  if (isLoading) {
    return (
      <View flex={1} backgroundColor={Colors.background}>
        <ScreenHeader title="Moderation Panel" />
        <View flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View flex={1} backgroundColor={Colors.background}>
      <ScreenHeader title="Moderation Panel" />

      {reports.length === 0 ? (
        <View flex={1} justifyContent="center" alignItems="center" paddingHorizontal="$6">
          <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
            No reports to review
          </Text>
          <Text fontSize={14} color="$textSecondary" textAlign="center">
            All reports have been reviewed
          </Text>
        </View>
      ) : (
        <>
          <View paddingHorizontal="$4" paddingVertical="$2">
            <Text fontSize={12} color="$textSecondary">
              {reports.length} UNREVIEWED {reports.length === 1 ? 'REPORT' : 'REPORTS'}
            </Text>
          </View>

          <FlatList
            data={reports}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <Text style={styles.contentType}>{getContentLabel(item)}</Text>
                  <Text style={styles.reportDate}>
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Unknown'}
                  </Text>
                </View>

                <View style={styles.reportBody}>
                  <Text style={styles.label}>Reported by:</Text>
                  <Text style={styles.value}>@{item.reporter?.username || 'Unknown'}</Text>

                  <Text style={styles.label}>Reason:</Text>
                  <Text style={styles.value}>{item.reason}</Text>

                  {item.additional_info && (
                    <>
                      <Text style={styles.label}>Details:</Text>
                      <Text style={styles.value}>{item.additional_info}</Text>
                    </>
                  )}
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.dismissButton]}
                    onPress={() => handleAction(item.id, 'dismissed')}
                    disabled={processingReportId === item.id}
                  >
                    <Text style={styles.dismissButtonText}>Dismiss</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.warnButton]}
                    onPress={() => handleAction(item.id, 'user_warned')}
                    disabled={processingReportId === item.id}
                  >
                    <Text style={styles.warnButtonText}>Warn User</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.removeButton]}
                    onPress={() => handleAction(item.id, 'content_removed')}
                    disabled={processingReportId === item.id}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>

                {processingReportId === item.id && (
                  <View style={styles.processingOverlay}>
                    <ActivityIndicator color={Colors.white} />
                  </View>
                )}
              </View>
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.primary}
              />
            }
            contentContainerStyle={styles.listContent}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  reportCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  contentType: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  reportDate: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  reportBody: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 8,
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  dismissButton: {
    backgroundColor: Colors.gray[100],
  },
  dismissButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  warnButton: {
    backgroundColor: Colors.warning,
  },
  warnButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  removeButton: {
    backgroundColor: Colors.error,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: OpacityColors.overlay.light,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
});
