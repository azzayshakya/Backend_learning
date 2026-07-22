const Joi = require("joi");

const password = Joi.string()
  .min(8)
  .pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
  .required()
  .messages({
    "string.pattern.base":
      "Password must contain at least one letter and one number",
    "string.min": "Password must be at least 8 characters",
  });

const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password,
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
  deviceId: Joi.string().optional(),
});

module.exports = { signupSchema, loginSchema };
