const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const BASE_URL = process.env.BASE_URL;

// Health check
app.get("/", (req, res) => {
    res.send("PSKM Paystack API is running");
});

// Create Paystack payment
app.post("/api/paystack/pay", async (req, res) => {
    try {
        const { email, amount, items } = req.body;

        const response = await axios.post(
            "https://api.paystack.co/transaction/initialize",
            {
                email,
                amount: amount * 100, // Paystack uses kobo
                callback_url: `${BASE_URL}/success`
            },
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET}`,
                    "Content-Type": "application/json"
                }
            }
        );

        res.json({
            success: true,
            authorization_url: response.data.data.authorization_url,
            reference: response.data.data.reference
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Success page handler
app.get("/success", (req, res) => {
    res.send(`
        <h1>Payment Successful</h1>
        <p>Your PSKM order has been received.</p>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("PSKM Paystack API running"));
