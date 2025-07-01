# TutorFlow Frontend

This is the Next.js frontend for the TutorFlow tutoring platform.

## Features

- **Authentication System**: Login and registration with JWT tokens
- **Role-based Access**: Student, Tutor, and Admin roles
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Form Validation**: Using React Hook Form and Zod
- **Protected Routes**: Automatic redirection for unauthenticated users
- **Responsive Design**: Mobile-first approach

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:8000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   └── layout.tsx        # Root layout
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── layout/          # Layout components
│   └── ui/              # shadcn/ui components
├── contexts/            # React contexts
├── lib/                 # Utility functions
└── types/               # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Authentication Flow

1. **Registration**: Users can register as students or tutors
2. **Login**: JWT tokens are stored in localStorage
3. **Protected Routes**: Automatic redirection for unauthenticated users
4. **Token Refresh**: Automatic token refresh on API calls
5. **Logout**: Clears tokens and redirects to home

## API Integration

The frontend communicates with the FastAPI backend through:
- RESTful API endpoints
- JWT authentication
- Automatic token management
- Error handling with toast notifications

## Development

### Adding New Components

1. Create component in appropriate directory
2. Use TypeScript for type safety
3. Follow shadcn/ui patterns for consistency
4. Add proper error handling

### Styling

- Use Tailwind CSS classes
- Follow the design system in `components/ui/`
- Maintain responsive design principles

### State Management

- Use React Context for global state (auth, user data)
- Use local state for component-specific data
- Avoid prop drilling with context providers

## Deployment

The frontend can be deployed to:
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Any static hosting service

Make sure to set the `NEXT_PUBLIC_API_URL` environment variable in your deployment platform.
