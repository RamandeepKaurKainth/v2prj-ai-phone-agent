const express = require("express");
const router = express.Router();

const {
  register,
  login,
  verify,
  forgotPassword,
  resetPassword
} = require("../auth/controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/me", verify);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;