const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./src/db/db");

const authRoutes = require("./src/routes/auth");
const phoneAgentRoutes = require("./src/routes/phoneAgent");

const app = express();

app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

db.query("SELECT 1")
  .then(() => console.log("MySQL connected"))
  .catch((err) => console.error("MySQL error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/phone-agent", phoneAgentRoutes);

app.get("/", (req, res) => {
  res.send("Backend server is running!");
});

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is healthy" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});