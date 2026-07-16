const users = require("../models/user.model");
const logger = require("../utils/logger");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

// GET /
const getHome = (req, res) => {
  logger.info("Home route accessed");

  res.status(200).json(ApiResponse(200, null, "Backend is working"));
};

// GET /users/:id
const getUserById = (req, res, next) => {
  try {
    const id = Number(req.params.id);

    logger.info(`Fetching user with id: ${id}`);

    // Bad Request
    if (isNaN(id)) {
      throw ApiError.badRequest("User ID must be a number");
    }

    const user = users.find((user) => user.id === id);

    // Not Found
    if (!user) {
      logger.warn(`User with id ${id} not found`);
      throw ApiError.notFound("User not found");
    }

    logger.info(`User ${id} fetched successfully`);

    res.status(200).json(ApiResponse(200, user, "User fetched successfully"));
  } catch (err) {
    logger.error(err);
    next(err);
  }
};

// POST /users
const createUser = (req, res, next) => {
  try {
    const { name, email } = req.body;

    // Bad Request
    if (!name || !email) {
      throw ApiError.badRequest("Name and Email are required");
    }

    // Conflict
    const existingUser = users.find((user) => user.email === email);

    if (existingUser) {
      throw ApiError.conflict("Email already exists");
    }

    logger.info(`Creating user ${name}`);

    const newUser = {
      id: users.length + 1,
      name,
      email,
    };

    users.push(newUser);

    logger.info(`User created successfully`);

    res
      .status(201)
      .json(ApiResponse(201, newUser, "User created successfully"));
  } catch (err) {
    logger.error(err);
    next(err);
  }
};

module.exports = {
  getHome,
  getUserById,
  createUser,
};
