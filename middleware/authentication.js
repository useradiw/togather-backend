const jwt = require("jsonwebtoken");
const { UnauthenticatedError } = require("../errors");

const auth = (req, res, next) => {
	//check header

	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		throw new UnauthenticatedError("Authentication invalid");
	}

	const token = authHeader.split(" ")[1];

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);

		//attach the user to the room routes
		req.user = { userID: payload.userID };
		next();
	} catch (error) {
		throw new UnauthenticatedError("Authentication invalid");
	}
};

module.exports = auth;
