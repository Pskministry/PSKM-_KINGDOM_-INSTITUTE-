require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
const { MongoClient } = require("mongodb");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* =========================
   MONGODB CONNECTION
========================= */
const client = new MongoClient(process.env.MONGODB_URI);

let ordersCollection;

async function connectDB() {
    try {
        await client.connect();
        const db = client.db("pskm");
        ordersCollection = db.collection("orders");
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ MongoDB Error:", err);
    }
}
connectDB();

/* =========================
   HEALTH CHECK
========================= */
app.get("/api/status", (req, res) => {
    res.json({
        status: true,
        service: "PSKM API Running"
    });
});

/* =========================
   SAVE ORDER (POSTMAN FIX)
========================= */
app.post("/api/order/save", async (req, res) => {
    try {
        if (!ordersCollection) {
            return res.status(500).json({
                success: false,
                message: "Database not connected yet"
            });
        }

        const order = {
            ...req.body,
            createdAt: new Date()
        };

        const result = await ordersCollection.insertOne(order);

        res.json({
            success: true,
            id: result.insertedId,
            message: "Order saved successfully"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

/* =========================
   PAYSTACK PAYMENT
========================= */
app.post("/api/paystack/pay", async (req, res) => {
    try {
        const { email, amount, cart } = req.body;

        const response = await axios.post(
            "https://api.paystack.co/transaction/initialize",
            {
                email: email || "customer@pskm.store",
                amount: Math.round(amount * 100),
                callback_url: "https://pskm-kingdom-institute.onrender.com/success",
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
            authorization_url: response.data.data.authorization_url,
            reference: response.data.data.reference
        });

    } catch (err) {
        res.status(500).json({
            status: false,
            message: err.response?.data?.message || err.message
        });
    }
});

/* =========================
   SUCCESS PAGE
========================= */
app.get("/success", (req, res) => {
    const reference = req.query.reference || "PSKM-" + Math.floor(Math.random() * 999999);

    res.send(`
    <html>
    <body style="background:#081420;color:white;text-align:center;padding-top:100px;">
        <h1 style="color:#FFD700">Payment Successful 🎉</h1>
        <p>Reference: <b>${reference}</b></p>

        <a href="https://wa.me/27845392695?text=Payment%20Reference:%20${reference}"
           style="display:block;margin:20px;color:white;">
           Send WhatsApp Proof
        </a>

        <a href="mailto:stevenmothlolo@gmail.com"
           style="color:#FFD700;">
           Send Email Proof
        </a>
    </body>
    </html>
    `);
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚀 PSKM Server running on port " + PORT);
});
