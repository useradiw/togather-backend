const express = require("express");
const router = express.Router();
const auth = require("../middleware/authentication");
const { getUserById, updateUser, deleteUser } = require("../controllers/users");

router
	.route("/:id")
	.get(auth, getUserById)
	.patch(auth, updateUser)
	.delete(auth, deleteUser);

module.exports = router;
