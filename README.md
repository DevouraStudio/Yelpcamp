# 🏕️ Yelpcamp

A full-stack campground review application where users can browse campgrounds, view photo galleries and interactive maps, leave star-rated reviews, and manage their own listings. Built with Node.js, Express, and MongoDB.

This project is based on the Colt Steele Web Developer Bootcamp curriculum and serves as a hands-on learning project for full-stack JavaScript development — covering server-side rendering, authentication, authorization, file uploads, and geospatial data.

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
- [Data Models](#-data-models)
- [Authentication & Authorization](#-authentication--authorization)
- [Image Uploads](#-image-uploads)
- [A Note on Versions](#-a-note-on-versions)
- [License](#-license)

---

## ✨ Features

- **Campground CRUD** — create, view, edit, and delete campground listings, each with a title, location, price, description, and images
- **Authentication** — secure registration and login via Passport.js (local strategy), with hashed credentials handled by `passport-local-mongoose`
- **Authorization** — only the original author can edit or delete their own campgrounds and reviews; protected routes redirect unauthenticated users back after login
- **Reviews & Star Ratings** — logged-in users can leave a written review with a 1–5 star rating on any campground
- **Multi-Image Uploads** — upload multiple campground photos at once, stored on ArvanCloud (S3-compatible object storage) via Multer + multer-s3
- **Interactive Maps** — a cluster map on the campgrounds index (MapLibre GL JS) and a per-campground location map on the show page, using Protomaps vector tiles
- **Form Validation** — server-side schema validation with Joi; client-side Bootstrap validation styling for instant feedback
- **Flash Messages** — success/error banners after actions like creating a campground or logging in
- **Custom Error Handling** — centralized Express error handler with a dedicated error page, plus an `ExpressError` utility class and `catchAsync` wrapper to avoid repetitive try/catch blocks

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 13.14.0 |
| Framework | Express 4.17.1 |
| Database | MongoDB (local, mmapv1 storage engine) |
| ODM | Mongoose 5.10.0 |
| Templating | EJS 3.x, rendered via `ejs-mate` for layout support |
| Styling | Bootstrap 5.3 (CDN) |
| Maps | MapLibre GL JS v3+, Protomaps vector tiles |
| File Storage | ArvanCloud Object Storage (S3-compatible) |
| Upload Middleware | Multer + multer-s3 |
| AWS SDK | aws-sdk v2 (used for the S3-compatible client) |
| Auth | Passport.js + passport-local + passport-local-mongoose |
| Sessions | express-session |
| Validation | Joi |
| Flash Messaging | connect-flash |
| HTTP Method Override | method-override (enables PUT/DELETE from HTML forms) |

> **Note:** This project intentionally runs on older, fixed dependency versions (Node 13, Express 4, Mongoose 5) due to the developer's low-spec machine (32-bit Windows 7, Pentium G620, 2GB RAM), which can't run newer Node.js/MongoDB releases. It also happens to match the bootcamp curriculum as originally taught. Modernizing the stack is a deliberate, deferred step — see [A Note on Versions](#-a-note-on-versions).

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
- **MongoDB** running locally (or a connection string to a remote instance)
- An **ArvanCloud** (or other S3-compatible) storage bucket and credentials for image uploads

## 📦 Getting Started

```bash
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

```env
ARVAN_ENDPOINT=your_arvan_s3_endpoint
ARVAN_ACCESS_KEY=your_access_key
ARVAN_SECRET_KEY=your_secret_key
ARVAN_BUCKET=your_bucket_name
```

These are consumed by `Arvancloud/index.js` to configure the S3-compatible client used for image uploads. Remember: `process.env` is only available server-side — these values are never exposed to client-side scripts in `public/`.

## 🌱 Database Seeding

`seeds/app.js` clears the `campgrounds` collection and generates 50 sample campgrounds using random city data (`seeds/cities.js`) and descriptive name combinations (`seeds/seedHelpers.js`). Run it with:

```bash
node seeds/app.js
```

⚠️ This wipes existing campground data — use with caution on anything beyond a local dev database.

## 🧭 Routes Overview

| Method | Route | Description | Protected? |
|---|---|---|---|
| GET | `/campgrounds` | List all campgrounds | No |
| GET | `/campgrounds/new` | Form to create a campground | Login required |
| POST | `/campgrounds` | Create a new campground | Login required |
| GET | `/campgrounds/:id` | View a single campground | No |
| GET | `/campgrounds/:id/edit` | Form to edit a campground | Login + author only |
| PUT | `/campgrounds/:id` | Update a campground | Login + author only |
| DELETE | `/campgrounds/:id` | Delete a campground | Login + author only |
| POST | `/campgrounds/:id/reviews` | Add a review | Login required |
| DELETE | `/campgrounds/:id/reviews/:reviewId` | Delete a review | Login + review author only |
| GET / POST | `/register` | View/submit registration form | No |
| GET / POST | `/login` | View/submit login form | No |
| GET | `/logout` | Log out the current user | No |

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
- Uses the `passport-local-mongoose` plugin, which adds `username`, salted/hashed `password` fields, and authentication helper methods automatically

## 🔐 Authentication & Authorization

- **Authentication** is handled by Passport's local strategy, backed by `passport-local-mongoose` on the `User` model.
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
- Original images are stored untouched — any future resizing/transformation is planned to happen at display time (e.g. via a CDN URL parameter or Mongoose virtual), not at upload time
- A custom wrapper middleware (`uploadImage`) is used to ensure Multer errors are properly caught and passed to Express's error handler, since Multer doesn't always propagate errors to `next()` automatically

## 📌 A Note on Versions

This project deliberately runs on **Node.js 13.14.0**, **Express 4.17.1**, and **Mongoose 5.10.0** — all of which are past end-of-life. This is primarily due to the developer's low-spec system: a 32-bit Windows 7 Ultimate machine with an Intel Pentium G620 @ 2.60GHz and 2GB of RAM. Newer Node.js and MongoDB releases don't run on 32-bit Windows, which is why MongoDB Server here is also pinned to 3.2 with the mmapv1 storage engine. It's a hardware constraint rather than a preference, and it happens to align with the bootcamp curriculum this project follows.

A handful of dependencies (`mongoose`, `aws-sdk`, `axios`) are flagged for future updates, but upgrading requires a coordinated bump across the stack (e.g. Mongoose 6+ requires a newer Node version) and is being handled deliberately rather than piecemeal, once the developer moves to more capable hardware.

If you're using this repo as a reference, keep in mind the patterns here reflect an older Express/Mongoose API surface (e.g. `useNewUrlParser`, `useCreateIndex` options that are no-ops or removed in newer Mongoose versions).

## 📄 License

ISC
