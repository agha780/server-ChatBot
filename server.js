const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const mongoose = require("mongoose");
mongoose
  .connect("mongodb://localhost:27017/bookingdataDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

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

app.post("/products", (req, res) => {
  const newBooking = new Booking({
    name: req.body.name,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    birthday: req.body.birthday,
    rentalPeriod: req.body.rentalPeriod,
    carName: req.body.carName,
    carPrice: req.body.carPrice,
    carImage: req.body.carImage,
    total: req.body.total,
    pickUpDate: req.body.pickUpDate,
    dropOffDate: req.body.dropOffDate,
  });

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

// New endpoint to get the last booking by email
app.get("/products/last", (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ error: "Email parameter is required" });
  }

  Booking.findOne({ email: email })
    .sort({ dropOffDate: -1 }) // Sort by most recent drop-off date
    .then((booking) => {
      if (booking) {
        res.json(booking);
      } else {
        res.status(404).json({ error: "No booking found for this email" });
      }
    })
    .catch((err) => {
      console.error("Error fetching booking:", err);
      res.status(500).json({ error: "Internal server error" });
    });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
