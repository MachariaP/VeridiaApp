# VeridiaApp Frontend

This is the frontend application for VeridiaApp, built with Next.js 15, React 19, and TypeScript.

## Features

- 🎨 Modern, responsive landing page with gradient backgrounds
- 🔐 Complete authentication flow (registration, login, logout)
- 🎭 Beautiful UI with Tailwind CSS
- 🎯 TypeScript for type safety
- ⚡ Fast development with Next.js hot reload
- 🎨 Lucide React icons

## Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8000`

## Installation

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Building for Production

```bash
npm run build
npm start
```

## Environment Variables

The API endpoint is currently hardcoded to `http://localhost:8000/api/v1`. In a production environment, you would want to use environment variables:

Create a `.env.local` file:

```
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1
```

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx          # Main landing page component
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── public/               # Static assets
└── package.json
```

## Features Implemented

### Landing Page
- Hero section with call-to-action buttons
- Feature cards showcasing AI Grounding, Community Vetted, and Full Transparency
- Responsive navigation bar
- Footer with copyright information

### Authentication Forms
- **Registration Form**: Email, password, first name, last name with validation
- **Login Form**: Email and password authentication
- **Password Recovery**: UI for password recovery (simulated)

### Dashboard
- Welcome screen for authenticated users
- User ID display
- Sign out functionality

## API Integration

The frontend integrates with the following backend endpoints:

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/token` - User login (OAuth2 compatible)
- Password recovery endpoint (to be implemented in backend)

## Technologies Used

- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

When making changes to the frontend:

1. Follow the existing code structure
2. Use TypeScript for all new components
3. Ensure responsive design
4. Test authentication flows
5. Update this README if adding new features

## License

MIT License - See main repository for details
