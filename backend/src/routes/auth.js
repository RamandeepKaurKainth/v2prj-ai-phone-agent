const express = require("express");
const router = express.Router();
const { register, login, verify } = require("../auth/controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/me", verify);

module.exports = router;