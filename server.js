const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   SERVE FRONTEND (IMPORTANT)
========================= */
app.use(express.static(path.join(__dirname, "public")));

/* HOME PAGE */
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* SUCCESS PAGE */
app.get("/success", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "success.html"));
});

/* =========================
   PAYSTACK CHECKOUT
========================= */
app.get("/api/paystack/pay", (req, res) => {
  res.json({
    status: true,
    message: "Paystack route exists. Use POST to initialize payment."
  });
});
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
        console.log(err.response?.data || err.message);

        res.status(500).json({
            status: false,
            message: err.response?.data?.message || err.message
        });
    }
});
app.get("/test-paystack", async (req,res)=>{
  res.json({
    keyExists: !!process.env.PAYSTACK_SECRET_KEY
  });
});
/* =========================
   STATUS ROUTE
========================= */
app.get("/api/status", (req, res) => {
    res.json({
        status: true,
        service: "PSKM Store",
        message: "Store API Online"
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("PSKM Store running on port " + PORT);
});
