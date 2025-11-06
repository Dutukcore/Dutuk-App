# Dutuk Backend - Supabase Configuration

This directory contains all the backend configuration for the Dutuk Vendor App.

## Overview

Dutuk is a vendor/company management platform for event services. Vendors can:
- Manage company profiles
- Receive and respond to customer event requests
- Track calendar availability
- Manage events (current, upcoming, past)
- Track earnings, payments, and reviews
- Process orders

## Database Architecture

### Tables

1. **companies** - Vendor company information
2. **requests** - Customer requests for events
3. **dates** - Vendor calendar dates (available/booked)
4. **events** - Accepted and ongoing events
5. **orders** - Customer orders requiring approval
6. **reviews** - Customer reviews for vendors
7. **payments** - Payment transactions
8. **earnings** - Vendor earnings records
9. **user_profiles** - Extended user profile information

### Features

- **Authentication**: Using Supabase Auth with email/password and OTP
- **Row Level Security (RLS)**: All tables protected with proper policies
- **Real-time**: Enabled for key tables (requests, orders, events)
- **Storage**: Configured for company logos and event images

## Setup Instructions

### 1. Access Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project: `unqpmwlzyaqrryzyrslf`

### 2. Run Database Migrations

Execute the SQL files in order:

1. `01_create_tables.sql` - Creates all database tables
2. `02_create_rls_policies.sql` - Sets up Row Level Security
3. `03_create_functions.sql` - Creates helper functions and triggers
4. `04_seed_data.sql` - (Optional) Adds sample data for testing

**How to run:**
- Go to SQL Editor in Supabase Dashboard
- Copy content from each file
- Execute in order

### 3. Enable Realtime (if needed)

For tables that need real-time updates:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE requests;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
```

### 4. Configure Storage (if needed)

For image uploads:
1. Go to Storage in Supabase Dashboard
2. Create buckets:
   - `company-logos` (public)
   - `event-images` (public)

## Environment Variables

Already configured in `/app/utils/supabase.ts`:
- `supabaseUrl`: https://unqpmwlzyaqrryzyrslf.supabase.co
- `supabaseAnonKey`: (already set)

## API Endpoints

All data access is through Supabase client. No custom API endpoints needed for MVP.

### Key Operations:

- **Auth**: `supabase.auth.*`
- **Companies**: `supabase.from('companies').*`
- **Requests**: `supabase.from('requests').*`
- **Events**: `supabase.from('events').*`
- **Orders**: `supabase.from('orders').*`
- **Reviews**: `supabase.from('reviews').*`
- **Payments**: `supabase.from('payments').*`

## Testing

After setup:
1. Test auth flow (register/login)
2. Create a company profile
3. Add calendar dates
4. Create test requests
5. Test accept/decline workflow

## Troubleshooting

### Common Issues:

1. **RLS Policy Errors**: Make sure you're authenticated when testing
2. **Foreign Key Violations**: Ensure user_id exists in auth.users
3. **Permission Denied**: Check RLS policies are created correctly

## Next Steps

- [ ] Run all migrations
- [ ] Test authentication flow
- [ ] Test company profile CRUD
- [ ] Test request workflow
- [ ] Test orders functionality
- [ ] Add sample data
- [ ] Test frontend integration