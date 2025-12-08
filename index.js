import express from "express";
import cors from "cors";
import fs from "fs";
import admin from "firebase-admin";
import mongoose from "mongoose";
import { userModel, alertModel, machineModel } from "./models.js";

// ----------- FIREBASE SERVICE ACCOUNT LOAD -----------
const serviceAccountPath = "./serviceAccountKey.json";

if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ Firebase key file not found!");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ---------- MONGOOSE CONNECTION ----------
const MONGO_URI =
  "mongodb+srv://anshshr:ansh123@freelancing-platform.esbya.mongodb.net/iot_data_collection";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ---------- EXPRESS APP ----------
const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("server started");
});

app.get("/health", (req, res) => {
  res.send("healthy");
});

// ---------- CREATE ALERT ----------
app.post("/postAlert", async (req, res) => {
  try {
    const alertData = req.body;

    const newAlert = await alertModel.create(alertData);

    res.status(200).json({
      message: "Successfully added machine alert",
      alert: newAlert,
    });
  } catch (error) {
    res.status(400).json({
      message: "Unable to save alert",
      error: error.message,
    });
  }
});

// ---------- MACHINE ROUTES ----------
// Get all machines
app.get("/machines", async (req, res) => {
  try {
    const machines = await machineModel.find();
    res.status(200).json({ count: machines.length, data: machines });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new machine
app.post("/machines", async (req, res) => {
  try {
    const {
      alertType,
      machineName,
      machine_defect_url,
      machine_desc,
      machine_location,
      machine_under_maintainance,
      machine_maintainance_status,
      start_time,
      end_time,
    } = req.body;

    if (!machineName || !machine_location || !start_time || !end_time) {
      return res.status(400).json({
        error:
          "Required fields: machineName, machine_location, start_time, end_time",
      });
    }

    const machine = await machineModel.create({
      alertType,
      machineName,
      machine_defect_url,
      machine_desc,
      machine_location,
      machine_under_maintainance,
      machine_maintainance_status,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
    });

    res.status(201).json({ message: "Machine created", machine });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- GET ALL ALERTS ----------
app.get("/getAlerts", async (req, res) => {
  try {
    const data = await alertModel.find();
    res.status(200).json({
      message: "Alerts fetched",
      data,
    });
  } catch (error) {
    res.status(400).json({
      message: "Unable to fetch alerts",
      error: error.message,
    });
  }
});

// ---------- BROADCAST NOTIFICATION ----------
app.post("/broadcast-notification", async (req, res) => {
  try {
    const { title, body } = req.body;

    const users = await userModel.find({ FCM_TOKEN: { $ne: null } });

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      const message = {
        token: user.FCM_TOKEN,
        notification: { title, body },
        data: { screen: "screen", id: "123" },
        android: {
          priority: "high",
          collapseKey: String(Date.now()),
        },
      };

      try {
        await admin.messaging().send(message);
        successCount++;
      } catch (err) {
        console.error("FCM Error:", err.message);
        failCount++;
      }
    }

    res.status(200).json({
      message: "Broadcast completed",
      sent_to: successCount,
      failed_for: failCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Broadcast failed",
      error: error.message,
    });
  }
});

// ---------- UPSERT USER ----------
app.post("/upsert-user", async (req, res) => {
  try {
    const { firstname, lastname, role, email, password, verified, FCM_TOKEN } =
      req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });

    let user = await userModel.findOne({ email });

    if (user) {
      const updatedUser = await userModel.findOneAndUpdate(
        { email },
        { FCM_TOKEN },
        { new: true }
      );

      return res.status(200).json({
        message: "FCM token updated",
        exists: true,
        user: updatedUser,
      });
    }

    if (!firstname || !password)
      return res.status(400).json({
        error: "Firstname & Password required for new user",
      });

    user = await userModel.create({
      firstname,
      lastname,
      role: role || "trainee",
      email,
      password,
      verified: verified || false,
      FCM_TOKEN,
    });

    res.status(201).json({
      message: "New user created",
      exists: false,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Upsert failed",
      error: error.message,
    });
  }
});

// ---------- SERVER START ----------
app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
