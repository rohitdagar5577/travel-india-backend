const authMiddleware = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();
const Trip = require("../models/Trip");


// CREATE TRIP (Protected)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { destination, startDate, endDate, description } = req.body;

    if (!destination || !startDate || !endDate) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const trip = new Trip({
      destination,
      startDate,
      endDate,
      description,
      createdBy: req.userId
    });

    await trip.save();
    res.status(201).json({ message: "Trip created successfully ✅", trip });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET ALL TRIPS (Protected)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate("createdBy", "name country city");

    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
