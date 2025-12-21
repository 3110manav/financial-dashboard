# Financial Data Dashboard

A full-stack Next.js application for uploading financial CSVs, validating transactions, and visualizing analytics.

## Features

- **CSV Upload**: Drag-and-drop interface with strict row-level validation (Zod).
- **Atomic Processing**: Database updates are transactional—entire file invalidates if one row fails.
- **Interactive Dashboard**:
    - Monthly Spending Trends (Line Chart)
    - Age Group Distribution (Bar Chart)
    - Gender Demographics (Pie Chart)
    - Top Spenders List
    - Activity Heatmap (Day of Week)
- **Paginated Data Table**: Searchable and paginated view of all transactions.
- **Tech Stack**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Prisma, PostgreSQL, Recharts.

## Getting Started

1. **Prerequisites**: Node.js 18+ and PostgreSQL.
2. **Installation**:
   ```bash
   npm install
   ```
3. **Database Setup**:
   Create a `.env` file with your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/financial_db?schema=public"
   ```
4. **Initialize DB**:
   ```bash
   npx prisma db push
   ```
5. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to upload a CSV.

## CSV Format

The upload expects a CSV with the following headers (case-insensitive keys mapped automatically if standard):
- `transaction_no` (Unique)
- `date` (ISO date)
- `full_name`
- `age` (18-90)
- `gender` (Male, Female, Other)
- `amount` (Numeric)

## Architecture

- **Backend**: Next.js Route Handlers (`/api/upload`, `/api/analytics/*`).
- **Validation**: Schema-first validation using `zod`.
- **Database**: Prisma ORM with atomic transactions (`$transaction`).
- **Frontend**: React Server/Client Components, Tailwind, Recharts.
