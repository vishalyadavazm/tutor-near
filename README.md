# TutorNear

TutorNear is a tutoring marketplace frontend built with Next.js, React, and TypeScript. It helps students discover tutors, allows tutors to manage their profiles, and provides an administration area for staff.

## Features

- Public tutor directory with search, location, course, experience, rating, and verification filters
- Student and teacher registration with OTP verification
- Password and OTP login
- Role-based routing for students, teachers, admin users, and staff
- Student job posts and teacher opportunity browsing
- Tutor profiles with qualifications, courses, experience, ratings, likes, and comments
- Profile completion indicators
- Enquiry management
- Admin and staff account management
- Course and qualification reference lists

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Axios
- React Hook Form and Zod
- Zustand
- React Hot Toast

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm
- A running TutorNear REST API

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=https://your-api.example.com/v1/api
BACKEND_URL=https://your-api.example.com
```

- `NEXT_PUBLIC_API_URL` is used directly by the Axios client for API requests.
- `BACKEND_URL` enables Next.js media and proxy rewrites in `next.config.ts`.

The API client also uses paths such as `/auth/passwordlogin/`, `/mentor/all`, and `/post/posts`.

### Development

```bash
npm run dev
```

Open `http://localhost:3000`.

### Production

```bash
npm run build
npm run start
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Homepage, tutor highlights, and job post highlights |
| `/login` | Public | User login |
| `/register` | Public | Student or teacher registration |
| `/forgot-password` | Public | Password reset |
| `/student` | Authenticated | Search and filter tutors |
| `/student/posts` | Authenticated | Browse and create job posts |
| `/teacher/[id]` | Public | Public tutor profile |
| `/teachers` | Public | Teacher directory view |
| `/dashboard` | Authenticated teacher | Teacher dashboard and profile completion |
| `/profile` | Authenticated | Role-aware student or teacher profile editor |
| `/admin` | Public | Admin and staff sign-in |
| `/admin/dashboard` | Admin/staff | Administration dashboard |
| `/admin/enquiries` | Admin/staff | View enquiries |
| `/admin/courses` | Admin/staff | View course options |
| `/admin/qualifications` | Admin/staff | View qualification options |
| `/admin/staff` | Admin | Create and view staff accounts |
| `/admin/profile` | Admin/staff | Administration profile |

## Authentication and Authorization

Authentication state is stored in `localStorage`:

- `authToken` contains the API bearer token.
- `authSession` records an authenticated session.
- `userRole` contains `student`, `teacher`, `admin`, or `staff`.
- `accountProfile` contains non-sensitive account display details.

The `RequireAuth` component protects role-specific routes. Users without a session are redirected to the appropriate sign-in page, and users with an incorrect role receive a permission message.

On HTTP 401 responses, the Axios interceptor clears the local session and redirects to `/login` or `/admin` depending on the current area.

## Project Structure

```text
src/
  app/                 App Router pages and layouts
  components/
    admin/             Administration UI
    auth/              Authentication and route protection
    common/            Shared small components
    shared/            Shared application components
    student/           Student and job-post features
    teacher/           Teacher dashboard and profiles
    ui/                Reusable UI controls
  constants/           Centralized API endpoint constants
  lib/                 Axios, validation, filtering, and notification utilities
  services/            REST API service modules
  utils/               Authentication, account, and display helpers
```

## API Integration

- `src/constants/api.ts` defines endpoint paths.
- `src/lib/axios.ts` configures authentication, timeouts, and global error handling.
- `src/services/` contains auth, mentor, student, staff, and enquiry operations.
- Media returned by the backend is used for profile and job-post images.

The mentor directory sends paginated API filters using the API's filter syntax. The client debounces text changes and cancels superseded requests.

## Development Notes

- Dashboard and profile layouts require authentication.
- Public `/student` and `/teachers` behavior can differ based on role and account state.
- API and form validation errors are shown as field errors or toast notifications where appropriate.
- The admin dashboard contains placeholders for future job-post and teacher verification workflows.
