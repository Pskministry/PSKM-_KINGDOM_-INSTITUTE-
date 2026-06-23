const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

// TEST ROUTE (CHECK IF SERVER WORKS)
app.get("/", (req, res) => {
    res.send("PSKM Paystack API is LIVE");
});

// PAYSTACK ROUTE (THIS IS WHAT YOU ARE MISSING)
app.post("/api/paystack/pay", async (req, res) => {
    try {
        const { email, amount, cart } = req.body;

        if (!amount) {
            return res.status(400).json({
                status: false,
                message: "Amount missing"
            });
        }

        const response = await axios.post(
            "https://api.paystack.co/transaction/initialize",
            {
                email: email || "customer@pskm.store",
                amount: Math.round(amount * 100),
                currency: "ZAR",
                callback_url: "https://pskm-kingdom-store.onrender.com/success.html",
                metadata: {
                    cart: cart || []
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return res.json({
            status: true,
            authorization_url: response.data.data.authorization_url,
            reference: response.data.data.reference
        });

    } catch (err) {
        return res.status(500).json({
            status: false,
            message: err.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("PSKM server running on port " + PORT);
});
