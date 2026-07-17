const Joi = require("joi");

// Reusable password rule: min 8 chars, needs at least one letter + one digit.
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
  password: Joi.string().required(), // no strength re-check on login, just presence
  deviceId: Joi.string().optional(), // client-supplied tag to identify this session
});

module.exports = { signupSchema, loginSchema };
