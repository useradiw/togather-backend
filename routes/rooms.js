const express = require("express");
const router = express.Router();
const auth = require("../middleware/authentication");

const {
	getRooms,
	getUserCreatedRooms,
	createRoom,
	getRoom,
	updateRoom,
	deleteRoom,
	joinRoom,
	leaveRoom,
} = require("../controllers/rooms");

router.route("/").get(getRooms);

router.route("/auth").get(auth, getUserCreatedRooms).post(auth, createRoom);

router
	.route("/auth/:id")
	.get(getRoom)
	.patch(auth, updateRoom)
	.delete(auth, deleteRoom);

router.route("/auth/:id/join").patch(auth, joinRoom);
router.route("/auth/:id/leave").patch(auth, leaveRoom);

module.exports = router;
