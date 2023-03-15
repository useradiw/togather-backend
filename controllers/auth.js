const User = require("../models/user");
const { OAuth2Client } = require("google-auth-library");
const { StatusCodes } = require("http-status-codes");
const { nanoid } = require("nanoid");
const asyncWrapper = require("../middleware/async");
const { BadRequestError, UnauthenticatedError } = require("../errors");

const register = asyncWrapper(async (req, res) => {
	const { name, email, mobile, userName, password } = req.body;
	const userID = nanoid(36);

	const newUser = {
		name,
		email,
		mobile,
		userID,
		userName,
		password,
	};

	if (!password || password.length < 8) {
		throw new BadRequestError(
			"Please set your password, at least 8 characters"
		);
	}

	try {
		const user = await User.create({ ...newUser });
		const token = user.createJWT();

		res
			.status(StatusCodes.CREATED)
			.json({ user: { username: user.userName }, token });
	} catch (error) {
		throw new BadRequestError(error);
	}
});

const login = asyncWrapper(async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		throw new BadRequestError("Please provide email and password");
	}

	const user = await User.findOne({ email });

	if (!user) {
		throw new UnauthenticatedError("Invalid Credentials");
	}

	if (user.source !== "Local") {
		throw new BadRequestError(
			"You have previously signed up with a different signin method"
		);
	}

	const isCorrectPassword = await user.validatePassword(password);

	if (!isCorrectPassword) {
		throw new UnauthenticatedError("Invalid Credentials");
	}

	const token = user.createJWT();
	res.status(StatusCodes.OK).json({ user: { username: user.userName }, token });
});

const googleLogin = asyncWrapper(async (req, res) => {
	const credential = req.body.credential;
	const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

	try {
		const ticket = await client.verifyIdToken({
			idToken: credential,
			audience: process.env.GOOGLE_CLIENT_ID,
		});
		const payload = ticket.getPayload();
		const { email, name, given_name } = payload;
		const userID = nanoid(36);
		const userName = given_name;
		const source = "Google";
		const newUser = {
			name,
			email,
			userID,
			userName,
			source,
		};
		const user = await User.findOne({ email });
		if (!user) {
			const user = await User.create({ ...newUser });
			const token = user.createJWT();
			res
				.status(StatusCodes.OK)
				.json({ user: { username: user.userName }, token });
		}
		const token = user.createJWT();
		res
			.status(StatusCodes.OK)
			.json({ user: { username: user.userName }, token });
	} catch (error) {
		throw new BadRequestError(error);
	}
});

module.exports = { register, login, googleLogin };
