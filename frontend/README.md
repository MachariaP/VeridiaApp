# VeridiaApp Frontend

## 📜 Table of Contents
* [Project Overview](#1-project-overview)
* [Team Roles and Responsibilities](#2-team-roles-and-responsibilities)
* [Technology Stack Overview](#3-technology-stack-overview)
* [Database Design Overview](#4-database-design-overview)
* [Feature Breakdown](#5-feature-breakdown)
* [API Security Overview](#6-api-security-overview)
* [CI/CD Pipeline Overview](#7-cicd-pipeline-overview)
* [Resources](#8-resources)
* [License](#9-license)
* [Created By](#10-created-by)

---

## 1. Project Overview

**Brief Description:**

The VeridiaApp Frontend is a modern, responsive web application providing the user interface for the VeridiaApp content verification platform. Built with Next.js 15, React 19, and TypeScript, this application delivers a fast, intuitive experience for content submission, verification voting, community discussions, and content discovery. The frontend features server-side rendering for optimal performance and SEO, responsive design for mobile and desktop users, and seamless integration with all backend microservices through RESTful APIs. As the primary user touchpoint, it transforms complex verification workflows into accessible, beautiful interfaces.

**Project Goals:**

* **Modern User Experience**: Deliver fast, responsive, and intuitive interfaces using latest React 19 features and Next.js optimizations
* **Type Safety**: Leverage TypeScript for compile-time error detection, better IDE support, and reduced runtime bugs
* **Performance Optimization**: Achieve sub-second page loads through server-side rendering, automatic code splitting, and image optimization
* **Responsive Design**: Provide seamless experience across devices (mobile, tablet, desktop) using Tailwind CSS utility-first approach
* **Authentication Flow**: Implement complete auth journey (registration, login, password reset, token refresh) with secure token management
* **Component Reusability**: Build modular, reusable components reducing code duplication and improving maintainability

**Key Tech Stack:**

* **Framework**: Next.js 15 with App Router for server-side rendering and optimal performance
* **UI Library**: React 19 with latest concurrent features and improved hooks
* **Language**: TypeScript for static type checking and enhanced developer experience
* **Styling**: Tailwind CSS 4 for rapid UI development with utility-first classes
* **Icons**: Lucide React for beautiful, consistent iconography
* **Build Tool**: Turbopack for lightning-fast development builds

---

## 2. Team Roles and Responsibilities

| Role | Key Responsibility |
|------|-------------------|
| **Frontend Developer** | Implement React components, pages, and user interactions using Next.js and TypeScript best practices |
| **UI/UX Designer** | Design user interfaces, create wireframes, ensure WCAG 2.1 AA accessibility compliance, and optimize user flows |
| **Full-Stack Developer** | Integrate frontend with backend APIs, handle authentication flows, manage application state, and debug integration issues |
| **QA Engineer** | Test UI functionality, cross-browser compatibility, responsive design, and end-to-end user workflows |
| **DevOps Engineer** | Configure Next.js deployment, set up CDN, manage environment variables, and optimize build processes |
| **Performance Engineer** | Optimize bundle sizes, implement code splitting, configure caching strategies, and monitor Core Web Vitals |

---

## 3. Technology Stack Overview

| Technology | Purpose in the Project |
|-----------|----------------------|
| **Next.js 15** | React framework providing server-side rendering, static site generation, automatic code splitting, and file-based routing |
| **React 19** | Component-based UI library with concurrent rendering, improved hooks, and automatic batching for optimal performance |
| **TypeScript 5** | Statically-typed superset of JavaScript providing compile-time error detection, IntelliSense, and refactoring support |
| **Tailwind CSS 4** | Utility-first CSS framework enabling rapid UI development with consistent design system and responsive modifiers |
| **Lucide React** | Beautiful open-source icon library with tree-shaking support reducing bundle size by including only used icons |
| **Turbopack** | Next-generation JavaScript bundler (successor to Webpack) providing 10x faster development builds and hot module replacement |
| **PostCSS** | CSS processor with Tailwind plugin enabling custom utility generation and CSS optimization |
| **Node.js 20+** | JavaScript runtime for executing Next.js server-side code and development tooling |
| **npm** | Package manager for installing dependencies, running scripts, and managing project workspace |

---

## 4. Database Design Overview

**Key Entities:**

* **Frontend Application State** - The frontend doesn't maintain a database but manages client-side state including: authenticated user information (from JWT claims), content submissions (fetched from Content Service), voting status (user's votes from Voting Service), comment threads (from Comment Service), search results (from Search Service), and form data (registration, content submission forms). State management uses React's built-in useState and useContext hooks for simple state, with potential for Redux Toolkit or Zustand for complex global state needs. Authentication tokens (access and refresh) are stored in memory and httpOnly cookies for security.

**Relationships:**

* **User Session → API Data (One-to-Many)**: The authenticated user's JWT access token enables fetching their personalized data from multiple services. A single user session retrieves their submitted content (Content Service), their voting history (Voting Service), their comments (Comment Service), and search preferences. The frontend orchestrates these relationships by making parallel API calls and combining results into cohesive user profile views and dashboards.

* **Content → Votes/Comments (Display Relationships)**: When displaying a content item, the frontend fetches related data from multiple services - the content details from Content Service, vote statistics from Voting Service, and comment threads from Comment Service. These relationships are displayed together on content detail pages, creating a unified verification experience even though data comes from distributed services. The frontend handles loading states, errors, and data freshness for smooth UX.

---

## 5. Feature Breakdown

* **Landing Page**: Beautiful, responsive homepage showcasing VeridiaApp's value proposition with hero section, feature cards (AI Grounding, Community Vetted, Full Transparency), and prominent call-to-action buttons. Gradient backgrounds and modern design attract users and communicate platform benefits. Optimized for SEO with proper meta tags, semantic HTML, and fast loading times through Next.js static generation.

* **User Registration**: Complete sign-up flow with form validation, password strength indicators, and error handling. Collects email, password, first name, and last name with client-side validation before API submission. Provides helpful error messages for validation failures (invalid email format, password too short) and API errors (email already exists). Successfully registered users are redirected to login page with success message.

* **User Login**: OAuth2-compatible authentication form collecting email and password. Submits credentials to User Service /token endpoint using form-urlencoded format. On success, stores JWT access and refresh tokens securely (in-memory and httpOnly cookies), extracts user information from JWT claims, and redirects to authenticated dashboard. Failed login shows clear error messages distinguishing invalid credentials from server errors.

* **Authenticated Dashboard**: Protected page accessible only to logged-in users showing personalized content. Displays welcome message with user's name, quick stats (submissions, votes, comments), and navigation to key features. Implements route protection redirecting unauthenticated users to login page. Includes sign-out functionality clearing tokens and session state.

* **Token Management**: Automatic JWT access token refresh when expired. Intercepts API 401 responses, uses refresh token to obtain new access token from User Service /refresh endpoint, retries original failed request with new token, and handles refresh token expiration by redirecting to login. This provides seamless authentication experience without interrupting user workflows.

* **Responsive Navigation**: Mobile-friendly navigation bar collapsing into hamburger menu on small screens. Provides consistent access to key features (search, submit content, my activity) across all pages. Shows authentication status with conditional rendering - "Login/Register" for anonymous users, "Dashboard/Logout" for authenticated users. Smooth animations and transitions enhance user experience.

* **Form Components**: Reusable form components with built-in validation, loading states, and error display. Includes input fields, textareas, file upload, and buttons with consistent styling and behavior. TypeScript interfaces ensure type safety for form data structures. Validation uses HTML5 constraints and custom logic with helpful error messages guiding users to fix issues.

* **Error Handling**: Comprehensive error boundary components catching React errors and displaying user-friendly fallback UI instead of blank screens. API error handling with retry logic, timeout management, and network failure detection. Graceful degradation when services are unavailable, showing cached data or informative messages rather than breaking the application.

* **Loading States**: Skeleton screens, spinners, and progress indicators provide visual feedback during data fetching and form submission. Prevents user confusion about application state and reduces perceived loading time. Uses React Suspense for automatic loading state management in async components.

* **Accessibility**: WCAG 2.1 AA compliance with semantic HTML, ARIA labels, keyboard navigation support, sufficient color contrast, and screen reader compatibility. Form inputs have associated labels, error messages are announced to screen readers, and focus management ensures logical tab order. Makes verification platform accessible to users with disabilities.

---

## 6. API Security Overview

* **JWT Token Storage**: Access tokens stored in memory (JavaScript variable) for API requests, while refresh tokens stored in httpOnly cookies (planned) for maximum security. Memory storage prevents XSS attacks from stealing tokens since JavaScript cannot access httpOnly cookies. Tokens are never stored in localStorage or sessionStorage, which are vulnerable to XSS. Token expiration is tracked, and expired tokens trigger automatic refresh before API calls.

* **HTTPS Enforcement**: All API communication occurs over HTTPS in production, encrypting data in transit. Environment variables distinguish development (http://localhost) from production (https://api.veridiapp.com) endpoints. HTTP requests in production are automatically upgraded to HTTPS by Next.js middleware, preventing man-in-the-middle attacks that could intercept credentials or tokens.

* **CORS Compliance**: Frontend respects CORS policies set by backend services. Includes credentials (Authorization headers) only when backend explicitly allows the frontend domain. Handles CORS preflight requests transparently. CORS errors are caught and displayed with helpful messages guiding users to contact support if legitimate requests are blocked.

* **Input Sanitization**: All user inputs are validated and sanitized before submission to prevent XSS attacks. Form libraries (React Hook Form, Formik) provide built-in sanitization. Dangerous HTML is escaped before rendering user-generated content. Content Security Policy headers restrict inline scripts and allowed resource origins, providing defense-in-depth against XSS.

* **Authentication State Management**: User authentication state tracked globally using React Context or state management library. State includes user ID, email, role, and token expiration time. State is synchronized across tabs using localStorage events. Logout is triggered automatically on token expiration, preventing users from accessing protected resources with expired credentials.

* **Route Protection**: Protected routes (dashboard, content submission, profile) use Next.js middleware or higher-order components checking authentication state before rendering. Unauthenticated users are redirected to login page with return URL parameter enabling redirect back after login. Protected API routes verify JWT on server-side before rendering sensitive data.

* **Environment Variables**: API endpoints, feature flags, and configuration stored in environment variables (NEXT_PUBLIC_API_BASE_URL) preventing hardcoding. Sensitive values are never committed to version control. .env.local for development, environment-specific configs for staging/production injected at build time or runtime by deployment platform.

* **Security Headers**: Next.js configured to set security headers including Content-Security-Policy, X-Frame-Options (preventing clickjacking), X-Content-Type-Options (preventing MIME sniffing), and Referrer-Policy. These headers provide multiple security layers, making exploitation more difficult even if other defenses fail.

---

## 7. CI/CD Pipeline Overview

Continuous Integration and Continuous Deployment (CI/CD) automates the frontend development lifecycle, ensuring code quality, catching bugs early, and delivering features rapidly to users. For the Frontend, CI/CD is critical because UI bugs directly impact user experience, and broken authentication flows could lock users out of the platform, making comprehensive testing essential before production deployment.

The Frontend uses **GitHub Actions** as the CI/CD platform, with workflows triggered on pushes to feature branches and pull requests to main. The pipeline includes: code linting with ESLint checking TypeScript and React best practices, type checking with TypeScript compiler (tsc) detecting type errors, running Jest tests (if unit tests exist) for component logic validation, building the production application with Next.js to verify build succeeds, bundle size analysis ensuring JavaScript bundles stay within performance budgets, and accessibility testing with Lighthouse or axe-core.

**Continuous Integration (CI)** validates every code change before merge. When code is pushed, the pipeline provisions Node.js 20 environment, installs dependencies with npm install, runs linting to enforce code style consistency (no unused variables, proper React hooks usage), executes TypeScript compiler in check mode detecting type errors without emitting files, builds production application with next build verifying all pages compile successfully, and analyzes bundle sizes comparing against baselines to prevent performance regressions. Failed checks block pull request merging.

**Continuous Deployment (CD)** automatically deploys to staging and production after merge to main. The pipeline builds production-optimized application with next build (minification, tree-shaking, code splitting), generates static pages for static routes using next export or SSR configuration, deploys to hosting platform (Vercel, AWS Amplify, Netlify, or custom server), and runs smoke tests verifying critical pages load successfully. Environment-specific configuration (API URLs, feature flags) is injected from GitHub Secrets or platform environment variables. Staging deploys immediately for QA testing; production may require approval.

The entire pipeline from commit to production typically completes in 3-5 minutes for the Frontend. Failed deployments trigger automatic rollback to previous stable version. Monitoring tracks Core Web Vitals (Largest Contentful Paint, First Input Delay, Cumulative Layout Shift), error rates, and API response times, alerting on performance degradation or error spikes impacting users.

---

## 8. Resources

* [Next.js Documentation](https://nextjs.org/docs) - React framework for production applications
* [React Documentation](https://react.dev/) - Component-based UI library guide
* [TypeScript Documentation](https://www.typescriptlang.org/docs/) - Typed JavaScript reference
* [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Utility-first CSS framework
* [Lucide React Icons](https://lucide.dev/) - Beautiful icon library
* [Next.js Deployment Guide](https://nextjs.org/docs/deployment) - Production deployment best practices
* [Web Vitals](https://web.dev/vitals/) - Essential metrics for healthy websites

---

## 9. License

This project is licensed under the **MIT License**.

---

## 10. Created By

**Phinehas Macharia**
