# PetShop Asset Management System

A full-featured asset management system for pet shops built with Next.js, Express, PostgreSQL, and Cloudinary.

## Features

- **Pet Management**: Track pets with species, breed, health records, pricing, and availability
- **Product Inventory**: Manage products with SKU, stock levels, and low-stock alerts
- **Equipment Tracking**: Track store equipment with condition monitoring and maintenance
- **Categories**: Organize assets with hierarchical categories
- **Image Uploads**: Store images using Cloudinary
- **Authentication**: Email/password and Google OAuth sign-in
- **Dashboard**: Overview stats, alerts, and recent activity

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TailwindCSS, shadcn/ui
- **Backend**: Express.js, TypeScript, Prisma ORM
- **Database**: PostgreSQL (Neon)
- **Storage**: Cloudinary
- **Auth**: NextAuth.js
- **Deployment**: Vercel (frontend), Render (backend)

## Project Structure

```
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── components/ # React components
│   │   ├── lib/       # Utilities & API client
│   │   └── types/     # TypeScript types
│   └── package.json
│
├── backend/           # Express API
│   ├── src/
│   │   ├── routes/    # API routes
│   │   ├── middleware/ # Auth middleware
│   │   ├── services/  # Cloudinary service
│   │   └── utils/     # Database connection
│   ├── prisma/        # Prisma schema
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (Neon recommended)
- Cloudinary account
- Google OAuth credentials (optional)

### 1. Clone and Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Set Up Environment Variables

**Backend** - Copy `backend/.env.example` to `backend/.env`:

```env
DATABASE_URL="postgresql://username:password@your-neon-host.neon.tech/petshop?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
FRONTEND_URL="http://localhost:3000"
PORT=5000
```

**Frontend** - Copy `frontend/.env.example` to `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Set Up Database

```bash
cd backend

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 4. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to access the application.

## External Services Setup

### Neon Database

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project and database
3. Copy the connection string to `DATABASE_URL`

### Cloudinary

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard to find your credentials
3. Copy Cloud Name, API Key, and API Secret

### Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable OAuth 2.0
4. Create OAuth credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project to Vercel
3. Set root directory to `frontend`
4. Add environment variables
5. Deploy

### Backend (Render)

1. Push code to GitHub
2. Create new Web Service on Render
3. Set root directory to `backend`
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Add environment variables
7. Deploy

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/google` - Google OAuth

### Pets
- `GET /api/pets` - List pets (with pagination & filters)
- `GET /api/pets/:id` - Get pet details
- `POST /api/pets` - Create pet
- `PUT /api/pets/:id` - Update pet
- `DELETE /api/pets/:id` - Delete pet

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `PATCH /api/products/:id/stock` - Update stock
- `DELETE /api/products/:id` - Delete product

### Equipment
- `GET /api/equipment` - List equipment
- `GET /api/equipment/:id` - Get equipment details
- `POST /api/equipment` - Create equipment
- `PUT /api/equipment/:id` - Update equipment
- `DELETE /api/equipment/:id` - Delete equipment

### Categories
- `GET /api/categories` - List categories
- `GET /api/categories/tree` - Get category tree
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/alerts` - Get alerts (low stock, sick pets, etc.)

### Upload
- `POST /api/upload/single` - Upload single image
- `POST /api/upload/multiple` - Upload multiple images
- `DELETE /api/upload/:publicId` - Delete image

## License

MIT
