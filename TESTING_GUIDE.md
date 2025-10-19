# VeridiaApp Refactoring - Testing and Validation Guide

## Architecture Overview

The application has been refactored with a clean, maintainable architecture:

### User Flow
```
Landing Page (/) 
  ↓ (Register)
/register (Standalone registration)
  ↓ (Auto-login after registration)
/onboarding (Profile setup - 3 steps)
  ↓ (Complete onboarding)
/dashboard-new (Main dashboard)
  ↓ (Navigate to any page)
All authenticated pages with consistent navigation
```

### Excluded Pages (No Navigation)
- `/` - Landing page with login/register
- `/register` - Registration page
- `/onboarding` - Onboarding flow

### Pages with Standard Navigation
All other pages use the AppLayout component which provides:
- Fixed header with logo, search, and profile icons
- Left sidebar with navigation menu
- Mobile-responsive hamburger menu
- Floating action button (FAB) on mobile
- Consistent dark mode support

## Testing Steps

### 1. Test User Registration Flow
1. Visit `http://localhost:3000/`
2. Click "Join Now" or "Get Started"
3. Should navigate to `/register`
4. Fill in registration form:
   - First Name, Last Name
   - Email address
   - Password (twice)
5. Click "Register"
6. Should auto-login and redirect to `/onboarding`

### 2. Test Onboarding Flow
1. After registration, should be on `/onboarding`
2. Step 1: Enter first name and last name
   - Click "Next"
3. Step 2: Enter bio, location, job title (optional)
   - Click "Next"
4. Step 3: Review welcome message
   - Click "Go to Dashboard"
5. Should redirect to `/dashboard-new`

### 3. Test Login Flow
1. Visit `http://localhost:3000/`
2. Click "Sign In"
3. Enter credentials
4. Should redirect to `/dashboard-new`

### 4. Test Navigation Components

#### Header Navigation
- Logo click → Should go to `/dashboard-new`
- Search bar click → Should go to `/search`
- Bell icon → Should go to `/notifications`
- Message icon → Should go to `/messages`
- Profile icon → Should go to `/dashboard`

#### Sidebar Navigation (Desktop)
Test all sidebar links:
- Home → `/dashboard-new`
- Profile → `/dashboard`
- Search → `/search`
- Notifications → `/notifications`
- Messages → `/messages`
- Settings → `/settings`
- Logout → Should clear auth and go to `/`

#### Mobile Navigation
1. Resize browser to mobile width
2. Click hamburger menu (☰)
3. Sidebar should slide in from left
4. Test all navigation links
5. Click outside or X to close
6. FAB (+ button) should appear bottom-right → `/create-content`

### 5. Test Individual Pages

#### Dashboard (/dashboard-new)
- Should show feed of content
- "Create Post" prompt → `/create-content`
- Trending topics sidebar (right)
- Click content item → `/content/{id}`

#### Dashboard (/dashboard)
- Shows user activity (votes, comments)
- Tabs: My Votes, My Comments
- Stats cards showing counts

#### Messages (/messages)
- Shows "Coming Soon" message
- Conversation list (placeholder)
- Return to Dashboard button → `/dashboard-new`

#### Notifications (/notifications)
- Filter tabs: All / Unread
- Mark as read functionality
- Click notification → Navigate to content

#### Reports (/reports)
- Shows "Under Construction" message
- Placeholder content

#### Search (/search)
- Search input field
- Results display (if backend available)

#### Settings (/settings)
- Tabs: Account, Privacy, Preferences
- Account: Update email/password
- Privacy: Post/profile visibility
- Preferences: Theme, language, notifications

### 6. Test Dark Mode Support
All pages should work in both light and dark modes:
- Check text contrast
- Check background colors
- Check hover states
- Check border colors

### 7. Test Responsive Design

#### Desktop (>1024px)
- 3-column layout (sidebar, content, right sidebar)
- Full navigation visible
- Search bar in header

#### Tablet (768px - 1024px)
- 2-column layout
- Collapsible sidebar
- Search icon in header

#### Mobile (<768px)
- Single column
- Hamburger menu
- FAB for quick actions
- Touch-friendly buttons

## Code Structure

```
frontend/
├── app/
│   ├── layout.tsx (Root layout with AppLayout)
│   ├── page.tsx (Landing page)
│   ├── register/page.tsx
│   ├── onboarding/page.tsx
│   ├── dashboard-new/page.tsx (Main dashboard)
│   ├── dashboard/page.tsx (User activity)
│   ├── messages/page.tsx
│   ├── notifications/page.tsx
│   ├── reports/page.tsx
│   ├── search/page.tsx
│   ├── settings/page.tsx
│   └── ... (other pages)
├── components/
│   ├── Navigation.tsx (Shared navigation component)
│   └── AppLayout.tsx (Layout wrapper)
└── lib/
    ├── auth.ts (Authentication utilities)
    ├── api-config.ts (API endpoints)
    └── utils.ts (Common utilities)
```

## API Integration Points

The app expects these microservices:

1. **User Service** (port 8000)
   - `/api/v1/auth/register`
   - `/api/v1/auth/token`
   - `/api/v1/users/me`

2. **Content Service** (port 8001)
   - `/api/v1/content/`

3. **Search Service** (port 8002)
   - `/api/v1/search/query`

4. **Voting Service** (port 8003)
   - `/api/v1/votes/`

5. **Comment Service** (port 8004)
   - `/api/v1/comments/`

6. **Notification Service** (port 8005)
   - `/api/v1/notifications/`

## Build and Deploy

```bash
# Install dependencies
cd frontend
npm install

# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Common Issues and Solutions

### Issue: Build fails
**Solution**: Run `npm install` to ensure all dependencies are installed

### Issue: Navigation not appearing
**Solution**: Check if page is in excluded paths (/, /register, /onboarding)

### Issue: Auth not persisting
**Solution**: Check localStorage for 'token' and 'userId' keys

### Issue: API calls failing
**Solution**: Ensure all microservices are running on correct ports

### Issue: Dark mode not working
**Solution**: Add `dark:` prefix to Tailwind classes

## Next Steps

1. **Backend Integration**: Connect to actual microservices
2. **Authentication**: Implement JWT refresh token logic
3. **Real-time Features**: Add WebSocket for messages and notifications
4. **Testing**: Add unit and integration tests
5. **Performance**: Implement lazy loading and code splitting
6. **SEO**: Add meta tags and Open Graph data
