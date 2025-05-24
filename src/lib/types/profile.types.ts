/**
 * Profile types for user profiles
 */

export interface ProfileType {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar_url: string;
  created_at?: string;
}

// Type used in MessageArea component
export interface ProfileInfoType {
  name: string;
  phone: string;
  email: string;
  avatar_url: string;
  id: string;
} 