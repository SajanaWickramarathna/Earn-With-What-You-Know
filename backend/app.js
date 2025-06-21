const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const router = require("./router");


const app = express();

// Middleware
app.use(cors());
app.use(express.json());



// Load API routes
app.use("/api", router);

mongoose.connect("mongodb+srv://sajana:mzIfNDwJS8Nz7dLI@vidp.okgeqic.mongodb.net/?retryWrites=true&w=majority&appName=vidP")
.then(() => console.log("connected to MongoDB"))
.then(() => {
    app.listen(5000);
    console.log("Server is running on port 5000");
})
.catch((err) => console.log(("Error connecting to MongoDB", err)));