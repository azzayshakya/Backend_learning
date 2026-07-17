const express = require("express");
const router = express.Router();

const {
  getHome,
  getUserById,
  createUser,
} = require("../controllers/user.controller");

router.get("/", getHome);

router.get("/users/:id", getUserById);

router.post("/users", createUser);

module.exports = router;
