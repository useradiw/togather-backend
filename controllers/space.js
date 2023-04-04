const Shop = require("../models/shop");
const Space = require("../models/space");
const asyncWrapper = require("../middleware/async");
const { BadRequestError, NotFoundError } = require("../errors");
const { customAlphabet } = require("nanoid");
const { StatusCodes } = require("http-status-codes");

const getSpaces = asyncWrapper(async (req, res) => {
	const spaces = await Space.find({ shopID: req.params.id });
	if (spaces.length === 0) {
		throw new NotFoundError("No spaces available");
	}

	res.status(StatusCodes.OK).json({ spaces });
});

const createSpace = asyncWrapper(async (req, res) => {
	const nanoid = customAlphabet("0123456789", 4);
	req.body.spaceID = nanoid();
	req.body.shopID = req.params.id;

	const shop = await Shop.findOne({ shopID: req.params.id });
	if (shop.owner !== req.user.userID) {
		throw new BadRequestError("Cannot create space");
	}

	try {
		const space = await Space.create(req.body);
		res.status(StatusCodes.CREATED).json({ space });
	} catch (error) {
		throw new BadRequestError(error);
	}
});

const getSpace = asyncWrapper(async (req, res) => {
	try {
		const space = await Space.findOne({
			shopID: req.params.shopid,
			spaceID: req.params.spaceid,
		});

		if (!space) {
			throw new NotFoundError("Space not found");
		}

		res.status(StatusCodes.OK).json({ space });
	} catch (error) {
		throw new BadRequestError(error);
	}
});

const updateSpace = asyncWrapper(async (req, res) => {
	const shop = await Shop.findOne({ shopID: req.params.shopid });
	if (shop.owner !== req.user.userID) {
		throw new BadRequestError("Cannot update space");
	}

	const { spaceName, description } = req.body;

	const newData = {
		spaceName,
		description,
	};

	try {
		const space = await Space.findOneAndUpdate(
			{ shopID: req.params.shopid, spaceID: req.params.spaceid },
			newData,
			{
				new: true,
				runValidators: true,
			}
		);

		if (!space) {
			throw new NotFoundError("Space not found");
		}

		res.status(StatusCodes.OK).json({ space });
	} catch (error) {
		throw new BadRequestError(error);
	}
});

const deleteSpace = asyncWrapper(async (req, res) => {
	const shop = await Shop.findOne({ shopID: req.params.shopid });
	if (shop.owner !== req.user.userID) {
		throw new BadRequestError("Cannot delete space");
	}

	try {
		const space = await Space.findOneAndDelete({
			shopID: req.params.shopid,
			spaceID: req.params.spaceid,
		});

		if (!space) {
			throw new NotFoundError("Space not found");
		}

		res.status(StatusCodes.OK).json({ message: "Delete space success" });
	} catch (error) {
		throw new BadRequestError(error);
	}
});

module.exports = {
	getSpaces,
	createSpace,
	getSpace,
	updateSpace,
	deleteSpace,
};
