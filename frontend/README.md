<div align="center">

# MealOra Frontend Client

[![React](https://img.shields.io/badge/React-v19-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-State-black?style=flat-square&logo=react)](https://zustand-demo.pmnd.rs/)

A lightning-fast Single Page Application (SPA) utilizing modern React paradigms, utility-first CSS, and boilerplate-free state management to deliver a premium user experience.

</div>

---

## Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Quick Start](#-installation--quick-start)
- [Pages & Routes](#-pages--routes)
- [Core Components](#-core-components)
- [Core Architecture](#-core-architecture)
- [Environment Variables](#-environment-variables)
- [Design System](#-design-system)

---

## Tech Stack

| Package | Version | Technical Purpose & Strategic Use |
|---|---|---|
| `react` | `^19.0.0` | Core UI library optimized for concurrent rendering. |
| `react-router-dom` | `^6.22.3` | Declarative routing allowing for nested layouts and strict route guarding based on auth state. |
| `zustand` | `^4.5.2` | Minimalist global state management. Used primarily for syncing the user's Auth and Wallet context securely without deep prop-drilling. |
| `tailwindcss` | `^4.0.0` | Utility-first CSS framework enabling ultra-fast UI prototyping and absolute layout consistency. |
| `vite` | `^6.0.0` | Next-generation build tool chosen for its instantaneous Hot Module Replacement (HMR). |
| `axios` | `^1.6.8` | HTTP client configured globally with `withCredentials: true` to seamlessly pass secure HTTP-Only cookies to the backend. |
| `date-fns` | `^3.6.0` | Provides bulletproof calendar date math to enforce the strict 11:00 AM IST cutoff rule for skipping meals. |
| `framer-motion` | `^11.0.8` | Adds physics-based micro-interactions and smooth page transitions to create a premium application feel. |
| `recharts` | `^2.12.3` | Composable charting library used to generate the data-rich analytics graphs in the Admin Dashboard. |
| `lucide-react` | `^0.359.0` | Clean, modern vector icons matching the luxury design aesthetic. |

---

## Project Structure

A highly modularized React SPA folder tree.

```
frontend/
├── public/                    # Static assets
│   └── favicon.ico            
│
├── src/                       # Application Source Code
│   ├── api/                   
│   │   └── axios.js           # Centralized Axios instance with credential interceptors
│   │
│   ├── components/            # Reusable UI Blocks
│   │   ├── AdminRoute.jsx     # Route guard preventing standard users
│   │   ├── Navbar.jsx         # Responsive top navigation bar
│   │   ├── ProtectedRoute.jsx # Route guard enforcing authentication
│   │   └── SkipMealCalendar.jsx # The interactive 11 AM cutoff calendar
│   │
│   ├── hooks/                 
│   │   └── useAuth.js         # Custom hooks wrapping Zustand logic
│   │
│   ├── pages/                 
│   │   ├── admin/             # Admin interface pages (Dashboard, Users, Menu)
│   │   ├── user/              # User interface pages (Dashboard, Skip Meal, Profile)
│   │   ├── LandingPage.jsx    # Unauthenticated marketing entry
│   │   ├── Login.jsx          # Auth entry
│   │   └── Register.jsx       # Auth registration
│   │
│   ├── store/                 
│   │   └── authStore.js       # Zustand global state (Auth status, Wallet balance)
│   │
│   ├── styles/                
│   │   └── index.css          # Tailwind base layer imports
│   │
│   ├── App.jsx                # Root Router configuration
│   └── main.jsx               # React DOM rendering entry point
│
├── .env                       # Environment Variables (Ignored by Git)
├── package.json               # Package dependencies
├── tailwind.config.js         # Tailwind theme customizations
└── vite.config.js             # Vite bundler configurations
```

---

## Installation & Quick Start

To run the frontend application locally, follow these precise steps:

1. **Navigate to the Frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install all required packages:**
   ```bash
   npm install react react-router-dom zustand tailwindcss @tailwindcss/vite vite axios date-fns framer-motion recharts lucide-react
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root of the `frontend` folder and populate it (see section below).

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   *The server will start on `http://localhost:5173`. Make sure the backend server is also running to populate data.*

---

## Pages & Routes

### Public / Customer Routes

| Route | Page | Description |
|---|---|---|
| `/` | `LandingPage` | Marketing homepage with Hero and Call to Actions. |
| `/login` | `Login` | User authentication via HTTP-Only cookies. |
| `/register` | `Register` | User account creation. |
| `/dashboard` | `UserDashboard` | Core hub displaying wallet balance, meals left, and today's delivery state. |
| `/skip-meal` | `SkipMeal` | Interactive calendar to pause delivery and refund credits. |
| `/profile` | `Profile` | Form to update details and upload an avatar. |
| `/wallet` | `Wallet` | Interface to add funds and view deduction history. |

### Admin Routes (Guarded)

| Route | Page | Description |
|---|---|---|
| `/admin` | `AdminDashboard` | Aggregated analytics with Recharts graphs. |
| `/admin/users` | `AdminUsers` | Directory of all users, their wallets, and active states. |
| `/admin/menu` | `AdminMenu` | UI to upload daily menus to Cloudinary. |

> **Route Guards:** `<ProtectedRoute>` securely redirects non-authenticated users to `/login`. `<AdminRoute>` completely blocks standard users from loading the admin components.

---

## Core Components

### `SkipMealCalendar`
The crown jewel of the user experience. Uses `date-fns` to generate an interactive month view. 
- Past dates are disabled.
- The 11:00 AM IST cutoff rule visually locks the *current* day if the cutoff time has passed.
- Highlights delivered meals with a green checkmark and skipped meals with a red 'X'.

### `Navbar`
A dual-state responsive header. For guests, it shows login options. For authenticated users, it displays wallet balance, an avatar dropdown, and navigation links.

### `OnboardingWizard`
A Gamified 3-step setup for new users:
1. Complete Profile (Phone, Avatar)
2. Add Delivery Address
3. Recharge Wallet to unlock the subscription.

---

## Core Architecture

### 1. Role-Based Access Control (RBAC)
The routing layer heavily utilizes `<ProtectedRoute>` and `<AdminRoute>` wrapper components. Standard users are physically prevented from accessing admin routes, ensuring that sensitive data and UI elements are completely gated off from unauthorized access.

### 2. Hydration & Global State (`useAuthStore`)
Instead of directly hydrating the UI from volatile `localStorage` (which causes UI flickering and security flaws), the app relies on the `authStore.js` (Zustand) to securely hydrate the session via the backend's `/auth/check` endpoint utilizing HTTP-Only cookies. A global `isCheckingAuth` spinner handles the brief loading state gracefully.

### 3. Axios Interceptor
All API requests flow through a centralized Axios instance configured with `withCredentials: true`. This guarantees the browser silently attaches the secure JWT session cookie to every outbound request.

---

## Environment Variables

Create a `.env` file in this `/frontend` directory before starting the application:

```env
# The URL where your backend API is running
VITE_API_URL=http://localhost:4000
```

---

## Design System

MealOra uses a curated, appetizing design language aimed at feeling premium and welcoming.

### Typography
- **Headings & Body:** Modern sans-serif stacks (Inter, system-ui) optimized for high legibility.

### Theming & Animations
- **Colors:** Deep branding hues (warm oranges and earth browns) mixed with stark whites and subtle grays to make food imagery pop.
- **Micro-interactions:** Extensive use of `hover:`, `transition-all`, and **Framer Motion** ensures every button click, page load, and modal pop-in feels alive and responsive.
- **Forms:** Controlled components with clear, real-time error states, utilizing Tailwind's `focus:ring` utilities to guide the user seamlessly through onboarding.
