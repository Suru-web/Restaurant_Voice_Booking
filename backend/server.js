import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// 1. IMPORT THE MODEL (This was missing!)
import Booking from "./models/BookingModel.js";
import bookingRoutes from "./routes/bookings.js";

dotenv.config();

const app = express();
app.use(cors({
    origin: "*",
    methods: "GET,POST,DELETE,PUT",
    allowedHeaders: "Content-Type,Authorization"
}));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});


app.use(express.json());

// 2. MongoDB Connect
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.log(err));

// 3. Test Database Write (Now this will work because 'Booking' is imported)
mongoose.connection.once('open', async () => {
    console.log("🔍 Testing database write...");
    try {
        const testBooking = new Booking({
            bookingId: "test-2",
            customerName: "Test User",
            numberOfGuests: 2,
            bookingDate: "tomorrow", // String is fine now if you updated the model
            bookingTime: "7:00 PM",
            cuisinePreference: "italian",
        });

        await testBooking.save();
        console.log("✅ Test booking saved successfully!");

        // Optional: Clean up test data immediately so your DB stays clean
        // await Booking.deleteOne({ bookingId: "test-123" });
    } catch (err) {
        console.error("❌ Test booking failed:", err.message);
    }
});

// 4. Routes
app.use("/api/bookings", bookingRoutes);

const PORT = process.env.PORT || 5050;
app.listen(PORT, "0.0.0.0", () =>
    console.log(`🚀 Server running on port ${PORT}`)
);