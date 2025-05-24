# Chat Application

A real-time chat application built with Next.js, TypeScript, and Supabase.

## Project Structure

- `src/app`: Next.js app router pages
- `src/components`: React components
  - `chat/`: Chat-related components
  - `layouts/`: Layout components
  - `ui/`: Reusable UI components
- `src/lib`: Utilities and shared code
  - `db/`: Database schema and utilities
  - `types/`: TypeScript type definitions
  - `supabase.ts`: Supabase client configuration

## Database Schema

The application uses the following tables:

1. **profiles**: User profile information
2. **messages**: Chat messages between users
3. **chat_label_types**: Available label types for categorizing chats
4. **chat_labels**: Associations between labels and chats
5. **chats**: (Optional) Chat metadata for future group chat support

See `src/lib/db/schema.sql` for the complete schema.

## Type System

TypeScript types are organized in the `src/lib/types` folder:

- `profile.types.ts`: User profile types
- `message.types.ts`: Message types
- `chat.types.ts`: Chat and conversation types
- `label.types.ts`: Label types

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Update `.env.local` with your Supabase credentials
5. Run the development server:
   ```bash
   npm run dev
   ```

## Key Features

- Real-time messaging
- Chat labels for organization
- Message replies
- Offline message support with IndexedDB
- User profiles

## Data Flow

1. User authentication via Supabase Auth
2. Chat list loaded from messages table, grouped by conversation partner
3. Profile information fetched for each conversation partner
4. Labels fetched and applied to conversations
5. Real-time updates via Supabase subscriptions 