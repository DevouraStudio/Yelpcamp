const mongoose = require("mongoose")

const Review = require("./review")

const Schema = mongoose.Schema

const opts = { toJSON: { virtuals: true } }

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
}, opts)

CampgroundSchema.post("findOneAndDelete", async (doc) => {
	if (doc) {
		await Review.deleteMany({
			_id: { $in: doc.reviews }
		})
	}
})

CampgroundSchema.virtual("properties.popup").get(function() {
	return `<strong><h5 style="text-align: center;">${this.location}</h5></strong>
	<a style="text-align: left;"href="/campgrounds/${this.id}">${this.title}</a>
	<p style="text-align: left;">Price: $${this.price}</p>`
})

module.exports = mongoose.model("Campground", CampgroundSchema)