# Database Setup Guide

## For Real Supabase Database

If you want to use a real Supabase database instead of the mock data:

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Note down your project URL and anon key

### 2. Set Environment Variables

Create a `.env.local` file in the root directory with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Create Database Schema

Run the SQL commands from `database/schema.sql` in your Supabase SQL editor to create the required tables and policies.

### 4. Required Database Fields

The Property table must include these fields for sorting to work:

- `description` (TEXT) - Property name
- `rooms` (INTEGER) - Number of rooms
- `price` (INTEGER) - Property price in cents or whole dollars
- `sq_feet` (INTEGER) - Square footage
- `washroom` (INTEGER) - Number of washrooms
- `garage` (INTEGER) - Number of garage spaces
- `gym` (INTEGER) - Has gym (0/1)
- `office` (INTEGER) - Has office (0/1)
- `recreational_room` (INTEGER) - Has recreational room (0/1)
- `basement_type` (TEXT) - Type of basement
- `property_kind` (TEXT) - Type of property
- `lot_size` (INTEGER) - Lot size in sq ft
- `image_urls` (TEXT[]) - Array of image URLs
- `buyer_id` (UUID) - Reference to buyer
- `status` (INTEGER) - Property status

### 5. Test Credentials

When using mock database, you can login with:

- Admin: admin@test.com / admin123
- User: user@test.com / user123

## Current Features Supported

### Sorting

The view-listings page supports sorting by:

- Name (description)
- Rooms
- Price
- Square Feet

### Authentication

- User registration and login
- Admin vs User roles
- Profile management (change username, password, delete account)

### Property Management

- Property search and filtering
- Property sorting by name, rooms, price, square feet
- Property bookmarking/saving
- Property viewing requests with email notifications

### Admin Features

- Property CRUD operations
- Image upload
- User management
- Dashboard analytics

## Mock vs Real Database

The application automatically detects whether real Supabase credentials are available:

- ✅ Real credentials found: Uses Supabase
- 🔧 No credentials: Uses mock database with sample data

Both implementations support the same features and API.
