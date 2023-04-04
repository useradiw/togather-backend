const express = require("express");
const router = express.Router();
const auth = require("../middleware/authentication");

const {
	getShops,
	getShop,
	createShop,
	updateShop,
	deleteShop,
} = require("../controllers/shops");

const {
	getSpaces,
	createSpace,
	getSpace,
	updateSpace,
	deleteSpace,
} = require("../controllers/space");

const {
	createBooking,
	getBooking,
	deleteBooking,
	accBooking,
	rejectBooking,
} = require("../controllers/booking");

router.route("/").get(getShops).post(auth, createShop);

router
	.route("/:id")
	.get(getShop)
	.patch(auth, updateShop)
	.delete(auth, deleteShop);

router.route("/:id/spaces").get(getSpaces).post(auth, createSpace);

router
	.route("/:shopid/spaces/:spaceid")
	.get(getSpace)
	.patch(auth, updateSpace)
	.delete(auth, deleteSpace);

router
	.route("/:shopid/spaces/:spaceid/booking")
	.get(auth, getBooking)
	.post(auth, createBooking);

router
	.route("/:shopid/spaces/:spaceid/booking/:bookingid")
	.delete(auth, deleteBooking);

router
	.route("/:shopid/spaces/:spaceid/booking/:bookingid/accept")
	.patch(auth, accBooking);
router
	.route("/:shopid/spaces/:spaceid/booking/:bookingid/reject")
	.patch(auth, rejectBooking);

module.exports = router;
