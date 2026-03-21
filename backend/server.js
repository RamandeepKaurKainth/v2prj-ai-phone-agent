const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./src/db/db");

// Import routes
const authRoutes = require("./src/routes/auth");
const aiRoutes = require("./src/routes/ai");
const phoneAgentRoutes = require("./src/routes/phoneAgent");

const app = express();
app.use(cors());
app.use(express.json());

// Test DB connection
db.query("SELECT 1")
  .then(() => console.log("MySQL connected"))
  .catch(err => console.error("MySQL error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/phone-agent", phoneAgentRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend server is running!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});
