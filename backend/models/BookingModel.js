import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
    bookingId: String,
    customerName: String,
    numberOfGuests: Number,
    bookingDate: Date,
    bookingTime: String,
    cuisinePreference: String,
    specialRequests: String,
    weatherInfo: Object,
    seatingPreference: String,
    status: { type: String, default: "confirmed" },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Booking", BookingSchema);
