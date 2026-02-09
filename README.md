# SyncTask

A modern task management application with team collaboration features, built with React, TypeScript, and Supabase.

## What is SyncTask?

SyncTask is a Kanban-styled task management board designed for teams to organize, track, and manage tasks efficiently. It provides real-time visibility into project progress with an intuitive interface for task filtering and team member availability tracking.

## Key Features

1. **Kanban Board**: Organize tasks across three columns - Todo, Working, and Done
2. **Team Filtering**: Click on team members to filter tasks by person
3. **Leave Calendar**: Mark and track team member leaves on an interactive calendar
4. **Dark Theme**: Eye-friendly dark mode throughout the application
5. **User Profile**: Quick access to user details with logout functionality
6. **Responsive Design**: Works seamlessly on different screen sizes
7. **Authentication**: Secure login with Email/Password or Google OAuth
8. **Role-Based Access**: Admin and Member roles with different permissions
9. **Real-time Updates**: Tasks sync in real-time across multiple users

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- A Supabase account (free tier available)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd SyncTask
pnpm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration script:
    - Copy contents of `supabase/migrations/001_initial_schema.sql`
    - Paste and run in the SQL Editor
3. Configure Google OAuth (optional):
    - Go to **Authentication > Providers > Google**
    - Add your Google OAuth credentials
4. Get your API keys:
    - Go to **Settings > API**
    - Copy `Project URL` and `anon` public key

### 3. Configure Environment

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the App

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173)

### 5. Create Users

The app comes with default test accounts. You can create them using one of these methods:

#### Option A: Run the Seed Script (Recommended)

```bash
# Set your service role key (find it in Supabase Dashboard > Settings > API)
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
pnpm seed:users
```

#### Option B: Create Users Manually

1. Go to Supabase **Authentication > Users**
2. Click "Add user" and create users with the credentials below
3. For admin user, go to **Table Editor > profiles** and set `role` to `admin`

### Default User Accounts

| Role   | Email                 | Password     |
| ------ | --------------------- | ------------ |
| Admin  | admin@synctask.com    | Admin@123    |
| Member | nuwanga@synctask.com  | Nuwanga@123  |
| Member | charuka@synctask.com  | Charuka@123  |
| Member | pramodi@synctask.com  | Pramodi@123  |
| Member | dileka@synctask.com   | Dileka@123   |
| Member | lasith@synctask.com   | Lasith@123   |
| Member | ashen@synctask.com    | Ashen@123    |
| Member | warsha@synctask.com   | Warsha@123   |
| Member | dedunu@synctask.com   | Dedunu@123   |
| Member | shalitha@synctask.com | Shalitha@123 |

> ⚠️ **Warning**: Change these passwords in production!

## How to Use

### Managing Tasks

- **Create Task**: Enter task description, select deadline and team members, click "Add Task"
- **Move Tasks**: Click the arrow buttons on task cards to move between columns
- **Delete Tasks**: Click the trash icon to remove a task

### Filtering by Team Member

- Click on any team member's name in the left sidebar to filter tasks
- Click again on the same name to clear the filter
- Only tasks tagged with that person will be displayed

### Marking Leaves

- Navigate to the calendar in the left sidebar
- Click on any date to open the leave management modal
- Check/uncheck team members who are on leave for that date
- Click "Save" to confirm

### Admin Features

Admins can access additional features from the user profile modal:

- **Team Management**: Add, edit, or remove team members
- **User Management**: Promote users to admin or demote to member

## Project Structure

```
src/
├── components/
│   ├── admin/           # Admin-only pages
│   ├── auth/            # Authentication pages
│   ├── ui/              # shadcn/ui components
│   ├── date-picker.tsx  # Calendar components
│   ├── kanban-board.tsx # Main task board
│   ├── sidebar-left.tsx # Navigation sidebar
│   └── ...
├── contexts/
│   └── AuthContext.tsx  # Authentication state
├── lib/
│   ├── database.ts      # Supabase queries
│   ├── supabase.ts      # Supabase client
│   └── utils.ts         # Utility functions
├── types/
│   └── database.types.ts # TypeScript types
└── App.tsx              # Main app with routing
```

## Database Schema

- **profiles**: User profiles linked to Supabase Auth
- **team_members**: Team member information
- **tasks**: Task data with status and deadline
- **task_assignees**: Many-to-many task/member relationships
- **leaves**: Leave dates for team members

## License

MIT License
