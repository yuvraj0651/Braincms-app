import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory DB
let users = [];

/**
 * BASE ROUTE
 */
app.get("/api", (req, res) => {
    res.json({
        message: "🚀 BrainCMS API Running...",
        status: "success"
    });
});

/**
 * REGISTER
 */
app.post("/api/auth/register", (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    const newUser = {
        id: Date.now(),
        fullName,
        email,
        password,
    };

    users.push(newUser);

    res.status(201).json({
        message: "User registered successfully",
    });
});

/**
 * LOGIN
 */
app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const user = users.find((u) => u.email === email);

    if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
        message: "Login successful",
        user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
        },
    });
});

/**
 * PORT
 */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});