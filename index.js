const express = require("express")
const app = express()
const path = require("path")
const mongoose = require("mongoose")
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")
const ExpressError = require("./utilities/ExpressError")
const campgrounds = require("./routes/campgrounds")
const reviews = require("./routes/reviews")
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.engine("ejs", ejsMate)
mongoose.connect("mongodb://localhost:27017/Yelpcamp", {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true
})
	.then(() => {
		console.log("Database is running!")
	})
	.catch((err) => {
		console.log(err, "Database is not running!!")
	})
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
app.use("/campgrounds", campgrounds)
app.use("/campgrounds/:id/reviews", reviews)
app.all("*", (req, res, next) => {
	next(new ExpressError("Page Not Found!", 404))
})
app.use((err, req, res, next) => {
	const { statusCode = 500 } = err
	if (!err.message) err.message = "Something went wrong, Please try again later."
	res.status(statusCode).render("error", { err })
})
app.listen(3000, () => {
	console.log("Server running on port 3000!")
})