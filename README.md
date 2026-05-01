# SpendSync: Project Overview
**SpendSync** is a full-stack, mobile-responsive personal finance management application designed to help users track their expenses, manage budgets, and visualize their spending habits. 

The application follows a modern **MERN stack** architecture (MongoDB, Express, React, Node.js) and is structurally divided into a robust RESTful API backend and a dynamic, single-page application (SPA) frontend.

---

## 1. Technology Stack

### Frontend (Client-side)
* **Core Framework:** React 19 (bootstrapped with Vite for fast HMR and optimized builds)
* **Routing:** React Router v7 (`react-router-dom`)
* **Styling:** Tailwind CSS (utility-first CSS for rapid UI development and mobile-first responsiveness)
* **Data Visualization:** Recharts (used for rendering analytics graphs and charts)
* **Icons:** Lucide React
* **Data Handling:** Axios (for API requests), XLSX (for Excel import/export functionality)

### Backend (Server-side)
* **Runtime & Framework:** Node.js with Express.js
* **Database:** MongoDB (using Mongoose for Object Data Modeling)
* **Authentication:** JSON Web Tokens (JWT) for secure session management and `bcrypt` for password hashing
* **File Handling:** Multer (for handling multipart/form-data, like Excel file uploads) and XLSX (for parsing Excel files on the server)
* **Environment Management:** `dotenv` for managing environment variables (DB URIs, JWT secrets)

---

## 2. Core Features & Application Flow

### Authentication & User Management
* **Secure Access:** The application is gated behind an authentication layer. Users can Register and Login.
* **Protected Routes:** The frontend uses a custom `ProtectedRoute` wrapper component and `AuthContext` to ensure that only authenticated users with valid JWT tokens can access the main features (Dashboard, Expenses, Budgets, Analytics, Profile).

### Financial Dashboard (`/dashboard`)
* Acts as the landing page post-login.
* Likely provides a high-level summary of the user's financial health, displaying recent transactions, total spending, and active budget statuses.

### Expense Management (`/expenses`)
* The core data-entry section of the app.
* **CRUD Operations:** Users can add, view, update, and delete their daily transactions.
* **Excel Integration:** Thanks to the `xlsx` and `multer` integration on both the frontend and backend (`/api/excel` route), users have the ability to bulk-import expenses from Excel spreadsheets or export their current records.

### Budgeting (`/budgets`)
* Allows users to set spending limits.
* This feature interacts with the `/api/budget` backend route to store and retrieve budget thresholds, helping users compare their actual expenses against their planned limits.

### Analytics & Visualizations (`/analytics`)
* Translates raw expense data into readable charts and graphs using Recharts.
* The backend (`/api/analytics` route) handles the heavy lifting of data aggregation (e.g., grouping expenses by category, date ranges, or tags) to supply the frontend with optimized datasets for rendering.

### User Profile (`/profile`)
* Allows users to manage their account settings and preferences.

---

## 3. Project Architecture & Directory Structure

### Backend (`/backend`)
Follows a standard MVC (Model-View-Controller) inspired architectural pattern:
* **`server.js`**: The main entry point. Initializes Express, connects to the database, applies global middleware (CORS, JSON parser), and mounts the route handlers.
* **`/config`**: Contains configuration files (e.g., `db.js` for MongoDB connection).
* **`/models`**: Defines the database schemas using Mongoose (`User.js`, `Expense.js`, `Budget.js`).
* **`/routes`**: Defines the API endpoints (`authRoutes`, `expenseRoutes`, `budgetRoutes`, `analyticsRoutes`, `excelRoutes`).
* **`/controllers`**: Contains the business logic for the routes (e.g., creating a user, querying the database for expenses).
* **`/middleware`**: Houses custom middleware, such as JWT verification to protect private routes.

### Frontend (`/frontend`)
Organized by feature and responsibility:
* **`App.jsx`**: The root component that sets up the React Router, wraps the app in the `AuthProvider`, and defines the route hierarchy.
* **`/src/pages`**: Contains the top-level view components corresponding to the routes (`Login.jsx`, `Register.jsx`, `Dashboard.jsx`, `Expenses.jsx`, `Budgets.jsx`, `Analytics.jsx`, `Profile.jsx`).
* **`/src/components`**: Reusable UI pieces (`Layout.jsx`, `Navigation.jsx`, and likely various form and chart components).
* **`/src/context`**: Houses the global state management, specifically `AuthContext` for handling user login state globally.
* **`/src/utils`**: Helper functions and generic utilities.

### Summary
SpendSync is a feature-rich, well-structured financial tracker. It is built to be scalable, using dedicated routes for specific business domains (auth, expenses, budgets, analytics) and offering advanced features like Excel data portability and visual data analysis.
