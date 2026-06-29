require("dotenv").config();
const { MongoClient } = require("mongodb");

/* =========================
   CONNECTION STRING
========================= */
const uri = process.env.MONGODB_URI;

/* =========================
   MAIN FUNCTION
========================= */
async function runGetStarted() {
    const client = new MongoClient(uri);

    try {
        console.log("🔄 Connecting to MongoDB...");

        await client.connect();

        console.log("✅ MongoDB Connected Successfully");

        /* =========================
           DATABASE + COLLECTION
        ========================= */
        const database = client.db("pskm");
        const movies = database.collection("movies");

        /* =========================
           TEST QUERY
        ========================= */
        const query = { title: "Back to the Future" };

        const movie = await movies.findOne(query);

        console.log("🎬 Movie Found:");
        console.log(movie);

        /* =========================
           OPTIONAL: INSERT TEST DATA
        ========================= */
        const insertResult = await movies.insertOne({
            title: "PSKM Test Movie",
            createdAt: new Date(),
            status: "active"
        });

        console.log("🟢 Inserted ID:", insertResult.insertedId);

    } catch (err) {
        console.error("❌ MongoDB Error:", err);

    } finally {
        await client.close();
        console.log("🔌 Connection Closed");
    }
}

/* =========================
   RUN SCRIPT
========================= */
runGetStarted().catch(console.error);
