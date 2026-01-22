const express = require("express");
const dotenv = require("dotenv");
const cron = require('node-cron');

const cors = require("cors");
const connectDb = require("./database/Db"); 
const userRoutes = require("./Routes/userRoutes");
const venueRoutes = require("./Routes/venueRoutes");
const courseRoutes = require("./Routes/courseRoutes");
const timetableRoutes = require("./Routes/timetableRoutes");

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://smartdarofronted.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
      } else {
          callback(new Error("Not allowed by CORS"));
      }
  },
  credentials: true,
}));

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/timetables', timetableRoutes);

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
