# SyncTask

A modern task management application with team collaboration features, built with React, TypeScript, and Supabase.

## What is SyncTask?

SyncTask is a Kanban-style task management board designed for teams to organize, track, and manage tasks efficiently. It provides real-time visibility into project progress with an intuitive interface for task filtering and team member availability tracking.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth)
- **Icons**: Lucide React

## How to Use

### Managing Tasks

- **Create Task**: Enter task description, select deadline and team members, click "Add Task" (only admins).
- **Move Tasks**: Click the arrow buttons on task cards to move between columns.
- **Delete Tasks**: Click the trash icon to remove a task (only admins).

### Filtering by Team Member

- Click on any team member's name in the left sidebar to filter tasks
- Click again on the same name to clear the filter
- Only tasks tagged with that person will be displayed

### Marking Leaves

- Navigate to the calendar in the left sidebar
- Click on any date to open the leave management modal
- Toggle to mark the user as on leave on a particular day
- Click "Confirm" to save
