const express = require("express");
const dotenv = require("dotenv");
const routes=require("./Routes/routes")
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
dotenv.config();

app.use(express.json());
app.use(cors());
app.use('/api',routes)

// ================= Using Routes ====================


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
