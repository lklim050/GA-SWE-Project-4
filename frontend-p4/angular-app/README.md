# AOInsights 🦉

> your **A**utomated **O**pinions into **I**nsights

![AOInsights Landing Page](./screenshots/landing.png)

AOInsights is a full-stack community survey platform built for Singapore.
Users complete surveys to earn points and climb reward tiers, while hosts
get AI-powered analytics on every response. Built as a Final Project for
the General Assembly Software Engineering Bootcamp.

---

## 🇸🇬 Overview

AOInsights connects three types of users on one platform:

- **Users** — Complete community surveys, earn points, track tier progression
- **Hosts** — Create surveys, view real-time analytics, generate AI insights
- **Admins** — Oversee the platform, manage survey publish states

The name **AOI** (蒼い) means _blue-green_ in Japanese — reflected in the
platform's cyan-teal-green colour identity.

---

## 🛠️ Tech Stack

### Frontend

| Technology             | Purpose                                 |
| ---------------------- | --------------------------------------- |
| Angular 17             | SPA framework (standalone components)   |
| TypeScript             | Type-safe JavaScript                    |
| Tailwind CSS           | Landing page styling                    |
| Vanilla CSS            | Component-level styling + glassmorphism |
| RxJS                   | Reactive programming, HTTP observables  |
| Angular Reactive Forms | Dynamic form handling (FormArray)       |
| ngx-markdown           | AI insight report rendering             |

### Backend

| Technology            | Purpose                                  |
| --------------------- | ---------------------------------------- |
| Node.js + Express     | REST API server                          |
| Prisma ORM            | Database queries and schema management   |
| PostgreSQL            | Relational database                      |
| bcrypt                | Password hashing                         |
| JSON Web Tokens (JWT) | Authentication (access + refresh tokens) |
| express-validator     | Request validation middleware            |
| Google Gemini AI      | Survey response analysis and insights    |

### Tools

| Tool    | Purpose                 |
| ------- | ----------------------- |
| Bruno   | API testing             |
| pgAdmin | Database management     |
| VS Code | Development environment |

---

## ✨ Features by Role

### 👤 USER

- Browse published community surveys
- Complete surveys with 4 question types (Text, Radio, Checkbox, Select)
- Earn points on every survey completion
- View previous submitted responses
- Track points balance and tier progression (Bronze → Silver → Gold → Platinum)
- Personal profile page with tier progress bar

### 📋 HOST

- Create and manage surveys (title, points reward)
- Add/edit/delete questions dynamically (draft surveys only)
- One-way publish flow — published surveys are locked for data integrity
- View real-time results with CSS bar charts
- Generate AI-powered insights using Google Gemini
  - Structured view with colour-coded sentiment cards
  - Full markdown report view
- Edit survey title inline (draft surveys only)

### 🛡️ ADMIN

- View all surveys across the platform
- Search surveys by ID or title
- Filter by published/draft status
- Unlock published surveys (reverts to draft for host editing)
- Publish draft surveys on behalf of hosts

### 🌐 Public

- Landing page with Singapore skyline hero
- How it works, features, and tier rewards sections
- Dark mode support

---

## 🗄️ Database Schema

With the usage of Prisma ORM, the database schema is defined in `prisma/schema.prisma`. The schema includes models for `User`, `Survey`, `Question`, `SurveyResponse`, and `SurveyInsight`, along with enums for `Role` and `QuestionType`.

