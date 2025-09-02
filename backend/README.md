# Blockchain Charity Platform - Django Backend

This is the Django REST API backend for the blockchain charity donation platform.

## Features

- User profile management with MetaMask wallet integration
- Charity creation and management with KYC verification
- Document upload and IPFS storage (via Pinata)
- Donation tracking and blockchain transaction recording
- Admin panel for charity approval/rejection
- RESTful API endpoints for frontend integration

## Setup Instructions

### 1. Prerequisites

Make sure you have Python 3.8+ installed on your system.

### 2. Create Virtual Environment

```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env file with your settings (optional for development)
```

### 5. Database Setup

```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser for admin access
python manage.py createsuperuser
```

### 6. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/`

### 7. Admin Panel

Access the Django admin panel at `http://localhost:8000/admin/` using the superuser credentials you created.

## API Endpoints

### Users
- `POST /api/users/profile/` - Create user profile
- `GET /api/users/profile/{wallet_address}/` - Get user profile
- `PUT /api/users/profile/{wallet_address}/update/` - Update user profile

### Charities
- `GET /api/charities/` - List all charities
- `POST /api/charities/create/` - Create new charity (with file upload)
- `GET /api/charities/{id}/` - Get specific charity
- `PUT /api/charities/{id}/status/` - Update charity status (admin)

### Donations
- `POST /api/donations/` - Record new donation
- `GET /api/donations/list/` - List donations (with filters)
- `GET /api/donations/{id}/` - Get specific donation

## File Storage

- **Development**: Files are stored locally in the `media/` directory
- **Production**: Configure Pinata API keys in `.env` for IPFS storage

## Database

The project uses SQLite by default for development. The database file (`db.sqlite3`) will be created automatically when you run migrations.

## CORS Configuration

The backend is configured to accept requests from `http://localhost:3000` (Next.js frontend). Update `CORS_ALLOWED_ORIGINS` in `settings.py` if needed.

## Testing the API

You can test the API endpoints using tools like:
- Postman
- curl
- Django REST Framework browsable API (when DEBUG=True)

Example API call:
```bash
curl -X GET http://localhost:8000/api/charities/
```