import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";

// import connectDB from "./src/db/db.js";
import {
  globalErrorHandler,
  jsonErrorHandler,
} from "./src/middlewares/errorHandlers.js";
import surveys from "./src/routers/surveys.js";
import users from "./src/routers/users.js";
import seed from "./src/routers/seed.js";
import questions from "./src/routers/questions.js";
import responses from "./src/routers/responses.js";
// import appts from "./src/routers/appts.js";
// import roles from "./src/routers/roles.js";
// import auth from "./src/routers/auth.js";
// connectDB();

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(jsonErrorHandler);

app.use((req, res, next) => {
  console.log(`${req.method} method is sent to ${req.url}`);
  next();
});

// app.use("/auth", auth);
// app.use("/users/:userId", appts);
// app.use("/roles", roles);
app.use("/users", users);
app.use("/seed", seed);
app.use("/surveys", surveys);
app.use("/questions", questions);
app.use("/responses", responses);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`the server is running on port ${PORT}`);
});

app.use(globalErrorHandler);
