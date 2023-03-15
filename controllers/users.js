const User = require("../models/user");
const asyncWrapper = require("../middleware/async");
const { BadRequestError, NotFoundError } = require("../errors");

const getUserById = asyncWrapper(async (req, res) => {
	const userID = req.params.id;

	const user = await User.findOne({ userID });
	if (!user) {
		return res.status(404).json({ msg: `No user with ID: ${userID}` });
	}
	res.status(200).json({ user });
});

const updateUser = asyncWrapper(async (req, res) => {
	const userId = req.params.id;
	const auth = req.user.userID;

	if (userId !== auth) {
		throw new BadRequestError("You are not authorized to do this");
	}

	const data = await User.findOne({ userId });

	if (data.source !== "Local") {
		throw new BadRequestError("You register with another method");
	}

	const { userName, mobile, email, name, password } = req.body;

	const newdata = { userName, mobile, email, name, password };

	const user = await User.findOneAndUpdate({ userId }, ...newdata, {
		new: true,
		runValidators: true,
	});
	if (!user) {
		throw new NotFoundError({ msg: `No user with ID: ${userId}` });
	}
	res.status(200).json({ user });
});

const deleteUser = asyncWrapper(async (req, res) => {
	const requester = req.user.userID;
	const userID = req.params.id;

	if (requester !== userID) {
		throw new BadRequestError("Cannot delete other user");
	}

	const user = await User.deleteOne({ userID });
	if (!user) {
		return res.status(404).json({ msg: `No user with ID: ${userID}` });
	}
	res.status(200).json({ msg: `Successfully delete user with ID: ${userID}` });
});

module.exports = {
	getUserById,
	updateUser,
	deleteUser,
};
