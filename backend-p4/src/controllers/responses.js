import prisma from "../db/prisma.js";

export const submitSurveyResponse = async (req, res) => {
  try {
    const { survey_id, answers_payload } = req.body;
    const userId = req.decoded?.id || req.decoded?.uuid;

    if (!userId) {
      return res
        .status(401)
        .json({ status: "error", msg: "User not found or login" });
    }

    // 1. Target Survey Checks
    const survey = await prisma.survey.findUnique({
      where: { id: Number(survey_id) },
    });

    if (!survey) {
      return res.status(404).json({ status: "error", msg: "Survey not found" });
    }

    if (!survey.is_published) {
      return res.status(400).json({
        status: "error",
        msg: "Cannot submit responses to an unpublished survey",
      });
    }

    // 2. Double Submission Guard Check
    const existingResponse = await prisma.surveyResponse.findUnique({
      where: {
        user_id_survey_id: {
          user_id: userId,
          survey_id: Number(survey_id),
        },
      },
    });

    if (existingResponse) {
      return res.status(400).json({
        status: "error",
        msg: "You have already completed this survey and claimed your points!",
      });
    }

    // 3. Database Transaction: Atomic write for the response row and points reward payout
    const result = await prisma.$transaction(async (tx) => {
      // Step A: Store the response payload structure
      const newResponse = await tx.surveyResponse.create({
        data: {
          user_id: userId,
          survey_id: Number(survey_id),
          answers_payload: answers_payload, // Directly injects the JSON array package
          status: "completed", // Overriding default "pending" since submission is successful
        },
      });

      // Step B: Increment the commuter's points balance automatically
      const updatedUser = await tx.user.update({
        where: { uuid: userId },
        data: {
          points_bal: {
            increment: survey.points_reward,
          },
        },
      });

      return { newResponse, newBalance: updatedUser.points_bal };
    });

    // 4. Return successful response containing payout statements
    return res.status(201).json({
      status: "ok",
      msg: "Survey submitted successfully! Points credited.",
      reward_points: survey.points_reward,
      new_total_balance: result.newBalance,
      response_id: result.newResponse.id,
    });
  } catch (error) {
    console.error("❌ submitSurveyResponse Error:", error.message);
    return res
      .status(500)
      .json({ status: "error", msg: "Fail to submit survey response" });
  }
};

export const getSurveyResults = async (req, res) => {
  try {
    const surveyId = Number(req.params.surveyId);
    const hostId = req.decoded?.id || req.decoded?.uuid;

    // 1. Verify ownership: Ensure the host running analytics actually owns this survey
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
    });

    if (!survey)
      return res.status(404).json({ status: "error", msg: "Survey not found" });
    if (survey.created_by !== hostId) {
      return res
        .status(403)
        .json({ status: "error", msg: "Unauthorised access to analytics" });
    }

    // 2. Fetch all questions belonging to this survey (to map out option defaults)
    const questions = await prisma.question.findMany({
      where: { survey_id: surveyId },
      orderBy: { id: "asc" },
    });

    // 3. Fetch all recorded responses submitted by commuters
    const responses = await prisma.surveyResponse.findMany({
      where: { survey_id: surveyId },
    });

    const totalSubmissions = responses.length;

    // 4. Initialize our Analytics Structure package
    const analyticsSummary = {};

    questions.forEach((q) => {
      if (q.type === "TEXT") {
        analyticsSummary[q.id] = {
          question_text: q.question_text,
          type: q.type,
          text_responses: [], // Text inputs will hold an array of strings literately
        };
      } else {
        // For RADIO, CHECKBOX, SELECT: Initialize all configured options with a count of 0
        const optionCounts = {};
        if (Array.isArray(q.options)) {
          q.options.forEach((opt) => {
            optionCounts[opt] = 0;
          });
        }

        analyticsSummary[q.id] = {
          question_text: q.question_text,
          type: q.type,
          counts: optionCounts,
          total_selections_counted: 0,
        };
      }
    });

    // 5. Loop through the JSON payloads and aggregate values
    responses.forEach((resp) => {
      const payload = resp.answers_payload; // This is the JSON array from the DB

      if (!Array.isArray(payload)) return;

      payload.forEach((item) => {
        const { question_id, answer } = item;

        // Skip if the question no longer exists in the summary tracking object
        if (!analyticsSummary[question_id]) return;

        const targetQuestion = analyticsSummary[question_id];

        if (targetQuestion.type === "TEXT") {
          // Push plain strings directly if answer exists and isn't empty
          if (answer && typeof answer === "string" && answer.trim() !== "") {
            targetQuestion.text_responses.push(answer.trim());
          }
        } else {
          // Handle Choice Inputs (RADIO, SELECT, CHECKBOX)
          if (Array.isArray(answer)) {
            // Checkbox multi-selections arrive as arrays
            answer.forEach((individualChoice) => {
              if (targetQuestion.counts[individualChoice] !== undefined) {
                targetQuestion.counts[individualChoice] += 1;
                targetQuestion.total_selections_counted += 1;
              }
            });
          } else if (answer !== undefined && answer !== null) {
            // Radio & Dropdown Select selections arrive as a single string/value
            if (targetQuestion.counts[answer] !== undefined) {
              targetQuestion.counts[answer] += 1;
              targetQuestion.total_selections_counted += 1;
            }
          }
        }
      });
    });

    // 6. Return the processed aggregated data package
    return res.json({
      status: "ok",
      survey_title: survey.title,
      total_submissions: totalSubmissions,
      analytics: analyticsSummary,
    });
  } catch (error) {
    console.error("❌ getSurveyAnalytics Error:", error.message);
    return res
      .status(500)
      .json({ status: "error", msg: "Fail to compile survey analytics" });
  }
};
