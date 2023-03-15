const { StatusCodes } = require("http-status-codes");
const Room = require("../models/room");
const asyncWrapper = require("../middleware/async");
const { BadRequestError, NotFoundError } = require("../errors");
const { nanoid } = require("nanoid");

const getRooms = asyncWrapper(async (req, res) => {
	const rooms = await Room.find({});
	if (rooms.length === 0) {
		throw new NotFoundError("No rooms available");
	}

	res.status(StatusCodes.OK).json({ rooms });
});

const getUserCreatedRooms = asyncWrapper(async (req, res) => {
	const rooms = await Room.find({ createdBy: req.user.userID }).sort(
		"createdAt"
	);
	if (rooms.length === 0) {
		throw new NotFoundError("No rooms available");
	}
	res.status(StatusCodes.OK).json({ rooms, count: rooms.length });
});

const createRoom = asyncWrapper(async (req, res) => {
	req.body.roomID = "R-" + nanoid(21);
	req.body.createdBy = req.user.userID;
	const members = req.body.members;
	const membersCount = req.body.membersCount;

	if (members !== undefined) {
		if (membersCount === undefined) {
			const defaultCount = 1;
			if (members.length > defaultCount) {
				throw new BadRequestError("Too many members");
			}
		}

		if (membersCount !== undefined && members.length > membersCount) {
			throw new BadRequestError("Too many members");
		}
	}

	try {
		const room = await Room.create(req.body);
		res.status(StatusCodes.CREATED).json({ room });
	} catch (error) {
		throw new BadRequestError(error);
	}
});

const getRoom = asyncWrapper(async (req, res) => {
	const roomID = req.params.id;
	if (!roomID) {
		throw new BadRequestError("Please provide room id");
	}

	try {
		const room = await Room.findOne({ roomID });

		if (!room) {
			throw new NotFoundError("Room not found");
		}

		res.status(StatusCodes.OK).json({ room });
	} catch (error) {
		throw new BadRequestError(error);
	}
});

const updateRoom = asyncWrapper(async (req, res) => {
	const createdBy = req.user.userID;
	const roomID = req.params.id;

	const { roomName, members, location, eventDate, membersCount, description } =
		req.body;

	const newData = {
		roomName,
		members,
		location,
		eventDate,
		membersCount,
		description,
	};

	try {
		const data = await Room.findOne({ roomID, createdBy });
		if (!data) {
			throw new NotFoundError("Room not found");
		}

		if (
			members.length > membersCount ||
			members.length > data.membersCount ||
			data.members.length > membersCount
		) {
			throw new BadRequestError("Too many members");
		}

		const room = await Room.findOneAndUpdate({ roomID, createdBy }, newData, {
			new: true,
			runValidators: true,
		});

		if (!room) {
			throw new NotFoundError("Room not found");
		}

		res.status(StatusCodes.OK).json({ room });
	} catch (error) {
		throw new BadRequestError(error);
	}
});

const deleteRoom = asyncWrapper(async (req, res) => {
	const userID = req.user.userID;
	const roomID = req.params.id;

	try {
		const room = await Room.findOneAndDelete({ createdBy: userID, roomID });

		if (!room) {
			throw new NotFoundError("Room not found");
		}

		res.status(StatusCodes.OK).json({ message: "Delete room success" });
	} catch (error) {
		throw new BadRequestError(error);
	}
});

const joinRoom = asyncWrapper(async (req, res) => {
	const userID = req.user.userID;
	const roomID = req.params.id;

	try {
		const room = await Room.findOne({ roomID });

		if (userID === room.createdBy) {
			throw new BadRequestError("You are the host");
		}

		if (room.members.length === room.membersCount) {
			throw new BadRequestError("Room Full");
		}

		const check = room.members.find((member) => member === userID);

		if (check) {
			throw new BadRequestError("You are already in the list");
		}

		room.members.push(userID);
		await room.save();

		res.status(StatusCodes.OK).json({ room, count: room.members.length });
	} catch (error) {
		throw new BadRequestError(error);
	}
});

const leaveRoom = asyncWrapper(async (req, res) => {
	const userID = req.user.userID;
	const roomID = req.params.id;

	try {
		const room = await Room.findOneAndUpdate(
			{ roomID },
			{ $pull: { members: userID } },
			{
				new: true,
				runValidators: true,
			}
		);

		res.status(StatusCodes.OK).json({ room, count: room.members.length });
	} catch (error) {
		throw new BadRequestError(error);
	}
});

module.exports = {
	getRooms,
	getUserCreatedRooms,
	createRoom,
	getRoom,
	updateRoom,
	deleteRoom,
	joinRoom,
	leaveRoom,
};
