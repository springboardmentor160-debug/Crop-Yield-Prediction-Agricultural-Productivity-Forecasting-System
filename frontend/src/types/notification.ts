/**
 * YieldSense AI  -  Notification Types
 */

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  unread_count: number;
}
