// import prisma from "../db/prisma.js";

// export const readSurveys = async (req, res) => {
//   try {
//     const surveys = await prisma.survey.findMany();
//     return res.status(200).json(surveys);
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ error: "Failed to retrieve surveys", details: error.message });
//   }
// };

import prisma from "../db/prisma.js";

// 1. CREATE A NEW SURVEY
export const createSurvey = async (req, res) => {
  try {
    const { id, title, points_reward, is_published } = req.body;

    // Verify the host user exists first
    const user = await prisma.user.findUnique({
      where: { uuid: id },
    });
    if (!user) return res.status(404).json({ msg: "user not found" });

    // Create the survey record linked to the host
    const survey = await prisma.survey.create({
      data: {
        title,
        points_reward: points_reward ? Number(points_reward) : 0,
        is_published: is_published ?? false,
        created_by: id, // Links the foreign key constraint
      },
    });

    return res.json({
      status: "ok",
      msg: "survey created successfully",
      survey,
    });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ status: "error", msg: "fail to create Survey" });
  }
};

// 2. READ ALL SURVEYS CREATED BY THE LOGGED-IN HOST
export const readAllSurveys = async (req, res) => {
  try {
    const { id } = req.body;

    // 1. Verify the user exists first
    const user = await prisma.user.findUnique({
      where: { uuid: id },
    });
    if (!user) return res.status(404).json({ msg: "user not found" });

    // 2. Query the Survey table directly using the foreign key string!
    // This avoids having to guess the reverse relation name entirely.
    const userSurveys = await prisma.survey.findMany({
      where: {
        created_by: id, // 🍏 Matches the foreign key property exactly
      },
    });

    return res.json({
      status: "fetch successfully",
      user: user.name,
      surveys: userSurveys,
    });
  } catch (error) {
    // This logs the exact error details to your terminal console so you can see it instantly
    console.error("❌ readAllSurveys Query Error:", error);

    return res.status(500).json({
      status: "error",
      msg: "fail to fetch Surveys",
      details: error.message,
    });
  }
};

// 3. READ A SINGLE SURVEY BY ID
export const getSurveyById = async (req, res) => {
  try {
    const { id } = req.body;
    const { surveyId } = req.params;

    const user = await prisma.user.findUnique({ where: { uuid: id } });
    if (!user) return res.status(404).json({ msg: "user not found" });

    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
      include: { questions: true }, // Includes nested survey questions if any exist
    });

    if (!survey)
      return res
        .status(404)
        .json({ status: "error", msg: "id does not exist" });

    return res.json({
      status: "ok",
      msg: "entry found",
      show: survey,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ status: "error", msg: "fail to find" });
  }
};

// UPDATE AN EXISTING SURVEY (With Strict Ownership Check)
export const updateSurvey = async (req, res) => {
  try {
    const { id, title, points_reward, is_published } = req.body;
    const { surveyId } = req.params;

    // 1. Verify the user exists
    const user = await prisma.user.findUnique({ where: { uuid: id } });
    if (!user) return res.status(404).json({ msg: "user not found" });

    // 2. Find the survey
    const existingSurvey = await prisma.survey.findUnique({
      where: { id: surveyId },
    });
    if (!existingSurvey)
      return res.status(404).json({ msg: "entry not found" });

    // 🛡️ 3. STRICT OWNERSHIP CHECK: Does this survey belong to the logged-in host?
    if (existingSurvey.created_by !== id) {
      return res.status(403).json({
        status: "error",
        msg: "unauthorised: You do not own this survey",
      });
    }

    // 4. Update the survey
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (points_reward !== undefined)
      updateData.points_reward = Number(points_reward);
    if (is_published !== undefined) updateData.is_published = is_published;

    const updatedSurvey = await prisma.survey.update({
      where: { id: surveyId },
      data: updateData,
    });

    return res.json({
      status: "ok",
      message: "update successfully",
      content: updatedSurvey,
    });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ status: "error", msg: "fail to update Survey" });
  }
};

// DELETE A SURVEY (With Strict Ownership Check)
export const deleteSurvey = async (req, res) => {
  try {
    const { id } = req.body;
    const { surveyId } = req.params;

    // 1. Verify the user exists
    const user = await prisma.user.findUnique({ where: { uuid: id } });
    if (!user) return res.status(404).json({ msg: "user not found" });

    // 2. Find the survey
    const existingSurvey = await prisma.survey.findUnique({
      where: { id: surveyId },
    });
    if (!existingSurvey)
      return res.status(404).json({ msg: "entry not found" });

    // 🛡️ 3. STRICT OWNERSHIP CHECK: Does this survey belong to the logged-in host?
    if (existingSurvey.created_by !== id) {
      return res.status(403).json({
        status: "error",
        msg: "unauthorised: You do not own this survey",
      });
    }

    // 4. Clean up children constraints and delete primary survey row
    await prisma.question.deleteMany({ where: { survey_id: surveyId } });
    await prisma.survey.delete({ where: { id: surveyId } });

    return res.json({ status: "ok", msg: "entry deleted" });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ status: "error", msg: "fail to delete" });
  }
};

// READ ALL PUBLISHED SURVEYS (Accessible by everyone to view/answer)
export const readPublishedSurveys = async (req, res) => {
  try {
    const { id } = req.body;

    // 1. Verify the user exists first
    const user = await prisma.user.findUnique({
      where: { uuid: id },
    });
    if (!user) return res.status(404).json({ msg: "user not found" });
    // Query the database for surveys that are marked as published
    const publishedSurveys = await prisma.survey.findMany({
      where: {
        is_published: true,
      },
      select: {
        id: true,
        title: true,
        points_reward: true,
        // created_at: true,
        // We can optionally include the host's name so users know who created it
        creator: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        created_by: "desc", // Show the newest surveys first
      },
    });

    return res.json({
      status: "fetch successfully",
      count: publishedSurveys.length,
      surveys: publishedSurveys,
    });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ status: "error", msg: "fail to fetch published surveys" });
  }
};
