# Periskope Chat Application

A modern, real-time chat application built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

### Core Features

- ✅ **Authentication**: Login/Signup with email and password
- ✅ **Real-time Messaging**: Send and receive messages instantly
- ✅ **Chat Management**: View all chats with unread counts and timestamps
- ✅ **Responsive Design**: Pixel-perfect UI matching the provided design
- ✅ **Search & Filter**: Search chats and filter by status (unread, assigned, important)

### Optional Features Implemented

- ✅ **Chat Labels**: Add and display labels on chats
- ✅ **Member Assignment**: Assign team members to specific chats
- ✅ **Advanced Filters**: Filter chats by multiple criteria

### Bonus Features

- ✅ **Semantic HTML**: Proper use of semantic tags instead of just divs
- ✅ **Modern UI/UX**: Clean, professional interface with smooth animations
- ✅ **TypeScript**: Full type safety throughout the application
- ✅ **Real-time Updates**: Live message updates using Supabase subscriptions

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Icons**: React Icons
- **Deployment**: Vercel/Netlify ready

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Chats Table

```sql
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('individual', 'group')) DEFAULT 'individual',
  participants TEXT[] NOT NULL,
  labels TEXT[],
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Messages Table

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('text', 'image', 'video', 'file')) DEFAULT 'text',
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd periskope-chat-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Supabase**

   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Create the database tables using the SQL schema above

4. **Environment variables**

   ```bash
   cp .env.local.example .env.local
   ```

   Update with your Supabase credentials:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## Key Implementation Highlights

### Real-time Messaging

- Uses Supabase real-time subscriptions for instant message delivery
- Optimistic UI updates for smooth user experience
- Automatic scrolling to latest messages

### State Management

- React hooks for local state management
- Custom hooks for auth and chat operations
- Efficient re-rendering with proper dependency arrays

### UI/UX Design

- Pixel-perfect implementation matching provided mockup
- Smooth animations and transitions
- Responsive design for all screen sizes
- Proper loading and error states

### Performance Optimizations

- Component memoization where appropriate
- Efficient database queries with proper indexing
- Image optimization and lazy loading
- Code splitting and bundle optimization

## Deployment

The application is configured for easy deployment on Vercel or Netlify:

1. **Vercel Deployment**

   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify Deployment**
   ```bash
   npm run build
   # Upload dist folder to Netlify
   ```

## AI Development Process

This project was built with assistance from Claude AI, demonstrating effective AI-human collaboration in software development. The AI helped with:

- Architecture planning and component structure
- TypeScript type definitions and interfaces
- Supabase integration and real-time features
- Tailwind CSS styling and responsive design
- Code organization and best practices

## Future Enhancements

- File upload and sharing capabilities
- Voice and video calling integration
- Advanced chat features (reactions, threads, mentions)
- Mobile app using React Native
- Advanced analytics and reporting
- Integration with external CRM systems
