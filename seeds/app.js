const mongoose = require("mongoose")
const { places, descriptors } = require("./seedHelpers")
const cities = require("./cities")
const Campground = require("../models/campground")

mongoose.connect("mongodb://localhost:27017/Yelpcamp", {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true
})
.then(() => {
	console.log("Database is running!")
})
.catch((err) => {
console.log("Database is not running!!", err)
})
const sample = array => array[Math.floor(Math.random() * array.length)]
const seedDB = async () => {
	await Campground.deleteMany({})
	for (let i = 0; i < 50; i++) {
	const random1000 = Math.floor(Math.random() * 1000)
	const camp = new Campground({
		location: `${cities[random1000].city}, ${cities[random1000].state}`,
		title: `${sample(descriptors)} ${sample(places)}`
	})
	await camp.save()
	}
}
seedDB().then(() => mongoose.connection.close())