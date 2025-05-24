/**
 * Message types for chat messages
 */

export enum MESSAGE_TYPES {
  SENT = "SENT",
  RECEIVED = "RECEIVED",
}

export interface MessageType {
  id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  replied_id?: string | null;
  chat_id?: string | null;
}

// Type used in MessageArea component for displaying messages
export interface CHAT_INFO_TYPE {
  id: string;
  type: MESSAGE_TYPES;
  name: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  is_read: boolean;
  createdAt: string;
  number: string;
  replied_id: string | null;
  isPending?: boolean;
} 