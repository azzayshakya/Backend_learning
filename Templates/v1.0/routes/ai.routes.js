const express = require("express");
const router = express.Router();
const { generateText } = require("../controllers/ai.controller");

router.post("/ai/generate", generateText);

module.exports = router;
