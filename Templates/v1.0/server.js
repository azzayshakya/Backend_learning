require("dotenv").config();
const cookieParser = require("cookie-parser");

const express = require("express");
const app = express();
const cors = require("cors");
const userRoutes = require("./routes/user.routes");
const aiRoutes = require("./routes/ai.routes");
const logger = require("./utils/logger");
const requestLogger = require("./middleware/request.logger");
const errorHandler = require("./middleware/error.handler");
const connectDB = require("./config/db");
const redisClient = require("./services/redis.client");
connectDB();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());
app.use(requestLogger);
app.use(cookieParser());
app.use("/", userRoutes);
app.use("/", aiRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});