```prisma
// prisma/schema.prisma

// 1. Define the constraints, fixed choices
enum Role {
  HOST
  USER
  ADMIN
}

enum QuestionType {
  RADIO
  CHECKBOX
  SELECT
  TEXT
}

model User {
  uuid       String @id @default(uuid()) // Primary Key
  email      String @unique
  name       String
  password   String
  role       Role   @default(USER)
  points_bal Int    @default(0)

  // Relations
  created_surveys Survey[]         @relation("SurveyCreator")
  responses       SurveyResponse[]

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
  surveyInsight SurveyInsight?

  @@map("surveys")
}

model Question {
  id            Int          @id @default(autoincrement())
  survey_id     Int
  question_text String       @db.Text
  type          QuestionType
  options       Json?
  survey        Survey       @relation(fields: [survey_id], references: [id], onDelete: Cascade)

  @@map("questions")
}

model SurveyResponse {
  id              Int     @id @default(autoincrement())
  user_id         String
  survey_id       Int
  answers_payload Json
  status          String  @default("pending")
  ai_fraud_notes  String? @db.Text
  user            User    @relation(fields: [user_id], references: [uuid], onDelete: Cascade)
  survey          Survey  @relation(fields: [survey_id], references: [id], onDelete: Cascade)

  @@unique([user_id, survey_id])
  @@map("survey_responses")
}

model SurveyInsight {
  id        Int      @id @default(autoincrement())
  survey_id Int      @unique
  summary   String // The AI-generated analysis
  submission_count Int      @default(0)
  createdAt DateTime @default(now())
  survey    Survey   @relation(fields: [survey_id], references: [id], onDelete: Cascade)

  @@map("survey_insights")
}
```

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js v18+ (v20 LTS recommended)
- PostgreSQL 14+
- npm 9+

---

### Backend Setup

**1. Clone the repository**

```bash
git clone <your-repo-url>
cd backend-p4
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

Create a .env file in the backend root directory and populate it with the following:

```env
PORT=your-backend-port
DATABASE_URL="postgresql://postgres:somepassword@localhost:your-db-port/your-db-name?schema=public"
ACCESS_SECRET=your_access_token_secret
REFRESH_SECRET=your_refresh_token_secret
GEMINI_API_KEY=your_google_gemini_api_key

```

**4. Set up the database**

```bash
# Run Prisma migrations
npx prisma migrate dev

# Seed the database with sample data
npx prisma db seed
```

**5. Start the backend server**

```bash
npm run dev
# Server runs on http://localhost:3000
```

---

### Frontend Setup

**1. Navigate to frontend**

```bash
cd frontend-p4/angular-app
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

```bash
# Update src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

**4. Start the development server**

```bash
npm start
```

---

### Frontend `environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000/api",
};
```

---

## 📖 API Dictionary

Full API documentation is available in:
[`API_DICTIONARY.md`](./API_DICTIONARY.md)

### Quick Reference

| Method | Endpoint                      | Auth      | Description                                   |
| ------ | ----------------------------- | --------- | --------------------------------------------- |
| GET    | `/users`                      | authAdmin | Get all users                                 |
| PUT    | `/users/register`             | none      | Register new user                             |
| POST   | `/users/login`                | none      | Login and get JWT tokens                      |
| POST   | `/users/refresh`              | none      | Refresh access token                          |
| POST   | `/users/logout`               | none      | Logout user                                   |
| PUT    | `/seed`                       | authAdmin | Reseed users, surveys, questions, responses   |
| GET    | `/surveys/admin`              | authAdmin | Get all surveys with creator details          |
| GET    | `/surveys`                    | auth      | Get surveys created by the authenticated user |
| GET    | `/surveys/public`             | auth      | Get published surveys                         |
| PUT    | `/surveys`                    | authHost  | Create survey                                 |
| PATCH  | `/surveys/:surveyId`          | authHost  | Update survey                                 |
| DELETE | `/surveys/:surveyId`          | authHost  | Delete survey                                 |
| POST   | `/surveys/:surveyId`          | auth      | Get survey with questions and response        |
| GET    | `/surveys/:surveyId/results`  | authHost  | Get survey results                            |
| POST   | `/surveys/:surveyId/insights` | authHost  | Generate AI insights                          |
| PATCH  | `/surveys/:surveyId/toggle`   | authAdmin | Toggle publish state                          |
| PUT    | `/questions`                  | authHost  | Create question                               |
| GET    | `/questions/survey/:surveyId` | authHost  | Get questions for a survey                    |
| PATCH  | `/questions/:questionId`      | authHost  | Update question                               |
| DELETE | `/questions/:questionId`      | authHost  | Delete question                               |
| GET    | `/responses`                  | auth      | Get authenticated user responses              |
| POST   | `/responses/survey/:surveyId` | auth      | Get survey and existing response              |
| PUT    | `/responses/submit`           | auth      | Submit survey response                        |

---

## Project Structure

```
.
├── backend-p4/
│   ├── package.json
│   ├── prisma.config.ts
│   ├── server.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── questions.js
│   │   │   ├── responses.js
│   │   │   ├── roles.js
│   │   │   ├── seed.js
│   │   │   ├── surveys.js
│   │   │   └── users.js
│   │   ├── db/
│   │   │   └── prisma.js
│   │   ├── generated/
│   │   │   └── prisma/
│   │   ├── middlewares/
│   │   │   ├── errorHandlers.js
│   │   │   ├── users.js
│   │   │   └── ref/
│   │   ├── models/
│   │   │   ├── Appts.js
│   │   │   ├── Auth.js
│   │   │   └── Roles.js
│   │   ├── routers/
│   │   │   ├── questions.js
│   │   │   ├── responses.js
│   │   │   ├── seed.js
│   │   │   ├── surveys.js
│   │   │   └── users.js
│   │   ├── utils/
│   │   │   └── resultProcessor.js
│   │   └── validators/
│   │       ├── auth.js
│   │       ├── checkErrors.js
│   │       └── surveys.js
│   └── generated/
├── frontend-p4/
│   └── angular-app/
│       ├── package.json
│       ├── angular.json
│       ├── tsconfig.json
│       ├── tailwind.config.js
│       ├── src/
│       │   ├── index.html
│       │   ├── main.ts
│       │   ├── styles.css
│       │   └── app/
│       │       ├── app.component.ts
│       │       ├── app.component.html
│       │       ├── app.component.css
│       │       ├── app.routes.ts
│       │       ├── app.config.ts
│       │       ├── core/
│       │       │   ├── guards/
│       │       │   ├── interceptors/
│       │       │   └── services/
│       │       ├── features/
│       │       │   ├── admin/
│       │       │   ├── auth/
│       │       │   ├── home/
│       │       │   └── ...
│       │       ├── services/
│       │       ├── shared/
│       │       └── assets/
│       ├── environments/
│       └── tailwind.config.js
└── some-references/
    ├── API_DICTIONARY.md
    ├── angular.md
    ├── prisma-postgresql-orm-guide.md
    └── ...
