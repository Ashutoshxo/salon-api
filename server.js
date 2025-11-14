import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import campaignRoutes from "./routes/campaign.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Static uploads folder (VERY IMPORTANT)
app.use("/uploads", express.static("uploads"));

// Connect DB
connectDB();

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🎨 Salon Campaign API",
    version: "1.0.0",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        profile: "GET /api/auth/me",
      },
      campaigns: {
        createCampaign: "POST /api/create-campaign",
        getHistory: "GET /api/history",
        retryCampaign: "POST /api/retry/:id",
      },
    },
  });
});

// ROUTES (MOST IMPORTANT)
app.use("/api", authRoutes);
app.use("/api", campaignRoutes);

// Not Found
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
