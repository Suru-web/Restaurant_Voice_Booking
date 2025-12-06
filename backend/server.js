import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// IMPORT THE MODEL
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

// MongoDB Connect
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.log(err));

// Routes
app.use("/api/bookings", bookingRoutes);

const PORT = process.env.PORT || 5050;
app.listen(PORT, "0.0.0.0", () =>
    console.log(`🚀 Server running on port ${PORT}`)
);