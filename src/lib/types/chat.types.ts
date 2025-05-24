/**
 * Chat types for conversations
 */

import { LabelData } from './label.types';

// Type for individual chats
export interface ChatType {
  id: string;
  name?: string;
  type: 'individual' | 'group';
  participants: string[]; // Array of profile IDs
  labels?: string[]; // Array of label type IDs
  assigned_to?: string; // Profile ID
  created_at?: string;
}

// Type used in ChatArea component for displaying conversations
export interface ConversationData {
  person_id: string;
  name: string;
  phone: string;
  latest_message: string;
  latest_message_timestamp: string;
  labels: LabelData[];
}

// Type for grouped messages by conversation partner
export interface GroupedMessages {
  [key: string]: {
    person_id: string;
    messages: Array<{
      content: string;
      created_at: string;
    }>;
  };
}

// Type for profile map used in chat area
export interface ProfileMap {
  [key: string]: {
    name: string;
    phone: string;
  };
} 