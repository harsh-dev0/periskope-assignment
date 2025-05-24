/**
 * Label types for chat labels
 */

export interface LabelType {
  id: string;
  label_name: string;
  color: string;
  created_at?: string;
}

export interface ChatLabelType {
  user_id: string;
  chat_partner_id: string;
  label_ids: string[]; // Array of label type IDs
}

// Type used in components for displaying labels
export interface LabelData {
  id: string;
  label_name: string;
  color: string;
} 