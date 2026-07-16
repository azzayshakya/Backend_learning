const ApiError = require("../utils/apiError");

const validate = (schema) => (req, res, next) => {
  try {
    if (schema.body) req.body = schema.body.parse(req.body);
    if (schema.params) req.params = schema.params.parse(req.params);
    if (schema.query) req.query = schema.query.parse(req.query);
    next();
  } catch (err) {
    const errors = err.errors?.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    })) || [{ message: err.message }];
    next(ApiError.badRequest("Validation failed", errors));
  }
};

module.exports = validate;
