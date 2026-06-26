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
const enterpriseRoutes = require("./Routes/enterpriseRoutes");
const campusRoutes = require("./Routes/campusRoutes");
const roomTagRoutes = require("./Routes/roomTagRoutes");
const timetableVersionRoutes = require("./Routes/timetableVersionRoutes");
const studentRoutes = require("./Routes/studentRoutes");
const lecturerRoutes = require("./Routes/lecturerRoutes");
const departmentRoutes = require("./Routes/departmentRoutes");
const seatingPlanRoutes = require("./Routes/seatingPlanRoutes");
const studentAccommodationRoutes = require("./Routes/studentAccommodationRoutes");
const academicCalendarRoutes = require("./Routes/academicCalendarRoutes");
const notificationRoutes = require("./Routes/notificationRoutes");
const auditLogRoutes = require("./Routes/auditLogRoutes");
const reportRoutes = require("./Routes/reportRoutes");
const integrationRoutes = require("./Routes/integrationRoutes");

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
app.use('/api/enterprise', enterpriseRoutes);
app.use('/api/campuses', campusRoutes);
app.use('/api/room-tags', roomTagRoutes);
app.use('/api/timetable-versions', timetableVersionRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/lecturers', lecturerRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/seating-plans', seatingPlanRoutes);
app.use('/api/student-accommodations', studentAccommodationRoutes);
app.use('/api/academic-calendar', academicCalendarRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/super-admin', require('./Routes/superAdminRoutes'));

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
