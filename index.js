const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDb = require("./database/Db"); 
const routes = require("./Routes/routes");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api', routes);

const PORT = process.env.PORT || 3000;

// Connect to the database and start the server
const startServer = async () => {
  try {
    await connectDb(); // Ensure DB connection before starting the server
    app.listen(PORT, () => {
      console.log(` Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(" Server failed to start:", error);
  }
};

startServer();
