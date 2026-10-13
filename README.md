# LogiX

LogiX is a lightweight transport and dispatch web app starter for a small logistics company.

Features included in this MVP scaffold:
- Login and role-based access (admin / dispatcher)
- Order management
- Fleet management (drivers and vehicles)
- Planned tours / dispatch board
- Leaflet map with OpenStreetMap tiles
- SQLite database for no-cost local setup

## Tech stack
- Backend: Node.js + Express
- Database: SQLite
- Frontend: React + Vite
- Maps: Leaflet + OpenStreetMap

## Quick start

1. Install dependencies:
   ```bash
   npm install
   npm run install:all
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Start the app:
   ```bash
   npm run dev
   ```

4. Open the browser:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000/api/health

## Demo login
- Email: admin@logix.local
- Password: admin123

## Main routes
- `/api/auth/login`
- `/api/orders`
- `/api/vehicles`
- `/api/drivers`
- `/api/tours`
- `/api/tours/plan`

## Notes
This is a practical MVP scaffold, designed for up to around 50 orders/day and optimized for low setup cost. For production scale, consider PostgreSQL and a route optimization engine such as OR-Tools / OSRM later.
