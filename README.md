# 🏕️ Yelpcamp
 
A full-stack campground discovery and review application where users can browse campgrounds, view photo galleries and interactive maps, search listings, leave star-rated reviews, and manage their own listings. Built with Node.js, Express, and MongoDB.
 
This project started from the Colt Steele Web Developer Bootcamp curriculum and has grown well past the tutorial baseline — original features include MapLibre-based cluster maps, regex-based search, dark mode, OAuth login, and hardened security middleware.
 
---
 
## 📑 Table of Contents
 
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Seeding](#-database-seeding)
- [Routes Overview](#-routes-overview)
- [Data Models](#️-data-models)
- [Authentication & Authorization](#-authentication--authorization)
- [Image Uploads](#️-image-uploads)
- [Roadmap](#-roadmap)
- [A Note on Versions](#-a-note-on-versions)
- [License](#-license)
---
 
## ✨ Features
 
- **Campground CRUD** — create, view, edit, and delete campground listings, each with a title, location, price, description, and images
- **Authentication** — local username/password via Passport.js (`passport-local` + `passport-local-mongoose`) **and** Google OAuth (`passport-google-oauth20` + `mongoose-findorcreate`)
- **Authorization** — only the original author can edit or delete their own campgrounds and reviews; protected routes redirect unauthenticated users back to their intended page after login
- **Reviews & Star Ratings** — logged-in users can leave a written review with a 1–5 star rating on any campground
- **Campground Search** — regex-based whole-word search (chosen over MongoDB `$text`, which only does whole-token matching, not substrings)
- **Multi-Image Uploads** — upload multiple campground photos at once, stored on ArvanCloud (S3-compatible object storage) via Multer + multer-s3
- **Interactive Maps** — a cluster map on the campgrounds index and a per-campground location map on the show page, built with MapLibre GL JS + Protomaps vector tiles (in place of Mapbox, due to access/billing constraints)
- **Security Hardening** — Helmet (with a tuned CSP), `express-mongo-sanitize`, and `sanitize-html` against NoSQL injection and stored XSS
- **Form Validation** — server-side schema validation with Joi; client-side Bootstrap validation styling for instant feedback
- **Flash Messages** — success/error banners after actions like creating a campground or logging in
- **Custom Error Handling** — centralized Express error handler with a dedicated error page, plus an `ExpressError` utility class and `catchAsync` wrapper to avoid repetitive try/catch blocks
## 🛠️ Tech Stack
 
| Layer                | Technology                                                          |
| --------------------- | -------------------------------------------------------------------- |
| Runtime               | Node.js 13.14.0                                                      |
| Framework             | Express 4.17.1                                                       |
| Database              | MongoDB 3.2 (local, mmapv1 storage engine)                           |
| ODM                   | Mongoose 5.10.0                                                      |
| Templating            | EJS 3.x, rendered via `ejs-mate` for layout support                  |
| Styling               | Bootstrap 5.3 (CDN) + Bootstrap Icons (CDN)                          |
| Maps                  | MapLibre GL JS, Protomaps vector tiles                               |
| File Storage          | ArvanCloud Object Storage (S3-compatible)                            |
| Upload Middleware     | Multer + multer-s3                                                   |
| AWS SDK               | aws-sdk v2 (used for the S3-compatible client)                       |
| Auth                  | Passport.js — `passport-local`, `passport-google-oauth20`, `passport-local-mongoose`, `mongoose-findorcreate` |
| Sessions              | express-session                                                      |
| Security              | Helmet, `express-mongo-sanitize`, `sanitize-html`                    |
| Validation            | Joi                                                                   |
| Flash Messaging       | connect-flash                                                        |
| HTTP Method Override  | method-override (enables PUT/DELETE from HTML forms)                 |
| Dev Tooling           | nodemon 2.0.22                                                       |
 
> **Note:** This project intentionally runs on older, fixed dependency versions (Node 13, Express 4, Mongoose 5) due to the developer's low-spec machine (32-bit Windows 7, Pentium G620, 2GB RAM), which can't run newer Node.js/MongoDB releases. Modernizing the stack is a deliberate, deferred step — see [A Note on Versions](#-a-note-on-versions).
 
## 📁 Project Structure
 
```
Yelpcamp/
├── controllers/          # Route handler logic (campgrounds, reviews, users)
├── models/                # Mongoose schemas (Campground, Review, User)
├── routes/                # Express routers
├── views/                 # EJS templates
│   ├── campgrounds/       # index, show, new, edit
│   ├── users/              # login, register
│   ├── layouts/            # boilerplate layout
│   └── partials/           # navbar, footer, flash messages
├── public/                # Static assets (CSS, client-side JS)
├── seeds/                  # Database seeding scripts and sample data
├── utilities/              # ExpressError class, catchAsync wrapper
├── Arvancloud/             # S3-compatible upload configuration (Multer + multer-s3)
├── schemas.js              # Joi validation schemas
├── middlewares.js          # isLoggedIn, isAuthor, validateCampground, etc.
└── index.js                # App entry point
```
 
## ✅ Prerequisites
 
- **Node.js** 13.14.0 (this project relies on Node 13 / Express 4 / Mongoose 5 compatibility — see the note on versions below)
- **MongoDB** 3.2 running locally (or a connection string to a remote instance)
- An **ArvanCloud** (or other S3-compatible) storage bucket and credentials for image uploads
- A **Google OAuth** client ID/secret if you want to test social login
## 📦 Getting Started
 
```
# Clone the repo
git clone https://github.com/DevouraStudio/Yelpcamp.git
cd Yelpcamp
 
# Install dependencies
npm install
 
# Set up your .env file (see Environment Variables below)
 
# Optionally seed the database with sample campgrounds
node seeds/app.js
 
# Start the app
node index.js
```
 
By default, the app runs on **http://localhost:3000**.
 
## 🔑 Environment Variables
 
Create a `.env` file in the project root:
 
```
# ArvanCloud (S3-compatible object storage)
ARVAN_ENDPOINT=your_arvan_s3_endpoint
ARVAN_ACCESS_KEY=your_access_key
ARVAN_SECRET_KEY=your_secret_key
ARVAN_BUCKET=your_bucket_name
 
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
 
# Session
SESSION_SECRET=a_long_random_string
```
 
Remember: `process.env` is only available server-side — these values are never exposed to client-side scripts in `public/`.
 
## 🌱 Database Seeding
 
`seeds/app.js` clears the `campgrounds` collection and generates 50 sample campgrounds using random city data (`seeds/cities.js`) and descriptive name combinations (`seeds/seedHelpers.js`). Run it with:
 
```
node seeds/app.js
```
 
⚠️ This wipes existing campground data — use with caution on anything beyond a local dev database.
 
## 🧭 Routes Overview
 
| Method     | Route                                | Description                   | Protected?                 |
| ---------- | ------------------------------------ | ------------------------------ | --------------------------- |
| GET        | `/campgrounds`                       | List all campgrounds           | No                          |
| GET        | `/campgrounds/new`                   | Form to create a campground    | Login required              |
| POST       | `/campgrounds`                       | Create a new campground        | Login required              |
| GET        | `/campgrounds/:id`                   | View a single campground       | No                          |
| GET        | `/campgrounds/:id/edit`              | Form to edit a campground      | Login + author only         |
| PUT        | `/campgrounds/:id`                   | Update a campground            | Login + author only         |
| DELETE     | `/campgrounds/:id`                   | Delete a campground            | Login + author only         |
| POST       | `/campgrounds/:id/reviews`           | Add a review                   | Login required              |
| DELETE     | `/campgrounds/:id/reviews/:reviewId` | Delete a review                | Login + review author only  |
| GET / POST | `/register`                          | View/submit registration form  | No                          |
| GET / POST | `/login`                             | View/submit login form         | No                          |
| GET        | `/auth/google`                       | Start Google OAuth flow        | No                          |
| GET        | `/auth/google/callback`              | Google OAuth callback          | No                          |
| GET        | `/logout`                            | Log out the current user       | No                          |
 
## 🗃️ Data Models
 
**Campground**
- `title`, `location`, `price`, `description` — String/Number fields
- `images` — array of `{ url, filename }` objects (from S3 uploads)
- `author` — reference to `User`
- `reviews` — array of references to `Review`
- On deletion, a `post("findOneAndDelete")` hook cascades and removes associated reviews
**Review**
- `body`, `rating` — String/Number
- `author` — reference to `User`
**User**
- `email` — required, unique
- Uses `passport-local-mongoose` for local auth (adds `username`, salted/hashed `password`, and auth helper methods) and `mongoose-findorcreate` to support Google OAuth's find-or-create login pattern
## 🔐 Authentication & Authorization
 
- **Local authentication** is handled by Passport's local strategy, backed by `passport-local-mongoose` on the `User` model.
- **Google OAuth** is handled by `passport-google-oauth20`, with `mongoose-findorcreate` used to find or create the corresponding user record.
- **Sessions** are managed with `express-session`, with `req.session.returnTo` used to redirect users back to their intended page after login.
- **Authorization middleware** (`middlewares.js`):
  - `isLoggedIn` — blocks access to protected routes and stores the originally requested URL for post-login redirect
  - `isAuthor` — ensures only the campground's original author can edit/delete it
  - `isReviewAuthor` — ensures only a review's original author can delete it
  - `validateCampground` / `validateReview` — run Joi schema validation and throw an `ExpressError` on failure
## 🖼️ Image Uploads
 
Campground images are uploaded via a multipart form (`enctype="multipart/form-data"`), processed by Multer, and streamed directly to an ArvanCloud S3-compatible bucket using `multer-s3`. Key details:
 
- Up to 15 images per campground (`upload.array("image", 15)`)
- File size limit: 50MB per file
- Only `jpeg`, `jpg`, `png`, and `webp` extensions are accepted
- Original images are stored untouched — resizing/transformation is planned to happen at display time (via a CDN URL parameter or a Mongoose virtual), not at upload time, to keep upload processing off the low-spec dev machine
- A custom wrapper middleware ensures Multer errors are properly caught and passed to Express's error handler, since Multer doesn't reliably propagate errors to `next()` on its own
## 🗺️ Roadmap
 
**Near-term**
- Deployment (currently the top priority over new features)
- Review editing
- Pagination
- User profile pages
- Password reset via email
- Rate limiting
**Architectural maturity**
- JSON API layer
- Automated tests
- Deployment documentation
- Loading states
- 404 / empty-state pages
- Sorting options for campground listings
**Dependency upkeep**
- `axios` — upgrade candidate with active CVEs; lowest-cost, highest-priority bump
- `aws-sdk` v2 — reached end-of-support September 2025; replacement blocked on the broader Node/Mongoose upgrade path
- `mongoose` 5.x — EOL, but upgrading requires a newer Node.js version first
## 📌 A Note on Versions
 
This project deliberately runs on **Node.js 13.14.0**, **Express 4.17.1**, and **Mongoose 5.10.0** — all of which are past end-of-life. This is primarily due to the developer's low-spec system: a 32-bit Windows 7 Ultimate machine with an Intel Pentium G620 @ 2.60GHz and 2GB of RAM. Newer Node.js releases don't run on 32-bit Windows, which is why MongoDB Server here is also pinned to 3.2 with the mmapv1 storage engine (~2GB database size cap). It's a hardware constraint rather than a preference, and it happens to align with the bootcamp curriculum this project originally followed.
 
Several dependencies (`mongoose`, `aws-sdk`, `axios`) are flagged for future updates, but upgrading requires a coordinated bump across the stack (e.g. Mongoose 6+ requires a newer Node version) and is being handled deliberately rather than piecemeal, once the developer moves to more capable hardware. Modern tooling like Vite or Create React App is unreachable locally on this machine; StackBlitz/CodeSandbox are used as workarounds when newer tooling is needed for isolated experiments.
 
If you're using this repo as a reference, keep in mind the patterns here reflect an older Express/Mongoose API surface (e.g. `useNewUrlParser`, `useCreateIndex` options that are no-ops or removed in newer Mongoose versions).
 
## 📄 License
 
ISC

## Author

- Website - [DevouraStudio](https://www.devoura.ir)
- Frontendmentor - [@DevouraStudio](https://www.frontendmentor.io/profile/DevouraStudio)
- Github - [@DevouraStudio](https://www.github.com/DevouraStudio)
- Codepen - [@DevouraStudio](https://www.codepen.io/DevouraStudio)
- Codesandbox - [@DevouraStudio](https://codesandbox.io/u/DevouraStudio)