```

## 📸 Screenshots

### Landing Page

![Landing Page](./screenshots/landing.png)

### Survey List (User)

![Survey List](./screenshots/survey-list.png)

### Survey Response

![Survey Response](./screenshots/survey-response.png)

### Host Dashboard

![Host Dashboard](./screenshots/host-dashboard.png)

### Results & Analytics

![Results Page](./screenshots/results.png)

### AI Insights Modal

![AI Insights](./screenshots/ai-insights.png)

### User Profile & Tiers

![Profile Page](./screenshots/profile.png)

### Admin Panel

![Admin Panel](./screenshots/admin.png)

---

## 🏗️ Architecture Decisions

### Why Angular over React?

React was taught during the bootcamp. Angular was chosen deliberately to demonstrate adaptability to new frameworks. Angular's opinionated structure —
dependency injection, TypeScript-first, RxJS — mirrors enterprise patterns used at companies like GovTech Singapore.

### Why PostgreSQL over MongoDB?

The survey data has clear relational structure — users own surveys, surveys contain questions, responses link users to surveys. A composite unique constraint (`user_id`, `survey_id`) on `survey_responses` enforces the no-duplicate-submission rule at the database level.

### JWT Auth Strategy

Two-token strategy: short-lived access tokens + refresh tokens. An Angular HTTP interceptor automatically attaches Bearer tokens to every request and handles 401 responses by redirecting to login.

### AI Integration

Google Gemini AI (`gemini-3.1-flash-lite`) analyses aggregated survey
response data. A structured prompt enforces consistent markdown output
that the frontend parses into colour-coded insight cards — green for
positive findings, red for negative, amber for recommendations.

---

## 🔮 Future Improvements

- [ ] Leaderboard page showing top point earners
- [ ] Mobile responsive layout improvements
- [ ] JWT refresh token rotation (currently access token only)
- [ ] Survey response export to CSV for hosts
- [ ] Points redemption / voucher system
- [ ] Multi-language support (Chinese, Malay, Tamil)
- [ ] Native mobile app (iOS/Android)
- [ ] Advanced fraud detection with ML model training

---

## 👨‍💻 Author

Built by **Lincoln** as the Final Project for
General Assembly Software Engineering Bootcamp — Singapore, 2026.

---

## 📄 Licence

This project is for educational purposes.
