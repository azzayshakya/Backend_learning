const ApiError = require("../utils/apiError");

const validateRequest = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // collect ALL validation errors, not just the first
    stripUnknown: true, // silently drop fields not defined in the schema
  });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return next(ApiError.badRequest("Validation failed", errors));
  }

  req.body = value; // replace with sanitized/coerced values
  next();
};

module.exports = validateRequest;
