const { StatusCodes } = require("http-status-codes");
const Room = require("../models/room");
const Shop = require("../models/shop");
const Space = require("../models/space");
const Booking = require("../models/booking");
const asyncWrapper = require("../middleware/async");
const { BadRequestError, NotFoundError } = require("../errors");
const { nanoid } = require("nanoid");

const createBooking = asyncWrapper(async (req, res) => {
	const userID = req.user.userID;
	const shopID = req.params.shopid;
	const spaceID = req.params.spaceid;
	const roomID = req.body.roomID;

	const room = await Room.findOne({ roomID });
	if (!room) {
		throw new NotFoundError("Room not found");
	}
	if (room.createdBy !== userID) {
		throw new BadRequestError("Unauthorized User");
	}

	const space = await Space.findOne({ shopID, spaceID });
	if (!space) {
		throw new NotFoundError("Space not found");
	}

	const participants = room.membersCount + 1;
	if (space.capacity < participants) {
		throw new BadRequestError("Not Enough Capacity");
	}

	const bookingID = nanoid(8);
	const start = new Date(req.body.start);
	const end = new Date(req.body.end);

	const shop = await Shop.findOne({ shopID });
	const oldBooking = await Booking.find({
		shopID,
		spaceID,
		status: "Accepted",
	});

	if (start < shop.startShop || end > shop.endShop) {
		throw new BadRequestError(
			"Requested time interval is not within shop's working hours"
		);
	}

	const bookingsData = oldBooking.map((Booking) => ({
		start: new Date(Booking.start),
		end: new Date(Booking.end),
	}));

	const booked = function (start, end) {
		for (let bookingData of bookingsData) {
			if (
				(start >= bookingData.start && start < bookingData.end) ||
				(end > bookingData.start && end <= bookingData.end) ||
				(start < bookingData.start && end > bookingData.end)
			) {
				console.log(start, bookingData.start, end, bookingData.end);
				return true; // booking overlaps with requested time interval
			}
		}
		return false; // no overlapping booking found
	};
	if (booked(start, end)) {
		throw new BadRequestError("The requested time interval is already booked");
	}

	const Data = { bookingID, roomID, shopID, spaceID, start, end };

	try {
		const booking = await Booking.create(Data);
		space.bookingReq.push(booking.bookingID);
		await space.save();
		res.status(StatusCodes.CREATED).json({ space, booking });
	} catch (error) {
		throw new BadRequestError(error);
	}
});

const getBooking = asyncWrapper(async (req, res) => {
	const userID = req.user.userID;
	const shopID = req.params.shopid;
	const spaceID = req.params.spaceid;

	const shop = await Shop.findOne({ shopID });
	if (shop.owner !== userID) {
		throw new BadRequestError("You are not the shop owner");
	}

	try {
		const booking = await Booking.find({ shopID, spaceID });
		res.status(StatusCodes.OK).json({ booking, count: booking.length });
	} catch (error) {
		throw new BadRequestError(error);
	}
});

const deleteBooking = asyncWrapper(async (req, res) => {
	const shopID = req.params.shopid;
	const spaceID = req.params.spaceid;
	const bookingID = req.params.bookingid;

	try {
		const booking = await Booking.findOneAndDelete({
			shopID,
			spaceID,
			bookingID,
		});

		if (!booking) {
			throw new NotFoundError("Booking not found");
		}

		const space = await Space.findOne({ shopID, spaceID });
		if (!space) {
			throw new NotFoundError("Space not found");
		}
		space.bookingReq.pull(bookingID);
		space.booking.pull(bookingID);
		await space.save();

		res.status(StatusCodes.OK).json({ message: "Delete booking success" });
	} catch (error) {
		throw new BadRequestError(error);
	}
});

const accBooking = asyncWrapper(async (req, res) => {
	const userID = req.user.userID;
	const shopID = req.params.shopid;
	const spaceID = req.params.spaceid;
	const bookingID = req.params.bookingid;

	const shop = await Shop.findOne({ shopID });
	if (shop.owner !== userID) {
		throw new BadRequestError("You are not the shop owner");
	}

	try {
		const booking = await Booking.findOneAndUpdate(
			{ bookingID, shopID, spaceID },
			{ status: "Accepted" },
			{
				new: true,
				runValidators: true,
			}
		);
		if (!booking) {
			throw new NotFoundError("Booking not found");
		}
		const space = await Space.findOneAndUpdate(
			{ shopID, spaceID },
			{ $pull: { bookingReq: booking.bookingID } },
			{
				new: true,
				runValidators: true,
			}
		);
		if (!space) {
			throw new NotFoundError("Space not found");
		}
		space.booking.push(booking.bookingID);
		await space.save();
		res.status(StatusCodes.OK).json({ booking, space });
	} catch (error) {
		throw new BadRequestError(error);
	}
});

const rejectBooking = asyncWrapper(async (req, res) => {
	const userID = req.user.userID;
	const shopID = req.params.shopid;
	const spaceID = req.params.spaceid;
	const bookingID = req.params.bookingid;

	const shop = await Shop.findOne({ shopID });
	if (shop.owner !== userID) {
		throw new BadRequestError("You are not the shop owner");
	}

	try {
		const booking = await Booking.findOneAndUpdate(
			{ bookingID, shopID, spaceID },
			{ status: "Rejected" },
			{
				new: true,
				runValidators: true,
			}
		);
		if (!booking) {
			throw new NotFoundError("Booking not found");
		}
		const space = await Space.findOne({ shopID, spaceID });
		if (!space) {
			throw new NotFoundError("Space not found");
		}
		space.bookingReq.pull(booking.bookingID);
		space.booking.pull(booking.bookingID);
		await space.save();
		res.status(StatusCodes.OK).json({ booking, space });
	} catch (error) {
		throw new BadRequestError(error);
	}
});

module.exports = {
	createBooking,
	getBooking,
	deleteBooking,
	accBooking,
	rejectBooking,
};
