// src/controllers/seedController.js
import prisma from "../db/prisma.js"; // 🍏 Uses your existing Copilot adapter setup!
import bcrypt from "bcrypt";

export const seedDatabase = async (req, res) => {
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
