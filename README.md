# LocalMate 📍

> **A modern, direct-to-consumer local service marketplace.**  
> Find and contact verified local electricians, plumbers, AC mechanics, and cleaners directly—no middleman commission, no paywalls, and no hidden phone numbers.

---

## Why LocalMate?

Most service aggregator apps treat local tradespeople as anonymous gig workers, charge heavy commission cuts, and hide their contact info behind gated lead forms.

**LocalMate flips this model:**
- **Direct Contact**: Customers get 1-tap phone calling and direct WhatsApp chats straight from the pro's digital visiting card.
- **Interactive Map Radar**: Real-time Leaflet map showing verified service pros within a 50 km GPS radius or by district.
- **Transparent Rates**: Upfront starting prices and full rate lists—no surprise billing.
- **Live Availability**: Pros can toggle between **"Available Now"** and **"Busy Today"** so you never call someone who can't take the job.
- **Service Modes & Hours**: Clear working hours (e.g., *9:00 AM – 8:00 PM (Mon–Sat)*) and delivery modes (*On-site Home Visit*, *In-Shop Workshop*, or *24/7 Emergency Service*).

---

## Core Features

### 📇 Digital Visiting Cards
- Dynamic business profile cards showing verified credentials (*Police Verified*, *Licensed Pro*, *Leaflet Listed*).
- 1-tap direct phone dialing (`tel:`) and pre-filled WhatsApp inquiry messages.
- Full service menu with pricing units (e.g. *per visit*, *per point*, *per unit*).
- Favorite bookmarking saved locally for quick re-access.

### 🗺️ Leaflet Live Map & Geocoding
- Pinpoint location radar with custom trade pins (Electricians, Plumbers, AC mechanics, etc.).
- Haversine distance calculation showing how many kilometers away each pro is.
- Seamless toggle between **Card Grid** and **Interactive Leaflet Map**.

### 💼 Service Provider Portal
- **Dashboard & Card Editor**: Real-time card customization with instant preview.
- **Operating Hours Picker**: Interactive time picker for opening/closing times, days of operation, or 24/7 non-stop mode.
- **Service Rate Manager**: Add, edit, or remove services and standard rates anytime.
- **Leads Tracker**: View incoming direct customer calls and WhatsApp inquiry timestamps.
- **Availability Switch**: Toggle working status on/off duty in real time.

### 🔍 Search, Filters & Pagination
- Filter by trade category, district/city, GPS distance radius, minimum customer rating, or keyword search.
- Responsive pagination with page numbers, range counter, and customizable items per page (6, 9, 12).

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Redux Toolkit, Lucide React, Leaflet & React-Leaflet |
| **Backend** | Node.js, Express, TypeScript, MongoDB & Mongoose, JSON Web Tokens (JWT), bcryptjs |
| **Architecture** | Clean monorepo (`client/` for frontend SPA, `server/` for REST API) |

---

## Project Structure

```text
r1/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/         # Visiting cards, Leaflet maps, Modals, Time pickers
│   │   ├── pages/              # ExplorePage, HomePage, ProviderDashboard, Favorites
│   │   ├── store/              # Redux slices (auth, providers, favorites)
│   │   ├── services/           # Axios API client
│   │   ├── types/              # Shared TypeScript interfaces
│   │   └── utils/              # Geo-distance & coordinate utilities
│   └── package.json
│
├── server/                     # Express + TypeScript Backend
│   ├── src/
│   │   ├── controllers/        # Auth, Provider profile, and Review controllers
│   │   ├── middleware/         # JWT authentication & route guards
│   │   ├── models/             # Mongoose schemas (User, ProviderProfile, Review)
│   │   ├── routes/             # REST route definitions (/api/auth, /api/providers, /api/reviews)
│   │   ├── scripts/            # Database seed script with verified demo providers
│   │   └── index.ts            # Server entry point
│   └── package.json
│
├── .gitignore                  # Comprehensive root gitignore protecting secrets & builds
├── package.json                # Root convenience scripts
└── README.md
```

---

## Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** running locally (`brew services start mongodb-community` on macOS) or a MongoDB Atlas connection string.

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd r1

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
cd ..
```

### 2. Configure Environment Variables

Create `.env` files from the provided templates:

**Server (`server/.env`):**
```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/localmate
JWT_SECRET=your_super_secret_jwt_key_here
```

**Client (`client/.env`):**
```env
VITE_API_BASE_URL=http://localhost:5001/api
```

### 3. Seed the Database (Optional but Recommended)

Populate MongoDB with realistic verified service pros across Bangalore, Chennai, Mumbai, Hyderabad, and Delhi:

```bash
npm run seed --prefix server
```

### 4. Run Locally

You can run both client and server from the root directory or in separate terminal tabs:

**Option A — From the project root:**
```bash
# Start backend API (runs on port 5001 with nodemon)
npm run server

# In another terminal tab, start frontend client (runs on http://localhost:5173)
npm run client
```

**Option B — Inside each folder:**
```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd client && npm run dev
```

Visit **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## API Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register customer or service provider | No |
| `POST` | `/api/auth/login` | Login user & receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `GET` | `/api/providers` | Query & paginate service providers (supports filters) | No |
| `GET` | `/api/providers/:id` | Get provider visiting card details | No |
| `GET` | `/api/providers/me` | Get logged-in provider's active profile | Yes |
| `PUT` | `/api/providers/me` | Update visiting card, rates, working type & hours | Yes |
| `PATCH`| `/api/providers/me/availability` | Toggle Available Now vs Busy Today | Yes |
| `POST` | `/api/providers/:id/call-click` | Increment direct call / contact metric | No |
| `GET` | `/api/reviews/:providerId` | Fetch verified reviews for a provider | No |
| `POST` | `/api/reviews/:providerId` | Submit a customer rating & review | Yes |
| `GET` | `/api/health` | Service and MongoDB health check status | No |

---

## Scripts Reference

```bash
# Frontend
npm run dev --prefix client        # Start Vite dev server with hot reload
npm run build --prefix client      # Build optimized production bundle
npm run preview --prefix client    # Preview production client build

# Backend
npm run dev --prefix server        # Start nodemon ts-node watcher
npm run build --prefix server      # Compile TypeScript to dist/
npm run start --prefix server      # Run compiled server in production
npm run seed --prefix server       # Populate initial demo records
```

---

## License

This project is licensed under the [MIT License](LICENSE).
