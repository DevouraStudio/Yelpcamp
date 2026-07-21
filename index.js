if (process.env.NODE_ENV !== "production") {
	require("dotenv").config()
}

const dbUrl = "mongodb://localhost:27017/Yelpcamp"

const scriptSrcUrls = [
	"https://stackpath.bootstrapcdn.com",
	"https://unpkg.com",
	"https://kit.fontawesome.com",
	"https://cdnjs.cloudflare.com",
	"https://cdn.jsdelivr.net",
	"https://tile.openstreetmap.org"
];

const styleSrcUrls = [
	"https://kit-free.fontawesome.com",
	"https://cdn.jsdelivr.net",
	"https://stackpath.bootstrapcdn.com",
	"https://unpkg.com",
	"https://fonts.googleapis.com",
	"https://use.fontawesome.com",
	"https://demotiles.maplibre.org",
	"https://tile.openstreetmap.org"
];

const connectSrcUrls = [
	"https://unpkg.com",
	"https://demotiles.maplibre.org",
	"https://tile.openstreetmap.org"
];

const fontSrcUrls = [];

const express = require("express")

const app = express()

const path = require("path")

const mongoose = require("mongoose")

const methodOverride = require("method-override")

const ejsMate = require("ejs-mate")

const ExpressError = require("./utilities/ExpressError")

const campgroundRoutes = require("./routes/campgrounds")

const reviewRoutes = require("./routes/reviews")

const userRoutes = require("./routes/users")

const session = require("express-session")

const flash = require("connect-flash")

const User = require("./models/user")

const passport = require("passport")

const LocalStrategy = require("passport-local")

const mongoSanitize = require("express-mongo-sanitize")

const helmet = require("helmet")

const MongoStore = require("connect-mongo")(session)

app.set("view engine", "ejs")

app.set("views", path.join(__dirname, "views"))

app.engine("ejs", ejsMate)

mongoose.connect(dbUrl, {
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

app.use(express.static(path.join(__dirname, "public")))

const store = new MongoStore({
	url: dbUrl,
	secret: "notasuitablesecretstring",
	touchAfter: 24 * 3600
})

store.on("error", function(e) {
	console.log(e, "Mongo session store is not working properly!")
})

const sessionConfig = {
	store,
	name: "Yelpcamp-session",
	secret: "notasuitablesecretstring",
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		// secure: true,
		expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
		maxAge: 7 * 24 * 60 * 60 * 1000
	}
}

app.use(session(sessionConfig))

app.use(flash())

app.use(mongoSanitize())

app.use(helmet({
	 crossOriginEmbedderPolicy: false
}))

app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: ["'self'", ...connectSrcUrls],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", "blob:"],
			childSrc: ["blob:"],
			objectSrc: [],
			imgSrc: [
				"'self'",
				"blob:",
				"data:",
				process.env.ARVAN_ENDPOINT,
				"https://i.postimg.cc",
				"https://loremflickr.com",
				"https://fastly.picsum.photos"
			],
			fontSrc: ["'self'", ...fontSrcUrls],
		},
	})
);

app.use(passport.initialize())

app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())

passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
	res.locals.currentUser = req.user
	res.locals.success = req.flash("success")
	res.locals.error = req.flash("error")
	next()
})

app.use("/campgrounds", campgroundRoutes)

app.use("/campgrounds/:id/reviews", reviewRoutes)

app.use("/", userRoutes)

app.get("/", (req, res) => {
	res.render("home")
})

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