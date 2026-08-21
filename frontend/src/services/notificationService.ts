/**
 * YieldSense AI  -  Notification Service
 *
 * API calls for notification operations.
 */

import api from "./api";
import type { NotificationListResponse } from "@/types/notification";

export const notificationService = {
  async getNotifications(): Promise<NotificationListResponse> {
    const response = await api.get("/notifications/");
    return response.data;
  },

  async markAsRead(notificationId: string): Promise<void> {
    await api.put(`/notifications/${notificationId}/read`);
  },
};
