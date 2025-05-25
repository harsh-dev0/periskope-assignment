
# Chat Application

A real-time chat app built with Next.js, TypeScript, and Supabase.
Deployed: https://periskope-assignment-ten.vercel.app/

## Project Overview

This app supports real-time messaging with chat labels and message replies, powered by Supabase’s realtime features.

## Key Features

* Real-time messaging using [Supabase Realtime API](https://supabase.com/docs/guides/realtime)
* Chat labels for organizing conversations
* Message replies for threaded discussions

## Technologies Used

* Next.js (App Router)
* TypeScript
* Supabase (Auth, Realtime, Database)


## Getting Started

1. Clone the repo:

   ```bash
   git clone https://github.com/your-username/your-repo.git
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Setup environment variables:

   ```bash
   cp .env.example .env.local
   ```
4. Update `.env.local` with your Supabase project URL and anon key.
5. Run the development server:

   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The app uses the following tables (see `src/lib/db/schema.sql`):

* `profiles` — user profile data
* `messages` — chat messages
* `chat_label_types` — label types for chats
* `chat_labels` — label assignments to chats
* `chats` — chat metadata (future group chat support)

## TypeScript Types

Types are organized under `src/lib/types`:

* `profile.types.ts` — user profiles
* `message.types.ts` — messages
* `chat.types.ts` — chats and conversations
* `label.types.ts` — chat labels

## Real-time Data Flow

* Users authenticate with Supabase Auth
* Conversations load from `messages` table
* User profiles and chat labels are fetched and applied
* Supabase realtime subscriptions keep chat data in sync live

## Learning Notes

* This was my first project using Supabase Realtime.
* I explored and understood Supabase’s realtime channels, sync behavior, and edge cases.
* Learned about handling message sync issues, permissions, and data consistency in realtime apps.
* The experience deepened my knowledge of building robust, reactive full-stack apps with realtime data.

## Useful Links

* [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
* [Next.js Documentation](https://nextjs.org/docs)
* [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

