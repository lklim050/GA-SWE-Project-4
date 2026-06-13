// src/controllers/seedController.js
import prisma from "../db/prisma.js"; // 🍏 Uses your existing Copilot adapter setup!
import bcrypt from "bcrypt";

export const seedDatabaseOld = async (req, res) => {
  try {
    // 1. Purge existing data to avoid primary/foreign key constraint clashes
    // Order matters due to relational dependency trees!
    await prisma.surveyResponse.deleteMany({});
    await prisma.question.deleteMany({});
    await prisma.survey.deleteMany({});
    await prisma.user.deleteMany({});

    // 2. Generate secure password hashes
    const hostPasswordHash = await bcrypt.hash("host1234", 12);
    const userPasswordHash = await bcrypt.hash("user1234", 12);
    const adminPasswordHash = await bcrypt.hash("admin1234", 12);

    // 3. Create Seed Users matching your exact schema Enums
    const hostUser = await prisma.user.create({
      data: {
        email: "host@askyou.com",
        name: "Host Seed",
        password: hostPasswordHash,
        role: "HOST", // Matches Enum
      },
    });

    const userUser = await prisma.user.create({
      data: {
        email: "user@askyou.com",
        name: "User Seed",
        password: userPasswordHash,
        role: "USER", // Matches Enum
      },
    });

    const userAdmin = await prisma.user.create({
      data: {
        email: "superadmin@askyou.com",
        name: "Admin Seed",
        password: adminPasswordHash,
        role: "ADMIN", // Matches Enum
      },
    });

    // 4. Create Seed Surveys with nested questions
    await prisma.survey.create({
      data: {
        title: "MRT Commuter Transit Comfort Survey",
        points_reward: 50,
        is_published: true,
        created_by: hostUser.uuid, // Links foreign key relation
        questions: {
          create: [
            {
              question_text:
                "How satisfied are you with the train cabin temperature during peak hours?",
              type: "RADIO", // Matches Enum
              options: ["Very Cold", "Comfortable", "Too Warm"],
            },
            {
              question_text:
                "Which MRT line do you commute on most frequently?",
              type: "SELECT",
              options: [
                "East-West Line",
                "North-South Line",
                "Circle Line",
                "Downtown Line",
              ],
            },
            {
              question_text:
                "What is your primary mode of feeder transport to reach your nearest MRT station?",
              type: "RADIO",
              options: [
                "Feeder Bus",
                "Walking",
                "Bicycle / PMD",
                "Ride-Hailing (Grab/Gojek)",
                "Car Drop-off",
              ],
            },
            {
              question_text:
                "Which of the following digital features do you use most frequently when planning your daily transit commute? (Select all that apply)",
              type: "CHECKBOX",
              options: [
                "Real-time Bus Arrival Timings",
                "Crowd Density Indicators",
                "Route Fare Calculators",
                "Disruption Alert Notifications",
              ],
            },
          ],
        },
      },
    });

    await prisma.survey.create({
      data: {
        title: "Changi Airport Layout Feedback 2026",
        points_reward: 120,
        is_published: true,
        created_by: hostUser.uuid,
        questions: {
          create: [
            {
              question_text:
                "How easy was it to navigate between Terminal 2 and Terminal 3 using the Skytrain?",
              type: "RADIO",
              options: ["Very Easy", "Neutral", "Confusing"],
            },
            {
              question_text:
                "What additional facilities would you like to see more of at the transit lounges?",
              type: "CHECKBOX",
              options: [
                "More Charging Pods",
                "Rest Zones",
                "Local Food Stalls",
              ],
            },
          ],
        },
      },
    });
    // Survey 3: Neighborhood E-Waste & Recycling Habits
    await prisma.survey.create({
      data: {
        title: "Neighborhood E-Waste & Recycling Habits",
        points_reward: 40,
        is_published: false,
        created_by: hostUser.uuid,
        questions: {
          create: [
            {
              question_text:
                "Are you aware of the electronic waste (e-waste) recycling bins located at your nearest community center?",
              type: "RADIO",
              options: [
                "Yes, I use them regularly",
                "I know where they are but haven't used them",
                "No, I didn't know they existed",
              ],
            },
            {
              question_text:
                "Which of these items have you disposed of in a blue recycling bin over the past month? (Select all that apply)",
              type: "CHECKBOX",
              options: [
                "Plastic Drink Bottles",
                "Cardboard Delivery Boxes",
                "Glass Jars",
                "Aluminium Drink Cans",
                "None of the above",
              ],
            },
          ],
        },
      },
    });

    // Survey 4: Corporate Remote Work & Wellness Survey
    await prisma.survey.create({
      data: {
        title: "Corporate Remote Work & Wellness Survey",
        points_reward: 80,
        is_published: true,
        created_by: hostUser.uuid,
        questions: {
          create: [
            {
              question_text:
                "On average, how many days a week would you prefer to work from home?",
              type: "SELECT",
              options: [
                "0 Days (Fully On-site)",
                "1 to 2 Days",
                "3 to 4 Days",
                "5 Days (Fully Remote)",
              ],
            },
            {
              question_text:
                "How would you rate your current work-life balance setup?",
              type: "RADIO",
              options: [
                "Excellent",
                "Good",
                "Manageable",
                "Struggling / Overworked",
              ],
            },
          ],
        },
      },
    });
    return res.status(201).json({
      status: "ok",
      msg: "Database seeded successfully via Bruno route!",
    });
  } catch (error) {
    console.error("Seeding route failed:", error.message);
    return res.status(500).json({
      status: "error",
      msg: "Failed to seed database through endpoint",
      details: error.message,
    });
  }
};

