# AssetFlow

**Enterprise Asset & Resource Management System**

AssetFlow is a centralized ERP, role-based platform designed to simplify and digitize how organizations manage their physical assets and shared resources. Built to eliminate the inefficiencies of manual spreadsheets, AssetFlow provides full lifecycle visibility, conflict-free allocation matching, repair Kanban workflows, and periodic audit coordination.

---

## 📖 System Features

* **Full Asset Lifecycle Management**: Monitor inventory states: *Available, Allocated, Reserved, Under Maintenance, Lost, Retired,* and *Disposed*.
* **Status Badges & Styling**: Modern slate visual system featuring color-appropriate status pills (Green for *Available*, Blue for *Allocated*, Orange for *Under Maintenance*).
* **Interactive Maintenance Kanban**: Re-themed drag-and-drop workflow to pipeline active repairs through stage columns (*Pending, Approved, Assigned, In Progress, Resolved*).
* **Shared Resource Bookings**: Overlap-free bookings engine to schedule rooms, equipment, or vehicles with instant timing checks.
* **Conflict-Free Asset Allocations**: Restrict assignment double-tracking, enforce expected return schedules, and view current holder logs.
* **Role-Based Control Rows**: Access custom features for **Admin**, **Asset Manager**, **Department Head**, and **Employee** roles.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Dependencies |
| --- | --- | --- |
| **Frontend** | React 19 (Vite) | Tailwind CSS v4, Lucide React, Zustand, React Router v7, Axios |
| **Backend** | Node.js (ES Modules) | Express v5, PostgreSQL Client (`pg`), Bcrypt, CORS, JSON Web Tokens |
| **Database** | PostgreSQL | Relational schema with foreign keys and cascade tracking |

---

## 📂 Project Architecture

```bash
Asset-flow/
├── backend/
│   ├── src/
│   │   ├── config/       # Postgres DB connection pools
│   │   ├── controllers/  # Route handler controllers (Auth, Setup, Actions)
│   │   ├── middleware/   # JWT verification and route protections
│   │   ├── routes/       # Route registers (*.routes.js)
│   │   └── app.js        # Express middleware setup and routes mounting
│   ├── server.js         # Backend start entry on Port 5000
│   └── schema.sql        # Database initialization schema
└── frontend/
    ├── src/
    │   ├── api/          # Axios backend endpoints wrapper
    │   ├── components/   # Sidebar layouts, visual structures
    │   ├── pages/        # Dashboard, Maintenance, Catalog pages
    │   ├── store/        # Zustand global state (auth, assets counters)
    │   ├── index.css     # Slate-blue variables and utility theme config
    │   └── main.jsx      # React router mount entry
```

---

## 🗄️ Database Schema

The database model is configured via `backend/schema.sql` with the following relationships:

* **`departments`**: Organizational branches, pointing circular-wise to their manager user details.
* **`users`**: User registries holding name hash passwords, emails, roles (`Employee`, `Department Head`, `Asset Manager`, `Admin`), and current status.
* **`assets`**: Specific inventory units mapped by custom tags (e.g. `AF-XXXX`), categories, locations, condition, and actual state fields.
* **`asset_allocations`**: Holds history of historical and active leases, documenting expected return deadlines and log condition reports.
* **`maintenance_requests`**: Connects active faulty requests, assigning technicians and prioritizing through importance classes.
* **`resource_bookings`**: Conflict-blocked calendar slots for booking shared rooms or vehicles.
* **`audit_cycles` & `asset_audits`**: Scheduled asset inventory audits with verification checklists and auditor sign-offs.

---

## 🚀 Setting Up the Application

### 📋 Prerequisites
* Install [Node.js](https://nodejs.org/) (v18 or higher recommended)
* Install [PostgreSQL](https://www.postgresql.org/)

### 1️⃣ Database Setup
1. Create a database called `assetflow` in your Postgres console:
   ```sql
   CREATE DATABASE assetflow;
   ```
2. Feed the schema tables into your database:
   ```bash
   psql -U postgres -d assetflow -f backend/schema.sql
   ```

### 2️⃣ Environment Configuration
Create a `.env` in the `backend/` directory:
```env
PORT=5000
DATABASE_URL=
FRONTEND_URL=http://localhost:5173
```

### 3️⃣ Running the Application
Launch both components to start testing:

#### Backend:
```bash
cd backend
npm install
npm run dev
# Server will open on Port 5000
```

#### Frontend:
```bash
cd ../frontend
npm install
npm run dev
# Console will open Vite local server (usually on http://localhost:5173 or 5174)
```

---

## 🧪 Credentials for Local Test
Login details to quickly evaluate the application flow:
* **Username**: `name@company.com`
* **Password**: `password123`
* Default Role: **Employee** (Admin tools, manager tools, and status upgrades can be verified in standard navigation routes)
