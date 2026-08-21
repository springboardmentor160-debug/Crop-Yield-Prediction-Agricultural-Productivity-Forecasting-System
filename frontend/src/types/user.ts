/**
 * YieldSense AI  -  User Types
 */

export interface UserProfile {
  uid: string;
  email: string;
  display_name: string;
  role: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface UserUpdate {
  display_name?: string;
  phone?: string;
  avatar_url?: string;
}
