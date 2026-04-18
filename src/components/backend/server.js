import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// 📁 Read DB
const getDB = () => {
    const data = fs.readFileSync("./db.json");
    return JSON.parse(data);
};

// 💾 Write DB
const saveDB = (data) => {
    fs.writeFileSync("./db.json", JSON.stringify(data, null, 2));
};

// ✅ ROOT
app.get("/", (req, res) => {
    res.json({
        message: "🚀 BrainCMS API Running...",
        status: "success"
    });
});


// ================= AUTH ROUTES =================

// 🔹 GET all users
app.get("/api/auth", (req, res) => {
    const db = getDB();
    res.json(db.auth);
});

// 🔹 GET single user
app.get("/api/auth/:id", (req, res) => {
    const db = getDB();
    const user = db.auth.find(u => u.id === req.params.id);

    if (!user) return res.status(404).json("User not found");

    res.json(user);
});

// 🔹 REGISTER
app.post("/api/auth/register", (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json("All fields are required");
    }

    const db = getDB();

    const existingUser = db.auth.find((u) => u.email === email);
    if (existingUser) {
        return res.status(400).json("User already exists");
    }

    const newUser = {
        id: Date.now().toString(),
        fullName,
        email,
        password,
        status: "active",
        role: "user",
        createdAt: new Date().toISOString()
    };

    db.auth.push(newUser);
    saveDB(db);

    res.status(201).json(newUser);
});

// 🔹 LOGIN
app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;

    const db = getDB();

    const user = db.auth.find((u) => u.email === email);

    if (!user || user.password !== password) {
        return res.status(401).json("Invalid credentials");
    }

    res.json({
        message: "Login successful",
        user
    });
});


// ================= GENERIC CRUD (IMPORTANT 🔥) =================

// 🔹 GET ANY COLLECTION (customers, leads, deals...)
app.get("/api/:collection", (req, res) => {
    const db = getDB();
    const { collection } = req.params;

    if (!db[collection]) {
        return res.status(404).json("Collection not found");
    }

    res.json(db[collection]);
});

// 🔹 POST (CREATE)
app.post("/api/:collection", (req, res) => {
    const db = getDB();
    const { collection } = req.params;

    if (!db[collection]) {
        return res.status(404).json("Collection not found");
    }

    const newItem = {
        id: Date.now().toString(),
        ...req.body
    };

    db[collection].push(newItem);
    saveDB(db);

    res.status(201).json(newItem);
});

// 🔹 PUT (UPDATE)
app.put("/api/:collection/:id", (req, res) => {
    const db = getDB();
    const { collection, id } = req.params;

    const index = db[collection].findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json("Item not found");
    }

    db[collection][index] = {
        ...db[collection][index],
        ...req.body
    };

    saveDB(db);

    res.json(db[collection][index]);
});

// 🔹 DELETE
app.delete("/api/:collection/:id", (req, res) => {
    const db = getDB();
    const { collection, id } = req.params;

    db[collection] = db[collection].filter(item => item.id !== id);

    saveDB(db);

    res.json({ message: "Deleted successfully" });
});


// ================= PORT =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});