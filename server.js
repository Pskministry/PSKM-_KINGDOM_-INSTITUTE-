const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* =========================
   HOME
========================= */
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* =========================
   INIT PAYSTACK PAYMENT
========================= */
app.post("/paystack/initiate", async (req, res) => {
    try {
        const { email, amount, cart } = req.body;

        const response = await axios.post(
            "https://api.paystack.co/transaction/initialize",
            {
                email: email || "customer@pskm.store",
                amount: Math.round(amount),
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

        return res.json({
            status: true,
            data: response.data.data
        });

    } catch (err) {
        return res.status(500).json({
            status: false,
            message: err.response?.data?.message || err.message
        });
    }
});

/* =========================
   SUCCESS / VERIFY PAYMENT
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

        if (verify.data.data.status === "success") {
            return res.send(`
                <h1>✅ Payment Successful</h1>
                <p>Reference: ${reference}</p>
                <a href="/">Back to Store</a>
            `);
        }

        return res.send("<h1>❌ Payment Failed</h1>");

    } catch (err) {
        return res.send("<h1>Error verifying payment</h1>");
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
   TEST CONFIG
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
