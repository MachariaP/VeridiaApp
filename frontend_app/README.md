# Frontend App: VeridiaApp Next.js Application

This is the frontend application for VeridiaApp, a mobile-first platform for content verification and community-driven truth-seeking. Built with Next.js, React, TypeScript, and Tailwind CSS.

## Features
- ✅ Mobile-first responsive design with Tailwind CSS
- ✅ TypeScript for type safety
- ✅ Authentication pages (Login & Register)
- ✅ Reusable Layout component with navigation
- ✅ API utility functions for backend integration
- ✅ JWT token management
- ✅ Client-side error handling
- ✅ Modern UI with dark mode support

## Technologies
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Next.js Fonts** - Optimized font loading (Geist)

## Getting Started

### Prerequisites
- Node.js 20+ installed
- Backend API running on http://localhost:8000 (see `user_service/README.md`)

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables (optional):
   Create a `.env.local` file:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser.

### Available Scripts
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Application Structure

### Pages
- **/** - Homepage with welcome message and feature highlights
- **/login** - User login page with form validation
- **/register** - User registration page with password confirmation

### Components
- **Layout** - Reusable layout with header navigation and footer
  - Mobile-first design with responsive navigation
  - Login/Register buttons in header
  - Footer with copyright information

### API Integration
The `src/lib/api.ts` module provides utilities for:
- JWT token management (localStorage)
- Authenticated API requests
- Login/Register/Logout functions
- Current user profile retrieval
- Error handling with proper types

Example usage:
```typescript
import { login, getCurrentUser, apiRequest } from '@/lib/api';

// Login user
await login('username', 'password');

// Get current user
const user = await getCurrentUser();

// Make authenticated request
const data = await apiRequest('/api/v1/some-endpoint');
```

## Design Principles

### Mobile-First Approach
All components are designed mobile-first with responsive breakpoints:
- Base styles: Mobile devices
- `sm:` - Small devices (640px+)
- `md:` - Medium devices (768px+)
- `lg:` - Large devices (1024px+)

### Type Safety
- All components use TypeScript
- Proper typing for props and state
- API responses are typed
- Form validation with client-side checks

### Error Handling
- User-friendly error messages
- Network error handling
- Form validation errors
- API error responses displayed to users

## Project Structure
```
frontend_app/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with fonts
│   │   ├── page.tsx                # Homepage
│   │   ├── globals.css             # Global styles & Tailwind
│   │   ├── login/
│   │   │   └── page.tsx           # Login page
│   │   └── register/
│   │       └── page.tsx           # Register page
│   ├── components/
│   │   └── Layout.tsx             # Reusable layout component
│   ├── lib/
│   │   └── api.ts                 # API utility functions
│   └── styles/
│       └── theme.js               # Theme configuration
├── public/                         # Static assets
├── next.config.ts                 # Next.js configuration
├── tailwind.config.ts             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json
```

## Integration with Backend

The frontend connects to the backend API at `http://localhost:8000` (configurable via `NEXT_PUBLIC_API_URL`).

Endpoints used:
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user profile (authenticated)

## Best Practices Implemented
1. **Component Reusability** - Shared Layout component
2. **Type Safety** - Full TypeScript coverage
3. **Error Handling** - Comprehensive client-side validation and error display
4. **Responsive Design** - Mobile-first with Tailwind CSS
5. **Security** - JWT tokens stored in localStorage, sent in Authorization headers
6. **User Experience** - Loading states, error messages, form validation

## Learn More

To learn more about the technologies used:
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
