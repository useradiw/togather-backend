const mongoose = require("mongoose");
const unique = require("mongoose-unique-validator");

mongoose.set("strictQuery", true);

const ShopSchema = new mongoose.Schema(
	{
		shopID: {
			type: String,
			unique: true,
			required: true,
		},
		shopName: {
			type: String,
			unique: true,
			required: true,
			uppercase: true,
			trim: true,
			minlength: [2, "Too Short"],
			maxlength: [30, "Too Long"],
		},
		owner: {
			type: String,
			ref: "user",
			required: [true, "Need host"],
		},
		location: String,
		description: {
			type: String,
			maxlength: 2000,
		},
		startShop: {
			type: Date,
			required: [true, "Set your shop opening time"],
		},
		endShop: {
			type: Date,
			required: [true, "Set your shop closing time"],
		},
	},
	{ timestamps: true }
);

ShopSchema.plugin(unique);

module.exports = mongoose.model("shop", ShopSchema);
