# Prisma + PostgreSQL Implementation Guide

This project currently uses Express with Mongoose and MongoDB. If the goal is to use PostgreSQL, Prisma is the right ORM layer to add between Express and the database.

Prisma is not the database driver itself. It uses a generated client on top of a PostgreSQL driver and gives you schema validation, migrations, and type-safe queries.

## Tables of Contents

- [Summary](#summary)
- [What Changes](#what-changes)
- [Install Prisma](#install-prisma)
- [Environment Variables](#environment-variables)
- [Suggested Prisma Schema](#suggested-prisma-schema)
- [Database Setup Flow](#database-setup-flow)
- [Prisma Client File](#prisma-client-file)
- [Replacing the Current DB Connection](#replacing-the-current-db-connection)
- [Controller Migrations](#controller-migrations)
- [Authentication Notes](#authentication-notes)
- [Route Updates](#route-updates)
- [Recommended Migration Order](#recommended-migration-order)
- [Practical Notes For This Project](#practical-notes-for-this-project)
- [Validation Checklist](#validation-checklist)

## Summary

For this codebase, Prisma should replace Mongoose as the ORM layer, while PostgreSQL becomes the backing database. The biggest design change is moving from embedded Mongo documents to relational tables, especially for users and appointments.

## What Changes

- Replace the current MongoDB connection in `backend-p4/src/db/db.js`.
- Replace Mongoose models in `backend-p4/src/models/` with Prisma models in `prisma/schema.prisma`.
- Update controllers in `backend-p4/src/controllers/` to use Prisma queries instead of `find`, `save`, `updateOne`, and `deleteOne`.
- Flatten the embedded appointment data into relational tables.

## Install Prisma

From `backend-p4`:

```bash
npm install prisma @prisma/client @prisma/adapter-pg pg
npm install --save-dev prisma
npx prisma init
```

That creates:

- `prisma/schema.prisma`
- `.env` entries for `DATABASE_URL`

## Environment Variables

Use a PostgreSQL connection string instead of the current Mongo one.

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/askyousomethingha_db?schema=public"
JWT_SECRET="your-secret"
PORT=5001
```

## Suggested Prisma Schema

Based on the current project, the core tables are `User`, `Survey`, `Question`, and `SurveyResponse`. Note below schema is for prisma v7.

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  uuid             String           @id @default(uuid()) // Primary Key
  email            String           @unique
  name             String
  password         String
  role             String           @default("user")
  points_bal       Int              @default(0)

  // Relations
  created_surveys  Survey[]         @relation("SurveyCreator")
  responses        SurveyResponse[]

  @@map("users")
}

model Survey {
  id            Int              @id @default(autoincrement())
  title         String
  points_reward Int              @default(0)
  is_published  Boolean          @default(false)
  created_by    String
  // Relations
  creator       User             @relation("SurveyCreator", fields: [created_by], references: [uuid], onDelete: Cascade)
  questions     Question[]
  responses     SurveyResponse[]

  @@map("surveys")
}

model Question {
  id            Int      @id @default(autoincrement())
  survey_id     Int
  question_text String   @db.Text
  type          String
  options       Json?
  survey        Survey   @relation(fields: [survey_id], references: [id], onDelete: Cascade)

  @@map("questions")
}

model SurveyResponse {
  id              Int      @id @default(autoincrement())
  user_id         String
  survey_id       Int
  answers_payload Json
  status          String   @default("pending")
  ai_fraud_notes  String?  @db.Text
  user            User             @relation(fields: [user_id], references: [uuid], onDelete: Cascade)
  survey          Survey           @relation(fields: [survey_id], references: [id], onDelete: Cascade)

  @@unique([user_id, survey_id])
  @@map("survey_responses")
}
```

## Database Setup Flow

1. Create the PostgreSQL database.
2. Update `.env` with `DATABASE_URL`.
3. Run a migration:

```bash
npx prisma migrate dev --name init
```

4. Generate Prisma Client automatically if needed (whenever there is changes schema.prisma):

```bash
npx prisma db push
npx prisma generate
```

note: if there is existing data and mismatch between schema and database, `db push` may fail. In that case, you can use `npx prisma db push --force-reset` to drop and recreate the database tables based on the current schema. Be cautious with this command as it will delete existing data.

```bash
npx prisma db push --force-reset && npx prisma generate
```

## Prisma Client File

Create a shared Prisma client file such as `backend-p4/src/db/prisma.js`.

For Prisma 7 with PostgreSQL, the runtime client needs the Postgres adapter. This project uses the generated client in `backend-p4/src/generated/prisma/index.js`, not the default `@prisma/client` import.

```js
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

export default prisma;
```

This matters because `npx prisma validate` can succeed even when the app crashes at runtime if the Prisma client wrapper is using the wrong constructor options. In this codebase, the previous `datasources` option caused Prisma 7 to throw before the server could start.

Then use `prisma` in controllers instead of Mongoose models.

## Replacing the Current DB Connection

The current `connectDB()` function in `backend-p4/src/db/db.js` connects to MongoDB with Mongoose. With Prisma, you usually do not open a custom connection in the same way.

Instead of:

```js
import mongoose from "mongoose";

await mongoose.connect(process.env.DATABASE);
```

Use Prisma directly in route handlers or services:

```js
import prisma from "../db/prisma.js";

const users = await prisma.user.findMany();
```

## Controller Migrations

### Auth controllernpx

Current behavior likely includes:

- creating a user
- hashing the password with `bcrypt`
- validating login credentials with `jsonwebtoken`

Prisma version:

- `prisma.user.create({ data: { ... } })`
- `prisma.user.findUnique({ where: { username } })`
- `prisma.user.update({ ... })`

### Appointment controller

Current embedded Mongo pattern:

- appointment data stored under a user document

Prisma/Postgres pattern:

- store each appointment as its own row
- connect it to the user with `userId`
- query with `include: { appointments: true }` when needed

Example:

```js
const appointment = await prisma.appointment.create({
  data: {
    title,
    type,
    purpose,
    company,
    person,
    address,
    comment,
    date: new Date(date),
    time,
    userId: Number(userId),
  },
});
```

## Authentication Notes

Keep the current auth flow, but read and write users through Prisma.

- Hash passwords with `bcrypt` before insert.
- Store the hash in `User.hash`.
- Sign JWTs the same way as before.
- Load the user from PostgreSQL during protected requests.

## Route Updates

The Express routes can stay mostly the same.

What changes is the data access layer:

- route handlers call Prisma instead of Mongoose
- request validation can stay in `backend-p4/src/validators/`
- middleware can stay in `backend-p4/src/middlewares/`

## Recommended Migration Order

1. Install Prisma and initialize the schema.
2. Define `User`, `Role`, and `Appointment` models.
3. Add the Prisma client wrapper.
4. Convert auth logic first, because login depends on the user table.
5. Convert appointment logic second.
6. Remove Mongoose imports after all controllers are updated.
7. Delete the Mongo-specific DB connection file once nothing uses it.

## Practical Notes For This Project

- The current `Auth` model contains embedded `appts`; that structure should become two tables with a relation.
- The current `Roles` file is easier to model as an enum or a separate `Role` table.
- PostgreSQL handles relationships better than nested documents for this app.

## Validation Checklist

- `npx prisma format`
- `npx prisma migrate dev`
- `npx prisma studio`
- Start the Express app and confirm auth and appointment routes still work