export const seedDatabase = async (req, res) => {
  try {
    console.log("⏳ Running dynamic controller-level database seed...");

    // 1. Wipe out existing data cleanly to prevent unique constraint crashes
    await prisma.$executeRaw`TRUNCATE TABLE survey_responses, questions, surveys, users RESTART IDENTITY CASCADE;`;

    // 2. Hash 'password123' dynamically using your environment's exact bcrypt settings
    const hashedPassword = await bcrypt.hash("password123", 12);

    // ==========================================
    // 3. SEED USERS (2 Hosts, 5 Users)
    // ==========================================
    await prisma.user.createMany({
      data: [
        {
          uuid: "h1111111-1111-1111-1111-111111111111",
          email: "host1@smrt.com",
          name: "Host Alex",
          password: hashedPassword,
          role: "HOST",
          points_bal: 0,
        },
        {
          uuid: "h2222222-2222-2222-2222-222222222222",
          email: "host2@smrt.com",
          name: "Host Beatrice",
          password: hashedPassword,
          role: "HOST",
          points_bal: 0,
        },
        {
          uuid: "u1111111-1111-1111-1111-111111111111",
          email: "user1@gmail.com",
          name: "Charles Tan",
          password: hashedPassword,
          role: "USER",
          points_bal: 80,
        },
        {
          uuid: "u2222222-2222-2222-2222-222222222222",
          email: "user2@gmail.com",
          name: "Daniel Lim",
          password: hashedPassword,
          role: "USER",
          points_bal: 80,
        },
        {
          uuid: "u3333333-3333-3333-3333-333333333333",
          email: "user3@gmail.com",
          name: "Emily Phua",
          password: hashedPassword,
          role: "USER",
          points_bal: 80,
        },
        {
          uuid: "u4444444-4444-4444-4444-444444444444",
          email: "user4@gmail.com",
          name: "Fiona Teo",
          password: hashedPassword,
          role: "USER",
          points_bal: 80,
        },
        {
          uuid: "u5555555-5555-5555-5555-555555555555",
          email: "user5@gmail.com",
          name: "Gabriel Ng",
          password: hashedPassword,
          role: "USER",
          points_bal: 80,
        },
      ],
    });

    // ==========================================
    // 4. SEED SURVEYS
    // ==========================================
    await prisma.survey.createMany({
      data: [
        {
          id: 1,
          title: "MRT Cabin Temperature & Comfort Feedback",
          points_reward: 30,
          is_published: true,
          created_by: "h1111111-1111-1111-1111-111111111111",
        },
        {
          id: 2,
          title: "Peak Hour Train Station Crowding Study",
          points_reward: 50,
          is_published: true,
          created_by: "h2222222-2222-2222-2222-222222222222",
        },
      ],
    });

    // ==========================================
    // 5. SEED QUESTIONS (With Valid JSON Option Formats)
    // ==========================================
    await prisma.question.createMany({
      data: [
        // Survey 1
        {
          id: 1,
          survey_id: 1,
          question_text: "Which MRT Line do you travel on most frequently?",
          type: "SELECT",
          options: [
            "East-West Line",
            "North-South Line",
            "Circle Line",
            "Downtown Line",
          ],
        },
        {
          id: 2,
          survey_id: 1,
          question_text:
            "How would you rate the current air-conditioning comfort level inside the cabin?",
          type: "RADIO",
          options: ["Too Cold", "Comfortable", "Too Warm"],
        },
        {
          id: 3,
          survey_id: 1,
          question_text:
            "Which amenities inside the train cars do you utilize? (Select all that apply)",
          type: "CHECKBOX",
          options: [
            "Grab Poles",
            "Overhead Handles",
            "Dynamic Route Map Display",
            "Priority Seats",
          ],
        },
        {
          id: 4,
          survey_id: 1,
          question_text:
            "Please share any specific suggestions to improve transit comfort.",
          type: "TEXT",
          options: null,
        },
        // Survey 2
        {
          id: 5,
          survey_id: 2,
          question_text: "Select your primary boarding transit node.",
          type: "SELECT",
          options: [
            "Jurong East",
            "Raffles Place",
            "City Hall",
            "Bishan",
            "Dhoby Ghaut",
          ],
        },
        {
          id: 6,
          survey_id: 2,
          question_text:
            "Do you skip arriving trains due to severe platform overcrowding?",
          type: "RADIO",
          options: ["Never", "Rarely", "Often", "Every Day"],
        },
        {
          id: 7,
          survey_id: 2,
          question_text:
            "What alternative routes or habits do you use to bypass peak hour crowding?",
          type: "CHECKBOX",
          options: [
            "Travel before 7:45 AM",
            "Take alternative bus routes",
            "Wait out the peak period at a station cafe",
          ],
        },
        {
          id: 8,
          survey_id: 2,
          question_text:
            "Describe your recent experience dealing with peak hour congestion.",
          type: "TEXT",
          options: null,
        },
      ],
    });

    // ==========================================
    // 6. SEED RESPONSES (Matching answers_payload)
    // ==========================================
    await prisma.surveyResponse.createMany({
      data: [
        {
          user_id: "u1111111-1111-1111-1111-111111111111",
          survey_id: 1,
          status: "completed",
          answers_payload: [
            { question_id: 1, answer: "East-West Line" },
            { question_id: 2, answer: "Comfortable" },
            {
              question_id: 3,
              answer: ["Grab Poles", "Dynamic Route Map Display"],
            },
            { question_id: 4, answer: "Everything looks clean and fine." },
          ],
        },
        {
          user_id: "u1111111-1111-1111-1111-111111111111",
          survey_id: 2,
          status: "completed",
          answers_payload: [
            { question_id: 5, answer: "Raffles Place" },
            { question_id: 6, answer: "Rarely" },
            { question_id: 7, answer: ["Travel before 7:45 AM"] },
            {
              question_id: 8,
              answer: "Crowded but the trains arrive very fast.",
            },
          ],
        },
        {
          user_id: "u2222222-2222-2222-2222-222222222222",
          survey_id: 1,
          status: "completed",
          answers_payload: [
            { question_id: 1, answer: "North-South Line" },
            { question_id: 2, answer: "Too Cold" },
            { question_id: 3, answer: ["Grab Poles", "Overhead Handles"] },
            {
              question_id: 4,
              answer: "Turn down the fan speed in early mornings.",
            },
          ],
        },
        {
          user_id: "u2222222-2222-2222-2222-222222222222",
          survey_id: 2,
          status: "completed",
          answers_payload: [
            { question_id: 5, answer: "Jurong East" },
            { question_id: 6, answer: "Every Day" },
            { question_id: 7, answer: ["Take alternative bus routes"] },
            {
              question_id: 8,
              answer:
                "Platform configuration at interchange points is dangerously crowded.",
            },
          ],
        },
        {
          user_id: "u3333333-3333-3333-3333-333333333333",
          survey_id: 1,
          status: "completed",
          answers_payload: [
            { question_id: 1, answer: "Circle Line" },
            { question_id: 2, answer: "Comfortable" },
            { question_id: 3, answer: ["Dynamic Route Map Display"] },
            { question_id: 4, answer: "No suggestions, great service." },
          ],
        },
        {
          user_id: "u3333333-3333-3333-3333-333333333333",
          survey_id: 2,
          status: "completed",
          answers_payload: [
            { question_id: 5, answer: "Bishan" },
            { question_id: 6, answer: "Often" },
            {
              question_id: 7,
              answer: [
                "Travel before 7:45 AM",
                "Wait out the peak period at a station cafe",
              ],
            },
            {
              question_id: 8,
              answer:
                "Circle Line platforms at Bishan get clogged easily during 6pm peak.",
            },
          ],
        },
        {
          user_id: "u4444444-4444-4444-4444-444444444444",
          survey_id: 1,
          status: "completed",
          answers_payload: [
            { question_id: 1, answer: "Downtown Line" },
            { question_id: 2, answer: "Too Warm" },
            { question_id: 3, answer: ["Priority Seats"] },
            {
              question_id: 4,
              answer: "Midday cabins feel stuffy when packed with shoppers.",
            },
          ],
        },
        {
          user_id: "u4444444-4444-4444-4444-444444444444",
          survey_id: 2,
          status: "completed",
          answers_payload: [
            { question_id: 5, answer: "Dhoby Ghaut" },
            { question_id: 6, answer: "Never" },
            { question_id: 7, answer: [] },
            {
              question_id: 8,
              answer:
                "I try to walk faster during transfers to avoid getting boxed in.",
            },
          ],
        },
        {
          user_id: "u5555555-5555-5555-5555-555555555555",
          survey_id: 1,
          status: "completed",
          answers_payload: [
            { question_id: 1, answer: "East-West Line" },
            { question_id: 2, answer: "Comfortable" },
            {
              question_id: 3,
              answer: [
                "Grab Poles",
                "Overhead Handles",
                "Dynamic Route Map Display",
              ],
            },
            {
              question_id: 4,
              answer:
                "Need brighter ambient lighting inside older rolling stock models.",
            },
          ],
        },
        {
          user_id: "u5555555-5555-5555-5555-555555555555",
          survey_id: 2,
          status: "completed",
          answers_payload: [
            { question_id: 5, answer: "City Hall" },
            { question_id: 6, answer: "Rarely" },
            {
              question_id: 7,
              answer: ["Wait out the peak period at a station cafe"],
            },
            {
              question_id: 8,
              answer:
                "The queue layout marshals do a solid job keeping paths flowing.",
            },
          ],
        },
      ],
    });

    // ==========================================
    // 7. FIX POSTGRES AUTOCREMENT SEQUENCERS
    // ==========================================
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('surveys', 'id'), coalesce(max(id), 1)) FROM surveys;`;
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('questions', 'id'), coalesce(max(id), 1)) FROM questions;`;
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('survey_responses', 'id'), coalesce(max(id), 1)) FROM survey_responses;`;

    console.log("✅ Database successfully seeded dynamically!");
    return res.json({
      status: "ok",
      msg: "Database seeded dynamically with correct local hashes!",
    });
  } catch (error) {
    console.error("❌ seedDatabase Error:", error.message);
    return res.status(500).json({
      status: "error",
      msg: "Fail to execute dynamic seed",
      details: error.message,
    });
  }
};
