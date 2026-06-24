const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   SERVE FRONTEND
========================= */
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/success", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "success.html"));
});

/* =========================
   PAYSTACK INIT (FIXED ROUTE)
   🔥 IMPORTANT: matches frontend now
========================= */
app.post("/paystack/initiate", async (req, res) => {
    try {
        const { email, amount, cart } = req.body;

        const response = await axios.post(
            "https://api.paystack.co/transaction/initialize",
            {
                email: email || "customer@pskm.store",
                amount: Math.round(Number(amount)),
                callback_url: `${process.env.BASE_URL}/success`
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
   VERIFY (OPTIONAL BUT CORRECT)
========================= */
app.get("/paystack/verify/:reference", async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${req.params.reference}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
                }
            }
        );

        res.json({
            status: true,
            data: response.data.data
        });

    } catch (err) {
        res.status(500).json({
            status: false,
            message: err.response?.data?.message || err.message
        });
    }
});

/* =========================
   STATUS CHECK
========================= */
app.get("/api/status", (req, res) => {
    res.json({
        status: true,
        service: "PSKM Store",
        message: "Store API Online"
    });
});

/* DEBUG PAYSTACK KEY */
app.get("/test-paystack", (req, res) => {
    res.json({
        keyExists: !!process.env.PAYSTACK_SECRET_KEY
    });
});

/* START SERVER */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("PSKM Store running on port " + PORT);
});
