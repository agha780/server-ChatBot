require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Schema and Model
const bookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  phoneNumber: String,
  birthday: String,
  rentalPeriod: String,
  carName: String,
  carPrice: Number,
  total: Number,
  carImage: String,
  pickUpDate: Date,
  dropOffDate: Date,
});
const Booking = mongoose.model("Booking", bookingSchema, "bookings");

// Routes

// POST: Add a new booking
app.post("/products", (req, res) => {
  const newBooking = new Booking(req.body);

  newBooking
    .save()
    .then((booking) =>
      res.json({ message: "Booking saved successfully", data: booking })
    )
    .catch((err) => {
      console.error("Error saving booking:", err);
      res.status(500).json({ error: "Internal server error" });
    });
});
app.get("/ping", (req, res) => {
  res.status(200).send("Server is up and running.");
});
app.get("/products/by-email", (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ error: "Email parameter is required" });
  }

  Booking.find({ email: email })
    .then((bookings) => res.json(bookings))
    .catch((err) => {
      console.error("Error fetching bookings:", err);
      res.status(500).json({ error: "Internal server error" });
    });
});

// Admin login route in server.js
app.post("/admin-login", (req, res) => {
  const { email, password } = req.body;

  // Check against hardcoded credentials or from database
  // this is for acess in the admin dashboard
  if (email === "aboodkishawi09@hotmail.com" && password === "123") {
    res.json({ isAdmin: true });
  } else {
    res.json({ isAdmin: false });
  }
});

app.post("/products", (req, res) => {
  console.log("Incoming booking data:", req.body); // Log the data received
  const newBooking = new Booking(req.body);

  newBooking
    .save()
    .then((booking) =>
      res.json({ message: "Booking saved successfully", data: booking })
    )
    .catch((err) => {
      console.error("Error saving booking:", err);
      res.status(500).json({ error: "Internal server error" });
    });
});

// GET: Retrieve all bookings
app.get("/products", (req, res) => {
  Booking.find()
    .then((data) => {
      console.log("Fetched data:", data);
      res.json(data);
    })
    .catch((err) => {
      console.error("Error fetching data:", err);
      res.status(500).json({ error: "Internal server error" });
    });
});

// GET: Retrieve the last booking by email
app.get("/products/by-email", (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ error: "Email parameter is required" });
  }

  Booking.find({ email: email })
    .sort({ dropOffDate: -1 }) // Sort by most recent drop-off date
    .then((bookings) => res.json(bookings))
    .catch((err) => {
      console.error("Error fetching bookings:", err);
      res.status(500).json({ error: "Internal server error" });
    });
});

// DELETE: Delete a specific booking by ID
app.delete("/products/:id", (req, res) => {
  const { id } = req.params;
  Booking.findByIdAndDelete(id)
    .then(() => res.json({ message: "Booking deleted successfully" }))
    .catch((err) => {
      console.error("Error deleting booking:", err);
      res.status(500).json({ error: "Internal server error" });
    });
});

// PUT: Update a specific booking's dates by ID
app.put("/products/:id", (req, res) => {
  const { id } = req.params;
  const { pickUpDate, dropOffDate } = req.body;

  console.log("PUT request received for ID:", id, "with data:", req.body);

  Booking.findByIdAndUpdate(id, { pickUpDate, dropOffDate }, { new: true })
    .then((updatedBooking) => {
      console.log("Booking updated in database:", updatedBooking);
      res.json(updatedBooking);
    })
    .catch((err) => {
      console.error("Error updating booking:", err);
      res.status(500).json({ error: "Internal server error" });
    });
});

// GET: Check car availability for rebooking
// Endpoint to check car availability
app.get("/products/check-availability", async (req, res) => {
  const { carName, pickUpDate, dropOffDate } = req.query;

  try {
    const pickUp = new Date(pickUpDate);
    const dropOff = new Date(dropOffDate);
    const today = new Date();

    // Find bookings for the same car that overlap with the requested dates and are in the future
    const overlappingBookings = await Booking.find({
      carName,
      pickUpDate: { $gte: today }, // Only consider future bookings
      $or: [{ pickUpDate: { $lt: dropOff }, dropOffDate: { $gt: pickUp } }],
    });

    const available = overlappingBookings.length === 0;
    res.json({ available });
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Welcome Route
app.get("/", (req, res) => {
  res.send("Welcome to the Chat Bot Server!");
});

// Server Listener
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
