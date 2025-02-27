const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDb = require("./database/Db"); 
const routes = require("./Routes/routes");

dotenv.config();

const app = express();

// Allowed origins for CORS
const allowedOrigins = [
    "https://frontend-example.com",
    "http://localhost:3000"  // Allow local dev environment
];

// Apply CORS middleware correctly
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true  // Allows sending cookies with requests
}));

// Middleware
app.use(express.json()); // Should be placed before routes

// Routes
app.use('/api', routes);

const PORT = process.env.PORT || 3000;

// Connect to the database and start the server
const startServer = async () => {
  try {
    await connectDb(); // Ensure DB connection before starting the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
  }
};

startServer();
