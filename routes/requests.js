const express = require("express");
const router = express.Router();
const Request = require("../models/Request");
const Trip = require("../models/Trip");
const authMiddleware = require("../middleware/authMiddleware");

// SEND JOIN REQUEST
router.post("/:tripId", authMiddleware, async (req, res) => {
  try {
    const { tripId } = req.params;

    const existing = await Request.findOne({
      trip: tripId,
      requester: req.userId
    });

    if (existing) {
      return res.status(400).json({ message: "Request already sent" });
    }

    const request = new Request({
      trip: tripId,
      requester: req.userId
    });

    await request.save();
    res.status(201).json({ message: "Join request sent ✅" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ACCEPT / REJECT REQUEST
router.put("/:requestId", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await Request.findById(req.params.requestId)
      .populate("trip");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Only trip owner can accept/reject
    if (request.trip.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.status = status;
    await request.save();

    res.json({ message: `Request ${status} ✅` });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET REQUESTS FOR MY TRIPS
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("trip")
      .populate("requester", "name country city");

    const myRequests = requests.filter(
      r => r.trip.createdBy.toString() === req.userId
    );

    res.json(myRequests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
