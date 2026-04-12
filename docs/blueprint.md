# **App Name**: Maids Connect

## Core Features:

- User Authentication & Profile Management: Secure sign-up, login, and role-based access for maids, employers, and administrators using Supabase Auth. Allows users to create and edit their profiles with specific details relevant to their role.
- Maid Search & Discovery: Browse and search for maids using filters like location, skills, and ratings. Display results in a responsive grid layout or an interactive map (React Leaflet) showing maid locations in Uganda.
- Service Booking System: Employers can view maid profiles and initiate booking requests with details like date, time, duration, and services needed. Maids receive notifications and can accept or reject bookings.
- Review & Reporting Mechanism: Users can leave ratings and reviews for services received. Includes a reporting tool for users to flag inappropriate content or behavior for administrator review.
- AI-Powered Profile Bio Assistant: An AI tool that suggests improvements or generates tailored text to enhance a maid's profile bio, helping them attract more relevant employer inquiries.
- Comprehensive Admin Dashboard: A secure, admin-only panel for managing users (blocking, verification), bookings (monitoring, intervention), reviews (deletion), and reports. Provides a basic analytics overview.

## Style Guidelines:

- Primary color: A deep, professional teal (#0D9488) to signify reliability and trust. Used for key interactive elements and headings.
- Background color: A very light, almost off-white with a subtle greenish tint (#F2F7F6) for a clean, fresh, and modern canvas.
- Accent color: A subdued forest green (#4DA377) for highlighting important information or secondary actions, providing a harmonious yet distinct contrast to the primary teal.
- Headlines and body font: 'Inter' (sans-serif) for its modern, clear, and highly readable characteristics, suitable across all content types from profile bios to admin data.
- Clean, modern, and outline-based icons for clarity and visual consistency with the Tailwind CSS and shadcn/ui aesthetic. Specific icons for profile verification badges should be used.
- A card-based layout featuring subtle shadows for visual hierarchy and depth. Responsive design is paramount, ensuring optimal viewing on both mobile and desktop devices. Profiles will be displayed in a clear grid format.
- Smooth and subtle animations using Framer Motion, especially for hover effects, state transitions, and the initial splash screen's fade-in and scale effects, enhancing user engagement without distraction.