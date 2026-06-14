import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";

import {
  globalErrorHandler,
  jsonErrorHandler,
} from "./src/middlewares/errorHandlers.js";
import surveys from "./src/routers/surveys.js";
import users from "./src/routers/users.js";
import seed from "./src/routers/seed.js";
import questions from "./src/routers/questions.js";
import responses from "./src/routers/responses.js";

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  console.log(`${req.method} method is sent to ${req.url}`);
  next();
});

app.use("/users", users);
app.use("/seed", seed);
app.use("/surveys", surveys);
app.use("/questions", questions);
app.use("/responses", responses);

app.use(jsonErrorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`the server is running on port ${PORT}`);
});

app.use(globalErrorHandler);
