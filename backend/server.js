const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./src/db/db");

const authRoutes = require("./src/routes/auth");
const phoneAgentRoutes = require("./src/routes/phoneAgent");

const app = express();
app.use(cors());
app.use(express.json());

db.query("SELECT 1")
  .then(() => console.log("MySQL connected"))
  .catch(err => console.error("MySQL error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/phone-agent", phoneAgentRoutes);

app.get("/", (req, res) => {
  res.send("Backend server is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});