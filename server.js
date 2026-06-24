const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* =========================
   HOME ROUTE
========================= */
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* =========================
   PAYSTACK INITIATE PAYMENT
========================= */
app.post("/paystack/initiate", async (req, res) => {
    try {
        const { email, amount, cart } = req.body;

        const response = await axios.post(
            "https://api.paystack.co/transaction/initialize",
            {
                email: email || "customer@pskm.store",
                amount: Math.round(amount * 100),
                callback_url: `${process.env.BASE_URL}/success`,
                metadata: { cart: cart || [] }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        res.json({
            status: true,
            data: response.data.data
        });

    } catch (err) {
        console.log(err.response?.data || err.message);

        res.status(500).json({
            status: false,
            message: err.response?.data?.message || err.message
        });
    }
});

/* =========================
   SUCCESS / VERIFY PAGE
========================= */
app.get("/success", async (req, res) => {
    const reference = req.query.reference;

    if (!reference) {
        return res.send("<h1>No payment reference found</h1>");
    }

    try {
        const verify = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
                }
            }
        );

        const status = verify.data.data.status;

        if (status === "success") {
            return res.send(`
                <h1>✅ Payment Successful</h1>
                <p>Reference: ${reference}</p>
                <a href="/">Back to Store</a>
            `);
        } else {
            return res.send("<h1>❌ Payment Failed</h1>");
        }

    } catch (err) {
        console.log(err.message);
        res.send("<h1>Error verifying payment</h1>");
    }
});

/* =========================
   STATUS CHECK
========================= */
app.get("/api/status", (req, res) => {
    res.json({
        status: true,
        service: "PSKM STORE",
        message: "Backend running"
    });
});

/* =========================
   TEST PAYSTACK CONFIG
========================= */
app.get("/test-paystack", (req, res) => {
    res.json({
        keyExists: !!process.env.PAYSTACK_SECRET_KEY,
        baseUrl: process.env.BASE_URL
    });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("PSKM Store running on port " + PORT);
});
