const express = require("express");
const dotenv = require("dotenv");
const cron = require('node-cron');
const cors = require("cors");
const connectDb = require("./database/Db"); 
const routes = require("./Routes/routes");
const User=require("./models/user")

dotenv.config();

const app = express();


const allowedOrigins = [
  "http://localhost:5173", // Add your frontend URL here ni god manze....
  "https://smartdarofronted.vercel.app" // If you have a live domain, add it here
];

app.use(cors({
  origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
      } else {
          callback(new Error("Not allowed by CORS"));
      }
  },
  credentials: true, // Allows cookies and credentials to be sent with requests
}));

// Middleware
app.use(express.json()); // Should be placed before routes

// Routes
app.use('/api', routes);

const PORT = process.env.PORT || 3001;

// Connect to the database and start the server
const startServer = async () => {
  try {
    await connectDb();

    // Cron job running every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      console.log('⏰ Running cron job every 15 minutes');
      try {
        const userCount = await User.countDocuments();
        console.log(`📊 Total users in the database: ${userCount}`);
      } catch (err) {
        console.error("❌ Cron job error:", err);
      }
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error);
  }
};

startServer();
