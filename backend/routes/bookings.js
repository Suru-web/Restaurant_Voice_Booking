import express from "express";
import Booking from "../models/BookingModel.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// POST create booking
router.post("/", async (req, res) => {
    console.log("📥 Received booking request");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    try {
        const booking = new Booking({
            bookingId: uuidv4(),
            ...req.body,
        });
        console.log("💾 Attempting to save booking...");
        const savedBooking = await booking.save();
        console.log("✅ Booking saved successfully:", savedBooking);
        res.json({ success: true, booking });
    } catch (err) {
        console.error("❌ Error saving booking:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET all bookings
router.get("/", async (req, res) => {
    const bookings = await Booking.find();
    res.json(bookings);
});

// GET one booking
router.get("/:id", async (req, res) => {
    const booking = await Booking.findOne({ bookingId: req.params.id });
    res.json(booking);
});

// DELETE booking
router.delete("/:id", async (req, res) => {
    await Booking.deleteOne({ bookingId: req.params.id });
    res.json({ success: true });
});

export default router;
