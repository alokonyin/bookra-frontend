# Bookra.com Backend API

FastAPI backend for Bookra.com - Online Travel Agency for East Africa

## Features

- User authentication (JWT)
- Role-based access control (Traveler, Operator, Office, Admin)
- Trip management
- Booking system
- Payment processing
- Office management

## Getting Started

### Prerequisites
- Python 3.11+
- PostgreSQL database

### Installation

```bash
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
```

### Running Locally

```bash
uvicorn app.main:app --reload
```

The API will be available at [http://localhost:8000](http://localhost:8000)

API documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

## Deployment on Replit

1. Push code to GitHub
2. Import project to Replit
3. Add environment variables in Replit Secrets:
   - `DATABASE_URL` - Supabase PostgreSQL connection string
   - `SECRET_KEY` - Random secret key for JWT
   - `CORS_ORIGINS` - Comma-separated list of allowed origins

## Tech Stack

- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic (migrations)
- Python-Jose (JWT)
- Passlib (password hashing)

## API Endpoints

- `/v1/auth/*` - Authentication
- `/v1/traveler/*` - Traveler operations
- `/v1/operator/*` - Operator operations
- `/v1/office/*` - Office operations
- `/v1/admin/*` - Admin operations
- `/health` - Health check
