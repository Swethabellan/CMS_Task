# Database Seed Script

This seed script populates the database with dummy data for testing and development.

## What it creates:

- **2 Admin users** (admin@test.com and swetha@test.com)
- **8 Customer users** with various names and emails
- **5 Technicians** with different specializations
- **15 Complaints** with various statuses and categories
- **Multiple Feedbacks** (both complaint-specific and standalone)
- **Service History** records for resolved complaints
- **Notifications** for admin users

## How to run:

```bash
npm run seed
```

Or directly:

```bash
npx tsx prisma/seed.ts
```

## Login Credentials:

### Admin Users:
- **Email:** admin@test.com  
  **Password:** admin123

- **Email:** swetha@test.com  
  **Password:** 12345

### Customer Users:
- **Email:** john.doe@example.com  
  **Password:** password123

All customer users use the same password: **password123**

## Note:

⚠️ **Warning:** The seed script will **delete all existing data** before seeding. This ensures a clean database state.

If you want to keep existing data, comment out the deletion section at the beginning of `seed.ts`.


