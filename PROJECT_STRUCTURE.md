# Project Structure

## Overview
React + Vite admin dashboard application with routing, theme support, and modular page components.

---

## 📁 Directory Structure

```
ui/
├── public/                          # Static assets served at root
│   └── vite.svg
│
├── src/                             # Source code directory
│   ├── assets/                      # Static assets (images, icons)
│   │   └── react.svg
│   │
│   ├── components/                  # Reusable React components
│   │   └── layout/                  # Layout components
│   │       ├── DashboardLayOut.jsx  # Main dashboard layout wrapper
│   │       ├── DashboardLayout.css  # Dashboard layout styles
│   │       ├── Navbar.jsx           # Top navigation bar
│   │       ├── Navbar.css           # Navbar styles
│   │       └── Sidebar.jsx          # Side navigation menu with theme toggle
│   │
│   ├── pages/                       # Page components (route views)
│   │   ├── Home/
│   │   │   └── Home.jsx            # Home/Dashboard page
│   │   ├── Courses/
│   │   │   ├── Courses.jsx         # Courses management page
│   │   │   ├── Courses.css         # Courses page styles
│   │   │   └── index.css           # Additional styles
│   │   ├── Exams/
│   │   │   └── Exams.jsx           # Exams page
│   │   ├── Users/
│   │   │   └── Users.jsx           # Users management page
│   │   ├── Webinar/
│   │   │   └── Webinar.jsx         # Webinar page
│   │   ├── Certificates/
│   │   │   └── Certificates.jsx    # Certificates page
│   │   ├── Marketing/
│   │   │   └── Marketing.jsx       # Marketing page
│   │   ├── AffiliateMarketing/
│   │   │   └── AffiliateMarketing.jsx  # Affiliate marketing page
│   │   ├── MyApp/
│   │   │   └── MyApp.jsx           # My App page
│   │   ├── Websites/
│   │   │   └── Websites.jsx        # Websites page
│   │   └── Settings/
│   │       └── Settings.jsx        # Settings page
│   │
│   ├── routes/                      # Routing configuration
│   │   └── AppRoutes.jsx           # Main route definitions
│   │
│   ├── App.jsx                      # Root App component
│   ├── App.css                      # App-level styles
│   ├── main.jsx                     # Application entry point
│   └── index.css                    # Global styles & theme variables
│
├── node_modules/                    # Dependencies (auto-generated)
│
├── index.html                       # HTML template
├── package.json                     # Project dependencies & scripts
├── package-lock.json                # Locked dependency versions
├── vite.config.js                   # Vite configuration
├── eslint.config.js                 # ESLint configuration
└── README.md                        # Project documentation

```

---

## 🎯 Key Files Explained

### Configuration Files

- **`package.json`** - Project metadata, dependencies, and npm scripts
- **`vite.config.js`** - Vite build tool configuration
- **`eslint.config.js`** - Code linting rules
- **`index.html`** - HTML entry point

### Source Files

#### Entry Points
- **`src/main.jsx`** - Application entry point, renders App component with BrowserRouter
- **`src/App.jsx`** - Root React component that renders AppRoutes

#### Routing
- **`src/routes/AppRoutes.jsx`** - Defines all application routes using React Router

#### Layout Components
- **`src/components/layout/DashboardLayOut.jsx`** - Main layout wrapper with Sidebar, Navbar, and Outlet
- **`src/components/layout/Sidebar.jsx`** - Collapsible sidebar navigation with theme toggle
- **`src/components/layout/Navbar.jsx`** - Top navigation bar

#### Pages
Each page component in `src/pages/` represents a route view:
- Home, Courses, Exams, Users, Webinar, Certificates, Marketing, AffiliateMarketing, MyApp, Websites, Settings

---

## 🎨 Styling Architecture

### Global Styles
- **`src/index.css`** - Global styles, CSS variables for themes (dark/light), sidebar styles

### Component Styles
- **`src/App.css`** - App-level styles
- **`src/components/layout/DashboardLayout.css`** - Dashboard layout styles
- **`src/components/layout/Navbar.css`** - Navbar styles
- **`src/pages/Courses/Courses.css`** - Courses page specific styles

### Theme System
The app supports dark/light themes using CSS variables defined in `index.css`:
- `--primary`, `--accent`, `--bg`, `--surface`, `--text-color`, etc.
- Theme is toggled via Sidebar component and stored in localStorage

---

## 📦 Dependencies

### Core
- **React** (^19.2.0) - UI library
- **React DOM** (^19.2.0) - React rendering
- **React Router DOM** (^7.11.0) - Client-side routing

### UI Libraries
- **Bootstrap** (^5.3.8) - CSS framework
- **Bootstrap Icons** (^1.13.1) - Icon library

### Development Tools
- **Vite** (^7.2.4) - Build tool and dev server
- **ESLint** (^9.39.1) - Code linting
- **@vitejs/plugin-react** - Vite React plugin

---

## 🚀 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## 🔄 Data Flow

```
index.html
    ↓
main.jsx (BrowserRouter wrapper)
    ↓
App.jsx
    ↓
AppRoutes.jsx
    ↓
DashboardLayout (Sidebar + Navbar + Outlet)
    ↓
Page Components (Home, Courses, etc.)
```

---

## 📝 Notes

- All pages follow a consistent structure with their own folder
- Layout components are separated from page components
- CSS is co-located with components for better organization
- Theme state is managed in Sidebar component and persisted in localStorage
- Routes are centrally defined in `AppRoutes.jsx`

