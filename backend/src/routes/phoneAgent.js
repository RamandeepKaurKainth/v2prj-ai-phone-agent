const express = require("express");
const router = express.Router();

router.post("/start", (req, res) => {
  res.json({
    status: "mock-started",
    message: "Phone agent will be implemented later"
  });
});

module.exports = router;
