const mongoose = require("mongoose");
const unique = require("mongoose-unique-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

mongoose.set("strictQuery", true);

const UserSchema = new mongoose.Schema(
	{
		userID: {
			type: String,
			unique: true,
			required: true,
		},
		userName: {
			type: String,
			unique: [true, "Already taken"],
			required: [true, "Need username"],
			trim: true,
			lowercase: true,
			match: [/^[a-zA-Z0-9]+$/, "is invalid"],
			index: true,
		},
		mobile: {
			type: String,
			match: [
				/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
				"not a valid input",
			],
			trim: true,
			minlength: [10, "too short"],
			maxlength: [15, "too long"],
		},
		email: {
			type: String,
			required: [true, "Email required"],
			match: [/\S+@\S+\.\S+/, "is invalid"],
			index: true,
			unique: [true, "There is account with that email already"],
		},
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
			minlength: [2, "Name need minimum 2 characters"],
		},
		password: {
			type: String,
		},
		source: {
			type: String,
			enum: ["Local", "Google"],
			default: "Local",
		},
	},
	{ timestamps: true }
);

UserSchema.pre("save", async function (next) {
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

UserSchema.methods.createJWT = function () {
	return jwt.sign({ userID: this.userID }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_LIFETIME,
	});
};

UserSchema.methods.validatePassword = async function (sentPassword) {
	const isMatch = await bcrypt.compare(sentPassword, this.password);
	return isMatch;
};

UserSchema.plugin(unique);

module.exports = mongoose.model("user", UserSchema);
