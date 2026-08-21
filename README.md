# Krishi Fair

Krishi Fair is a transparent agricultural marketplace that connects farmers with verified buyers. The platform supports crop listings, competitive bidding, KYC workflows, market-price information, multilingual AI assistance, chat, uploads, and agro-monitoring integrations.

## Features

- Farmer and buyer authentication with role-based access
- Crop listing and marketplace workflows
- Live-style bidding with bid status management
- Buyer KYC and user profile management
- Direct buyer-farmer chat with notifications
- Multilingual AI advisory powered by Gemini
- Market prices through the AGMARKNET/data.gov.in integration
- Agro-monitoring integration
- Cloudinary-backed image and document uploads
- Admin settings and bidding-duration cron jobs

## Project Structure

```text
.
├── backend/     # Express API, Prisma client, authentication, and integrations
├── frontend/    # React web application
└── README.md
```

## Tech Stack

- **Frontend:** React 19, React Router, Tailwind CSS, Radix UI, Zustand, CRACO
- **Backend:** Node.js, Express, Prisma
- **Database:** MongoDB
- **Integrations:** Gemini, Cloudinary, data.gov.in/AGMARKNET, AgroMonitoring

## Prerequisites

- Node.js 18 or later
- npm
- MongoDB database
- API credentials for the integrations you want to enable

## Local Setup

### 1. Install dependencies

Run this from the repository root:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure the backend

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="mongodb+srv://<user>:<password>@<cluster>/<database>"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=""
GEMINI_MODEL=gemini-2.0-flash
GOV_API_KEY=""
GOV_RESOURCE_ID=""
GOV_API_BASE_URL=https://api.data.gov.in
AGRO_API_KEY=""
AGRO_API_BASE_URL=https://api.agromonitoring.com/agro/1.0

CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD="change-this-password"
DEFAULT_BIDDING_DURATION=24
MARKET_CACHE_ENABLED=false
```

Never commit `.env` files or real API keys. The repository ignores environment files by default.

### 3. Configure the frontend

Create `frontend/.env`:

```env
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_USE_MOCK=false
REACT_APP_CLOUDINARY_CLOUD_NAME=""
REACT_APP_CLOUDINARY_API_KEY=""
REACT_APP_CLOUDINARY_UPLOAD_PRESET=""
```

Set `REACT_APP_USE_MOCK=true` when you want to use the local mock store instead of the backend API.

### 4. Prepare the database

From `backend/`:

```bash
npx prisma generate
npx prisma db push
node prisma/seed.js
```

### 5. Start the application

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm start
```

The frontend runs at [http://localhost:3000](http://localhost:3000), and the API runs at [http://localhost:5000](http://localhost:5000).

## API Health Check

```text
GET http://localhost:5000/api/health
```

The response reports API status and the enabled application modules.

## API Areas

| Area | Base path |
| --- | --- |
| Authentication | `/api/auth` |
| Users and KYC | `/api/users` |
| Crop listings | `/api/crops` |
| Bidding and admin actions | `/api` |
| Chats | `/api/chats` |
| AI assistant | `/api/ai` |
| Market prices | `/api/market` |
| Agro monitoring | `/api/agro` |
| Uploads | `/api/upload` |

## Production Build

Build the frontend from `frontend/`:

```bash
npm run build
```

Run the backend from `backend/`:

```bash
npm start
```

For production, provide a managed MongoDB connection, strong secrets, configured CORS origins, and credentials for each external service used by the deployment.

## License

This project is currently maintained as a hackathon application. Add the intended license before distributing it publicly.
