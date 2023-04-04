const mongoose = require("mongoose");
const unique = require("mongoose-unique-validator");

mongoose.set("strictQuery", true);

const BookingSchema = new mongoose.Schema(
	{
		bookingID: {
			type: String,
			unique: true,
			required: true,
		},
		status: {
			type: String,
			enum: ["Applying", "Rejected", "Accepted"],
			default: "Applying",
		},
		roomID: {
			type: String,
			ref: "room",
			required: [true, "Room ID required"],
		},
		shopID: {
			type: String,
			ref: "shop",
		},
		spaceID: {
			type: String,
			ref: "space",
		},
		start: {
			type: Date,
			required: [true, "Select event start date"],
		},
		end: {
			type: Date,
			required: [true, "Select event end date"],
		},
	},
	{ timestamps: true }
);

BookingSchema.plugin(unique);

module.exports = mongoose.model("booking", BookingSchema);
