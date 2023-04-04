const Shop = require("../models/shop");
const asyncWrapper = require("../middleware/async");
const { BadRequestError, NotFoundError } = require("../errors");
const { nanoid } = require("nanoid");
const { StatusCodes } = require("http-status-codes");

const getShops = asyncWrapper(async (req, res) => {
	const shops = await Shop.find({});
	if (shops.length === 0) {
		throw new NotFoundError("No shops available");
	}

	res.status(StatusCodes.OK).json({ shops });
});

const createShop = asyncWrapper(async (req, res) => {
	req.body.shopID = "S-" + nanoid(16);
	req.body.owner = req.user.userID;

	try {
		const shop = await Shop.create(req.body);
		res.status(StatusCodes.CREATED).json({ shop });
	} catch (error) {
		throw new BadRequestError(error);
	}
});

const getShop = asyncWrapper(async (req, res) => {
	const shopID = req.params.id;
	if (!shopID) {
		throw new BadRequestError("Please provide shop id");
	}

	try {
		const shop = await Shop.findOne({ shopID });

		if (!shop) {
			throw new NotFoundError("Shop not found");
		}

		res.status(StatusCodes.OK).json({ shop });
	} catch (error) {
		throw new BadRequestError(error);
	}
});

const updateShop = asyncWrapper(async (req, res) => {
	const owner = req.user.userID;
	const shopID = req.params.id;

	const { shopName, location, description, startShop, endShop } = req.body;

	const newData = {
		shopName,
		location,
		description,
		startShop,
		endShop,
	};

	try {
		const shop = await Shop.findOneAndUpdate({ shopID, owner }, newData, {
			new: true,
			runValidators: true,
		});

		if (!shop) {
			throw new NotFoundError("Shop not found");
		}

		res.status(StatusCodes.OK).json({ shop });
	} catch (error) {
		throw new BadRequestError(error);
	}
});

const deleteShop = asyncWrapper(async (req, res) => {
	const owner = req.user.userID;
	const shopID = req.params.id;

	try {
		const shop = await Shop.findOneAndDelete({ shopID, owner });

		if (!shop) {
			throw new NotFoundError("Shop not found");
		}

		res.status(StatusCodes.OK).json({ message: "Delete shop success" });
	} catch (error) {
		throw new BadRequestError(error);
	}
});

module.exports = {
	getShops,
	getShop,
	createShop,
	updateShop,
	deleteShop,
};
