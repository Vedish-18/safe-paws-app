# Safe-Paws

Safe-Paws is a web application designed to help rescue and support stray animals, especially injured street dogs. It connects users, volunteers, and admins on one platform for reporting injuries, managing rescue operations, and handling food and money donations.

## Project Overview

The main purpose of Safe-Paws is to provide a simple digital system where:

- users can report injured animals
- volunteers can accept and complete rescue cases
- donors can contribute food or money
- admins can monitor the complete activity of the platform

This project combines animal rescue support, volunteer coordination, and donation tracking in one role-based application.

## Main Features

### User Features

- Register and log in
- Report injured street dogs
- Upload injury images
- Add location manually or using current location
- Donate food
- Donate money
- View personal history and activity
- Update profile and settings

### Volunteer Features

- View available injury cases
- Accept pending rescue cases
- See assigned rescue operations
- Add treatment details
- Upload proof of rescue
- Mark operations as completed
- Claim food donations
- Upload proof of food delivery

### Admin Features

- View overall dashboard statistics
- Monitor users and volunteers
- Review rescue and donation activity
- View activity logs
- Analyze monthly charts and role distribution

## Technologies Used

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Radix UI
- Recharts

### Backend

- Supabase Authentication
- Supabase PostgreSQL Database
- Supabase Storage
- Supabase Realtime

### Other Libraries and Tools

- React Router DOM
- TanStack React Query
- Lucide React
- Sonner
- Vitest
- ESLint

## Programming Languages

- TypeScript
- SQL
- HTML/CSS through React components and Tailwind CSS

## User Roles

The system has three main roles:

- User
- Volunteer
- Admin

Each role has access only to its own pages and actions using protected routes and role-based access control.

## Backend and Database

The backend is built using Supabase. It provides:

- user authentication
- PostgreSQL database
- file and image storage
- realtime updates

### Main Database Tables

- `profiles`
- `user_roles`
- `injury_reports`
- `food_donations`
- `money_donations`
- `activity_logs`

## SDKs and APIs Used

### SDKs

- `@supabase/supabase-js`
- `@tanstack/react-query`

### APIs

- Supabase API for authentication, database, storage, and realtime
- Browser Geolocation API for current location
- OpenStreetMap Nominatim API for reverse geocoding
- Google Maps search links for volunteer navigation

## UI, Graphs, and Interface Design

The user interface is designed using:

- Tailwind CSS for styling
- shadcn/ui and Radix UI for reusable components
- Lucide React for icons
- Recharts for graphs and analytics

### Interface Style

- clean dashboard-based layout
- responsive design for different screen sizes
- rounded cards and buttons
- simple color-coded status indicators
- soft shadows and modern UI structure

### Graphs Used

- Bar charts
- Pie charts
- Responsive chart containers
- Tooltips and legends

These charts are mainly used in user, volunteer, and admin dashboards to show activity and contribution statistics.

## Core Logic Used in the Project

- Role-based authentication and authorization
- Protected route system for users, volunteers, and admins
- Row Level Security in Supabase
- Automatic profile and role creation after signup
- Injury reporting workflow with image upload
- Volunteer case claiming system
- Food donation claim and delivery proof workflow
- Dashboard statistics and chart generation
- Activity logging for important actions
- Location fetching using browser geolocation

## Project Workflow

### User Workflow

1. User registers and logs in
2. User can report an injured animal
3. User can donate food or money
4. User can track their activity and update profile details

### Volunteer Workflow

1. Volunteer logs in
2. Volunteer checks available rescue cases
3. Volunteer accepts a case
4. Volunteer updates treatment details
5. Volunteer uploads proof and completes the rescue
6. Volunteer can also claim and deliver food donations

### Admin Workflow

1. Admin logs in
2. Admin monitors users, volunteers, and donations
3. Admin views dashboards, charts, and activity records

## Current Limitations

- AI-based injury identification is currently placeholder logic
- Money donation is a simulated flow and not connected to a real payment gateway
- Testing coverage is minimal
- Map and location handling is basic

## Future Improvements

- Integrate real AI injury detection
- Add payment gateway integration
- Add live map support
- Add notification features
- Improve analytics and reporting
- Expand support for more rescue scenarios and animals

### Prerequisites

- Node.js
- npm
- Supabase project credentials

### Environment Variables

Create a `.env` file and add:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Run Tests

```bash
npm run test
```

## Conclusion

Safe-Paws is a full-stack animal rescue and donation management system. It helps connect the public, volunteers, and administrators through one platform and demonstrates the use of modern web technologies for a socially useful problem.
