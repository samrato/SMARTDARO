const express = require("express");
const dotenv = require("dotenv");
const cron = require('node-cron');
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const userRoutes = require("./Routes/userRoutes");
const venueRoutes = require("./Routes/venueRoutes");
const courseRoutes = require("./Routes/courseRoutes");
const timetableRoutes = require("./Routes/timetableRoutes");
const academicSessionRoutes = require("./Routes/academicSessionRoutes");
const lecturerConstraintRoutes = require("./Routes/lecturerConstraintRoutes");
const courseStreamRoutes = require("./Routes/courseStreamRoutes");
const studentRegistrationRoutes = require("./Routes/studentRegistrationRoutes");
const academicCatalogRoutes = require("./Routes/academicCatalogRoutes");
const examRoutes = require("./Routes/examRoutes");

dotenv.config();

const app = express();

// Secure HTTP headers
app.use(helmet());

// Apply rate limiting: Max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

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
app.use('/api/academic-sessions', academicSessionRoutes);
app.use('/api/lecturer-constraints', lecturerConstraintRoutes);
app.use('/api/course-streams', courseStreamRoutes);
app.use('/api/student-registrations', studentRegistrationRoutes);
app.use('/api/academic-catalogs', academicCatalogRoutes);
app.use('/api/exams', examRoutes);

const PORT = process.env.PORT || 3001;

// Connect to the database and start the server
const startServer = async () => {
  try {
    // Verify PostgreSQL connection
    const pgDb = require("./database/pgDb");
    await pgDb.query("SELECT 1");
    console.log("✅ PostgreSQL is connected successfully");

    // Cron job running every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      console.log('⏰ Running cron job every 15 minutes');
      try {
        const userCountRes = await pgDb.query("SELECT COUNT(*) FROM users");
        console.log(`📊 Total users in the database: ${userCountRes.rows[0].count}`);
      } catch (err) {
        console.error("❌ Cron job error:", err);
      }
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  }
};

startServer();
