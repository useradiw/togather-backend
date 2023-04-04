const mongoose = require("mongoose");
const unique = require("mongoose-unique-validator");

mongoose.set("strictQuery", true);

const SpaceSchema = new mongoose.Schema(
	{
		spaceID: {
			type: String,
			required: true,
		},
		spaceName: {
			type: String,
			unique: true,
			required: true,
			uppercase: true,
			trim: true,
			minlength: [2, "Too Short"],
			maxlength: [30, "Too Long"],
		},
		shopID: {
			type: String,
			ref: "shop",
			required: [true, "Need shop"],
		},
		description: {
			type: String,
			maxlength: 2000,
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
		bookingReq: [String],
		booking: [String],
		capacity: {
			type: Number,
			default: 0,
			required: [true, "Please declare the capacity"],
		},
	},
	{ timestamps: true }
);

SpaceSchema.plugin(unique);

module.exports = mongoose.model("space", SpaceSchema);
