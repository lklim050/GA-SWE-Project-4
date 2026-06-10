import { body } from "express-validator";

export const validateRegistrationData = [
  body("username", "username is required").exists(),
  body("username", "username has 10 to 50 characters").isLength({
    min: 10,
    max: 50,
  }),
  body("password", "password is required").exists(),
  body("password", "password has 10 to 50 characters").isLength({
    min: 10,
    max: 50,
  }),
];

export const validateLoginData = [
  body("username", "username is required").exists().trim().notEmpty(),
  body("password", "passowrd is required").exists().trim().notEmpty(),
];
