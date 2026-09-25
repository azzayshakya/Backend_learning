import express from "express";

const app = express();
const PORT = process.env.PORT || 4001;

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running smoothly",
  });
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
