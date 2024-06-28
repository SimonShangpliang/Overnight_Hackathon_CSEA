const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyD_-BM_UUFlX7Zr3aZ3thWH5YkhjDS2R8w");

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.use(cors({
    origin: "https://overnight-hackathon-csea-frontend.vercel.app",
    methods: ["POST", "GET"],
    credentials: true
}));

const server = http.createServer(app);

app.get("/", (req, res) => {
    res.json("Hello");
});

async function initialize() {
    try {
        const url = "mongodb+srv://Tanmay:Tanmay@kapilicampuscollaborati.nnisj09.mongodb.net/Overnight_Hackathon?retryWrites=true&w=majority";
        await mongoose.connect(url);
        console.log("Database Connected Successfully");
    } catch (error) {
        console.error("Database connection error:", error);
    }
}

app.post('/generate', async (req, res) => {
    const { prompt } = req.body;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        res.send(text);
    } catch (error) {
        console.error("Failed to generate content:", error);
        res.status(500).send("Failed to generate content");
    }
});

// ROUTES IMPORT
const userRoutes = require("./routes/userRoutes.js");
app.use("/user", userRoutes);

const assignmentRoutes = require("./routes/assignmentRoutes.js");
app.use("/assignment", assignmentRoutes);

// PORT
const port = process.env.PORT || 8080;

initialize().then(() => {
    server.listen(port, function () {
        console.log(`Server Started on Port ${port}`);
    });
}).catch(error => {
    console.error("Initialization error:", error);
});
