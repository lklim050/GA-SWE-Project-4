import { body } from "express-validator";

export const validateRegistrationData = [
  body("email", "email is required").trim().notEmpty(),
  body("name", "name has 10 to 50 characters").isLength({
    min: 10,
    max: 50,
  }),
  body("password", "password is required").trim().notEmpty(),
  body("password", "password has 10 to 50 characters").isLength({
    min: 10,
    max: 50,
  }),
];

export const validateLoginData = [
  body("email", "email is required").exists().trim().notEmpty(),
  body("password", "passowrd is required").exists().trim().notEmpty(),
];
