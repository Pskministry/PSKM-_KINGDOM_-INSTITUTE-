require("dotenv").config();

const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI);

let orders;

async function connectDB() {
    try {
        await client.connect();
        console.log("✅ MongoDB Connected");

        const db = client.db("pskm");
        orders = db.collection("orders");
    } catch (err) {
        console.error("MongoDB Error:", err);
    }
}

connectDB();

const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
require("dotenv").config();
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

/* HOME */
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* =========================
   PAYSTACK INIT
========================= */
app.post("/api/order/save", async (req, res) => {
    try {
        const order = {
            ...req.body,
            createdAt: new Date()
        };

        const result = await orders.insertOne(order);

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
app.post("/api/paystack/pay", async (req, res) => {
    try {
        const { email, amount, cart } = req.body;

        const response = await axios.post(
            "https://api.paystack.co/transaction/initialize",
            {
                email: email || "customer@pskm.store",
                amount: Math.round(amount * 100),

                // IMPORTANT: send reference to success page
                callback_url: "https://pskm-kingdom-institute.onrender.com/success",

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

        res.json({
            status: true,
            authorization_url: response.data.data.authorization_url,
            reference: response.data.data.reference
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
   SUCCESS PAGE (FIXED)
========================= */
app.get("/success", (req, res) => {

    const reference = req.query.reference || "PSKM-" + Math.floor(Math.random() * 999999);

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>PSKM Payment Success</title>
        <style>
            body{
                margin:0;
                font-family:Arial;
                background:#081420;
                color:white;
                display:flex;
                align-items:center;
                justify-content:center;
                height:100vh;
            }
            .box{
                background:#10243d;
                padding:30px;
                border-radius:12px;
                text-align:center;
                width:90%;
                max-width:500px;
                box-shadow:0 10px 30px rgba(0,0,0,0.4);
            }
            h1{color:#FFD700}
            .ref{
                background:#071a2e;
                padding:10px;
                border-radius:8px;
                margin:15px 0;
                color:#FFD700;
                font-weight:bold;
            }
            a{
                display:block;
                margin-top:12px;
                padding:12px;
                border-radius:8px;
                text-decoration:none;
                font-weight:bold;
            }
            .wa{background:#25D366;color:white}
            .email{background:#FFD700;color:black}
        </style>
    </head>
    <body>

    <div class="box">
        <h1>Payment Successful 🎉</h1>

        <p>Your Order Reference:</p>

        <div class="ref">${reference}</div>

        <p>Select how you want to submit proof:</p>

        <a class="wa"
           href="https://wa.me/27845392695?text=Hello PSKM Ministry,%0A%0AI completed payment.%0AReference: ${reference}%0A%0APlease confirm my order."
           target="_blank">
           Send via WhatsApp
        </a>

        <a class="email"
           href="mailto:stevenmothlolo@gmail.com,spkministry@gmail.com?subject=PSKM Payment ${reference}&body=Hello PSKM Ministry,%0A%0AI completed payment.%0AReference: ${reference}%0A%0APlease confirm my order.">
           Send via Email
        </a>

    </div>

    </body>
    </html>
    `);
});

/* =========================
   STATUS CHECK
========================= */
app.get("/api/status", (req, res) => {
    res.json({
        status: true,
        service: "PSKM Store API Running"
    });
});

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("PSKM Store running on port " + PORT);
});
