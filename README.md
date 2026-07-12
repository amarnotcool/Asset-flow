# 🏡 AssetFlow

> *A cozy, conflict-free sanctuary for tracking, organizing, and nurturing your team's physical assets and shared spaces.* ☕✨

---

## 🎨 Clean, Cozy & Calm Aesthetic

AssetFlow features a premium **Soft Slate & Serene Blue** design to keep workspaces looking friendly and easy on the eyes:
* **🍂 Calming Gradients**: A comforting gradient backdrop (`from-[#f0f4f8] to-[#d9e2ec]`) grounds the page when logging in.
* **📂 Slate Sidebar**: A deep, organizing slate-colored navigation sidebar (`bg-[#0f172a]`) keeps all your tabs neatly categorized with clean, micro-animated icons.
* **🍃 Cozy Status Badges**: Status indicators feel light and colorful:
  - 🟢 **Available** cards wear a soft spring green.
  - 🔵 **Allocated** items reside in gentle sky blue.
  - 🟡 **Under Maintenance** items are wrapped in a cozy golden amber.

---

## 🧭 The Grand Tour (Features)

* **🗺️ Asset Catalog**: A beautiful inventory log to track tags (using dynamic tags like `AF-xxxx`), location registries, cost, and physical quality reports.
* **🛠️ Maintenance Kanban**: An intuitive Pipeline structure. Advancing faulty laptops or flickering projector screens through the board stages adjusts their available states in real-time.
* **📅 Overlap-Free Bookings**: Book meeting spaces or shared equipment slot-by-slot. The bookings engine checks schedules instantly to prevent double-bookings.
* **🏠 Raise Request Modal**: A polished, pop-up dialog box designed to let team members report issues or describe repairs with ease.

---

## 👥 The Roles in Our House

In the AssetFlow workspace, everyone plays a helpful part:

| | Role | Cozy Persona | Key Comforts |
| :--- | :--- | :--- | :--- |
| 🛠️ | **Admin** | *The Architect* | Configures departments, organizes categories, and helps users settle into their roles. |
| 🔑 | **Asset Manager** | *The Curator* | Registers new inventory, delegates equipment, and manages maintenance approvals. |
| 📋 | **Department Head** | *The Host* | Keeps tabs on department assets and coordinates bookings for their team. |
| 🏕️ | **Employee** | *The Resident* | Views their allocated gear, books resources, and raises hands to request repairs. |

---

## 📂 Project Architecture

```bash
Asset-flow/
├── backend/
│   ├── src/
│   │   ├── config/       # Postgres DB connections & pools
│   │   ├── controllers/  # Heart of route controls (Auth, Setup, Actions)
│   │   ├── middleware/   # JWT verification guards
│   │   ├── routes/       # Route registers (*.routes.js)
│   │   └── app.js        # Express middleware setup and routes mounting
│   ├── server.js         # Backend start entry on Port 5000
│   └── schema.sql        # Table structures & blueprints
└── frontend/
    ├── src/
    │   ├── api/          # Axios backend endpoints wrapper
    │   ├── components/   # Sidebar layouts and UI elements
    │   ├── pages/        # Dashboard, Maintenance Kanban, Catalog pages
    │   ├── store/        # Zustand global store manager
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

## 🚀 Setting Up Your Cozy Lab

Let's get AssetFlow running on your local machine:

### 🧩 Prerequisites
* Install [Node.js](https://nodejs.org/) (v18 or higher recommended)
* Install [PostgreSQL](https://www.postgresql.org/)

### 1️⃣ Creating the Database Nest
1. Open your Postgres database console and establish the database:
   ```sql
   CREATE DATABASE assetflow;
   ```
2. Feed in the schemas using `schema.sql`:
   ```bash
   psql -U postgres -d assetflow -f backend/schema.sql
   ```

### 2️⃣ Setting Up the Environment Map
Create a cozy `.env` file under the `/backend` folder:
```env
PORT=5000
DATABASE_URL=
FRONTEND_URL=http://localhost:5174
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
# Console will open Vite local server on http://localhost:5174
```

---

## 🔑 Cozy Access Key
Login details to quickly evaluate the application flow:
* **Username**: `name@company.com`
* **Password**: `password123`
* Default Role: **Employee**
