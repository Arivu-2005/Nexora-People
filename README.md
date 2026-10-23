# PeoplePulse HR — Employee Performance & HR Management System

PeoplePulse HR is a modern, enterprise-grade Employee Performance & HR Management System built with a React.js (Vite + Tailwind CSS) frontend, Node.js + Express backend, and MongoDB database.

---

## 🌟 Key Features

1. **Enterprise Dashboard**:
   - Workforce KPIs: Total active employees, present today, on leave, and pending leave requests.
   - Interactive charts: 7-day attendance trends and department distribution using Recharts.
   - Recent approvals, urgent notifications, and strategic performance milestones.

2. **Authentication & RBAC (Role-Based Access Control)**:
   - Built with JWT, bcrypt password hashing, and role checks (`Admin`, `HR`, `Manager`, `Employee`).
   - Route protection and access-level authorization enforced at the API controller layer.

3. **Employee Directory**:
   - Complete employee profiles: Employee ID, designation, department, contact info, salary, skills, and status (`Active`, `On Leave`, `Suspended`, `Terminated`).
   - Dynamic real-time search and department/status filtering.
   - Employee creation, edit modals, and status deactivation controls.

4. **Attendance & Shift Management**:
   - Single-click **Clock In** and **Clock Out** functionality with shift duration and late-arrival detection.
   - History logs with employee filters, date filters, and manual entry adjustments for HR/Admin.

5. **Leave Management & Approval Workflow**:
   - Self-service leave requests with balance tracking (Annual, Casual, Sick).
   - Approval/rejection workflows with reason tracking and real-time quota deduction.

6. **Performance & Goal Management**:
   - Strategic OKRs/Goals with KPI target metrics and live progress bars.
   - Appraisal review system with 5-star scoring across Technical, Communication, Teamwork, and Leadership criteria.

7. **Departments & Analytics**:
   - Manage departments, budgets, campus locations, and department heads.
   - Live member count badges linked to MongoDB relations.

8. **Reports & Exports**:
   - One-click CSV exports for Employees, Attendance, Leaves, and Performance Appraisals.
   - In-app notification center.

9. **Security & Audit Logs**:
   - Centralized immutable audit logs for all CRUD operations and state changes.
   - Helmet security headers, CORS protection, rate limiting, and Zod input validation.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI.

### 2. Backend Setup
```bash
cd server
npm install
# Seed the database with demo accounts and data
node seed.js
# Start server
node src/server.js
```
*Backend runs on `http://localhost:5000`.*

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@peoplepulse.com` | `Password123!` |
| **HR Specialist** | `hr@peoplepulse.com` | `Password123!` |
| **Manager** | `manager@peoplepulse.com` | `Password123!` |
| **Employee** | `employee@peoplepulse.com` | `Password123!` |

*(The login screen also provides 1-click credential auto-fill buttons for quick testing.)*

---

## 🚢 Deployment Instructions

### Backend (Render / Railway)
1. Set the root directory to `server`.
2. Build command: `npm install`
3. Start command: `node src/server.js`
4. Set environment variables:
   - `PORT=5000`
   - `MONGODB_URI=<your_mongodb_atlas_connection_string>`
   - `JWT_SECRET=<strong_secret_key>`
   - `CLIENT_URL=<your_deployed_frontend_url>`

### Frontend (Vercel)
1. Set root directory to `client`.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Configure `/api` proxy or set `VITE_API_URL` to point to the deployed backend URL.
