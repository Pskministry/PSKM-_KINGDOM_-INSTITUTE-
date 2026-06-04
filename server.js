const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route (check if server is alive)
app.get("/", (req, res) => {
    res.send("✅ PSKM KINGDOM INSTITUTE API IS RUNNING");
});

// Simple API test route (for future apps/payments)
app.post("/api/test", (req, res) => {
    console.log("📩 Request received:", req.body);

    res.json({
        status: "success",
        message: "Data received successfully",
        data: req.body
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
