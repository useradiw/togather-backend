const express = require("express");
const router = express.Router();

const { login, register, googleLogin } = require("../controllers/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/login/google", googleLogin);

module.exports = router;
