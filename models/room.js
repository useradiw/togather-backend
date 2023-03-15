const mongoose = require("mongoose");
const unique = require("mongoose-unique-validator");
const { DateTime } = require("luxon");

mongoose.set("strictQuery", true);

const RoomSchema = new mongoose.Schema(
	{
		roomID: {
			type: String,
			unique: true,
			required: true,
		},
		roomName: {
			type: String,
			unique: true,
			required: true,
			uppercase: true,
			trim: true,
			minlength: [2, "Too Short"],
			maxlength: [30, "Too Long"],
		},
		status: {
			type: String,
			enum: [
				"Recruiting",
				"Full",
				"Tommorow",
				"In progress",
				"Held",
				"Cancelled",
			],
			default: function () {
				if (this.members.length === this.membersCount) {
					return "Full";
				}
				return "Recruiting";
			},
		},
		createdBy: {
			type: String,
			ref: "user",
			required: [true, "Need host"],
		},
		location: String,
		eventDate: {
			type: Date,
			default: DateTime.now().plus({ days: 1 }),
			min: DateTime.now().plus({ hours: 10 }),
		},
		membersCount: {
			type: Number,
			default: 1,
			min: [0, "Cannot be negative"],
		},
		members: {
			type: [String],
			ref: "user",
		},
		description: {
			type: String,
			maxlength: 2000,
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

RoomSchema.plugin(unique);

module.exports = mongoose.model("room", RoomSchema);
