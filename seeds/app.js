const mongoose = require("mongoose")
const { places, descriptors } = require("./seedHelpers")
const cities = require("./cities")
const Campground = require("../models/campground")
const axios = require("axios")

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
		const res = await axios.get("https://random.imagecdn.app/v1/image?width=500&height=500&category=nature&format=text")
		const random1000 = Math.floor(Math.random() * 1000)
		const randomPrice = Math.floor(Math.random() * 20) + 10
		const camp = new Campground({
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			image: res.data,
			price: randomPrice,
			description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore corrupti suscipit itaque sed. Perspiciatis magnam maiores tempore nesciunt exercitationem consectetur atque porro corporis at tenetur blanditiis, dolorum quo ea! Impedit?"
		})
		await camp.save()
	}
}
seedDB().then(() => mongoose.connection.close())