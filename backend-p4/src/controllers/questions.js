import prisma from "../db/prisma.js";

// Refactor: check survey ownership
const verifySurveyOwnership = async (surveyId, hostId) => {
  const survey = await prisma.survey.findUnique({
    where: { id: Number(surveyId) },
  });

  if (!survey) {
    return { error: 404, msg: "Survey not found" };
  }

  if (survey.created_by !== hostId) {
    return { error: 403, msg: "Unauthorised: You do not own this survey" };
  }

  // LIVE SURVEY GUARD: Block modifying questions if the survey is actively published
  if (survey.is_published) {
    return {
      error: 400,
      msg: "Cannot modify questions on a live survey. Please unpublish or clone it first.",
    };
  }

  // Return the survey data so the controller can reuse it if needed
  return { success: true, survey };
};

export const createQuestion = async (req, res) => {
  try {
    const { survey_id, question_text, type, options } = req.body;
    const hostId = req.decoded?.id || req.decoded?.uuid;

    // check ownership
    const ownership = await verifySurveyOwnership(survey_id, hostId);
    if (ownership.error)
      return res
        .status(ownership.error)
        .json({ status: "error", msg: ownership.msg });

    // // check published status, prevent changes if already published
    // if (survey.is_published) {
    //   return res.status(400).json({
    //     status: "error",
    //     msg: "Cannot add questions to a live survey. Please unpublish or clone it first.",
    //   });
    // }

    // check duplicates
    const existingQuestion = await prisma.question.findFirst({
      where: {
        survey_id: Number(survey_id),
        question_text: {
          equals: question_text.trim(),
          mode: "insensitive", // Case-insensitive matching (e.g., "What is your age?" matches "what is your age?")
        },
      },
    });

    if (existingQuestion) {
      return res.status(400).json({
        status: "error",
        msg: "A question with this text already exists in this survey",
      });
    }

    // Check options if type is TEXT
    let finalOptions = options;
    if (type === "TEXT") {
      finalOptions = null;
    }

    // If all checks pass, insert into database
    const newQuestion = await prisma.question.create({
      data: {
        survey_id: Number(survey_id),
        question_text,
        type,
        options: finalOptions,
      },
    });

    return res.status(201).json({
      status: "ok",
      msg: "Question created successfully",
      question: newQuestion,
    });
  } catch (error) {
    console.error("❌ createQuestion Error:", error.message);
    return res
      .status(500)
      .json({ status: "error", msg: "Fail to create question" });
  }
};

export const readQuestionsBySurveyId = async (req, res) => {
  try {
    const surveyId = Number(req.params.surveyId);
    const hostId = req.decoded?.id || req.decoded?.uuid;

    // Ownership check
    const ownership = await verifySurveyOwnership(surveyId, hostId);
    if (ownership.error)
      return res
        .status(ownership.error)
        .json({ status: "error", msg: ownership.msg });

    // Fetch questions
    const questions = await prisma.question.findMany({
      where: { survey_id: Number(surveyId) },
      orderBy: { id: "asc" }, // Keeps order stable
    });

    return res.json({ status: "ok", count: questions.length, questions });
  } catch (error) {
    console.error("❌ readQuestions Error:", error.message);
    return res
      .status(500)
      .json({ status: "error", msg: "Fail to fetch questions" });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { question_text, type, options } = req.body;
    const hostId = req.decoded?.id || req.decoded?.uuid;

    // 1. Verify target question exists
    const question = await prisma.question.findUnique({
      where: { id: Number(questionId) },
    });
    if (!question)
      return res
        .status(404)
        .json({ status: "error", msg: "Question not found" });

    // 2. Verify survey ownership
    const ownership = await verifySurveyOwnership(question.survey_id, hostId);
    if (ownership.error)
      return res
        .status(ownership.error)
        .json({ status: "error", msg: ownership.msg });

    // 3. Build dynamic updates and handle TEXT constraint rules
    const updateData = {};
    if (question_text !== undefined) updateData.question_text = question_text;

    // Determine type changes
    const finalType = type || question.type;
    if (type !== undefined) updateData.type = type;

    if (finalType === "TEXT") {
      updateData.options = null; // Enforce null if type becomes or stays TEXT
    } else if (options !== undefined) {
      updateData.options = options;
    }

    // 4. Update row
    const updatedQuestion = await prisma.question.update({
      where: { id: Number(questionId) },
      data: updateData,
    });

    return res.json({
      status: "ok",
      msg: "Question updated successfully",
      question: updatedQuestion,
    });
  } catch (error) {
    console.error("❌ updateQuestion Error:", error.message);
    return res
      .status(500)
      .json({ status: "error", msg: "Fail to update question" });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const hostId = req.decoded?.id || req.decoded?.uuid;

    // 1. Verify target question exists
    const question = await prisma.question.findUnique({
      where: { id: Number(questionId) },
    });
    if (!question)
      return res
        .status(404)
        .json({ status: "error", msg: "Question not found" });

    // 2. Verify survey ownership
    const ownership = await verifySurveyOwnership(question.survey_id, hostId);
    if (ownership.error)
      return res
        .status(ownership.error)
        .json({ status: "error", msg: ownership.msg });

    // 3. Perform removal
    await prisma.question.delete({
      where: { id: Number(questionId) },
    });

    return res.json({ status: "ok", msg: "Question deleted successfully" });
  } catch (error) {
    console.error("❌ deleteQuestion Error:", error.message);
    return res
      .status(500)
      .json({ status: "error", msg: "Fail to delete question" });
  }
};
