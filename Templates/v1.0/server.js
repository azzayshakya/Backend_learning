require("dotenv").config();

const express = require("express");
const app = express();
const userRoutes = require("./routes/user.routes");
const aiRoutes = require("./routes/ai.routes");
const logger = require("./utils/logger");
const requestLogger = require("./middleware/request.logger");
const errorHandler = require("./middleware/error.handler");
const connectDB = require("./config/db");

connectDB();
app.use(express.json());
app.use(requestLogger);

app.use("/", userRoutes);
app.use("/", aiRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});
