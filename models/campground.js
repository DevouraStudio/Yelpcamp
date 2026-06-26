const mongoose = require("mongoose")

const Review = require("./review")

const Schema = mongoose.Schema

const CampgroundSchema = new Schema({
	title: String,
	images: [
		{
			url: String,
			filename: String
		}
	],
	price: Number,
	description: String,
	location: String,
	geometry: {
		type: {
			type: String,
			enum: ["Point"],
			required: true
		},
		coordinates: {
			type: [Number],
			required: true
		}
	},
	reviews: [{
		type: Schema.Types.ObjectId,
		ref: "Review"
	}],
	author: {
		type: Schema.Types.ObjectId,
		ref: "User"
	}
})

CampgroundSchema.post("findOneAndDelete", async (doc) => {
	if (doc) {
		await Review.deleteMany({
			_id: { $in: doc.reviews }
		})
	}
})

module.exports = mongoose.model("Campground", CampgroundSchema)