const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

/*

SERVE STORE FRONTEND

*/

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
res.sendFile(path.join(__dirname, "public", "index.html"));
});

/*

PAYSTACK CHECKOUT

*/

app.post("/api/paystack/pay", async (req, res) => {

try {

    const { email, amount, cart } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({
            status: false,
            message: "Invalid amount"
        });
    }

    const response = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
            email: email || "customer@pskm.store",
            amount: Math.round(amount * 100),
            currency: "ZAR",

            metadata: {
                cart: cart || []
            },

            callback_url:
                "https://pskm-kingdom-institute.onrender.com/success.html"
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
        authorization_url:
            response.data.data.authorization_url,
        reference:
            response.data.data.reference
    });

} catch (error) {

    console.error(error.response?.data || error.message);

    res.status(500).json({
        status: false,
        message:
            error.response?.data?.message ||
            error.message
    });

}

});

/*

SUCCESS PAGE

*/

app.get("/success.html", (req, res) => {
res.sendFile(
path.join(__dirname, "public", "success.html")
);
});

/*

HEALTH CHECK

*/

app.get("/api/status", (req, res) => {
res.json({
status: true,
service: "PSKM Store",
message: "Store API Online"
});
});

/*

START SERVER

*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log(
"PSKM Store running on port ${PORT}"
);
});
