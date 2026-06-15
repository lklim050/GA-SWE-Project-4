// src/controllers/seedController.js
import prisma from "../db/prisma.js"; // 🍏 Uses your existing Copilot adapter setup!
import bcrypt from "bcrypt";

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
        {
          id: 3,
          title: "Bus Interchanges & Feeder Service Connectivity",
          points_reward: 20,
          is_published: false,
          created_by: "h1111111-1111-1111-1111-111111111111",
        },
        {
          id: 4,
          title: "Active Mobility & Bicycle Parking Infrastructure",
          points_reward: 25,
          is_published: false,
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
        // ✨ --- Survey 3 Questions (Host 1's New Survey) ---
        {
          id: 9,
          survey_id: 3,
          question_text:
            "Which terminal hub or integrated transport hub (ITH) do you use most often?",
          type: "SELECT",
          options: [
            "Bedok ITH",
            "Jurong East",
            "Woodlands Integrated",
            "Toa Payoh",
            "Sengkang",
          ],
        },
        {
          id: 10,
          survey_id: 3,
          question_text:
            "Are the arrival countdown timing displays at the bus bays accurate?",
          type: "RADIO",
          options: ["Always Accurate", "Mostly Accurate", "Unreliable"],
        },
        {
          id: 11,
          survey_id: 3,
          question_text:
            "What factors disrupt your transfer experience from bus to train? (Select all)",
          type: "CHECKBOX",
          options: [
            "Unsheltered walkways",
            "Poor directional signs",
            "Long walking distances",
            "Queuing bottlenecks",
          ],
        },
        {
          id: 12,
          survey_id: 3,
          question_text:
            "Provide specific feedback regarding feeder route frequencies in residential estates.",
          type: "TEXT",
          options: null,
        },
        // ✨ --- Survey 4 Questions (Host 2's New Survey) ---
        {
          id: 13,
          survey_id: 4,
          question_text:
            "What type of active mobility device do you cycle/ride to the station?",
          type: "SELECT",
          options: [
            "Bicycle (Personal)",
            "Shared Bike (Anywheel/HelloRide)",
            "E-Scooter / PMD",
            "None (Walk only)",
          ],
        },
        {
          id: 14,
          survey_id: 4,
          question_text:
            "How secure do you feel leaving items at the station's dual-tier yellow bike racks?",
          type: "RADIO",
          options: [
            "Very Secure",
            "Somewhat Safe",
            "Anxious about theft/vandalism",
          ],
        },
        {
          id: 15,
          survey_id: 4,
          question_text:
            "Which station upgrades would encourage you to cycle more? (Select all)",
          type: "CHECKBOX",
          options: [
            "More sheltered bicycle bays",
            "CCTV monitoring links",
            "Dedicated cycling pathways",
            "Lockers",
          ],
        },
        {
          id: 16,
          survey_id: 4,
          question_text:
            "Report any specific access points where cycling tracks disconnect abruptly near stations.",
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
